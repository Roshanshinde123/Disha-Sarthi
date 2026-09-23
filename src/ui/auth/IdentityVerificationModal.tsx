// Disha Sarathi - Demo Identity Verification & Aadhaar Masking Modal (PS 26097)
import React, { useState } from 'react';
import { addAuditLog } from '../../core/store';

export type IdentityDocType = 'AADHAAR' | 'VOTER_ID' | 'PAN' | 'RATION_CARD';
export type IdentityVerificationStatus = 'NOT_SUBMITTED' | 'SUBMITTED' | 'UNDER_REVIEW' | 'VERIFIED' | 'NEEDS_CORRECTION';

interface IdentityVerificationModalProps {
  userId: string;
  userName: string;
  isOpen: boolean;
  onClose: () => void;
  onVerificationComplete?: (status: IdentityVerificationStatus, maskedId: string) => void;
}

export const IdentityVerificationModal: React.FC<IdentityVerificationModalProps> = ({
  userId,
  userName,
  isOpen,
  onClose,
  onVerificationComplete
}) => {
  const [docType, setDocType] = useState<IdentityDocType>('AADHAAR');
  const [idNumber, setIdNumber] = useState('');
  const [fileName, setFileName] = useState<string | null>(null);
  const [status, setStatus] = useState<IdentityVerificationStatus>('NOT_SUBMITTED');
  const [msg, setMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  // Mask sensitive identity numbers for display (never expose in logs/LLMs)
  const getMaskedNumber = (raw: string, type: IdentityDocType): string => {
    const digits = raw.replace(/[^0-9A-Za-z]/g, '');
    if (type === 'AADHAAR') {
      if (digits.length >= 12) {
        return `XXXX XXXX ${digits.slice(-4)}`;
      }
      return `XXXX XXXX ${digits.slice(-4) || '1234'}`;
    }
    if (digits.length >= 4) {
      return `*** *** ${digits.slice(-4)}`;
    }
    return `*** *** 5678`;
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFileName(e.target.files[0].name);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!idNumber.trim()) {
      setMsg('⚠️ कृपया ओळख दस्तऐवज क्रमांक प्रविष्ट करा.');
      return;
    }

    const masked = getMaskedNumber(idNumber, docType);
    setStatus('SUBMITTED');
    setMsg('✅ दस्तऐवज यशस्वीरित्या सादर केला गेला आहे (Submitted for Review).');

    // Record privacy-safe audit log (without raw Aadhaar numbers or documents)
    await addAuditLog(
      'IDENTITY_DOCUMENT_SUBMITTED',
      `User ${userName} (${userId}) submitted demo identity verification for ${docType} (Masked: ${masked}).`,
      userId,
      'BENEFICIARY',
      'WEB_PORTAL'
    );

    // Simulate coordinator review workflow after 1 second
    setTimeout(() => {
      setStatus('VERIFIED');
      setMsg('🎉 ओळख दस्तऐवज यशस्वीरित्या सत्यापित झाले (Demo Verified)!');
      onVerificationComplete?.('VERIFIED', masked);
    }, 1200);
  };

  return (
    <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.65)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999, padding: '16px' }}>
      <div style={{ background: '#FFFFFF', borderRadius: '16px', maxWidth: '520px', width: '100%', padding: '28px', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.3)', maxHeight: '90vh', overflowY: 'auto' }}>
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
          <div>
            <span className="demo-pill" style={{ marginBottom: '6px' }}>
              🛡️ PM-AJAY GIA Component • Demo Verification
            </span>
            <h2 style={{ fontSize: '1.3rem', fontWeight: 800, color: '#0F172A', margin: '4px 0 0' }}>
              ओळखपत्र पडताळणी (Identity Verification)
            </h2>
          </div>
          <button type="button" onClick={onClose} style={{ background: 'none', border: 'none', fontSize: '1.4rem', cursor: 'pointer', color: '#64748B' }}>
            ✕
          </button>
        </div>

        {/* Security & Privacy Notice */}
        <div style={{ background: '#EFF6FF', border: '1px solid #BFDBFE', borderRadius: '8px', padding: '12px', fontSize: '0.82rem', color: '#1E40AF', marginBottom: '18px', lineHeight: 1.5 }}>
          🔒 <strong>गोपनीयता सुरक्षा (DPDP Act Compliance):</strong><br />
          आपला आधार किंवा ओळख क्रमांक सुरक्षित राहील. पूर्ण क्रमांक कधीही सार्वजनिक केला जात नाही (केवळ XXXX XXXX 1234 स्वरूप दिसेल).
        </div>

        {status === 'VERIFIED' ? (
          <div style={{ textAlign: 'center', padding: '24px 12px' }}>
            <div style={{ fontSize: '3rem', marginBottom: '10px' }}>✅</div>
            <h3 style={{ color: '#166534', margin: '0 0 6px' }}>ओळख पडताळणी पूर्ण झाली!</h3>
            <p style={{ color: '#64748B', fontSize: '0.9rem', marginBottom: '18px' }}>
              आपले {docType} दस्तऐवज (मास्क: <strong>{getMaskedNumber(idNumber, docType)}</strong>) यशस्वीरित्या पडताळले गेले आहे.
            </p>
            <button
              type="button"
              className="btn-primary"
              style={{ padding: '10px 24px', fontWeight: 700 }}
              onClick={onClose}
            >
              डॅशबोर्डवर सुरू ठेवा →
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            {/* Document Type Selection */}
            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#334155', marginBottom: '4px' }}>
                दस्तऐवज प्रकार निवडा (Select Document Type):
              </label>
              <select
                value={docType}
                onChange={(e) => setDocType(e.target.value as IdentityDocType)}
                style={{ width: '100%', padding: '9px 12px', border: '1px solid #CBD5E1', borderRadius: '6px', fontSize: '0.9rem', background: '#FFF', boxSizing: 'border-box' }}
              >
                <option value="AADHAAR">आधार कार्ड (Aadhaar Card - Masked)</option>
                <option value="VOTER_ID">मतदान ओळखपत्र (Voter ID Card)</option>
                <option value="RATION_CARD">रेशन कार्ड (Ration Card)</option>
                <option value="PAN">पॅन कार्ड (PAN Card)</option>
              </select>
            </div>

            {/* Document Number Input */}
            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#334155', marginBottom: '4px' }}>
                {docType === 'AADHAAR' ? '१२-अंकी आधार क्रमांक (Aadhaar Number):' : 'ओळखपत्र क्रमांक (Document Number):'}
              </label>
              <input
                type="text"
                required
                placeholder={docType === 'AADHAAR' ? 'उदा. 1234 5678 9012' : 'उदा. ABC1234567'}
                value={idNumber}
                onChange={(e) => setIdNumber(e.target.value)}
                style={{ width: '100%', padding: '9px 12px', border: '1px solid #CBD5E1', borderRadius: '6px', fontSize: '0.9rem', boxSizing: 'border-box' }}
              />
              <small style={{ color: '#94A3B8', fontSize: '0.75rem', display: 'block', marginTop: '3px' }}>
                पूर्वावलोकन: {idNumber ? getMaskedNumber(idNumber, docType) : 'XXXX XXXX 1234'}
              </small>
            </div>

            {/* File Upload Box */}
            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#334155', marginBottom: '4px' }}>
                दस्तऐवजाची प्रत अपलोड करा (Upload Scan / Photo):
              </label>
              <div style={{ border: '2px dashed #CBD5E1', borderRadius: '8px', padding: '16px', textAlign: 'center', background: '#F8FAFC' }}>
                <input
                  type="file"
                  id="identity-file-input"
                  accept="image/jpeg,image/png,application/pdf"
                  onChange={handleFileChange}
                  style={{ display: 'none' }}
                />
                <label htmlFor="identity-file-input" style={{ cursor: 'pointer' }}>
                  <div style={{ fontSize: '1.8rem', marginBottom: '6px' }}>📄</div>
                  <span style={{ color: '#2563EB', fontWeight: 600, fontSize: '0.88rem' }}>
                    {fileName ? fileName : 'फाइल निवडा (Choose File: PDF, JPG, PNG)'}
                  </span>
                  <small style={{ display: 'block', color: '#94A3B8', marginTop: '4px' }}>
                    कमाल आकार: 5MB
                  </small>
                </label>
              </div>
            </div>

            {msg && (
              <div style={{ padding: '8px 12px', borderRadius: '6px', fontSize: '0.85rem', background: '#F1F5F9', color: '#0F172A', fontWeight: 500 }}>
                {msg}
              </div>
            )}

            <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end', marginTop: '10px' }}>
              <button
                type="button"
                onClick={onClose}
                style={{ padding: '9px 16px', border: '1px solid #CBD5E1', background: '#F8FAFC', borderRadius: '6px', cursor: 'pointer' }}
              >
                रद्द करा (Cancel)
              </button>
              <button
                type="submit"
                className="btn-primary"
                style={{ padding: '9px 20px', fontWeight: 700 }}
              >
                पडताळणीसाठी सादर करा (Submit & Verify) →
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
