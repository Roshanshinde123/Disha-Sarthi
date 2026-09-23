import React, { useState } from 'react';
import { ConversationEvent, Session } from '../../core/types';

interface FeedbackViewProps {
  session: Session;
  onEvent: (event: ConversationEvent) => void;
}

export const FeedbackView: React.FC<FeedbackViewProps> = ({ onEvent }) => {
  const [rating, setRating] = useState<number>(5);
  const [comment, setComment] = useState<string>('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onEvent({
      type: 'CHIP_CLICK',
      payload: { value: String(rating), comment }
    });
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', paddingBottom: '24px' }}>
      <div>
        <h1 style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--ink)' }}>
          सत्र प्रतिक्रिया (Session Feedback)
        </h1>
        <p style={{ color: 'var(--muted)', fontSize: '0.95rem' }}>
          दिशा सारथी के साथ आपकी बातचीत का अनुभव कैसा रहा?
        </p>
      </div>

      <form onSubmit={handleSubmit} className="rec-card" style={{ gap: '16px' }}>
        <div>
          <label style={{ fontWeight: 700, display: 'block', marginBottom: '8px' }}>
            रेटिंग चुनें (Rating):
          </label>
          <div style={{ display: 'flex', gap: '8px', fontSize: '1.8rem', cursor: 'pointer' }}>
            {[1, 2, 3, 4, 5].map((star) => (
              <span
                key={star}
                id={`star-${star}`}
                onClick={() => setRating(star)}
                style={{ color: star <= rating ? '#E0A32E' : '#D6D9D1' }}
              >
                ★
              </span>
            ))}
          </div>
        </div>

        <div>
          <label style={{ fontWeight: 700, display: 'block', marginBottom: '6px' }}>
            कोई सुझाव या टिप्पणी (Optional Comment):
          </label>
          <textarea
            className="app-input"
            rows={3}
            placeholder="आवाज समझने में कोई समस्या या अच्छा अनुभव..."
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            style={{ width: '100%', padding: '10px 12px', minHeight: '80px' }}
          />
        </div>

        <button type="submit" id="btn-submit-feedback" className="btn-primary">
          प्रतिक्रिया सबमिट करें (Submit Feedback) →
        </button>
      </form>
    </div>
  );
};
