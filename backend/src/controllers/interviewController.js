// backend/src/controllers/interviewController.js
import Interview from '../models/Interview.js';
import { extractStructuredData, determineNextQuestion } from '../services/geminiService.js';

/**
 * POST /api/interviews
 * Body: { patientId, language }
 */
export async function createInterview(req, res, next) {
  try {
    const { patientId, language } = req.body;

    if (req.patientId && req.patientId !== patientId) {
      return res.status(403).json({ success: false, message: 'Forbidden' });
    }

    // Check if an in-progress interview already exists for this patient
    let interview = await Interview.findOne({ patientId, status: 'in-progress' });
    
    if (!interview) {
      interview = await Interview.create({
        patientId,
        language: language || 'en',
      });
    }

    res.status(201).json({ success: true, interview });
  } catch (err) {
    next(err);
  }
}

/**
 * GET /api/interviews/:id
 */
export async function getInterview(req, res, next) {
  try {
    const { id } = req.params;
    const interview = await Interview.findById(id);

    if (!interview) return res.status(404).json({ success: false, message: 'Interview not found' });
    
    if (req.patientId && req.patientId !== interview.patientId.toString()) {
      return res.status(403).json({ success: false, message: 'Forbidden' });
    }

    res.json({ success: true, interview });
  } catch (err) {
    next(err);
  }
}

/**
 * POST /api/interviews/:id/answer
 * Body: { question, answer }
 */
export async function addAnswer(req, res, next) {
  try {
    const { id } = req.params;
    const { questionId, question, answer, chiefComplaint } = req.body;

    const interview = await Interview.findById(id);
    if (!interview) return res.status(404).json({ success: false, message: 'Interview not found' });
    
    if (req.patientId && req.patientId !== interview.patientId.toString()) {
      return res.status(403).json({ success: false, message: 'Forbidden' });
    }

    if (!question || !answer || !answer.trim()) {
      return res.status(400).json({ success: false, message: 'Invalid or empty answer' });
    }

    // AI Extraction (Phase 10B) - fallback gracefully on failure
    const { extractedData, status } = await extractStructuredData(answer);

    interview.responses.push({ 
      questionId, 
      question, 
      answer,
      extractedData: extractedData || {},
      extractionStatus: status
    });
    
    if (chiefComplaint !== undefined) {
      interview.chiefComplaint = chiefComplaint;
    }

    await interview.save();
    res.json({ success: true, interview });
  } catch (err) {
    next(err);
  }
}

/**
 * POST /api/interviews/:id/complete
 */
export async function completeInterview(req, res, next) {
  try {
    const { id } = req.params;
    
    const interview = await Interview.findById(id);
    if (!interview) return res.status(404).json({ success: false, message: 'Interview not found' });
    
    if (req.patientId && req.patientId !== interview.patientId.toString()) {
      return res.status(403).json({ success: false, message: 'Forbidden' });
    }

    interview.status = 'completed';
    interview.completedAt = new Date();
    await interview.save();

    // Trigger AI summary generation immediately
    try {
      const { generateClinicalSummary } = await import('../services/geminiService.js');
      const { clinicalSummary, status } = await generateClinicalSummary(interview);

      if (status === 'completed' && clinicalSummary) {
        interview.clinicalSummary = {
          ...clinicalSummary,
          generatedAt: new Date()
        };
        interview.summaryStatus = 'completed';
      } else {
        // Deterministic Fallback Logic
        const fallbackSummary = {
          chiefComplaint: interview.chiefComplaint || 'Not provided',
          duration: '',
          severity: '',
          symptoms: [],
          medicalHistory: [],
          medications: [],
          allergies: [],
          previousAdmissions: [],
          relevantResponses: [],
          aiSummaryText: 'AI summarization unavailable. Please review responses directly.',
          generatedAt: new Date()
        };

        interview.responses.forEach(r => {
          if (r.questionId === 'q_duration') fallbackSummary.duration = r.answer;
          if (r.questionId === 'q_severity') fallbackSummary.severity = r.answer;
          if (r.questionId === 'q_symptoms' && r.extractedData?.symptoms) fallbackSummary.symptoms = r.extractedData.symptoms;
          if (r.questionId === 'q_conditions' || r.questionId === 'q_conditions_specify') fallbackSummary.medicalHistory.push(r.answer);
          if (r.questionId === 'q_meds' || r.questionId === 'q_meds_specify') fallbackSummary.medications.push(r.answer);
          if (r.questionId === 'q_allergies') fallbackSummary.allergies.push(r.answer);
          if (r.questionId === 'q_admitted') fallbackSummary.previousAdmissions.push(r.answer);
          fallbackSummary.relevantResponses.push(`Q: ${r.question} | A: ${r.answer}`);
        });

        interview.clinicalSummary = fallbackSummary;
        interview.summaryStatus = 'fallback';
      }
      await interview.save();
    } catch (summaryErr) {
      console.error('Failed to generate summary during completion:', summaryErr.message);
    }

    res.json({ success: true, interview });
  } catch (err) {
    next(err);
  }
}

