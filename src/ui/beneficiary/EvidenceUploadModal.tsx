// Disha Sarathi - Placement Evidence Upload Modal (PS 26097)
import React, { useState } from 'react';
import { EvidenceType, PlacementEvidence } from '../../core/types';
import { submitPlacementEvidence } from '../../core/store';

interface EvidenceUploadModalProps {
  beneficiaryId: string;
  onClose: () => void;
  onSuccess: (newEvidence: PlacementEvidence) => void;
}

export const EvidenceUploadModal: React.FC<EvidenceUploadModalProps> = ({
  beneficiaryId,
  onClose,
  onSuccess
}) => {
  const [evidenceType, setEvidenceType] = useState<EvidenceType>('JOINING_LETTER');
  const [employerName, setEmployerName] = useState('');
  const [designation, setDesignation] = useState('');
  const [joiningDate, setJoiningDate] = useState(new Date().toISOString().split('T')[0]);
  const [monthlyWage, setMonthlyWage] = useState('₹18,000/month');
  const [fileName, setFileName] = useState('Offer_Letter_Scan.pdf');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!employerName.trim() || !designation.trim()) {
      setErrorMsg('कृपया कंपनीचे नाव व पद प्रविष्ट करा.');
      return;
    }

    setIsSubmitting(true);
    try {
      const created = await submitPlacementEvidence({
        beneficiary_id: beneficiaryId,
        evidence_type: evidenceType,
        document_name: fileName,
        employer_name: employerName.trim(),
        designation: designation.trim(),
        joining_date: joiningDate,
        monthly_wage_inr: monthlyWage.trim(),
        is_demo: false
      });
      setIsSubmitting(false);
      onSuccess(created);
    } catch (err: any) {
      setIsSubmitting(false);
      setErrorMsg(`त्रुटी: ${err.message}`);
    }
  };

  return (
    <div className="modal-backdrop" style={{ position: 'fixed', inset: 0, background: 'rgba(20,32,26,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999, padding: '16px' }}>
      <div className="modal-dialog dash-card" style={{ background: '#FFFFFF', maxWidth: '520px', width: '100%', maxHeight: '90vh', overflowY: 'auto', borderRadius: '16px', padding: '24px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--stone)', paddingBottom: '12px', marginBottom: '16px' }}>
          <div>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--ink)' }}>
              📄 रोजगार पुरावा सादर करा (Submit Placement Evidence)
            </h3>
            <div style={{ fontSize: '0.8rem', color: 'var(--muted)' }}>
              PM-AJAY GIA Component • Verification & Nodal Approval
            </div>
          </div>
          <button type="button" className="btn-ctrl" onClick={onClose} style={{ padding: '4px 10px' }}>✕</button>
        </div>

        {errorMsg && (
          <div style={{ padding: '8px 12px', background: '#F7E9E8', color: '#A8322D', borderRadius: '6px', fontSize: '0.85rem', marginBottom: '14px' }}>
            {errorMsg}
          </div>
        )}

        {/* Informative Notice */}
        <div style={{ background: '#FFFDF9', border: '1px solid #E0A32E', padding: '10px 12px', borderRadius: '8px', fontSize: '0.82rem', color: '#8A5B00', marginBottom: '16px' }}>
          ℹ️ <strong>महत्त्वाचे:</strong> कागदपत्रे अपलोड केल्यानंतर ती थेट प्रमाणित होत नाहीत. GIA समन्वयकाद्वारे तपासणी झाल्यावरच <em>"COORDINATOR_VERIFIED"</em> स्थिती प्राप्त होईल.
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          {/* Document Type */}
          <div className="form-group">
            <label className="form-label">कागदपत्राचा प्रकार (Evidence Document Type):</label>
            <select
              className="app-input"
              value={evidenceType}
              onChange={(e) => setEvidenceType(e.target.value as EvidenceType)}
            >
              <option value="JOINING_LETTER">रुजू अहवाल / पत्र (Joining Letter)</option>
              <option value="OFFER_LETTER">ऑफर लेटर (Offer Letter)</option>
              <option value="APPOINTMENT_LETTER">नियुक्ती पत्र (Appointment Letter)</option>
              <option value="EMPLOYER_CONFIRMATION">नियोक्ता पुष्टीकरण ईमेल/पत्र (Employer Confirmation)</option>
              <option value="EMPLOYMENT_ID">कर्मचारी ओळखपत्र (Employment ID Card)</option>
              <option value="OTHER">इतर अधिकृत पुरावा (Other Approved Proof)</option>
            </select>
          </div>

          {/* Employer Name */}
          <div className="form-group">
            <label className="form-label">कंपनी / आस्थापनेचे नाव (Employer / Agency Name):</label>
            <input
              type="text"
              className="app-input"
              placeholder="e.g. Mahindra Auto Ancillary / Tata Power Solar"
              value={employerName}
              onChange={(e) => setEmployerName(e.target.value)}
              required
            />
          </div>

          {/* Designation */}
          <div className="form-group">
            <label className="form-label">पद / कामाचे नाव (Designation / Job Role):</label>
            <input
              type="text"
              className="app-input"
              placeholder="e.g. Solar PV Assembly Technician"
              value={designation}
              onChange={(e) => setDesignation(e.target.value)}
              required
            />
          </div>

          {/* Joining Date & Monthly Wage */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <div className="form-group">
              <label className="form-label">रुजू दिनांक (Joining Date):</label>
              <input
                type="date"
                className="app-input"
                value={joiningDate}
                onChange={(e) => setJoiningDate(e.target.value)}
              />
            </div>
            <div className="form-group">
              <label className="form-label">मासिक वेतन (Monthly Wage):</label>
              <input
                type="text"
                className="app-input"
                placeholder="e.g. ₹18,500/month"
                value={monthlyWage}
                onChange={(e) => setMonthlyWage(e.target.value)}
              />
            </div>
          </div>

          {/* Simulated File Upload Input */}
          <div className="form-group">
            <label className="form-label">दस्तऐवज फाइल निवडा (Select File / Photo):</label>
            <input
              type="file"
              className="app-input"
              accept=".pdf,.png,.jpg,.jpeg"
              onChange={(e) => {
                if (e.target.files && e.target.files[0]) {
                  setFileName(e.target.files[0].name);
                }
              }}
            />
            <small style={{ color: 'var(--muted)', fontSize: '0.75rem', marginTop: '2px', display: 'block' }}>
              फाइल: {fileName} (PDF, JPEG, PNG समर्थित)
            </small>
          </div>

          {/* Submit and Cancel Buttons */}
          <div style={{ display: 'flex', gap: '10px', marginTop: '12px' }}>
            <button
              type="button"
              className="btn-secondary"
              style={{ flex: 1 }}
              onClick={onClose}
            >
              रद्द करा (Cancel)
            </button>
            <button
              type="submit"
              className="btn-primary"
              style={{ flex: 2 }}
              disabled={isSubmitting}
            >
              {isSubmitting ? 'सादर होत आहे...' : '📤 पुरावा सादर करा (Submit Proof)'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
