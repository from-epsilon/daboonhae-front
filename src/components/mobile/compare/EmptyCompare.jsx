// 비교함 빈 상태
// - 부드러운 톤의 일러스트(텍스트만, 이모지 X) + CTA "식품 둘러보기"
// - DS 톤: "비교할 식품을 담아주세요" — 명령 X, 안내 톤
import { Button } from '../../ds/Button.jsx';
import { IconCompare } from '../../ds/Icons.jsx';

export function EmptyCompare({ onBrowse, max }) {
  return (
    <div className="m-compare-empty">
      <div className="m-compare-empty-illus" aria-hidden="true">
        <IconCompare size={36} />
      </div>
      <h2 className="m-compare-empty-title">비교함이 비어있어요</h2>
      <p className="m-compare-empty-sub">
        궁금한 식품을 최대 {max}개까지 담아<br />
        영양 정보를 나란히 비교해보세요
      </p>
      <div className="m-compare-empty-cta">
        <Button variant="brand" size="md" onClick={onBrowse}>
          식품 둘러보기
        </Button>
      </div>
    </div>
  );
}
