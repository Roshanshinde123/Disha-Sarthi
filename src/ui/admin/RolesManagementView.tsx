// Disha Sarathi - Role-Based Access Control (RBAC) Permissions Matrix (PS 26097)
import React from 'react';

const PERMISSIONS_MATRIX = [
  {
    feature: 'व्हॉईस समुपदेशन व NLU (Voice Assessment)',
    beneficiary: '✅ पूर्ण प्रवेश (Full)',
    coordinator: '✅ चाचणी प्रवेश (Demo)',
    admin: '✅ पूर्ण प्रवेश (Full)'
  },
  {
    feature: 'वैयक्तिक कौशल्य पासपोर्ट व आकांक्षा कार्ड (Skill Passport & Card)',
    beneficiary: '✅ स्वतःचा पासपोर्ट (Own Only)',
    coordinator: '✅ सर्व लाभार्थ्यांचे (All)',
    admin: '✅ सर्व लाभार्थ्यांचे (All)'
  },
  {
    feature: 'रुजू पुरावा सादर करणे (Evidence Upload)',
    beneficiary: '✅ स्वतःचा पुरावा (Own)',
    coordinator: '❌ केवळ तपासणी (Review Only)',
    admin: '✅ चाचणी प्रवेश'
  },
  {
    feature: 'रुजू पुरावा तपासणी व मंजुरी (Evidence Verification Queue)',
    beneficiary: '❌ प्रवेश नाही (No Access)',
    coordinator: '✅ तपासणी व मंजुरी हक्क (Verify/Reject)',
    admin: '✅ पूर्ण प्रशासकीय हक्क (Full)'
  },
  {
    feature: 'जिल्हा नियोजन नकाशा व मॅट्रिक्स (Map & District Matrix)',
    beneficiary: '❌ प्रवेश नाही (No Access)',
    coordinator: '✅ पूर्ण प्रवेश (Full)',
    admin: '✅ पूर्ण प्रवेश (Full)'
  },
  {
    feature: '७, ३० व ९० दिवस पाठपुरावा नोंद (Follow-Up Logging)',
    beneficiary: '✅ स्व-अहवाल (Self-Report)',
    coordinator: '✅ अधिकृत नोंद (Coordinator Log)',
    admin: '✅ पूर्ण प्रवेश (Full)'
  },
  {
    feature: 'वापरकर्ता व भूमिका व्यवस्थापन (User Management)',
    beneficiary: '❌ प्रवेश नाही (No Access)',
    coordinator: '❌ प्रवेश नाही (No Access)',
    admin: '✅ पूर्ण नियंत्रण (Create/Deactivate)'
  },
  {
    feature: 'Exotel गेटवे व सिस्टीम सेटिंग्ज (System & Gateway Config)',
    beneficiary: '❌ प्रवेश नाही (No Access)',
    coordinator: '❌ प्रवेश नाही (No Access)',
    admin: '✅ पूर्ण नियंत्रण (Full Control)'
  }
];

export const RolesManagementView: React.FC = () => {
  return (
    <div className="roles-management-page" style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
      <div>
        <span className="demo-pill" style={{ marginBottom: '6px' }}>
          Security & Access Control • RBAC Matrix
        </span>
        <h2 style={{ fontSize: '1.45rem', fontWeight: 800, color: 'var(--ink)' }}>
          🛡️ भूमिका व प्रवेश परवानगी मॅट्रिक्स (Roles & Permissions)
        </h2>
        <p style={{ fontSize: '0.88rem', color: 'var(--muted)' }}>
          तीन प्रमुख भूमिकांसाठी निश्चित केलेल्या अधिकारांचे आणि मार्ग संरक्षणाचे (Route Guards) स्पष्ट विवरण.
        </p>
      </div>

      <div className="dash-card" style={{ background: '#FFFFFF', padding: 0, overflow: 'hidden' }}>
        <div style={{ overflowX: 'auto' }}>
          <table className="app-table" style={{ width: '100%', margin: 0, fontSize: '0.88rem' }}>
            <thead>
              <tr>
                <th>कार्यप्रणाली / घटक (Feature / Subsystem)</th>
                <th>👤 लाभार्थी (Beneficiary)</th>
                <th>📋 GIA समन्वयक (Coordinator)</th>
                <th>🛡️ प्रशासक (Admin)</th>
              </tr>
            </thead>
            <tbody>
              {PERMISSIONS_MATRIX.map((row, idx) => (
                <tr key={idx}>
                  <td><strong>{row.feature}</strong></td>
                  <td>{row.beneficiary}</td>
                  <td>{row.coordinator}</td>
                  <td>{row.admin}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
