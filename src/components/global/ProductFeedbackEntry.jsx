import { MessageCircle } from 'lucide-react';
import { openSiteFeedback } from '../../data/siteFeedback.js';

export default function ProductFeedbackEntry() {
  return (
    <div className="product-feedback-entry">
      <button
        type="button"
        className="product-feedback-entry-button"
        onClick={() => openSiteFeedback({
          type: 'data_error',
          entryPoint: 'product_data_error',
        })}
      >
        <MessageCircle size={14} aria-hidden />
        제품 정보 오류 제보
      </button>
    </div>
  );
}
