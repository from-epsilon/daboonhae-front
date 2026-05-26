// 비교 자동 태그 셀 (Badge 스택)
// - getAutoTags 결과(최대 4개)를 세로로 쌓아 표시
// - 태그 없는 제품은 dash로 표시 (시각적 빈 칸 방지)
import { Badge } from '../../ds/Badge.jsx';

export function CompareTagsCell({ tags = [] }) {
  if (!tags || tags.length === 0) {
    return (
      <div className="m-compare-cell m-compare-cell--tags m-compare-cell--empty">-</div>
    );
  }
  return (
    <div className="m-compare-cell m-compare-cell--tags">
      <div className="m-compare-tags-stack">
        {tags.map((t, i) => (
          <Badge key={`${t.label}-${i}`} variant={t.v}>{t.label}</Badge>
        ))}
      </div>
    </div>
  );
}