/**
 * GET /api/interviews/:id/next
 * Analyzes responses and returns the next question or indicates completion.
 */
export async function getNextQuestion(req, res, next) {
  try {
    const { id } = req.params;
    const interview = await Interview.findById(id);
    
    if (!interview) return res.status(404).json({ success: false, message: 'Interview not found' });
    if (req.patientId && req.patientId !== interview.patientId.toString()) {
      return res.status(403).json({ success: false, message: 'Forbidden' });
    }

    if (interview.status === 'completed') {
      return res.json({ success: true, isComplete: true });
    }

    const lang = interview.language === 'hi' ? 'hi' : 'en';
    const responses = interview.responses || [];

    // Helper to check if a specific question was answered
    const answered = (qId) => responses.some(r => r.questionId === qId);
    // Helper to get the answer of a specific question
    const getAns = (qId) => responses.find(r => r.questionId === qId)?.answer?.toLowerCase();

    // The Rule Engine (Phase 9)
    // We determine the next question based on what hasn't been answered yet,
    // and inject conditionals.
    const QUESTION_BANK = {
      en: {
        q_cc: { questionId: 'q_cc', text: "What brings you to the hospital today? What is your main concern?", type: 'open' },
        q_duration: { questionId: 'q_duration', text: "How long have you been experiencing this problem?", type: 'open' },
        q_severity: { questionId: 'q_severity', text: "On a scale of 1-10, how severe is the discomfort?", type: 'scale' },
        q_symptoms: { questionId: 'q_symptoms', text: "Do you have any of these symptoms?", type: 'multi', options: ['Fever', 'Chest pain', 'Breathlessness', 'Nausea', 'Dizziness', 'Weakness'] },
        q_conditions: { questionId: 'q_conditions', text: "Do you have any known medical conditions?", type: 'yesno' },
        q_conditions_specify: { questionId: 'q_conditions_specify', text: "Please specify your medical conditions:", type: 'open' },
        q_meds: { questionId: 'q_meds', text: "Are you currently taking any medications?", type: 'yesno' },
        q_meds_specify: { questionId: 'q_meds_specify', text: "Please list the medications you are taking:", type: 'open' },
        q_allergies: { questionId: 'q_allergies', text: "Do you have any known allergies?", type: 'yesno' },
        q_admitted: { questionId: 'q_admitted', text: "Have you been admitted to a hospital before for this issue?", type: 'yesno' },
      },
      hi: {
        q_cc: { questionId: 'q_cc', text: "आज आप अस्पताल क्यों आए हैं? आपकी मुख्य समस्या क्या है?", type: 'open' },
        q_duration: { questionId: 'q_duration', text: "आप यह समस्या कितने समय से अनुभव कर रहे हैं?", type: 'open' },
        q_severity: { questionId: 'q_severity', text: "1-10 के पैमाने पर, तकलीफ कितनी गंभीर है?", type: 'scale' },
        q_symptoms: { questionId: 'q_symptoms', text: "क्या आपको इनमें से कोई लक्षण है?", type: 'multi', options: ['बुखार', 'सीने में दर्द', 'सांस की तकलीफ', 'मतली', 'चक्कर', 'कमजोरी'] },
        q_conditions: { questionId: 'q_conditions', text: "क्या आपको कोई ज्ञात बीमारी है?", type: 'yesno' },
        q_conditions_specify: { questionId: 'q_conditions_specify', text: "कृपया अपनी बीमारियों का उल्लेख करें:", type: 'open' },
        q_meds: { questionId: 'q_meds', text: "क्या आप वर्तमान में कोई दवाएं ले रहे हैं?", type: 'yesno' },
        q_meds_specify: { questionId: 'q_meds_specify', text: "कृपया उन दवाओं की सूची दें जो आप ले रहे हैं:", type: 'open' },
        q_allergies: { questionId: 'q_allergies', text: "क्या आपको कोई एलर्जी है?", type: 'yesno' },
        q_admitted: { questionId: 'q_admitted', text: "क्या आपको पहले इस समस्या के लिए अस्पताल में भर्ती किया गया था?", type: 'yesno' },
      }
    };

    const b = QUESTION_BANK[lang];

    // Sub-Phase 10C: AI determines the next question
    // 1. Build an array of allowed questions that haven't been answered
    const availableQuestions = Object.values(b).filter(q => !answered(q.questionId));
    
    // 2. Request AI to choose
    let aiSelectedQuestionId = null;
    let aiCustomQuestion = null;
    let aiCustomOptions = [];
    if (availableQuestions.length > 0) {
      try {
        const aiResult = await determineNextQuestion(responses, availableQuestions, lang);
        if (aiResult && aiResult.questionId) {
          // 3. Strict Validation
          if (b[aiResult.questionId] && !answered(aiResult.questionId)) {
            aiSelectedQuestionId = aiResult.questionId;
            aiCustomQuestion = aiResult.question;
            aiCustomOptions = aiResult.options;
          } else {
            console.warn('AI suggested invalid or already-answered question:', aiResult.questionId);
          }
        }
      } catch (aiErr) {
        console.error('AI determining next question failed:', aiErr.message);
      }
    }

    let nextQuestion = null;

    if (aiSelectedQuestionId) {
      nextQuestion = { ...b[aiSelectedQuestionId] };
      // Override with AI-generated conversational text if provided (especially important for Hindi)
      if (aiCustomQuestion) nextQuestion.text = aiCustomQuestion;
      if (aiCustomOptions && aiCustomOptions.length > 0) nextQuestion.options = aiCustomOptions;
    } else {
      // 4. Fallback (The Rule Engine)
      if (!answered('q_cc')) nextQuestion = b.q_cc;
      else if (!answered('q_duration')) nextQuestion = b.q_duration;
      else if (!answered('q_severity')) nextQuestion = b.q_severity;
      else if (!answered('q_symptoms')) nextQuestion = b.q_symptoms;
      else if (!answered('q_conditions')) nextQuestion = b.q_conditions;
      else if (getAns('q_conditions') === 'yes' || getAns('q_conditions') === 'हाँ' || getAns('q_conditions') === 'yes ✅') {
        if (!answered('q_conditions_specify')) nextQuestion = b.q_conditions_specify;
        else if (!answered('q_meds')) nextQuestion = b.q_meds;
      } 
      else if (!answered('q_meds')) nextQuestion = b.q_meds;

      if (!nextQuestion) {
        if ((getAns('q_meds') === 'yes' || getAns('q_meds') === 'हाँ' || getAns('q_meds') === 'yes ✅') && !answered('q_meds_specify')) {
          nextQuestion = b.q_meds_specify;
        }
        else if (!answered('q_allergies')) nextQuestion = b.q_allergies;
        else if (!answered('q_admitted')) nextQuestion = b.q_admitted;
      }
    }

    if (nextQuestion) {
      return res.json({ success: true, isComplete: false, question: nextQuestion });
    }

    // If we reach here, all logic paths are complete
    return res.json({ success: true, isComplete: true });

  } catch (err) {
    next(err);
  }
}

