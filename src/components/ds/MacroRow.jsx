// 다분해 DS MacroRow (단백질/탄수/지방 분포 + kcal)
// props:
//   - protein, carbs, fat, kcal: number (g, kcal)
//   - compact: boolean — true 시 한 줄 텍스트로 축약 (FoodCard list 레이아웃용)

// 그램 합 대비 비율 계산 (총합 0 일 때 0%)
function calcPercent(value, total) {
  return total > 0 ? (value / total) * 100 : 0;
}

// compact 변형: 한 줄 텍스트 + 구분선
function CompactRow({ protein, carbs, fat, kcal }) {
  return (
    <div
      style={{
        display: 'flex',
        gap: 10,
        fontSize: 11,
        color: 'var(--text-secondary)',
        fontFamily: 'var(--font-numeric)',
        alignItems: 'center',
      }}
    >
      <span>
        <b style={{ color: 'var(--text-primary)' }}>{kcal}</b>kcal
      </span>
      <span style={{ width: 1, height: 10, background: 'var(--gray-300)' }} />
      <span>
        단백질 <b style={{ color: 'var(--text-primary)' }}>{protein}g</b>
      </span>
      <span>
        탄수 <b style={{ color: 'var(--text-primary)' }}>{carbs}g</b>
      </span>
      <span>
        지방 <b style={{ color: 'var(--text-primary)' }}>{fat}g</b>
      </span>
    </div>
  );
}

// 풀 변형: 비율 막대 + 3컬럼 범례
function FullRow({ protein, carbs, fat }) {
  const total = protein + carbs + fat;
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
      <div
        style={{
          display: 'flex',
          height: 8,
          borderRadius: 4,
          overflow: 'hidden',
          background: 'var(--gray-100)',
        }}
      >
        <div style={{ width: `${calcPercent(protein, total)}%`, background: 'var(--green-500)' }} />
        <div style={{ width: `${calcPercent(carbs, total)}%`, background: 'var(--orange-400)' }} />
        <div style={{ width: `${calcPercent(fat, total)}%`, background: 'var(--blue-400)' }} />
      </div>
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr 1fr',
          gap: 8,
          fontSize: 11,
          fontFamily: 'var(--font-numeric)',
        }}
      >
        <div>
          <span
            style={{
              display: 'inline-block',
              width: 8,
              height: 8,
              borderRadius: 2,
              background: 'var(--green-500)',
              marginRight: 6,
            }}
          />
          <span style={{ color: 'var(--text-secondary)' }}>단백질</span>{' '}
          <b style={{ color: 'var(--text-primary)' }}>{protein}g</b>
        </div>
        <div>
          <span
            style={{
              display: 'inline-block',
              width: 8,
              height: 8,
              borderRadius: 2,
              background: 'var(--orange-400)',
              marginRight: 6,
            }}
          />
          <span style={{ color: 'var(--text-secondary)' }}>탄수화물</span>{' '}
          <b style={{ color: 'var(--text-primary)' }}>{carbs}g</b>
        </div>
        <div>
          <span
            style={{
              display: 'inline-block',
              width: 8,
              height: 8,
              borderRadius: 2,
              background: 'var(--blue-400)',
              marginRight: 6,
            }}
          />
          <span style={{ color: 'var(--text-secondary)' }}>지방</span>{' '}
          <b style={{ color: 'var(--text-primary)' }}>{fat}g</b>
        </div>
      </div>
    </div>
  );
}

// wide 변형: 비율 막대 + 수치 한 줄 + kcal 강조 (데스크톱 가로형 카드용)
// - ratioOnly: 그램 대신 비율(%)만 표시, kcal 생략 — 카드 내 다른 영역과 수치 중복 방지
function WideRow({ protein, carbs, fat, kcal, ratioOnly = false }) {
  const total = protein + carbs + fat;
  const pct = (v) => (total > 0 ? Math.round((v / total) * 100) : 0);
  const fmt = (v) => (ratioOnly ? `${pct(v)}%` : `${v}g`);
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
      <div
        style={{
          display: 'flex',
          height: 6,
          borderRadius: 3,
          overflow: 'hidden',
          background: 'var(--gray-100)',
        }}
      >
        <div style={{ width: `${calcPercent(carbs, total)}%`, background: 'var(--orange-400)' }} />
        <div style={{ width: `${calcPercent(protein, total)}%`, background: 'var(--green-500)' }} />
        <div style={{ width: `${calcPercent(fat, total)}%`, background: 'var(--blue-400)' }} />
      </div>
      <div
        style={{
          display: 'flex',
          alignItems: 'baseline',
          gap: 12,
          fontSize: 12,
          fontFamily: 'var(--font-numeric)',
          color: 'var(--text-secondary)',
        }}
      >
        <span>
          <span
            style={{
              display: 'inline-block',
              width: 6,
              height: 6,
              borderRadius: 2,
              background: 'var(--orange-400)',
              marginRight: 4,
              verticalAlign: 'middle',
            }}
          />
          탄 <b style={{ color: 'var(--text-primary)' }}>{fmt(carbs)}</b>
        </span>
        <span>
          <span
            style={{
              display: 'inline-block',
              width: 6,
              height: 6,
              borderRadius: 2,
              background: 'var(--green-500)',
              marginRight: 4,
              verticalAlign: 'middle',
            }}
          />
          단 <b style={{ color: 'var(--text-primary)' }}>{fmt(protein)}</b>
        </span>
        <span>
          <span
            style={{
              display: 'inline-block',
              width: 6,
              height: 6,
              borderRadius: 2,
              background: 'var(--blue-400)',
              marginRight: 4,
              verticalAlign: 'middle',
            }}
          />
          지 <b style={{ color: 'var(--text-primary)' }}>{fmt(fat)}</b>
        </span>
        {!ratioOnly && (
          <span style={{ marginLeft: 'auto', fontSize: 14 }}>
            <b style={{ color: 'var(--text-primary)', fontWeight: 700 }}>{kcal}</b>
            <span style={{ fontSize: 11 }}>kcal</span>
          </span>
        )}
      </div>
    </div>
  );
}

export function MacroRow({ protein = 0, carbs = 0, fat = 0, kcal = 0, compact = false, wide = false, ratioOnly = false }) {
  if (compact) {
    return <CompactRow protein={protein} carbs={carbs} fat={fat} kcal={kcal} />;
  }
  if (wide) {
    return <WideRow protein={protein} carbs={carbs} fat={fat} kcal={kcal} ratioOnly={ratioOnly} />;
  }
  return <FullRow protein={protein} carbs={carbs} fat={fat} />;
}
