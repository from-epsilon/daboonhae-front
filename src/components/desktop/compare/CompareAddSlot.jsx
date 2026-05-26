// 데스크탑 비교 - 마지막 컬럼 자리에 노출되는 "추가" 슬롯
// - max 미만일 때만 노출 (요구사항)
// - 점선 박스 + 아이콘 + 라벨, 클릭 시 리스트로 이동
import { IconPlus } from '../../ds/Icons.jsx';

export function CompareAddSlot({ onClick, remaining }) {
  return (
    <button
      type="button"
      className="d-compare-add-slot"
      onClick={onClick}
      aria-label={`제품 추가 (남은 슬롯 ${remaining}개)`}
    >
      <span className="d-compare-add-icon" aria-hidden="true">
        <IconPlus size={24} />
      </span>
      <span className="d-compare-add-label">제품 추가</span>
      <span className="d-compare-add-sub">{remaining}개 더 담을 수 있어요</span>
    </button>
  );
}
