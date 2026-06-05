import { useState } from 'react';
import { ChevronDown } from 'lucide-react';
import { IconAlert } from '../../ds/Icons.jsx';

// 제품별 추가 안내(additional_content) 단일 항목 — { title, body }
function NoticeItem({ title, body }) {
  return (
    <div className="d-detail-notice-item">
      {title && <div className="d-detail-notice-item-title">{title}</div>}
      {body && <p className="d-detail-notice-item-body">{body}</p>}
    </div>
  );
}

// 주의사항/교차오염 등 경고성 텍스트 블록
function CautionBlock({ label, text }) {
  if (!text) return null;
  return (
    <div className="d-detail-notice-caution">
      <IconAlert size={14} />
      <div>
        <span className="d-detail-notice-caution-label">{label}</span>
        <span className="d-detail-notice-caution-text">{text}</span>
      </div>
    </div>
  );
}

// 추가 안내 카드 — additional_content + caution_notes + 교차오염
// 표시할 내용이 하나도 없으면 렌더하지 않음
export function ProductNotice({ additionalContent, cautionNotes, crossContamination }) {
  const [open, setOpen] = useState(false);
  const items = (Array.isArray(additionalContent) ? additionalContent : []).filter(
    (it) => it && (it.title || it.body),
  );
  const hasCaution = Boolean(cautionNotes) || Boolean(crossContamination);

  if (items.length === 0 && !hasCaution) return null;

  return (
    <section className="d-detail-card d-detail-notice">
      <header className="d-detail-card-head d-detail-notice-head">
        <button
          type="button"
          className="d-detail-notice-toggle"
          onClick={() => setOpen((v) => !v)}
          aria-expanded={open}
        >
          <span className="d-detail-card-title">추가 안내</span>
          <ChevronDown size={18} className={open ? 'is-open' : ''} />
        </button>
      </header>

      {open && (
        <>
          {items.length > 0 && (
            <div className="d-detail-notice-list">
              {items.map((it, i) => (
                <NoticeItem key={i} title={it.title} body={it.body} />
              ))}
            </div>
          )}

          {hasCaution && (
            <div className="d-detail-notice-cautions">
              <CautionBlock label="주의사항" text={cautionNotes} />
              <CautionBlock label="교차오염 가능성" text={crossContamination} />
            </div>
          )}
        </>
      )}
    </section>
  );
}