/**
 * Phase 10D: POST /api/interviews/:id/summary
 * Generates (if not exists) and returns the clinical summary.
 */
export async function generateSummary(req, res, next) {
  try {
    const { id } = req.params;
    const interview = await Interview.findById(id);

    if (!interview) return res.status(404).json({ success: false, message: 'Interview not found' });
    
    // Auth Check
    if (req.patientId && req.patientId !== interview.patientId.toString()) {
      return res.status(403).json({ success: false, message: 'Forbidden' });
    }

    // Must be completed (or at least have some responses)
    if (interview.status !== 'completed' && interview.responses.length === 0) {
      return res.status(400).json({ success: false, message: 'Interview must have responses to summarize' });
    }

    // Idempotency: Return existing summary if already done or fallback generated
    if (interview.summaryStatus === 'completed' || interview.summaryStatus === 'fallback') {
      return res.json({ success: true, clinicalSummary: interview.clinicalSummary, summaryStatus: interview.summaryStatus });
    }

    interview.summaryStatus = 'generating';
    await interview.save();

    const { generateClinicalSummary } = await import('../services/geminiService.js');
    const { clinicalSummary, status } = await generateClinicalSummary(interview);

    if (status === 'completed' && clinicalSummary) {
      interview.clinicalSummary = {
        ...clinicalSummary,
        generatedAt: new Date()
      };
      interview.summaryStatus = 'completed';
    } else {
      // Deterministic Fallback Logic
      const fallbackSummary = {
        chiefComplaint: interview.chiefComplaint || 'Not provided',
        duration: '',
        severity: '',
        symptoms: [],
        medicalHistory: [],
        medications: [],
        allergies: [],
        previousAdmissions: [],
        relevantResponses: [],
        aiSummaryText: 'AI summarization unavailable. Please review responses directly.',
        generatedAt: new Date()
      };

      interview.responses.forEach(r => {
        if (r.questionId === 'q_duration') fallbackSummary.duration = r.answer;
        if (r.questionId === 'q_severity') fallbackSummary.severity = r.answer;
        if (r.questionId === 'q_symptoms' && r.extractedData?.symptoms) fallbackSummary.symptoms = r.extractedData.symptoms;
        if (r.questionId === 'q_conditions' || r.questionId === 'q_conditions_specify') fallbackSummary.medicalHistory.push(r.answer);
        if (r.questionId === 'q_meds' || r.questionId === 'q_meds_specify') fallbackSummary.medications.push(r.answer);
        if (r.questionId === 'q_allergies') fallbackSummary.allergies.push(r.answer);
        if (r.questionId === 'q_admitted') fallbackSummary.previousAdmissions.push(r.answer);
        fallbackSummary.relevantResponses.push(`Q: ${r.question} | A: ${r.answer}`);
      });

      interview.clinicalSummary = fallbackSummary;
      interview.summaryStatus = 'fallback';
    }

    await interview.save();

    return res.json({ success: true, clinicalSummary: interview.clinicalSummary, summaryStatus: interview.summaryStatus });

  } catch (err) {
    next(err);
  }
}

/**
 * Phase 10D: GET /api/interviews/:id/summary
 * Retrieves the existing summary.
 */
export async function getSummary(req, res, next) {
  try {
    const { id } = req.params;
    const interview = await Interview.findById(id);

    if (!interview) return res.status(404).json({ success: false, message: 'Interview not found' });
    
    // Auth Check
    if (req.patientId && req.patientId !== interview.patientId.toString()) {
      return res.status(403).json({ success: false, message: 'Forbidden' });
    }

    res.json({ 
      success: true, 
      clinicalSummary: interview.clinicalSummary || null, 
      summaryStatus: interview.summaryStatus 
    });
  } catch (err) {
    next(err);
  }
}
