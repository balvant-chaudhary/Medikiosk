// src/pages/patient/Documents.jsx
import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Upload, X, FileText, Image, File, Check, ArrowRight, Loader2 } from 'lucide-react';
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
      const { documentAPI } = await import('../../services/api');
      const response = await documentAPI.upload(formData);
      if (response.data.success) {
        const uploadedDoc = response.data.document;
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
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>

        {/* Header */}
        <div>
          <p style={{
            fontSize: '0.6875rem',
            fontWeight: 600,
            color: 'var(--color-text-muted)',
            letterSpacing: '0.08em',
            textTransform: 'uppercase',
            marginBottom: '0.5rem',
          }}>
            Step 5 of 6
          </p>
          <h1 style={{ fontSize: '1.25rem', fontWeight: 600, color: 'var(--color-text-primary)', marginBottom: '0.375rem' }}>
            {t('documents.title')}
          </h1>
          <p style={{ fontSize: '0.875rem', color: 'var(--color-text-secondary)' }}>
            {t('documents.subtitle')}
          </p>
        </div>

        {/* Document type selector */}
        <div>
          <p style={{ fontSize: '0.8125rem', fontWeight: 500, color: 'var(--color-text-primary)', marginBottom: '0.5rem' }}>
            {language === 'hi' ? 'दस्तावेज़ का प्रकार चुनें' : 'Select document type'}
          </p>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
            {docTypes.map(type => {
              const Icon = TYPE_ICONS[type] || File;
              const selected = selectedType === type;
              return (
                <button
                  key={type}
                  id={`doc-type-${type}`}
                  onClick={() => setSelectedType(type)}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '0.375rem',
                    padding: '0.4375rem 0.875rem',
                    borderRadius: 'var(--radius-md)',
                    fontSize: '0.8125rem',
                    fontWeight: 500,
                    cursor: 'pointer',
                    border: `1px solid ${selected ? 'var(--color-primary)' : 'var(--color-border)'}`,
                    background: selected ? 'var(--color-accent-light)' : 'white',
                    color: selected ? 'var(--color-primary)' : 'var(--color-text-secondary)',
                    transition: 'all 0.15s',
                    fontFamily: 'Inter, sans-serif',
                  }}
                >
                  <Icon size={13} />
                  {type}
                </button>
              );
            })}
          </div>
        </div>

        {/* Upload zone */}
        <div
          onDragOver={e => { e.preventDefault(); setDragOver(true); }}
          onDragLeave={() => setDragOver(false)}
          onDrop={handleDrop}
          onClick={() => fileRef.current?.click()}
          style={{
            border: `1.5px dashed ${dragOver ? 'var(--color-primary)' : 'var(--color-border)'}`,
            borderRadius: 'var(--radius-lg)',
            padding: '2.5rem 2rem',
            textAlign: 'center',
            cursor: 'pointer',
            background: dragOver ? 'var(--color-accent-light)' : 'white',
            transition: 'all 0.15s',
          }}
        >
          <input
            ref={fileRef}
            type="file"
            multiple
            accept=".pdf,.jpg,.jpeg,.png"
            onChange={handleFileChange}
            style={{ display: 'none' }}
          />
          {uploading ? (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.75rem' }}>
              <Loader2 size={28} style={{ color: 'var(--color-primary)', animation: 'spin 1.2s linear infinite' }} />
              <p style={{ color: 'var(--color-primary)', fontSize: '0.875rem', fontWeight: 500 }}>
                {language === 'hi' ? 'अपलोड हो रहा है...' : 'Uploading...'}
              </p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.75rem' }}>
              <div style={{
                width: 44,
                height: 44,
                borderRadius: 8,
                background: 'var(--color-surface-2)',
                border: '1px solid var(--color-border)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}>
                <Upload size={20} color="var(--color-text-secondary)" />
              </div>
              <div>
                <p style={{ fontWeight: 600, fontSize: '0.9375rem', color: 'var(--color-text-primary)' }}>
                  {t('documents.upload')}
                </p>
                <p style={{ color: 'var(--color-text-muted)', fontSize: '0.8125rem', marginTop: 4 }}>
                  PDF, JPG, PNG · Max 10MB
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Uploaded files list */}
        {documents.length > 0 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            <p style={{ fontSize: '0.8125rem', fontWeight: 500, color: 'var(--color-text-secondary)' }}>
              {language === 'hi' ? 'अपलोड किए गए दस्तावेज़' : 'Uploaded documents'} ({documents.length})
            </p>
            {documents.map((doc) => {
              const Icon = TYPE_ICONS[doc.type] || File;
              return (
                <div key={doc.id} style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.875rem',
                  padding: '0.875rem 1rem',
                  background: 'white',
                  border: '1px solid var(--color-border)',
                  borderRadius: 'var(--radius-md)',
                }}>
                  <div style={{
                    width: 36,
                    height: 36,
                    borderRadius: 6,
                    background: 'var(--color-surface-2)',
                    border: '1px solid var(--color-border)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                  }}>
                    <Icon size={16} color="var(--color-text-secondary)" />
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{ fontSize: '0.875rem', fontWeight: 500, color: 'var(--color-text-primary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {doc.name}
                    </p>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: 2 }}>
                      <Badge variant="muted">{doc.type}</Badge>
                      <span style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>{formatSize(doc.size)}</span>
                    </div>
                  </div>
                  <Check size={15} color="var(--color-primary)" style={{ flexShrink: 0 }} />
                  <button
                    onClick={() => removeDocument(doc.id)}
                    style={{
                      padding: '0.375rem',
                      borderRadius: 4,
                      background: 'none',
                      border: 'none',
                      cursor: 'pointer',
                      color: 'var(--color-text-muted)',
                      display: 'flex',
                      transition: 'color 0.15s',
                    }}
                    onMouseEnter={e => e.currentTarget.style.color = 'var(--color-danger)'}
                    onMouseLeave={e => e.currentTarget.style.color = 'var(--color-text-muted)'}
                  >
                    <X size={15} />
                  </button>
                </div>
              );
            })}
          </div>
        )}

        {/* Actions */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          <Button
            id="btn-documents-continue"
            variant="primary"
            size="xl"
            style={{ width: '100%' }}
            onClick={() => navigate('/patient/review')}
          >
            {t('documents.next')}
            <ArrowRight size={16} />
          </Button>
          <button
            id="btn-documents-skip"
            onClick={() => navigate('/patient/review')}
            style={{
              width: '100%',
              padding: '0.75rem',
              fontSize: '0.8125rem',
              color: 'var(--color-text-muted)',
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              fontFamily: 'Inter, sans-serif',
            }}
          >
            {t('documents.skip')}
          </button>
        </div>
      </div>
    </PatientLayout>
  );
}
