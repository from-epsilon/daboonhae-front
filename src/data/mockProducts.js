// 제품 데이터
// - Supabase export (Food Names) → mockProducts 스키마로 1회 변환
// - 원본: '카카오톡 받은 파일/Supabase Snippet List Food Names.csv'
// - 변환 스크립트: tools/convert_csv.mjs (변환 후 삭제됨)
// - 컴포넌트는 이 형태(shape)에만 의존하므로 추후 API 소스로 갈아끼울 수 있음

export const PRODUCTS = [
  {
    "id": "p005",
    "name": "하림 닭가슴살 블랙페퍼",
    "brand": "하림",
    "thumbnail": "https://tqklhszfkvzk6518638.edge.naverncp.com/product/8801492373090_1.png",
    "volume": "100g",
    "category": "닭가슴살",
    "purposesFit": [
      "muscle",
      "weight_loss",
      "glucose"
    ],
    "nutrition": {
      "calories": 109,
      "protein": 22,
      "carbs": 1,
      "sugar": 1,
      "fat": 1.9,
      "fiber": 0,
      "bcaa": 0
    },
    "ingredients": {
      "sweeteners": [],
      "proteinSources": [
        "닭고기"
      ],
      "allergens": [
        "대두"
      ],
      "lactoseFree": true
    },
    "description": "단백질 22g, 당류 1g.",
    "purchaseUrl": "#",
    "rankingScore": 98
  },
  {
    "id": "p006",
    "name": "톡스올로지 클렌즈 48시간",
    "brand": "푸드올로지",
    "thumbnail": "https://thumbnail.coupangcdn.com/thumbnails/remote/300x300ex/image/retail/images/6c69a6c4-d78f-4dcd-9802-4ac51ace99ff2613813254801000567.png",
    "volume": "1000ml",
    "category": "제로 음료",
    "purposesFit": [
      "weight_loss"
    ],
    "nutrition": {
      "calories": 105,
      "protein": 1,
      "carbs": 25,
      "sugar": 17,
      "fat": 0,
      "fiber": 0,
      "bcaa": 0
    },
    "ingredients": {
      "sweeteners": [],
      "proteinSources": [],
      "allergens": [
        "유당"
      ],
      "lactoseFree": false
    },
    "description": "제로 음료 카테고리 제품.",
    "purchaseUrl": "#",
    "rankingScore": 40
  },
  {
    "id": "p007",
    "name": "하림 맛닭가슴살 바베큐맛",
    "brand": "하림",
    "thumbnail": "https://encrypted-tbn3.gstatic.com/shopping?q=tbn:ANd9GcR6HWpPKE1S1EjLdBdlVGgjXS26YbDiKxlz4qm0lCfgxMtlJTdQhN-6Luom3hl6fqXPJvrzNL7sNYrkW8w6JEBSmQPS38-G44jIZ4vMOhO89bwA1bMtWwV2JaXEq3U0CySRI1KjtZzC&usqp=CAc",
    "volume": "100g",
    "category": "닭가슴살",
    "purposesFit": [
      "muscle",
      "weight_loss"
    ],
    "nutrition": {
      "calories": 170,
      "protein": 17,
      "carbs": 7,
      "sugar": 4,
      "fat": 8,
      "fiber": 0,
      "bcaa": 0
    },
    "ingredients": {
      "sweeteners": [],
      "proteinSources": [
        "대두",
        "닭고기"
      ],
      "allergens": [
        "대두"
      ],
      "lactoseFree": true
    },
    "description": "단백질 17g.",
    "purchaseUrl": "#",
    "rankingScore": 86
  },
  {
    "id": "p008",
    "name": "컵누들 매콤한맛",
    "brand": "오뚜기",
    "thumbnail": "https://asset.m-gs.kr/prod/1038210182/1/550",
    "volume": "37.8g",
    "category": "곤약·면",
    "purposesFit": [
      "weight_loss",
      "glucose"
    ],
    "nutrition": {
      "calories": 120,
      "protein": 1,
      "carbs": 29,
      "sugar": 3,
      "fat": 0,
      "fiber": 0.4,
      "bcaa": 0
    },
    "ingredients": {
      "sweeteners": [],
      "proteinSources": [],
      "allergens": [],
      "lactoseFree": true
    },
    "description": "당류 3g.",
    "purchaseUrl": "#",
    "rankingScore": 57
  },
  {
    "id": "p009",
    "name": "천하장사 The 건강하닭",
    "brand": "진주햄",
    "thumbnail": "https://thumbnail8.coupangcdn.com/thumbnails/remote/492x492ex/image/retail/images/6729407775520630-dc97e5aa-c3ca-4e91-8e95-d0d13b6ca270.jpg",
    "volume": "700g",
    "category": "간식",
    "purposesFit": [
      "weight_loss",
      "glucose"
    ],
    "nutrition": {
      "calories": 29,
      "protein": 3,
      "carbs": 3,
      "sugar": 1,
      "fat": 0.6,
      "fiber": 0,
      "bcaa": 0
    },
    "ingredients": {
      "sweeteners": [],
      "proteinSources": [
        "대두",
        "닭고기"
      ],
      "allergens": [
        "대두",
        "글루텐"
      ],
      "lactoseFree": true
    },
    "description": "당류 1g.",
    "purchaseUrl": "#",
    "rankingScore": 64
  },
  {
    "id": "p010",
    "name": "더단백드링크 초코",
    "brand": "빙그레",
    "thumbnail": "https://tqklhszfkvzk6518638.edge.naverncp.com/product/8801104670876.png",
    "volume": "250ml",
    "category": "계란·간편식",
    "purposesFit": [
      "muscle",
      "weight_loss",
      "glucose"
    ],
    "nutrition": {
      "calories": 105,
      "protein": 20,
      "carbs": 7,
      "sugar": 0.8,
      "fat": 0.6,
      "fiber": 0,
      "bcaa": 0
    },
    "ingredients": {
      "sweeteners": [
        "알룰로스",
        "수크랄로스",
        "아세설팜칼륨"
      ],
      "proteinSources": [
        "대두"
      ],
      "allergens": [
        "유당",
        "대두"
      ],
      "lactoseFree": false
    },
    "description": "단백질 20g, 당류 0.8g, 대체당(알룰로스, 수크랄로스) 사용.",
    "purchaseUrl": "#",
    "rankingScore": 98
  },
  {
    "id": "p011",
    "name": "프로틴 그래놀라 제로슈거",
    "brand": "켈로그",
    "thumbnail": "https://cdn.011st.com/11dims/resize/600x600/quality/75/11src/product/8447123868/B.jpg?270465027",
    "volume": "350g",
    "category": "시리얼·그래놀라",
    "purposesFit": [
      "muscle",
      "glucose",
      "meal_replacement"
    ],
    "nutrition": {
      "calories": 419,
      "protein": 20.5,
      "carbs": 63,
      "sugar": 0.48,
      "fat": 10.5,
      "fiber": 0,
      "bcaa": 0
    },
    "ingredients": {
      "sweeteners": [
        "알룰로스",
        "스테비아",
        "말티톨"
      ],
      "proteinSources": [
        "대두"
      ],
      "allergens": [
        "대두",
        "글루텐"
      ],
      "lactoseFree": true
    },
    "description": "단백질 20.5g, 당류 0.48g, 대체당(알룰로스, 스테비아) 사용.",
    "purchaseUrl": "#",
    "rankingScore": 95
  },
  {
    "id": "p012",
    "name": "매일두유 고단백 플레인",
    "brand": "매일유업",
    "thumbnail": "https://directcdn.maeil.com/UploadedFiles/direct/product/1a86e6f6-3d64-4c60-9a18-4b80df0bd1fc.jpg",
    "volume": "190ml",
    "category": "프로틴 드링크",
    "purposesFit": [
      "weight_loss",
      "glucose"
    ],
    "nutrition": {
      "calories": 90,
      "protein": 12,
      "carbs": 6.5,
      "sugar": 1.2,
      "fat": 4.1,
      "fiber": 1.5,
      "bcaa": 0
    },
    "ingredients": {
      "sweeteners": [
        "알룰로스"
      ],
      "proteinSources": [
        "대두"
      ],
      "allergens": [
        "대두"
      ],
      "lactoseFree": true
    },
    "description": "당류 1.2g, 대체당(알룰로스) 사용.",
    "purchaseUrl": "#",
    "rankingScore": 85
  },
  {
    "id": "p013",
    "name": "매일두유 고단백 검은콩",
    "brand": "매일유업",
    "thumbnail": "https://img.danawa.com/prod_img/500000/932/143/img/13143932_1.jpg??shrink=360:360&_v=2026052009",
    "volume": "190ml",
    "category": "프로틴 드링크",
    "purposesFit": [
      "weight_loss",
      "glucose"
    ],
    "nutrition": {
      "calories": 105,
      "protein": 12,
      "carbs": 6,
      "sugar": 1.7,
      "fat": 4.8,
      "fiber": 2,
      "bcaa": 0
    },
    "ingredients": {
      "sweeteners": [
        "알룰로스"
      ],
      "proteinSources": [
        "대두"
      ],
      "allergens": [
        "대두"
      ],
      "lactoseFree": true
    },
    "description": "당류 1.7g, 대체당(알룰로스) 사용.",
    "purchaseUrl": "#",
    "rankingScore": 85
  },
  {
    "id": "p014",
    "name": "뉴케어 올프로틴 고소한맛",
    "brand": "대상웰라이프",
    "thumbnail": "https://tqklhszfkvzk6518638.edge.naverncp.com/product/8809345610859.png",
    "volume": "245ml",
    "category": "프로틴 드링크",
    "purposesFit": [
      "muscle",
      "weight_loss",
      "glucose"
    ],
    "nutrition": {
      "calories": 135,
      "protein": 25,
      "carbs": 3,
      "sugar": 0,
      "fat": 2.5,
      "fiber": 0,
      "bcaa": 0
    },
    "ingredients": {
      "sweeteners": [
        "알룰로스",
        "수크랄로스",
        "스테비아"
      ],
      "proteinSources": [
        "대두",
        "WPC"
      ],
      "allergens": [
        "유당",
        "대두"
      ],
      "lactoseFree": false
    },
    "description": "단백질 25g, 당류 0g, 대체당(알룰로스, 수크랄로스) 사용.",
    "purchaseUrl": "#",
    "rankingScore": 98
  },
  {
    "id": "p015",
    "name": "아몬드브리즈 뉴트리플러스 프로틴",
    "brand": "블루다이아몬드",
    "thumbnail": "https://contents.kyobobook.co.kr/sih/fit-in/375x0/gift/pdt/1709/hot1706490125299.jpg",
    "volume": "190ml",
    "category": "제로 음료",
    "purposesFit": [
      "weight_loss"
    ],
    "nutrition": {
      "calories": 65,
      "protein": 4.2,
      "carbs": 5,
      "sugar": 5,
      "fat": 3,
      "fiber": 0,
      "bcaa": 0
    },
    "ingredients": {
      "sweeteners": [],
      "proteinSources": [],
      "allergens": [
        "견과류"
      ],
      "lactoseFree": true
    },
    "description": "제로 음료 카테고리 제품.",
    "purchaseUrl": "#",
    "rankingScore": 58
  },
  {
    "id": "p016",
    "name": "마이밀 뉴프로틴 오리지널",
    "brand": "대상웰라이프",
    "thumbnail": "https://cdn.wellife.co.kr/upload/item/G2001000935/202506090845420600_L.png",
    "volume": "190ml",
    "category": "제로 음료",
    "purposesFit": [
      "weight_loss"
    ],
    "nutrition": {
      "calories": 150,
      "protein": 9,
      "carbs": 15,
      "sugar": 10,
      "fat": 6,
      "fiber": 0,
      "bcaa": 0
    },
    "ingredients": {
      "sweeteners": [
        "수크랄로스"
      ],
      "proteinSources": [
        "카제인",
        "대두"
      ],
      "allergens": [
        "유당",
        "대두",
        "견과류"
      ],
      "lactoseFree": false
    },
    "description": "대체당(수크랄로스) 사용.",
    "purchaseUrl": "#",
    "rankingScore": 58
  },
  {
    "id": "p017",
    "name": "더단백드링크 딸기",
    "brand": "빙그레",
    "thumbnail": "https://img.danawa.com/prod_img/500000/158/262/img/41262158_1.jpg?shrink=360:360&_v=20250712070439",
    "volume": "250ml",
    "category": "간식",
    "purposesFit": [
      "muscle",
      "weight_loss",
      "glucose"
    ],
    "nutrition": {
      "calories": 105,
      "protein": 20,
      "carbs": 6.5,
      "sugar": 0.7,
      "fat": 0.6,
      "fiber": 0,
      "bcaa": 0
    },
    "ingredients": {
      "sweeteners": [
        "알룰로스",
        "수크랄로스",
        "아세설팜칼륨"
      ],
      "proteinSources": [],
      "allergens": [
        "유당"
      ],
      "lactoseFree": false
    },
    "description": "단백질 20g, 당류 0.7g, 대체당(알룰로스, 수크랄로스) 사용.",
    "purchaseUrl": "#",
    "rankingScore": 98
  },
  {
    "id": "p018",
    "name": "얼티브 프로틴 초코맛",
    "brand": "얼티브",
    "thumbnail": "https://thumbnail.coupangcdn.com/thumbnails/remote/492x492ex/image/retail/images/ae66bcf7-ccac-4abb-a104-460c6d6314353061338337901139434.png",
    "volume": "250ml",
    "category": "프로틴 드링크",
    "purposesFit": [
      "muscle",
      "weight_loss",
      "glucose"
    ],
    "nutrition": {
      "calories": 125,
      "protein": 21,
      "carbs": 2,
      "sugar": 0,
      "fat": 3.9,
      "fiber": 0,
      "bcaa": 0
    },
    "ingredients": {
      "sweeteners": [
        "수크랄로스",
        "아세설팜칼륨"
      ],
      "proteinSources": [
        "대두"
      ],
      "allergens": [
        "대두"
      ],
      "lactoseFree": true
    },
    "description": "단백질 21g, 당류 0g, 대체당(수크랄로스, 아세설팜칼륨) 사용.",
    "purchaseUrl": "#",
    "rankingScore": 98
  },
  {
    "id": "p019",
    "name": "더단백드링크 커피",
    "brand": "빙그레",
    "thumbnail": "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQqnRhg5aU91ttQ5qxVlqoiDOgAawmcxwfttQ&s",
    "volume": "250ml",
    "category": "프로틴 드링크",
    "purposesFit": [
      "muscle",
      "weight_loss",
      "glucose"
    ],
    "nutrition": {
      "calories": 110,
      "protein": 20,
      "carbs": 7,
      "sugar": 0.9,
      "fat": 1,
      "fiber": 0,
      "bcaa": 0
    },
    "ingredients": {
      "sweeteners": [
        "알룰로스",
        "수크랄로스",
        "아세설팜칼륨"
      ],
      "proteinSources": [],
      "allergens": [
        "유당"
      ],
      "lactoseFree": false
    },
    "description": "단백질 20g, 당류 0.9g, 대체당(알룰로스, 수크랄로스) 사용.",
    "purchaseUrl": "#",
    "rankingScore": 98
  },
  {
    "id": "p020",
    "name": "더단백드링크 카라멜",
    "brand": "빙그레",
    "thumbnail": "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQwGAIbkbLdJYaam-N2xbTxMEWClGHfTIoP6Q&s",
    "volume": "250ml",
    "category": "간식",
    "purposesFit": [
      "muscle",
      "weight_loss",
      "glucose"
    ],
    "nutrition": {
      "calories": 105,
      "protein": 20,
      "carbs": 6,
      "sugar": 0.9,
      "fat": 1,
      "fiber": 0,
      "bcaa": 0
    },
    "ingredients": {
      "sweeteners": [
        "알룰로스",
        "수크랄로스",
        "아세설팜칼륨"
      ],
      "proteinSources": [],
      "allergens": [
        "유당"
      ],
      "lactoseFree": false
    },
    "description": "단백질 20g, 당류 0.9g, 대체당(알룰로스, 수크랄로스) 사용.",
    "purchaseUrl": "#",
    "rankingScore": 98
  },
  {
    "id": "p021",
    "name": "더단백드링크 바나나",
    "brand": "빙그레",
    "thumbnail": "https://img.danuri.io/catalog-image/385/479/071/17327823b4dc4162b2e1794814296854.jpg?shrink=360:360&_v=20260518123542",
    "volume": "250ml",
    "category": "간식",
    "purposesFit": [
      "muscle",
      "weight_loss",
      "glucose"
    ],
    "nutrition": {
      "calories": 105,
      "protein": 20,
      "carbs": 6.5,
      "sugar": 0.7,
      "fat": 0.5,
      "fiber": 0,
      "bcaa": 0
    },
    "ingredients": {
      "sweeteners": [
        "알룰로스",
        "수크랄로스",
        "아세설팜칼륨"
      ],
      "proteinSources": [],
      "allergens": [
        "유당"
      ],
      "lactoseFree": false
    },
    "description": "단백질 20g, 당류 0.7g, 대체당(알룰로스, 수크랄로스) 사용.",
    "purchaseUrl": "#",
    "rankingScore": 98
  },
  {
    "id": "p022",
    "name": "더단백드링크 밀크티",
    "brand": "빙그레",
    "thumbnail": "https://img.danuri.io/catalog-image/929/065/040/fff08ae9ea1548698e8ffb6691491ba8.jpg?_v=20260518124028&shrink=360:360",
    "volume": "250ml",
    "category": "간식",
    "purposesFit": [
      "muscle",
      "weight_loss",
      "glucose"
    ],
    "nutrition": {
      "calories": 98,
      "protein": 20,
      "carbs": 4.5,
      "sugar": 0.7,
      "fat": 0.6,
      "fiber": 0,
      "bcaa": 0
    },
    "ingredients": {
      "sweeteners": [
        "알룰로스",
        "수크랄로스",
        "아세설팜칼륨"
      ],
      "proteinSources": [],
      "allergens": [
        "유당"
      ],
      "lactoseFree": false
    },
    "description": "단백질 20g, 당류 0.7g, 대체당(알룰로스, 수크랄로스) 사용.",
    "purchaseUrl": "#",
    "rankingScore": 98
  },
  {
    "id": "p023",
    "name": "더단백드링크 멜론",
    "brand": "빙그레",
    "thumbnail": "https://asset.m-gs.kr/prod/1067302922/1/2000",
    "volume": "250ml",
    "category": "간식",
    "purposesFit": [
      "muscle",
      "weight_loss",
      "glucose"
    ],
    "nutrition": {
      "calories": 109,
      "protein": 20,
      "carbs": 5.7,
      "sugar": 0.9,
      "fat": 0.7,
      "fiber": 0,
      "bcaa": 0
    },
    "ingredients": {
      "sweeteners": [
        "알룰로스",
        "수크랄로스",
        "아세설팜칼륨"
      ],
      "proteinSources": [],
      "allergens": [
        "유당"
      ],
      "lactoseFree": false
    },
    "description": "단백질 20g, 당류 0.9g, 대체당(알룰로스, 수크랄로스) 사용.",
    "purchaseUrl": "#",
    "rankingScore": 98
  },
  {
    "id": "p024",
    "name": "더단백드링크 다크초코",
    "brand": "빙그레",
    "thumbnail": "https://img.shoppingntmall.com/goods/231/27213231_h.jpg",
    "volume": "330ml",
    "category": "간식",
    "purposesFit": [
      "muscle",
      "weight_loss",
      "glucose"
    ],
    "nutrition": {
      "calories": 168,
      "protein": 35,
      "carbs": 4.7,
      "sugar": 0.9,
      "fat": 1,
      "fiber": 0,
      "bcaa": 0
    },
    "ingredients": {
      "sweeteners": [
        "수크랄로스",
        "아세설팜칼륨"
      ],
      "proteinSources": [],
      "allergens": [
        "유당"
      ],
      "lactoseFree": false
    },
    "description": "단백질 35g, 당류 0.9g, 대체당(수크랄로스, 아세설팜칼륨) 사용.",
    "purchaseUrl": "#",
    "rankingScore": 98
  },
  {
    "id": "p025",
    "name": "더단백드링크 더블초코",
    "brand": "빙그레",
    "thumbnail": "https://www.bing.co.kr/upload/product/2026/04/1f556fc7-dc48-43f5-9d22-b9c9233612e4.png",
    "volume": "350g",
    "category": "간식",
    "purposesFit": [
      "muscle",
      "weight_loss",
      "glucose"
    ],
    "nutrition": {
      "calories": 182,
      "protein": 40,
      "carbs": 4,
      "sugar": 0.8,
      "fat": 0.7,
      "fiber": 0,
      "bcaa": 0
    },
    "ingredients": {
      "sweeteners": [
        "수크랄로스",
        "아세설팜칼륨"
      ],
      "proteinSources": [],
      "allergens": [
        "유당"
      ],
      "lactoseFree": false
    },
    "description": "단백질 40g, 당류 0.8g, 대체당(수크랄로스, 아세설팜칼륨) 사용.",
    "purchaseUrl": "#",
    "rankingScore": 98
  },
  {
    "id": "p026",
    "name": "더단백드링크 민트초코",
    "brand": "빙그레",
    "thumbnail": "https://t17.azb.co.kr/view/1000x/BcFJCsIwFADQw4hLkz+ZwVULohRUChW6DEW0KUgMJOBwet8b3JoO/ck9u197bmX/Le9m1VwHmMZYay47rUt85U2OS3qoXOpUl5tK96oJyAAzBgMarRUvIAyOcOxm/oT+ctQIHiyTQUKPntlLQKGtBTSkcpr/",
    "volume": "250ml",
    "category": "간식",
    "purposesFit": [
      "muscle",
      "weight_loss",
      "glucose"
    ],
    "nutrition": {
      "calories": 105,
      "protein": 20,
      "carbs": 7,
      "sugar": 0.8,
      "fat": 0.6,
      "fiber": 0,
      "bcaa": 0
    },
    "ingredients": {
      "sweeteners": [
        "알룰로스",
        "수크랄로스",
        "아세설팜칼륨"
      ],
      "proteinSources": [],
      "allergens": [
        "유당"
      ],
      "lactoseFree": false
    },
    "description": "단백질 20g, 당류 0.8g, 대체당(알룰로스, 수크랄로스) 사용.",
    "purchaseUrl": "#",
    "rankingScore": 98
  },
  {
    "id": "p027",
    "name": "닥터유 프로 단백질바 크런치",
    "brand": "오리온",
    "thumbnail": "https://img.danawa.com/prod_img/500000/467/349/img/20349467_1.jpg?shrink=360:360&_v=20260405073204",
    "volume": "70g",
    "category": "프로틴 바",
    "purposesFit": [
      "muscle",
      "meal_replacement"
    ],
    "nutrition": {
      "calories": 355,
      "protein": 24,
      "carbs": 22,
      "sugar": 9,
      "fat": 19,
      "fiber": 0,
      "bcaa": 0
    },
    "ingredients": {
      "sweeteners": [],
      "proteinSources": [
        "WPI",
        "WPC",
        "대두"
      ],
      "allergens": [
        "유당",
        "대두",
        "견과류"
      ],
      "lactoseFree": false
    },
    "description": "단백질 24g.",
    "purchaseUrl": "#",
    "rankingScore": 78
  },
  {
    "id": "p028",
    "name": "셀렉스 프로핏 SPORTS 플러스 초콜릿",
    "brand": "셀렉스",
    "thumbnail": "https://thumbnail.coupangcdn.com/thumbnails/remote/492x492ex/image/retail/images/1cad607f-7ec2-494c-b2bf-9b9c78e8669e16064777894520761207.png",
    "volume": "330ml",
    "category": "프로틴 드링크",
    "purposesFit": [
      "muscle",
      "weight_loss",
      "glucose"
    ],
    "nutrition": {
      "calories": 99,
      "protein": 20,
      "carbs": 2.9,
      "sugar": 0,
      "fat": 0.8,
      "fiber": 0,
      "bcaa": 0
    },
    "ingredients": {
      "sweeteners": [
        "수크랄로스",
        "아세설팜칼륨"
      ],
      "proteinSources": [
        "WPI"
      ],
      "allergens": [
        "유당"
      ],
      "lactoseFree": false
    },
    "description": "단백질 20g, 당류 0g, 대체당(수크랄로스, 아세설팜칼륨) 사용.",
    "purchaseUrl": "#",
    "rankingScore": 98
  },
  {
    "id": "p029",
    "name": "셀렉스 프로틴 오리지널",
    "brand": "셀렉스",
    "thumbnail": "https://direct.maeil.com/UploadedFiles/direct/product/748a88ca-f526-4dbe-87a0-ea5dae9d68a5.jpg",
    "volume": "190ml",
    "category": "프로틴 드링크",
    "purposesFit": [
      "muscle"
    ],
    "nutrition": {
      "calories": 190,
      "protein": 12,
      "carbs": 22,
      "sugar": 14,
      "fat": 6,
      "fiber": 0,
      "bcaa": 0
    },
    "ingredients": {
      "sweeteners": [],
      "proteinSources": [
        "대두",
        "WPC"
      ],
      "allergens": [
        "유당",
        "대두",
        "견과류"
      ],
      "lactoseFree": false
    },
    "description": "프로틴 드링크 카테고리 제품.",
    "purchaseUrl": "#",
    "rankingScore": 59
  },
  {
    "id": "p030",
    "name": "셀렉스 프로핏 밀크 바닐라",
    "brand": "셀렉스",
    "thumbnail": "https://img.danawa.com/prod_img/500000/827/248/img/28248827_1.jpg?shrink=360:360&_v=20260405080353",
    "volume": "250ml",
    "category": "프로틴 드링크",
    "purposesFit": [
      "muscle",
      "weight_loss",
      "glucose"
    ],
    "nutrition": {
      "calories": 105,
      "protein": 20,
      "carbs": 4,
      "sugar": 0,
      "fat": 0.8,
      "fiber": 0,
      "bcaa": 0
    },
    "ingredients": {
      "sweeteners": [
        "수크랄로스",
        "아세설팜칼륨"
      ],
      "proteinSources": [
        "대두",
        "WPC"
      ],
      "allergens": [
        "유당",
        "대두"
      ],
      "lactoseFree": false
    },
    "description": "단백질 20g, 당류 0g, 대체당(수크랄로스, 아세설팜칼륨) 사용.",
    "purchaseUrl": "#",
    "rankingScore": 98
  },
  {
    "id": "p031",
    "name": "셀렉스 프로핏 모카 초콜릿",
    "brand": "셀렉스",
    "thumbnail": "https://img.danawa.com/prod_img/500000/001/249/img/28249001_1.jpg?shrink=360:360&_v=20260405080758",
    "volume": "250ml",
    "category": "프로틴 드링크",
    "purposesFit": [
      "muscle",
      "weight_loss",
      "glucose"
    ],
    "nutrition": {
      "calories": 100,
      "protein": 20,
      "carbs": 9,
      "sugar": 0,
      "fat": 0.7,
      "fiber": 5,
      "bcaa": 0
    },
    "ingredients": {
      "sweeteners": [
        "알룰로스",
        "수크랄로스",
        "아세설팜칼륨"
      ],
      "proteinSources": [
        "대두",
        "WPC"
      ],
      "allergens": [
        "유당",
        "대두"
      ],
      "lactoseFree": false
    },
    "description": "단백질 20g, 당류 0g, 식이섬유 5g, 대체당(알룰로스, 수크랄로스) 사용.",
    "purchaseUrl": "#",
    "rankingScore": 98
  },
  {
    "id": "p032",
    "name": "셀렉스 프로핏 바나나",
    "brand": "셀렉스",
    "thumbnail": "https://directcdn.maeil.com/UploadedFiles/direct/product/0618d55d-de67-4b08-b00e-308f7b411411.jpg",
    "volume": "250ml",
    "category": "프로틴 드링크",
    "purposesFit": [
      "muscle",
      "weight_loss",
      "glucose"
    ],
    "nutrition": {
      "calories": 100,
      "protein": 20,
      "carbs": 3.5,
      "sugar": 0,
      "fat": 0.8,
      "fiber": 0,
      "bcaa": 0
    },
    "ingredients": {
      "sweeteners": [
        "수크랄로스",
        "아세설팜칼륨"
      ],
      "proteinSources": [
        "대두",
        "WPC"
      ],
      "allergens": [
        "유당",
        "대두"
      ],
      "lactoseFree": false
    },
    "description": "단백질 20g, 당류 0g, 대체당(수크랄로스, 아세설팜칼륨) 사용.",
    "purchaseUrl": "#",
    "rankingScore": 98
  },
  {
    "id": "p033",
    "name": "테이크핏 맥스 바나나맛",
    "brand": "테이크핏",
    "thumbnail": "https://image.oliveyoung.co.kr/cfimages/cf-goods/uploads/images/thumbnails/10/0000/0022/A00000022869002ko.jpg?l=ko&QT=85&SF=webp&sharpen=1x0.5",
    "volume": "250ml",
    "category": "프로틴 드링크",
    "purposesFit": [
      "muscle",
      "weight_loss",
      "glucose"
    ],
    "nutrition": {
      "calories": 105,
      "protein": 24,
      "carbs": 1,
      "sugar": 0.7,
      "fat": 0.5,
      "fiber": 0,
      "bcaa": 0
    },
    "ingredients": {
      "sweeteners": [
        "수크랄로스",
        "아세설팜칼륨"
      ],
      "proteinSources": [
        "대두"
      ],
      "allergens": [
        "유당",
        "대두"
      ],
      "lactoseFree": false
    },
    "description": "단백질 24g, 당류 0.7g, 대체당(수크랄로스, 아세설팜칼륨) 사용.",
    "purchaseUrl": "#",
    "rankingScore": 98
  },
  {
    "id": "p034",
    "name": "테이크핏 맥스 호박고구마맛",
    "brand": "테이크핏",
    "thumbnail": "https://image.oliveyoung.co.kr/cfimages/cf-goods/uploads/images/thumbnails/10/0000/0022/A00000022869103ko.jpg?l=ko&QT=85&SF=webp&sharpen=1x0.5",
    "volume": "250ml",
    "category": "프로틴 드링크",
    "purposesFit": [
      "muscle",
      "weight_loss",
      "glucose"
    ],
    "nutrition": {
      "calories": 105,
      "protein": 24,
      "carbs": 1,
      "sugar": 0.7,
      "fat": 0.5,
      "fiber": 0,
      "bcaa": 0
    },
    "ingredients": {
      "sweeteners": [
        "수크랄로스",
        "아세설팜칼륨"
      ],
      "proteinSources": [
        "대두"
      ],
      "allergens": [
        "유당",
        "대두"
      ],
      "lactoseFree": false
    },
    "description": "단백질 24g, 당류 0.7g, 대체당(수크랄로스, 아세설팜칼륨) 사용.",
    "purchaseUrl": "#",
    "rankingScore": 98
  },
  {
    "id": "p035",
    "name": "테이크핏 맥스 고소한맛",
    "brand": "테이크핏",
    "thumbnail": "https://image.oliveyoung.co.kr/cfimages/cf-goods/uploads/images/thumbnails/10/0000/0022/A00000022868802ko.jpg?l=ko&QT=85&SF=webp&sharpen=1x0.5",
    "volume": "250ml",
    "category": "프로틴 드링크",
    "purposesFit": [
      "muscle",
      "weight_loss",
      "glucose"
    ],
    "nutrition": {
      "calories": 105,
      "protein": 24,
      "carbs": 1,
      "sugar": 0.7,
      "fat": 0.5,
      "fiber": 0,
      "bcaa": 0
    },
    "ingredients": {
      "sweeteners": [
        "수크랄로스",
        "아세설팜칼륨"
      ],
      "proteinSources": [
        "대두"
      ],
      "allergens": [
        "유당",
        "대두"
      ],
      "lactoseFree": false
    },
    "description": "단백질 24g, 당류 0.7g, 대체당(수크랄로스, 아세설팜칼륨) 사용.",
    "purchaseUrl": "#",
    "rankingScore": 98
  },
  {
    "id": "p036",
    "name": "테이크핏 맥스 초코맛",
    "brand": "테이크핏",
    "thumbnail": "https://img.danuri.io/catalog-image/679/016/018/d32e2033794d4f32972ae695f519ec04.jpg?_v=20260504114908&shrink=360:360",
    "volume": "250ml",
    "category": "프로틴 드링크",
    "purposesFit": [
      "muscle",
      "weight_loss",
      "glucose"
    ],
    "nutrition": {
      "calories": 106,
      "protein": 24,
      "carbs": 1,
      "sugar": 0.7,
      "fat": 0.7,
      "fiber": 0,
      "bcaa": 0
    },
    "ingredients": {
      "sweeteners": [
        "수크랄로스",
        "아세설팜칼륨"
      ],
      "proteinSources": [
        "대두"
      ],
      "allergens": [
        "유당",
        "대두"
      ],
      "lactoseFree": false
    },
    "description": "단백질 24g, 당류 0.7g, 대체당(수크랄로스, 아세설팜칼륨) 사용.",
    "purchaseUrl": "#",
    "rankingScore": 98
  },
  {
    "id": "p037",
    "name": "라라스윗 저당 딸기 생요거트바",
    "brand": "라라스윗",
    "thumbnail": "https://tqklhszfkvzk6518638.edge.naverncp.com/product/8809599361057.png",
    "volume": "70ml",
    "category": "간식",
    "purposesFit": [
      "weight_loss",
      "glucose"
    ],
    "nutrition": {
      "calories": 80,
      "protein": 1,
      "carbs": 17,
      "sugar": 3,
      "fat": 3.5,
      "fiber": 7,
      "bcaa": 0
    },
    "ingredients": {
      "sweeteners": [
        "에리스리톨",
        "수크랄로스",
        "아세설팜칼륨"
      ],
      "proteinSources": [],
      "allergens": [
        "유당"
      ],
      "lactoseFree": false
    },
    "description": "당류 3g, 식이섬유 7g, 대체당(에리스리톨, 수크랄로스) 사용.",
    "purchaseUrl": "#",
    "rankingScore": 70
  },
  {
    "id": "p038",
    "name": "라라스윗 저당 복숭아 생요거트바",
    "brand": "라라스윗",
    "thumbnail": "https://tqklhszfkvzk6518638.edge.naverncp.com/product/8809599361217.png",
    "volume": "70ml",
    "category": "간식",
    "purposesFit": [
      "weight_loss",
      "glucose"
    ],
    "nutrition": {
      "calories": 80,
      "protein": 1,
      "carbs": 17,
      "sugar": 3,
      "fat": 3.4,
      "fiber": 7,
      "bcaa": 0
    },
    "ingredients": {
      "sweeteners": [
        "알룰로스",
        "에리스리톨",
        "수크랄로스",
        "아세설팜칼륨"
      ],
      "proteinSources": [],
      "allergens": [
        "유당"
      ],
      "lactoseFree": false
    },
    "description": "당류 3g, 식이섬유 7g, 대체당(알룰로스, 에리스리톨) 사용.",
    "purchaseUrl": "#",
    "rankingScore": 70
  },
  {
    "id": "p039",
    "name": "라라스윗 저당 블루베리 생요거트바",
    "brand": "라라스윗",
    "thumbnail": "https://image.woodongs.com/imgsvr/item/GD_8809599361286_001.jpg",
    "volume": "70ml",
    "category": "간식",
    "purposesFit": [
      "weight_loss",
      "glucose"
    ],
    "nutrition": {
      "calories": 75,
      "protein": 1,
      "carbs": 17,
      "sugar": 4,
      "fat": 2.8,
      "fiber": 6,
      "bcaa": 0
    },
    "ingredients": {
      "sweeteners": [
        "에리스리톨",
        "수크랄로스",
        "아세설팜칼륨"
      ],
      "proteinSources": [],
      "allergens": [
        "유당"
      ],
      "lactoseFree": false
    },
    "description": "식이섬유 6g, 대체당(에리스리톨, 수크랄로스) 사용.",
    "purchaseUrl": "#",
    "rankingScore": 66
  },
  {
    "id": "p040",
    "name": "라라스윗 저당 애플망고 생요거트바",
    "brand": "라라스윗",
    "thumbnail": "https://tqklhszfkvzk6518638.edge.naverncp.com/product/8809599361606.jpg",
    "volume": "70ml",
    "category": "간식",
    "purposesFit": [
      "weight_loss",
      "glucose"
    ],
    "nutrition": {
      "calories": 75,
      "protein": 1,
      "carbs": 18,
      "sugar": 3,
      "fat": 2.7,
      "fiber": 7,
      "bcaa": 0
    },
    "ingredients": {
      "sweeteners": [
        "알룰로스",
        "에리스리톨",
        "수크랄로스",
        "아세설팜칼륨"
      ],
      "proteinSources": [],
      "allergens": [
        "유당"
      ],
      "lactoseFree": false
    },
    "description": "당류 3g, 식이섬유 7g, 대체당(알룰로스, 에리스리톨) 사용.",
    "purchaseUrl": "#",
    "rankingScore": 70
  },
  {
    "id": "p041",
    "name": "라라스윗 저당 멜론바",
    "brand": "라라스윗",
    "thumbnail": "https://tqklhszfkvzk6518638.edge.naverncp.com/product/8809599360739.jpg",
    "volume": "70ml",
    "category": "간식",
    "purposesFit": [
      "weight_loss",
      "glucose"
    ],
    "nutrition": {
      "calories": 100,
      "protein": 1,
      "carbs": 16,
      "sugar": 3,
      "fat": 6,
      "fiber": 6,
      "bcaa": 0
    },
    "ingredients": {
      "sweeteners": [
        "알룰로스",
        "수크랄로스",
        "아세설팜칼륨"
      ],
      "proteinSources": [],
      "allergens": [
        "유당"
      ],
      "lactoseFree": false
    },
    "description": "당류 3g, 식이섬유 6g, 대체당(알룰로스, 수크랄로스) 사용.",
    "purchaseUrl": "#",
    "rankingScore": 68
  },
  {
    "id": "p042",
    "name": "라라스윗 저당 단팥바",
    "brand": "라라스윗",
    "thumbnail": "https://tqklhszfkvzk6518638.edge.naverncp.com/product/8809599360791.jpg",
    "volume": "70ml",
    "category": "간식",
    "purposesFit": [
      "weight_loss",
      "glucose"
    ],
    "nutrition": {
      "calories": 60,
      "protein": 1.6,
      "carbs": 21,
      "sugar": 1,
      "fat": 1.4,
      "fiber": 9,
      "bcaa": 0
    },
    "ingredients": {
      "sweeteners": [
        "알룰로스",
        "수크랄로스",
        "아세설팜칼륨",
        "말티톨"
      ],
      "proteinSources": [
        "WPC"
      ],
      "allergens": [
        "유당"
      ],
      "lactoseFree": false
    },
    "description": "당류 1g, 식이섬유 9g, 대체당(알룰로스, 수크랄로스) 사용.",
    "purchaseUrl": "#",
    "rankingScore": 76
  },
  {
    "id": "p043",
    "name": "라라스윗 저당 바닐라 초코바",
    "brand": "라라스윗",
    "thumbnail": "https://tqklhszfkvzk6518638.edge.naverncp.com/product/8809599360470.png",
    "volume": "90ml",
    "category": "간식",
    "purposesFit": [
      "weight_loss",
      "glucose"
    ],
    "nutrition": {
      "calories": 170,
      "protein": 3,
      "carbs": 20,
      "sugar": 2,
      "fat": 14,
      "fiber": 8,
      "bcaa": 0
    },
    "ingredients": {
      "sweeteners": [
        "알룰로스",
        "에리스리톨",
        "수크랄로스",
        "아세설팜칼륨"
      ],
      "proteinSources": [
        "계란"
      ],
      "allergens": [
        "유당",
        "견과류",
        "계란"
      ],
      "lactoseFree": false
    },
    "description": "당류 2g, 식이섬유 8g, 대체당(알룰로스, 에리스리톨) 사용.",
    "purchaseUrl": "#",
    "rankingScore": 77
  },
  {
    "id": "p044",
    "name": "라라스윗 저당 초콜릿 초코바",
    "brand": "라라스윗",
    "thumbnail": "https://tqklhszfkvzk6518638.edge.naverncp.com/product/8809599360432.png",
    "volume": "90ml",
    "category": "간식",
    "purposesFit": [
      "weight_loss",
      "glucose"
    ],
    "nutrition": {
      "calories": 150,
      "protein": 3.5,
      "carbs": 18.5,
      "sugar": 2,
      "fat": 13,
      "fiber": 6.5,
      "bcaa": 0
    },
    "ingredients": {
      "sweeteners": [
        "알룰로스",
        "에리스리톨",
        "스테비아"
      ],
      "proteinSources": [
        "계란"
      ],
      "allergens": [
        "유당",
        "견과류",
        "계란"
      ],
      "lactoseFree": false
    },
    "description": "당류 2g, 식이섬유 6.5g, 대체당(알룰로스, 에리스리톨) 사용.",
    "purchaseUrl": "#",
    "rankingScore": 76
  },
  {
    "id": "p045",
    "name": "라라스윗 저당 말차 초코바",
    "brand": "라라스윗",
    "thumbnail": "https://tqklhszfkvzk6518638.edge.naverncp.com/product/8809599360593.png",
    "volume": "90ml",
    "category": "간식",
    "purposesFit": [
      "weight_loss",
      "glucose"
    ],
    "nutrition": {
      "calories": 150,
      "protein": 2,
      "carbs": 21,
      "sugar": 2,
      "fat": 12,
      "fiber": 9,
      "bcaa": 0
    },
    "ingredients": {
      "sweeteners": [
        "알룰로스",
        "에리스리톨",
        "수크랄로스",
        "아세설팜칼륨"
      ],
      "proteinSources": [
        "계란"
      ],
      "allergens": [
        "유당",
        "견과류",
        "계란"
      ],
      "lactoseFree": false
    },
    "description": "당류 2g, 식이섬유 9g, 대체당(알룰로스, 에리스리톨) 사용.",
    "purchaseUrl": "#",
    "rankingScore": 75
  },
  {
    "id": "p046",
    "name": "라라스윗 저당 쿠키앤크림 초코바",
    "brand": "라라스윗",
    "thumbnail": "https://tqklhszfkvzk6518638.edge.naverncp.com/product/8809599360692.jpg",
    "volume": "90ml",
    "category": "간식",
    "purposesFit": [
      "weight_loss",
      "glucose"
    ],
    "nutrition": {
      "calories": 145,
      "protein": 2,
      "carbs": 21,
      "sugar": 1,
      "fat": 12,
      "fiber": 5,
      "bcaa": 0
    },
    "ingredients": {
      "sweeteners": [
        "알룰로스",
        "에리스리톨",
        "스테비아",
        "말티톨"
      ],
      "proteinSources": [
        "계란"
      ],
      "allergens": [
        "유당",
        "글루텐",
        "계란"
      ],
      "lactoseFree": false
    },
    "description": "당류 1g, 식이섬유 5g, 대체당(알룰로스, 에리스리톨) 사용.",
    "purchaseUrl": "#",
    "rankingScore": 72
  },
  {
    "id": "p047",
    "name": "라라스윗 저당 딸기 초코바",
    "brand": "라라스윗",
    "thumbnail": "https://tqklhszfkvzk6518638.edge.naverncp.com/product/8809599361088.png",
    "volume": "90ml",
    "category": "간식",
    "purposesFit": [
      "weight_loss",
      "glucose"
    ],
    "nutrition": {
      "calories": 175,
      "protein": 2,
      "carbs": 25,
      "sugar": 3,
      "fat": 13.3,
      "fiber": 4,
      "bcaa": 0
    },
    "ingredients": {
      "sweeteners": [
        "알룰로스",
        "에리스리톨",
        "수크랄로스",
        "아세설팜칼륨"
      ],
      "proteinSources": [],
      "allergens": [
        "유당"
      ],
      "lactoseFree": false
    },
    "description": "당류 3g, 대체당(알룰로스, 에리스리톨) 사용.",
    "purchaseUrl": "#",
    "rankingScore": 66
  },
  {
    "id": "p048",
    "name": "미트리 닭가슴살 볼 깻잎",
    "brand": "미트리",
    "thumbnail": "https://thumbnail.coupangcdn.com/thumbnails/remote/492x492ex/image/vendor_inventory/9e27/64e42d85723b931ddc60bd962494f7f5586c425cb48b5e5b65cae5d51c39.jpg",
    "volume": "100g",
    "category": "닭가슴살",
    "purposesFit": [
      "muscle",
      "weight_loss"
    ],
    "nutrition": {
      "calories": 135,
      "protein": 19,
      "carbs": 8,
      "sugar": 4,
      "fat": 3,
      "fiber": 0,
      "bcaa": 0
    },
    "ingredients": {
      "sweeteners": [],
      "proteinSources": [
        "대두",
        "닭고기"
      ],
      "allergens": [
        "대두"
      ],
      "lactoseFree": true
    },
    "description": "단백질 19g.",
    "purchaseUrl": "#",
    "rankingScore": 90
  },
  {
    "id": "p049",
    "name": "딥앤로우 크런치커피바",
    "brand": "빙그레",
    "thumbnail": "https://www.brandb.net/_next/image?url=https%3A%2F%2Fapi.brandb.net%2Fapi%2Fv2%2Fcommon%2Fimage%3FfileId%3D23744&w=1920&q=75",
    "volume": "90ml",
    "category": "간식",
    "purposesFit": [
      "weight_loss",
      "glucose"
    ],
    "nutrition": {
      "calories": 159,
      "protein": 2.5,
      "carbs": 19,
      "sugar": 2.4,
      "fat": 13.5,
      "fiber": 5,
      "bcaa": 0
    },
    "ingredients": {
      "sweeteners": [
        "에리스리톨",
        "수크랄로스"
      ],
      "proteinSources": [],
      "allergens": [
        "유당",
        "대두",
        "견과류"
      ],
      "lactoseFree": false
    },
    "description": "당류 2.4g, 식이섬유 5g, 대체당(에리스리톨, 수크랄로스) 사용.",
    "purchaseUrl": "#",
    "rankingScore": 70
  },
  {
    "id": "p050",
    "name": "딥앤로우 크런치초코바",
    "brand": "빙그레",
    "thumbnail": "https://coolicecream.openhost.cafe24.com/COOL/ice/%EA%B8%B0%EB%B3%B8%EC%9B%90%EB%B3%B8/%EB%94%A5%EC%95%A4%EB%A1%9C%EC%9A%B0%ED%81%AC%EB%9F%B0%EC%B9%98%EC%B4%88%EC%BD%94%EB%B0%94_%EA%B8%B0%EB%B3%B8.jpg",
    "volume": "90ml",
    "category": "간식",
    "purposesFit": [
      "weight_loss",
      "glucose"
    ],
    "nutrition": {
      "calories": 153,
      "protein": 3,
      "carbs": 19,
      "sugar": 2.4,
      "fat": 12.5,
      "fiber": 4,
      "bcaa": 0
    },
    "ingredients": {
      "sweeteners": [
        "알룰로스",
        "에리스리톨",
        "수크랄로스"
      ],
      "proteinSources": [],
      "allergens": [
        "유당",
        "대두",
        "견과류"
      ],
      "lactoseFree": false
    },
    "description": "당류 2.4g, 대체당(알룰로스, 에리스리톨) 사용.",
    "purchaseUrl": "#",
    "rankingScore": 69
  },
  {
    "id": "p051",
    "name": "랩노쉬 프로틴 드링크 퍼펙트 그레인",
    "brand": "랩노쉬",
    "thumbnail": "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRlW_DXy5HcyUmRpIY3_ImE7NuVbdgmygsgrw&s",
    "volume": "350ml",
    "category": "프로틴 드링크",
    "purposesFit": [
      "muscle",
      "weight_loss",
      "glucose"
    ],
    "nutrition": {
      "calories": 125,
      "protein": 27,
      "carbs": 3,
      "sugar": 0,
      "fat": 0.6,
      "fiber": 0,
      "bcaa": 0
    },
    "ingredients": {
      "sweeteners": [
        "수크랄로스",
        "아세설팜칼륨"
      ],
      "proteinSources": [
        "대두",
        "WPC"
      ],
      "allergens": [
        "유당",
        "대두"
      ],
      "lactoseFree": false
    },
    "description": "단백질 27g, 당류 0g, 대체당(수크랄로스, 아세설팜칼륨) 사용.",
    "purchaseUrl": "#",
    "rankingScore": 98
  }
];

// id로 단일 제품 조회
export function getProductById(id) {
  return PRODUCTS.find((p) => p.id === id);
}
