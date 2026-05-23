// 정렬 드롭다운
// - 옵션은 일단 고정. 추후 목적별로 다르게 노출하고 싶다면 props로 분리 예정
const OPTIONS = [
  { key: 'ranking', label: '인기순' },
  { key: 'calories_asc', label: '칼로리 낮은 순' },
  { key: 'protein_desc', label: '단백질 높은 순' },
  { key: 'sugar_asc', label: '당류 낮은 순' },
];

export default function SortDropdown({ value, onChange }) {
  return (
    <select className="sort-dropdown" value={value} onChange={(e) => onChange(e.target.value)}>
      {OPTIONS.map((o) => (
        <option key={o.key} value={o.key}>{o.label}</option>
      ))}
    </select>
  );
}
