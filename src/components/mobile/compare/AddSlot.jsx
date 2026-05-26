// 비교 추가 슬롯 (가로 스크롤 마지막에 점선 박스 + 아이콘)
// - max 미만일 때만 노출 → 비어있는 슬롯을 "추가 가능"으로 시각화
import { IconPlus } from '../../ds/Icons.jsx';

export function AddSlot({ onClick, remaining }) {
  return (
    <button
      type="button"
      className="m-compare-add-slot"
      onClick={onClick}
      aria-label={`제품 추가 (남은 슬롯 ${remaining}개)`}
    >
      <span className="m-compare-add-icon" aria-hidden="true">
        <IconPlus size={20} />
      </span>
      <span className="m-compare-add-label">제품 추가</span>
      <span className="m-compare-add-sub">+{remaining}개 가능</span>
    </button>
  );
}
