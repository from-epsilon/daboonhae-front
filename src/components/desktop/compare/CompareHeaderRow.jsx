// 데스크탑 비교 컬럼 헤더 (각 제품의 상단 카드)
// - 썸네일(160px 정사각) + 브랜드 + 제품명 + ScoreGauge 80px + 우상단 X
// - 제품명/썸네일 클릭 → 디테일 페이지로 이동
// - 이미지 실패 시 placeholder
import { useState } from 'react';
import { IconClose } from '../../ds/Icons.jsx';

// 이미지 로딩 실패 시 fallback (외부 의존성 차단)
function Thumb({ src, alt }) {
  const [failed, setFailed] = useState(false);
  if (failed || !src) {
    return <div className="d-compare-thumb d-compare-thumb--ph" aria-hidden="true" />;
  }
  return (
    <img
      className="d-compare-thumb"
      src={src}
      alt={alt}
      onError={() => setFailed(true)}
      loading="lazy"
    />
  );
}

// 우상단 X 버튼 (SRP)
function RemoveButton({ name, onClick }) {
  return (
    <button
      type="button"
      className="d-compare-col-x"
      aria-label={`${name} 비교에서 제거`}
      onClick={onClick}
    >
      <IconClose size={14} />
    </button>
  );
}

export function CompareHeaderRow({ product, onRemove, onOpen, dragProps, isDragging, dropPosition, dragOffsetX }) {
  // 상세 이동 핸들러 (가드 포함)
  const handleOpen = () => {
    if (typeof onOpen === 'function') onOpen(product.id);
  };

  return (
    <div
      className={`d-compare-col-header${isDragging ? ' is-dragging' : ''}${dropPosition ? ` is-drop-${dropPosition}` : ''}`}
      data-compare-product-id={product.id}
      style={isDragging ? { transform: `translateX(${dragOffsetX}px)` } : undefined}
      tabIndex={0}
      aria-label={`${product.name} 비교 열. 드래그하거나 좌우 방향키로 순서를 변경할 수 있습니다`}
      {...dragProps}
    >
      <RemoveButton name={product.name} onClick={() => onRemove(product.id)} />
      <button
        type="button"
        className="d-compare-col-open"
        onClick={handleOpen}
        aria-label={`${product.name} 상세 보기`}
      >
        <Thumb src={product.thumb} alt={product.name} />
        <div className="d-compare-col-brand">{product.brand}</div>
        <div className="d-compare-col-name">
          <span>{product.name}</span>
          {product.serving && (
            <span className="d-compare-col-volume">{product.serving}</span>
          )}
        </div>
      </button>
    </div>
  );
}
