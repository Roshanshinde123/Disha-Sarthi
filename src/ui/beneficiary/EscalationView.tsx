import React from 'react';
import { ConversationEvent, Session } from '../../core/types';
import coordinatorsData from '../../data/coordinators.json';

interface EscalationViewProps {
  session: Session;
  onEvent: (event: ConversationEvent) => void;
}

export const EscalationView: React.FC<EscalationViewProps> = ({ session, onEvent }) => {
  const coordinators = coordinatorsData as any[];
  const userDistrict = session.profile.district || 'Varanasi';
  const coord =
    coordinators.find((c) => c.district.toLowerCase() === userDistrict.toLowerCase()) ||
    coordinators[0];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', paddingBottom: '24px' }}>
      <div style={{ background: '#F7E9E8', border: '2px solid #A8322D', padding: '16px', borderRadius: '12px' }}>
        <h1 style={{ fontSize: '1.4rem', fontWeight: 800, color: '#A8322D' }}>
          👨‍💼 जिला समन्वयक सहायता (Direct Coordinator Contact)
        </h1>
        <p style={{ color: 'var(--ink)', fontSize: '0.95rem', marginTop: '6px' }}>
          स्वचालित वार्तालाप रोक दिया गया है। आप सीधे अपने जिले के पीएम-अजय समन्वयक से फोन पर बात कर सकते हैं।
        </p>
      </div>

      <div className="rec-card">
        <h2 style={{ fontSize: '1.2rem', fontWeight: 700 }}>{coord.name}</h2>
        <div style={{ color: 'var(--muted)', fontSize: '0.9rem' }}>
          पीएम-अजय जिला समन्वयक • {coord.district}, {coord.state}
        </div>

        <div style={{ marginTop: '12px', fontSize: '1.1rem', fontWeight: 'bold', color: 'var(--field-deep)' }}>
          📞 {coord.phone}
        </div>

        <div style={{ display: 'flex', gap: '10px', marginTop: '14px' }}>
          <a
            href={`tel:${coord.phone.replace(/\s+/g, '')}`}
            className="btn-primary"
            style={{ textDecoration: 'none' }}
          >
            📞 अभी कॉल करें (Call Now)
          </a>
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
        <button
          type="button"
          id="btn-escalation-restart"
          className="btn-secondary"
          onClick={() => onEvent({ type: 'RESTART' })}
        >
          🔄 मुख्य मेनू पर वापस जाएं (Restart Intake)
        </button>
      </div>
    </div>
  );
};
