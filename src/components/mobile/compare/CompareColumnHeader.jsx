// 비교 컬럼 헤더 (각 제품 상단 = 썸네일 + 브랜드 + 이름 + X)
// - 가로 스크롤 데이터 컬럼의 최상단 셀로 사용
// - 우상단 X 버튼 → onRemove
// - 이미지 로딩 실패 시 회색 placeholder 표시
import { useState } from 'react';
import { IconClose } from '../../ds/Icons.jsx';

// 이미지 로딩 실패 시 노출할 placeholder (썸네일 외부 의존성 차단)
function Thumb({ src, alt }) {
  const [failed, setFailed] = useState(false);
  if (failed || !src) {
    return <div className="m-compare-thumb m-compare-thumb--ph" aria-hidden="true" />;
  }
  return (
    <img
      className="m-compare-thumb"
      src={src}
      alt={alt}
      onError={() => setFailed(true)}
      loading="lazy"
    />
  );
}

export function CompareColumnHeader({ product, onRemove, onOpen, dragProps }) {
  // onOpen: 제품명 영역 클릭 시 디테일로 이동
  const handleOpen = () => {
    if (typeof onOpen === 'function') onOpen(product.id);
  };

  return (
    <div
      className="m-compare-col-header"
      tabIndex={0}
      aria-label={`${product.name} 비교 열. 드래그하거나 좌우 방향키로 순서를 변경할 수 있습니다`}
      {...dragProps}
    >
      <button
        type="button"
        className="m-compare-col-x"
        aria-label={`${product.name} 비교에서 제거`}
        onClick={() => onRemove(product.id)}
      >
        <IconClose size={14} />
      </button>
      <button
        type="button"
        className="m-compare-col-open"
        onClick={handleOpen}
        aria-label={`${product.name} 상세 보기`}
      >
        <Thumb src={product.thumb} alt={product.name} />
        <div className="m-compare-col-brand">{product.brand}</div>
        <div className="m-compare-col-name">
          <span>{product.name}</span>
          {product.serving && (
            <span className="m-compare-col-volume">{product.serving}</span>
          )}
        </div>
      </button>
    </div>
  );
}
