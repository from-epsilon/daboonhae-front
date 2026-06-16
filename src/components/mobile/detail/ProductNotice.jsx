// 모바일 디테일 — 추가 안내 카드
// - additional_content({ title, body }) + caution_notes + 교차오염
// - 표시할 내용이 하나도 없으면 렌더하지 않음
import { IconAlert } from '../../ds/Icons.jsx';

// 추가 안내 단일 항목
function NoticeItem({ title, body }) {
  return (
    <div className="m-detail-notice-item">
      {title && <div className="m-detail-notice-item-title">{title}</div>}
      {body && <p className="m-detail-notice-item-body">{body}</p>}
    </div>
  );
}

// 주의사항/교차오염 등 경고성 텍스트 블록
function CautionBlock({ label, text }) {
  if (!text) return null;
  return (
    <div className="m-detail-notice-caution">
      <IconAlert size={14} />
      <div>
        <span className="m-detail-notice-caution-label">{label}</span>
        <span className="m-detail-notice-caution-text">{text}</span>
      </div>
    </div>
  );
}

export function ProductNotice({ additionalContent, cautionNotes, crossContamination, embedded = false }) {
  const items = (Array.isArray(additionalContent) ? additionalContent : []).filter(
    (it) => it && (it.title || it.body),
  );
  const hasCaution = Boolean(cautionNotes) || Boolean(crossContamination);

  if (items.length === 0 && !hasCaution) return null;

  return (
    <section className={`${embedded ? 'm-detail-embedded-section ' : 'm-detail-card '}m-detail-notice`}>
      <header className="m-detail-card-head">
        <h2 className="m-detail-card-title">추가 안내</h2>
      </header>

      {items.length > 0 && (
        <div className="m-detail-notice-list">
          {items.map((it, i) => (
            <NoticeItem key={i} title={it.title} body={it.body} />
          ))}
        </div>
      )}

      {hasCaution && (
        <div className="m-detail-notice-cautions">
          <CautionBlock label="주의사항" text={cautionNotes} />
          <CautionBlock label="교차오염 가능성" text={crossContamination} />
        </div>
      )}
    </section>
  );
}
