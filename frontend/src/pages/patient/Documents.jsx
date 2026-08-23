// src/pages/patient/Documents.jsx
import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Upload, X, FileText, Image, File, CheckCircle2, ArrowRight, Loader2 } from 'lucide-react';
import { PatientLayout } from '../../layouts/PatientLayout';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { usePatient } from '../../context/PatientContext';
import { useTranslation } from '../../hooks/useTranslation';

const DOC_TYPES_EN = ['Prescription', 'Lab Report', 'Discharge Summary', 'Scan/X-Ray', 'Other'];
const DOC_TYPES_HI = ['नुस्खा', 'लैब रिपोर्ट', 'डिस्चार्ज सारांश', 'स्कैन/X-रे', 'अन्य'];

const TYPE_ICONS = {
  'Prescription': FileText, 'नुस्खा': FileText,
  'Lab Report': FileText,   'लैब रिपोर्ट': FileText,
  'Discharge Summary': File, 'डिस्चार्ज सारांश': File,
  'Scan/X-Ray': Image,       'स्कैन/X-रे': Image,
  'Other': File,             'अन्य': File,
};

export default function Documents() {
  const navigate = useNavigate();
  const { addDocument, documents, removeDocument, language } = usePatient();
  const { t } = useTranslation();
  const fileRef = useRef(null);

  const [selectedType, setSelectedType] = useState('');
  const [uploading, setUploading] = useState(false);
  const [dragOver, setDragOver] = useState(false);

  const docTypes = language === 'hi' ? DOC_TYPES_HI : DOC_TYPES_EN;

  const processFile = async (file) => {
    if (!file) return;
    if (!['image/jpeg', 'image/png', 'application/pdf'].includes(file.type)) {
      alert(language === 'hi' ? 'केवल PDF, JPG, PNG फ़ाइलें समर्थित हैं।' : 'Only PDF, JPG, PNG files supported.');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      alert(language === 'hi' ? 'फ़ाइल 5MB से छोटी होनी चाहिए।' : 'File must be under 5MB.');
      return;
    }
    
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('document', file);
      // We pass patientId if needed, but the JWT already has it
      
      // We use require from services/api.js. We need to import it at the top.
      const { documentAPI } = await import('../../services/api');
      
      const response = await documentAPI.upload(formData);
      
      if (response.data.success) {
        const uploadedDoc = response.data.document;
        // The backend returns the document info including OCR text/AI extraction
        addDocument({
          id: uploadedDoc._id,
          name: uploadedDoc.originalName,
          type: selectedType || (language === 'hi' ? 'अन्य' : 'Other'),
          url: uploadedDoc.storageUrl,
          fileType: uploadedDoc.mimetype,
          size: uploadedDoc.size,
          status: uploadedDoc.ocrStatus.toLowerCase(),
          extractedText: uploadedDoc.extractedText,
          aiExtraction: uploadedDoc.aiExtraction
        });
      }
    } catch (err) {
      console.error('Upload failed', err);
      alert(language === 'hi' ? 'अपलोड विफल रहा। कृपया पुनः प्रयास करें।' : 'Upload failed. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  const handleFileChange = (e) => {
    Array.from(e.target.files || []).forEach(processFile);
    e.target.value = '';
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    Array.from(e.dataTransfer.files).forEach(processFile);
  };

  const formatSize = (bytes) => {
    if (bytes < 1024) return `${bytes}B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)}KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)}MB`;
  };

  return (
    <PatientLayout showProgress currentStep={5}>
      <div className="space-y-6">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-[var(--color-text-primary)]">{t('documents.title')}</h1>
          <p className="text-[var(--color-text-secondary)] mt-1 text-sm">{t('documents.subtitle')}</p>
        </div>

        {/* Document type selector */}
        <div>
          <p className="text-sm font-medium text-[var(--color-text-primary)] mb-2">
            {language === 'hi' ? 'दस्तावेज़ का प्रकार चुनें' : 'Select document type'}
          </p>
          <div className="flex flex-wrap gap-2">
            {docTypes.map(type => {
              const Icon = TYPE_ICONS[type] || File;
              return (
                <button
                  key={type}
                  id={`doc-type-${type}`}
                  onClick={() => setSelectedType(type)}
                  className={`
                    flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-medium
                    border-2 transition-all duration-150 touch-target
                    ${selectedType === type
                      ? 'bg-[#2563EB] border-[#2563EB] text-white'
                      : 'border-[var(--color-border)] text-[var(--color-text-secondary)] hover:border-[#2563EB]'
                    }
                  `}
                >
                  <Icon size={14} />
                  {type}
                </button>
              );
            })}
          </div>
        </div>

        {/* Drop zone */}
        <div
          onDragOver={e => { e.preventDefault(); setDragOver(true); }}
          onDragLeave={() => setDragOver(false)}
          onDrop={handleDrop}
          onClick={() => fileRef.current?.click()}
          className={`
            relative border-2 border-dashed rounded-2xl p-10 text-center cursor-pointer
            transition-all duration-200
            ${dragOver
              ? 'border-[#2563EB] bg-blue-50 scale-[1.02]'
              : 'border-[var(--color-border)] bg-white hover:border-[#2563EB] hover:bg-blue-50/30'
            }
          `}
        >
          <input
            ref={fileRef}
            type="file"
            multiple
            accept=".pdf,.jpg,.jpeg,.png"
            onChange={handleFileChange}
            className="hidden"
          />
          {uploading ? (
            <div className="flex flex-col items-center gap-3">
              <Loader2 size={40} className="text-[#2563EB] animate-spin-slow" />
              <p className="text-[#2563EB] font-medium text-sm">
                {language === 'hi' ? 'अपलोड हो रहा है...' : 'Uploading...'}
              </p>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-3">
              <div className="w-16 h-16 rounded-2xl bg-blue-50 border border-blue-100 flex items-center justify-center">
                <Upload size={28} className="text-[#2563EB]" />
              </div>
              <div>
                <p className="font-semibold text-[var(--color-text-primary)]">
                  {t('documents.upload')}
                </p>
                <p className="text-[var(--color-text-muted)] text-sm mt-1">
                  PDF, JPG, PNG · Max 10MB
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Uploaded files */}
        {documents.length > 0 && (
          <div className="space-y-2">
            <p className="text-sm font-medium text-[var(--color-text-secondary)]">
              {language === 'hi' ? 'अपलोड किए गए दस्तावेज़' : 'Uploaded documents'} ({documents.length})
            </p>
            {documents.map((doc) => {
              const Icon = TYPE_ICONS[doc.type] || File;
              return (
                <div key={doc.id} className="card p-4 flex items-center gap-4">
                  <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center flex-shrink-0">
                    <Icon size={20} className="text-[#2563EB]" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-[var(--color-text-primary)] truncate">{doc.name}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <Badge variant="primary" className="text-xs">{doc.type}</Badge>
                      <span className="text-xs text-[var(--color-text-muted)]">{formatSize(doc.size)}</span>
                    </div>
                  </div>
                  <CheckCircle2 size={18} className="text-[var(--color-success)] flex-shrink-0" />
                  <button
                    onClick={() => removeDocument(doc.id)}
                    className="p-1.5 rounded-lg hover:bg-red-50 text-[var(--color-text-muted)] hover:text-[var(--color-danger)] transition-colors"
                  >
                    <X size={16} />
                  </button>
                </div>
              );
            })}
          </div>
        )}

        {/* Actions */}
        <div className="space-y-3">
          <Button
            id="btn-documents-continue"
            variant="gradient"
            size="xl"
            className="w-full"
            onClick={() => navigate('/patient/review')}
          >
            {t('documents.next')}
            <ArrowRight size={20} />
          </Button>
          <button
            id="btn-documents-skip"
            onClick={() => navigate('/patient/review')}
            className="w-full text-sm text-[var(--color-text-muted)] hover:text-[var(--color-text-secondary)] transition-colors py-2"
          >
            {t('documents.skip')}
          </button>
        </div>
      </div>
    </PatientLayout>
  );
}
