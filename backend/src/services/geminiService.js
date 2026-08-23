import { GoogleGenerativeAI, SchemaType } from '@google/generative-ai';

let genAI = null;

if (process.env.AI_API_KEY && process.env.AI_API_KEY !== 'your_gemini_api_key_here') {
  genAI = new GoogleGenerativeAI(process.env.AI_API_KEY);
}

const TIMEOUT_MS = 5000;

/**
 * Extracts structured medical data from a patient's natural language response.
 * @param {string} patientResponse - The original answer from the patient.
 * @returns {Promise<{ extractedData: object|null, status: string }>}
 */
export async function extractStructuredData(patientResponse) {
  if (!genAI) {
    return { extractedData: null, status: 'skipped' };
  }

  try {
    const model = genAI.getGenerativeModel({
      model: process.env.AI_MODEL || 'gemini-2.5-flash',
      generationConfig: {
        responseMimeType: "application/json",
        responseSchema: {
          type: SchemaType.OBJECT,
          properties: {
            symptoms: {
              type: SchemaType.ARRAY,
              items: { type: SchemaType.STRING },
              description: "List of symptoms mentioned by the patient."
            },
            duration: {
              type: SchemaType.STRING,
              description: "Duration of the symptoms if mentioned, e.g., '3 days'."
            },
            severity: {
              type: SchemaType.STRING,
              description: "Severity of the symptoms if mentioned, e.g., 'high', '5/10'."
            }
          }
        }
      }
    });

    const prompt = `
You are a medical data extraction assistant. Extract the structured information from the following patient response.
Rules:
1. ONLY extract symptoms, duration, and severity.
2. DO NOT generate diagnoses, treatment recommendations, or prescriptions.
3. If a field is not mentioned, leave it empty or null.

Patient Response:
"${patientResponse}"
    `;

    // Execute with timeout
    const generatePromise = model.generateContent(prompt);
    
    const timeoutPromise = new Promise((_, reject) => {
      setTimeout(() => reject(new Error('Gemini API timeout')), TIMEOUT_MS);
    });

    const result = await Promise.race([generatePromise, timeoutPromise]);
    const responseText = result.response.text();
    
    let parsed = null;
    try {
      parsed = JSON.parse(responseText);
    } catch (parseErr) {
      console.error('Gemini JSON parsing error:', parseErr);
      return { extractedData: null, status: 'failed' };
    }

    // Basic validation
    if (typeof parsed !== 'object' || parsed === null) {
      return { extractedData: null, status: 'failed' };
    }

    // Ensure it only contains the requested fields
    const safeData = {
      symptoms: Array.isArray(parsed.symptoms) ? parsed.symptoms : [],
      duration: parsed.duration || null,
      severity: parsed.severity || null,
    };

    return { extractedData: safeData, status: 'success' };

  } catch (error) {
    console.error('Gemini API Error:', error.message);
    return { extractedData: null, status: 'failed' };
  }
}

/**
 * Intelligently determines the next relevant interview question from a bank of allowed questions.
 * @param {Array} responses - The history of questions and answers so far.
 * @param {Array} questionBank - The list of available questions { questionId, text, type }.
 * @returns {Promise<{ questionId: string|null, reason: string|null }>}
 */
