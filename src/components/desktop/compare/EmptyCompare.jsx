// 데스크탑 비교 페이지 빈 상태
// - 일러스트 없이 텍스트 위주 + "식품 둘러보기" CTA (요구사항)
// - SRP: 빈 상태 렌더링만 담당
import { Button } from '../../ds/Button.jsx';
import { IconCompare } from '../../ds/Icons.jsx';

export function EmptyCompare({ max, onBrowse }) {
  return (
    <div className="d-compare-empty">
      <div className="d-compare-empty-illus" aria-hidden="true">
        <IconCompare size={40} />
      </div>
      <h2 className="d-compare-empty-title">비교함이 비어있어요</h2>
      <p className="d-compare-empty-sub">
        궁금한 식품을 최대 {max}개까지 담아<br />
        영양 정보를 한 화면에서 나란히 비교해 보세요.
      </p>
      <div className="d-compare-empty-cta">
        <Button variant="brand" size="lg" onClick={onBrowse}>
          식품 둘러보기
        </Button>
      </div>
    </div>
  );
}
