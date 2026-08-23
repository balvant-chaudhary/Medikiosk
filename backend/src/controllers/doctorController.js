// backend/src/controllers/doctorController.js
import Interview from '../models/Interview.js';
import Patient from '../models/Patient.js';

/**
 * GET /api/doctor/queue
 * Retrieve all completed interviews that are in the queue.
 * Query params: status (queueStatus), search (patient name or CC)
 */
export async function getQueue(req, res, next) {
  try {
    const { status, search } = req.query;
    
    // Base filter: only completed interviews
    const filter = { status: 'completed' };
    
    if (status) {
      filter.queueStatus = status;
    }

    let query = Interview.find(filter)
      .populate('patientId', 'name age gender phone')
      .sort({ completedAt: -1 });

    let interviews = await query;

    if (search) {
      const searchLower = search.toLowerCase();
      interviews = interviews.filter(i => {
        const patientName = i.patientId?.name?.toLowerCase() || '';
        const cc = i.clinicalSummary?.chiefComplaint?.toLowerCase() || '';
        const rawCc = i.chiefComplaint?.toLowerCase() || '';
        return patientName.includes(searchLower) || cc.includes(searchLower) || rawCc.includes(searchLower);
      });
    }

    res.json({ success: true, count: interviews.length, queue: interviews });
  } catch (err) {
    next(err);
  }
}

/**
 * GET /api/doctor/patients/:id
 * Retrieve full details for a specific interview (the clinical record)
 */
export async function getPatientDetail(req, res, next) {
  try {
    const { id } = req.params; // This is the interview ID
    
    const interview = await Interview.findById(id).populate('patientId', 'name age gender phone');
    if (!interview) {
      return res.status(404).json({ success: false, message: 'Record not found' });
    }

    // Optionally mark it as IN_REVIEW if it's currently READY_FOR_REVIEW
    if (interview.queueStatus === 'READY_FOR_REVIEW') {
      interview.queueStatus = 'IN_REVIEW';
      await interview.save();
    }

    // Fetch documents associated with this interview (or patient)
    const Document = (await import('../models/Document.js')).default;
    const documents = await Document.find({ 
      $or: [
        { interviewId: interview._id },
        { patientId: interview.patientId._id }
      ]
    }).sort({ createdAt: -1 });

    res.json({ success: true, record: interview, documents });
  } catch (err) {
    next(err);
  }
}

/**
 * PATCH /api/doctor/interviews/:id/review
 * Mark an interview as REVIEWED
 */
export async function markReviewed(req, res, next) {
  try {
    const { id } = req.params;
    
    const interview = await Interview.findById(id);
    if (!interview) {
      return res.status(404).json({ success: false, message: 'Record not found' });
    }

    interview.queueStatus = 'REVIEWED';
    interview.reviewedBy = req.user.id; // Provided by requireAuth middleware
    interview.reviewedAt = new Date();

    await interview.save();

    res.json({ success: true, record: interview });
  } catch (err) {
    next(err);
  }
}
