import Patient from '../models/Patient.js';
import Interview from '../models/Interview.js';
import Document from '../models/Document.js';
import User from '../models/User.js';

export const getSystemStats = async (req, res, next) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Patients
    const totalPatients = await Patient.countDocuments();
    const patientsToday = await Patient.countDocuments({ createdAt: { $gte: today } });

    // Interviews
    const interviews = await Interview.aggregate([
      {
        $group: {
          _id: null,
          total: { $sum: 1 },
          completed: {
            $sum: { $cond: [{ $eq: ['$isComplete', true] }, 1, 0] }
          },
          inProgress: {
            $sum: { $cond: [{ $eq: ['$isComplete', false] }, 1, 0] }
          },
          readyForReview: {
            $sum: { $cond: [{ $eq: ['$queueStatus', 'READY_FOR_REVIEW'] }, 1, 0] }
          },
          inReview: {
            $sum: { $cond: [{ $eq: ['$queueStatus', 'IN_REVIEW'] }, 1, 0] }
          },
          reviewed: {
            $sum: { $cond: [{ $eq: ['$queueStatus', 'REVIEWED'] }, 1, 0] }
          }
        }
      }
    ]);

    const interviewStats = interviews[0] || {
      total: 0, completed: 0, inProgress: 0, readyForReview: 0, inReview: 0, reviewed: 0
    };

    // Documents / OCR
    const docs = await Document.aggregate([
      {
        $group: {
          _id: null,
          total: { $sum: 1 },
          completed: {
            $sum: { $cond: [{ $eq: ['$ocrStatus', 'COMPLETED'] }, 1, 0] }
          },
          failed: {
            $sum: { $cond: [{ $eq: ['$ocrStatus', 'FAILED'] }, 1, 0] }
          },
          aiSuccess: {
            $sum: { $cond: [{ $ifNull: ['$aiExtraction', false] }, 1, 0] }
          }
        }
      }
    ]);

    const docStats = docs[0] || { total: 0, completed: 0, failed: 0, aiSuccess: 0 };

    // Registrations over last 7 days for chart
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 6);
    sevenDaysAgo.setHours(0,0,0,0);

    const registrationsTrend = await Patient.aggregate([
      { $match: { createdAt: { $gte: sevenDaysAgo } } },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
          count: { $sum: 1 }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    // Fill missing days
    const trendData = [];
    for (let i = 0; i < 7; i++) {
      const d = new Date(sevenDaysAgo);
      d.setDate(d.getDate() + i);
      const dateStr = d.toISOString().split('T')[0];
      const found = registrationsTrend.find(x => x._id === dateStr);
      trendData.push({
        date: dateStr,
        patients: found ? found.count : 0
      });
    }

    res.json({
      success: true,
      stats: {
        patients: { total: totalPatients, today: patientsToday, trend: trendData },
        interviews: interviewStats,
        documents: docStats
      }
    });

  } catch (err) {
    next(err);
  }
};

export const getDoctorWorkload = async (req, res, next) => {
  try {
    // We want to group interviews by assigned doctor, but right now interviews aren't explicitly assigned to a doctor until reviewed, or maybe they just sit in a general queue.
    // The prompt says: "Doctor Workload - Patients waiting, Patients reviewed".
    // If we look at the queue, 'REVIEWED' might have a doctor ID attached if they reviewed it. Wait, does `Interview.js` have a `reviewedBy` field?
    
    // Let's check `Interview` model for how 'reviewed' is tracked.
    // Assuming we just want active doctors and how many they have reviewed.
    
    // Actually, any Doctor can pull from the queue. Let's aggregate by `reviewedBy` if it exists.
    const workload = await Interview.aggregate([
      { $match: { queueStatus: 'REVIEWED', reviewedBy: { $exists: true, $ne: null } } },
      {
        $group: {
          _id: '$reviewedBy',
          reviewedCount: { $sum: 1 }
        }
      },
      {
        $lookup: {
          from: 'users',
          localField: '_id',
          foreignField: '_id',
          as: 'doctor'
        }
      },
      { $unwind: '$doctor' },
      {
        $project: {
          _id: 1,
          name: '$doctor.name',
          email: '$doctor.email',
          specialty: '$doctor.specialty',
          reviewedCount: 1
        }
      },
      { $sort: { reviewedCount: -1 } }
    ]);

    // If doctors haven't reviewed anything, they won't show up. We can just fetch all doctors and merge.
    const doctors = await User.find({ role: 'DOCTOR' }).select('name email specialty');
    const result = doctors.map(doc => {
      const stats = workload.find(w => w._id.toString() === doc._id.toString());
      return {
        id: doc._id,
        name: doc.name,
        email: doc.email,
        specialty: doc.specialty,
        reviewedCount: stats ? stats.reviewedCount : 0,
        // Since there is a global queue, 'waiting' is global, but if we have assigned patients, we'd count them here.
        // For MediKiosk, patients waiting are pooled for all doctors.
      };
    });

    // Also get the global queue count
    const globalWaiting = await Interview.countDocuments({ queueStatus: { $in: ['READY_FOR_REVIEW', 'IN_REVIEW'] } });

    res.json({
      success: true,
      doctors: result,
      globalWaiting
    });

  } catch (err) {
    next(err);
  }
};
