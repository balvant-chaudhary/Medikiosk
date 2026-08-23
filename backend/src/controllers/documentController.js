import fs from 'fs';
import path from 'path';
import Document from '../models/Document.js';
import { extractText } from '../services/ocrService.js';
import { extractInformationFromDocument } from '../services/geminiService.js';

/**
 * POST /api/documents
 * Uploads a document, performs OCR, and optionally AI extraction.
 * Protected by requirePatientAuth (or requireAuth for doctors testing it).
 */
export async function uploadDocument(req, res, next) {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'No file uploaded.' });
    }

    // Determine the patient ID. 
    // If it's a kiosk patient, it's in req.patientId. 
    // If it's a doctor/admin, we'd need it in req.body.
    // For this flow, we assume kiosk patient flow.
    let patientId = req.patientId;
    if (!patientId && req.user && req.user.role !== 'PATIENT') {
       patientId = req.body.patientId; 
    }

    if (!patientId) {
       // Cleanup file
       fs.unlinkSync(req.file.path);
       return res.status(400).json({ success: false, message: 'Patient ID is required.' });
    }

    const { interviewId } = req.body;

    const fileUrl = `/uploads/${req.file.filename}`;

    // Create document record in DB
    const docRecord = await Document.create({
      patientId,
      interviewId: interviewId || null,
      filename: req.file.filename,
      originalName: req.file.originalname,
      mimetype: req.file.mimetype,
      size: req.file.size,
      storageUrl: fileUrl,
      ocrStatus: 'PROCESSING',
    });

    // Start OCR asynchronously to not block the frontend for too long if we wanted, 
    // but the user requirement implies we wait for it to finish or return immediately.
    // We will await OCR to provide immediate feedback to the patient.
    try {
      const ocrText = await extractText(req.file.path, req.file.mimetype);
      docRecord.extractedText = ocrText;
      
      // If OCR yielded text, run Gemini extraction
      if (ocrText && ocrText.trim().length > 0) {
         const { extractedData, status } = await extractInformationFromDocument(ocrText);
         if (status === 'completed' && extractedData) {
            docRecord.aiExtraction = extractedData;
         }
      }

      docRecord.ocrStatus = 'COMPLETED';
      await docRecord.save();

      return res.status(201).json({
        success: true,
        message: 'Document processed successfully.',
        document: docRecord
      });

    } catch (processErr) {
      console.error('Document processing error:', processErr);
      docRecord.ocrStatus = 'FAILED';
      await docRecord.save();

      // Return 201 because the upload itself succeeded, but processing failed.
      return res.status(201).json({
        success: true, // upload succeeded
        message: 'Document uploaded, but OCR processing failed.',
        document: docRecord
      });
    }

  } catch (err) {
    if (req.file) {
      // Clean up on unhandled error
      try { fs.unlinkSync(req.file.path); } catch (e) {}
    }
    next(err);
  }
}

/**
 * GET /api/documents/:id
 * Retrieves a single document.
 * Must be owned by the requesting patient or accessed by a doctor.
 */
export async function getDocument(req, res, next) {
  try {
    const doc = await Document.findById(req.params.id);
    if (!doc) {
      return res.status(404).json({ success: false, message: 'Document not found.' });
    }

    // Auth check
    if (req.patientId && doc.patientId.toString() !== req.patientId) {
      return res.status(403).json({ success: false, message: 'Not authorized to view this document.' });
    }

    res.json({ success: true, document: doc });
  } catch (err) {
    next(err);
  }
}

/**
 * GET /api/patients/:patientId/documents
 * Retrieves all documents for a patient.
 */
export async function getPatientDocuments(req, res, next) {
  try {
    const { patientId } = req.params;

    // Auth check
    if (req.patientId && patientId !== req.patientId) {
      return res.status(403).json({ success: false, message: 'Not authorized.' });
    }

    const documents = await Document.find({ patientId }).sort({ createdAt: -1 });

    res.json({ success: true, documents });
  } catch (err) {
    next(err);
  }
}