export async function determineNextQuestion(responses, questionBank, language = 'en') {
  if (!genAI || !questionBank || questionBank.length === 0) {
    return { questionId: null, reason: 'AI disabled or no bank', question: null, options: [] };
  }

  try {
    const model = genAI.getGenerativeModel({
      model: process.env.AI_MODEL || 'gemini-2.5-flash',
      generationConfig: {
        responseMimeType: "application/json",
        responseSchema: {
          type: SchemaType.OBJECT,
          properties: {
            questionId: {
              type: SchemaType.STRING,
              description: "The exact questionId from the allowed question bank to ask next, or null if the interview is complete."
            },
            reason: {
              type: SchemaType.STRING,
              description: "Brief reason why this question was selected based on the clinical context."
            },
            question: {
              type: SchemaType.STRING,
              description: "The conversational question string."
            },
            options: {
              type: SchemaType.ARRAY,
              items: { type: SchemaType.STRING },
              description: "Options if it is a multiple choice question."
            }
          }
        }
      }
    });

    const langInstruction = language === 'hi' || language === 'hindi'
      ? "\n5. CRITICAL: If the language is 'hi' or 'hindi', YOU MUST generate the 'question' text and all 'options' entirely in simple, conversational Hindi using the Devanagari script. DO NOT output English questions if the language is Hindi."
      : "\n5. Generate the 'question' and 'options' in English.";

    const prompt = `
You are an AI assisting in a medical interview. Your job is to select the BEST NEXT question to ask from an approved list.

Interview History:
${JSON.stringify(responses.map(r => ({ Q: r.question, A: r.answer, Extracted: r.extractedData })), null, 2)}

Available Question Bank:
${JSON.stringify(questionBank, null, 2)}

Rules:
1. You MUST select EXACTLY ONE 'questionId' from the Available Question Bank.
2. DO NOT invent your own questions.
3. If the interview has gathered enough information and no available questions are relevant, return questionId as null.
4. Base your choice logically on what is missing (e.g. if symptoms are reported, ask duration).${langInstruction}
    `;

    const generatePromise = model.generateContent(prompt);
    
    const timeoutPromise = new Promise((_, reject) => {
      setTimeout(() => reject(new Error('Gemini API timeout')), TIMEOUT_MS);
    });

    const result = await Promise.race([generatePromise, timeoutPromise]);
    const responseText = result.response.text();
    
    let parsed = null;
    try {
      parsed = JSON.parse(responseText);
    } catch (parseErr) {
      console.error('Gemini NextQ parsing error:', parseErr);
      return { questionId: null, reason: 'Parse error' };
    }

    return { 
      questionId: parsed.questionId || null, 
      reason: parsed.reason || '',
      question: parsed.question || null,
      options: Array.isArray(parsed.options) ? parsed.options : []
    };

  } catch (error) {
    console.error('Gemini NextQ API Error:', error.message);
    return { questionId: null, reason: 'API Error', question: null, options: [] };
  }
}

/**
 * Phase 10D: Generates a highly constrained clinical summary from the interview.
 * Strictly forbidden from diagnosing, recommending treatment, or prescribing.
 * @param {Object} interview - The completed interview document containing responses.
 * @returns {Promise<{ clinicalSummary: Object|null, status: string }>}
 */
export async function generateClinicalSummary(interview) {
  if (!genAI) {
    return { clinicalSummary: null, status: 'skipped' };
  }

  try {
    const model = genAI.getGenerativeModel({
      model: process.env.AI_MODEL || 'gemini-2.5-flash',
      generationConfig: {
        responseMimeType: "application/json",
        responseSchema: {
          type: SchemaType.OBJECT,
          properties: {
            chiefComplaint: { type: SchemaType.STRING },
            duration: { type: SchemaType.STRING },
            severity: { type: SchemaType.STRING },
            symptoms: { type: SchemaType.ARRAY, items: { type: SchemaType.STRING } },
            medicalHistory: { type: SchemaType.ARRAY, items: { type: SchemaType.STRING } },
            medications: { type: SchemaType.ARRAY, items: { type: SchemaType.STRING } },
            allergies: { type: SchemaType.ARRAY, items: { type: SchemaType.STRING } },
            previousAdmissions: { type: SchemaType.ARRAY, items: { type: SchemaType.STRING } },
            relevantResponses: { type: SchemaType.ARRAY, items: { type: SchemaType.STRING } },
            aiSummaryText: { type: SchemaType.STRING, description: "Use strictly 'Patient reports...' terminology. NO DIAGNOSES." }
          },
          required: ["chiefComplaint", "duration", "severity", "symptoms", "medicalHistory", "medications", "allergies", "previousAdmissions", "relevantResponses", "aiSummaryText"]
        }
      }
    });

    // We send only the needed data to Gemini
    const payload = interview.responses.map(r => ({
      questionId: r.questionId,
      question: r.question,
      answer: r.answer,
      extractedData: r.extractedData
    }));

    const prompt = `
You are an expert clinical summarizer. The patient conversation may be in Hindi, Hinglish, or English. Your task is to analyze the entire conversation, translate if necessary, and synthesize the findings into a strictly structured English medical summary for a doctor's queue.

MEDICAL SAFETY RULES:
1. DO NOT diagnose the patient. (e.g. Do NOT say "Patient has pneumonia").
2. DO NOT recommend treatment or prescribe medication.
3. DO NOT invent symptoms or medical history not explicitly present in the data.
4. Use objective, reporting English language ONLY: "Patient reports...", "Patient stated...", "No information provided for...".
5. Keep the aiSummaryText concise and purely factual based on the provided answers, always returning it in English.
6. Translate all extracted symptoms, complaints, and durations into medical English.

Patient Interview Data:
${JSON.stringify(payload, null, 2)}
    `;

    const generatePromise = model.generateContent(prompt);
    
    // 10000ms timeout for the summary generation
    const timeoutPromise = new Promise((_, reject) => {
      setTimeout(() => reject(new Error('Gemini Summary timeout')), 10000);
    });

    const result = await Promise.race([generatePromise, timeoutPromise]);
    const responseText = result.response.text();
    
    let parsed = null;
    try {
      parsed = JSON.parse(responseText);
    } catch (parseErr) {
      console.error('Gemini Summary parsing error:', parseErr);
      return { clinicalSummary: null, status: 'failed' };
    }

    return { 
      clinicalSummary: parsed, 
      status: 'completed' 
    };

  } catch (error) {
    console.error('Gemini Summary API Error:', error.message);
    return { clinicalSummary: null, status: 'failed' };
  }
}
/**
 * Phase 12: Extracts structured information from raw OCR text.
 * Strictly forbidden from diagnosing, only extracting what is explicitly reported in the document.
 * @param {string} ocrText - The raw text extracted via OCR.
 * @returns {Promise<{ extractedData: Object|null, status: string }>}
 */
