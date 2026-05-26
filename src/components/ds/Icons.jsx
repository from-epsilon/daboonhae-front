// 다분해 DS 아이콘 세트 (Lucide 스타일 SVG)
// - 모두 currentColor 기반: 부모 color 상속
// - props: { size=22, stroke=1.5, fill='none' }

// 공통 SVG 래퍼: 자식 path/polyline 등을 그대로 넘김
export const Icon = ({ d, size = 22, stroke = 1.5, fill = 'none' }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill={fill}
    stroke="currentColor"
    strokeWidth={stroke}
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    {d}
  </svg>
);

// 홈 아이콘
export const IconHome = (p) => (
  <Icon
    {...p}
    d={
      <>
        <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
        <polyline points="9 22 9 12 15 12 15 22" />
      </>
    }
  />
);

// 카테고리 아이콘 (2x2 그리드)
export const IconCategory = (p) => (
  <Icon
    {...p}
    d={
      <>
        <rect x="3" y="3" width="7" height="7" rx="1" />
        <rect x="14" y="3" width="7" height="7" rx="1" />
        <rect x="3" y="14" width="7" height="7" rx="1" />
        <rect x="14" y="14" width="7" height="7" rx="1" />
      </>
    }
  />
);

// 비교 아이콘 (양방향 화살표)
export const IconCompare = (p) => (
  <Icon
    {...p}
    d={
      <>
        <path d="M16 3h5v5" />
        <path d="M4 20L21 3" />
        <path d="M21 16v5h-5" />
        <path d="M15 15l6 6" />
        <path d="M4 4l5 5" />
      </>
    }
  />
);

// 사용자 아이콘
export const IconUser = (p) => (
  <Icon
    {...p}
    d={
      <>
        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
        <circle cx="12" cy="7" r="4" />
      </>
    }
  />
);

// 검색 아이콘 (돋보기)
export const IconSearch = (p) => (
  <Icon
    {...p}
    d={
      <>
        <circle cx="11" cy="11" r="7" />
        <line x1="20" y1="20" x2="16.65" y2="16.65" />
      </>
    }
  />
);

// 하트 아이콘
export const IconHeart = (p) => (
  <Icon
    {...p}
    d={
      <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
    }
  />
);

// 종 아이콘 (알림)
export const IconBell = (p) => (
  <Icon
    {...p}
    d={
      <>
        <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
        <path d="M13.73 21a2 2 0 0 1-3.46 0" />
      </>
    }
  />
);

// 뒤로가기 (좌측 화살표)
export const IconBack = (p) => <Icon {...p} d={<polyline points="15 18 9 12 15 6" />} />;

// 공유 아이콘
export const IconShare = (p) => (
  <Icon
    {...p}
    d={
      <>
        <circle cx="18" cy="5" r="3" />
        <circle cx="6" cy="12" r="3" />
        <circle cx="18" cy="19" r="3" />
        <line x1="8.59" y1="13.51" x2="15.42" y2="17.49" />
        <line x1="15.41" y1="6.51" x2="8.59" y2="10.49" />
      </>
    }
  />
);

// 닫기 (X)
export const IconClose = (p) => (
  <Icon
    {...p}
    d={
      <>
        <line x1="18" y1="6" x2="6" y2="18" />
        <line x1="6" y1="6" x2="18" y2="18" />
      </>
    }
  />
);

// 추가 (+)
export const IconPlus = (p) => (
  <Icon
    {...p}
    d={
      <>
        <line x1="12" y1="5" x2="12" y2="19" />
        <line x1="5" y1="12" x2="19" y2="12" />
      </>
    }
  />
);

// 체크 아이콘
export const IconCheck = (p) => <Icon {...p} d={<polyline points="20 6 9 17 4 12" />} />;

// 별 (채워진 형태)
export const IconStar = (p) => (
  <Icon
    {...p}
    fill="currentColor"
    stroke="none"
    d={<polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />}
  />
);

// 셰브론 (오른쪽 화살표)
export const IconChevron = (p) => <Icon {...p} d={<polyline points="9 18 15 12 9 6" />} />;

// 정보 (i)
export const IconInfo = (p) => (
  <Icon
    {...p}
    d={
      <>
        <circle cx="12" cy="12" r="10" />
        <line x1="12" y1="16" x2="12" y2="12" />
        <line x1="12" y1="8" x2="12.01" y2="8" />
      </>
    }
  />
);

// 경고 (!)
export const IconAlert = (p) => (
  <Icon
    {...p}
    d={
      <>
        <circle cx="12" cy="12" r="10" />
        <line x1="12" y1="8" x2="12" y2="12" />
        <line x1="12" y1="16" x2="12.01" y2="16" />
      </>
    }
  />
);

// 필터 (깔때기)
export const IconFilter = (p) => (
  <Icon {...p} d={<polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3" />} />
);

// 정렬 아이콘
export const IconSort = (p) => (
  <Icon
    {...p}
    d={
      <>
        <path d="M3 6h18" />
        <path d="M7 12h10" />
        <path d="M11 18h2" />
      </>
    }
  />
);

// 잎사귀 (비건/식물성 표시)
export const IconLeaf = (p) => (
  <Icon
    {...p}
    d={
      <>
        <path d="M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.48 19.2 2.96c1.4 9.3 -2 17.04 -8.2 17.04Z" />
        <path d="M2 21c0 -3 1.85 -5.36 5.08 -6" />
      </>
    }
  />
);
