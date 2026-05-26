import { useState } from 'react';
import { ChevronDown } from 'lucide-react';
import './FaqPage.css';

const FAQ_ITEMS = [
  {
    q: '다분해.는 어떤 서비스인가요?',
    a: '다이어트 식품의 영양성분표를 분해하고, 제품 간 비교를 도와주는 서비스입니다. 브랜드 광고가 아닌 공식 영양정보 데이터를 기반으로 합니다.',
  },
  {
    q: '데이터는 어디서 가져오나요?',
    a: '식품의약품안전처에 공시된 영양정보표와 제품 패키지에 표기된 성분 정보를 기반으로 수집합니다. 사용자 제보로 추가되는 제품도 있습니다.',
  },
  {
    q: '비교함은 최대 몇 개까지 담을 수 있나요?',
    a: '최대 5개 제품을 동시에 비교할 수 있습니다. 비교함은 브라우저에 저장되어 새로고침해도 유지됩니다.',
  },
  {
    q: '다분해 점수는 어떻게 계산되나요?',
    a: '칼로리, 단백질, 당류, 식이섬유 등 주요 영양 지표를 종합적으로 평가한 점수입니다. 특정 제품을 추천하거나 비추천하는 것이 아니라, 영양 균형 정도를 수치로 나타냅니다.',
  },
  {
    q: '특정 제품이 등록되어 있지 않아요.',
    a: '현재 서비스 초기 단계라 모든 제품을 다루고 있지는 않습니다. 문의하기를 통해 제품 추가를 요청하시면 검토 후 반영하겠습니다.',
  },
  {
    q: '영양 정보가 실제와 다른 것 같아요.',
    a: '제조사의 레시피 변경이나 입력 오류 가능성이 있습니다. 문의하기로 알려주시면 빠르게 수정하겠습니다.',
  },
  {
    q: '서비스 이용료가 있나요?',
    a: '다분해.는 무료 서비스입니다. 별도 회원가입 없이 모든 기능을 이용할 수 있습니다.',
  },
];

function FaqItem({ q, a }) {
  const [open, setOpen] = useState(false);
  return (
    <div className={`d-faq-item${open ? ' is-open' : ''}`}>
      <button
        type="button"
        className="d-faq-item-toggle"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
      >
        <span className="d-faq-item-q">{q}</span>
        <ChevronDown size={18} className={`d-faq-item-chevron${open ? ' is-open' : ''}`} />
      </button>
      {open && (
        <div className="d-faq-item-a">
          <p>{a}</p>
        </div>
      )}
    </div>
  );
}

export default function FaqPage() {
  return (
    <div className="page d-faq">
      <header className="d-faq-header">
        <h1 className="d-faq-title">자주 묻는 질문</h1>
        <p className="d-faq-sub">궁금한 점이 해결되지 않으면 문의하기를 이용해주세요.</p>
      </header>
      <div className="d-faq-list">
        {FAQ_ITEMS.map((item, i) => (
          <FaqItem key={i} q={item.q} a={item.a} />
        ))}
      </div>
    </div>
  );
}
