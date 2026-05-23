// 제품 썸네일 — 이미지가 있으면 이미지를, 없으면 brand 이니셜 + 결정론적 컬러 아바타
// - 실제 product.thumbnail이 들어오면 자동으로 <img>로 전환되어 향후 변경 없이 호환
// - 컨테이너 쿼리(cqi)로 폰트 크기가 컨테이너 폭에 비례 (모든 사이즈에서 일관된 비율)
// - aria-hidden 기본: 시각 장식이며, 옆의 브랜드·제품명 텍스트가 의미를 전달

export default function ProductThumb({ product, size = 'card', className = '' }) {
  const label = product?.brand || product?.name || '';
  const seed = product?.id || product?.brand || product?.name || 'unknown';
  const initials = getInitials(label);
  const { bg, fg } = getBrandColors(seed);

  // 실제 이미지가 있으면 그대로 렌더
  if (product?.thumbnail) {
    return (
      <img
        className={`product-thumb product-thumb-${size} ${className}`}
        src={product.thumbnail}
        alt=""
        aria-hidden
        loading="lazy"
      />
    );
  }

  return (
    <div
      className={`product-thumb product-thumb-${size} ${className}`}
      style={{ backgroundColor: bg, color: fg }}
      aria-hidden
    >
      <span className="product-thumb-initials">{initials}</span>
    </div>
  );
}

// 브랜드 문자열에서 표시용 이니셜 추출
// - 한글: 첫 2글자 (예: "미트프로" → "미트")
// - 영문: 공백 분리 시 각 단어의 첫 글자 (예: "Slim Up" → "SU")
//         단어 1개면 첫 2글자 대문자 (예: "Optimum" → "OP")
// - 빈 값: "?"
function getInitials(name) {
  const trimmed = (name || '').trim();
  if (!trimmed) return '?';

  if (/^[가-힣]/.test(trimmed)) {
    return trimmed.slice(0, 2);
  }

  const words = trimmed.split(/\s+/).filter(Boolean);
  if (words.length >= 2) {
    return (words[0][0] + words[1][0]).toUpperCase();
  }
  return trimmed.slice(0, 2).toUpperCase();
}

// seed 문자열 → 결정론적 HSL 컬러 페어 (배경: 파스텔, 글자: 같은 hue의 어두운 톤)
// - 같은 brand는 항상 같은 색 → 사용자가 시각으로 빠르게 구분 가능
function getBrandColors(seed) {
  const hue = hashString(seed) % 360;
  return {
    bg: `hsl(${hue}, 60%, 90%)`,
    fg: `hsl(${hue}, 50%, 28%)`,
  };
}

// 문자열 → 양의 정수 (DJB2 변형, 31진수 곱셈)
function hashString(str) {
  let h = 0;
  for (let i = 0; i < str.length; i++) {
    h = (h * 31 + str.charCodeAt(i)) | 0;
  }
  return Math.abs(h);
}