export async function extractInformationFromDocument(ocrText) {
  if (!genAI) {
    return { extractedData: null, status: 'skipped' };
  }

  if (!ocrText || ocrText.trim().length === 0) {
    return { extractedData: null, status: 'failed' };
  }

  try {
    const model = genAI.getGenerativeModel({
      model: process.env.AI_MODEL || 'gemini-2.5-flash',
      generationConfig: {
        responseMimeType: "application/json",
        responseSchema: {
          type: SchemaType.OBJECT,
          properties: {
            reportedConditions: { type: SchemaType.ARRAY, items: { type: SchemaType.STRING }, description: "Diagnoses or conditions explicitly stated in the document" },
            medications: { type: SchemaType.ARRAY, items: { type: SchemaType.STRING }, description: "Medications explicitly listed" },
            allergies: { type: SchemaType.ARRAY, items: { type: SchemaType.STRING }, description: "Allergies explicitly listed" },
            labValues: { 
              type: SchemaType.ARRAY, 
              items: {
                type: SchemaType.OBJECT,
                properties: {
                  test: { type: SchemaType.STRING },
                  value: { type: SchemaType.STRING },
                  unit: { type: SchemaType.STRING },
                  flag: { type: SchemaType.STRING, description: "'high', 'low', 'normal', or null" }
                }
              },
              description: "Extracted laboratory test results"
            },
            summary: { type: SchemaType.STRING, description: "A brief 1-2 sentence summary of what the document is (e.g. 'Blood test report from Oct 2023')." }
          },
          required: ["reportedConditions", "medications", "allergies", "labValues", "summary"]
        }
      }
    });

    const prompt = `
You are a medical data extraction assistant. Analyze the following raw OCR text extracted from a patient's uploaded document.

MEDICAL SAFETY RULES:
1. ONLY extract information explicitly present in the text.
2. DO NOT interpret or diagnose the patient. (e.g. if glucose is 200, do not diagnose Diabetes, just extract the value).
3. If a field is not present, return an empty array or null.

RAW OCR TEXT:
${ocrText}
`;

    const generatePromise = model.generateContent(prompt);
    
    // 15000ms timeout for OCR structured extraction
    const timeoutPromise = new Promise((_, reject) => {
      setTimeout(() => reject(new Error('Gemini OCR Extraction timeout')), 15000);
    });

    const result = await Promise.race([generatePromise, timeoutPromise]);
    const responseText = result.response.text();
    
    let parsed = null;
    try {
      parsed = JSON.parse(responseText);
    } catch (parseErr) {
      console.error('Gemini OCR Extraction parsing error:', parseErr);
      return { extractedData: null, status: 'failed' };
    }

    return { 
      extractedData: parsed, 
      status: 'completed' 
    };

  } catch (error) {
    console.error('Gemini OCR Extraction API Error:', error.message);
    return { extractedData: null, status: 'failed' };
  }
}
