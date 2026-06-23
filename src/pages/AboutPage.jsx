import { Link } from 'react-router-dom';
import { BarChart3, Scale, Search, ShieldCheck } from 'lucide-react';
import { useProducts } from '../store/ProductsContext.jsx';
import Seo from '../components/global/Seo.jsx';
import './AboutPage.css';

const FEATURES = [
  {
    Icon: BarChart3,
    title: '성분 분해',
    desc: '칼로리, 단백질, 당류, 지방, 나트륨, EAA, BCAA처럼 제품 선택에 필요한 지표를 같은 형식으로 정리합니다.',
    chips: ['칼로리', '단백질', '당류', '지방', '나트륨', 'EAA', 'BCAA'],
  },
  {
    Icon: Search,
    title: '조건 필터링',
    desc: '목적에 맞게 칼로리·단백질·당류 범위를 조절하고, 대체당·단백질 원료·알레르기 유발 성분을 포함하거나 제외할 수 있습니다.',
    chips: ['칼로리 범위', '단백질 함량', '대체당', '알레르기 제외'],
  },
  {
    Icon: Scale,
    title: '비교 도구',
    desc: '최대 5개 제품을 나란히 놓고 지표별로 비교할 수 있습니다.',
    chips: ['영양성분', '원재료', '핵심 지표', '가격 정보'],
  },
  {
    Icon: ShieldCheck,
    title: '구매 전 확인',
    desc: '가격과 판매처 정보를 참고하되, 실제 구매 조건은 외부 판매처에서 최종 확인하도록 안내합니다.',
    chips: ['가격 변동 가능', '배송비 확인', '판매처 조건 확인'],
  },
];

export default function AboutPage() {
  const { products } = useProducts();
  const productCount = products.length;

  return (
    <div className="page d-about">
      <Seo
        title="서비스 소개"
        description="다분해는 흩어진 다이어트 식품 정보를 모아 성분, 영양지표, 원재료, 가격을 비교할 수 있게 정리하는 서비스입니다."
        canonicalPath="/about"
      />
      <section className="d-about-hero">
        <h1 className="d-about-hero-title">
          다이어트 식품<br />
          <span className="d-about-hero-accent">분석</span><br />
          해드림.
        </h1>
        <p className="d-about-hero-sub">
          다분해.는 "다이어트 식품 분석 해드림"의 줄임말입니다.
          제품명과 광고 문구만으로는 알기 어려운 영양성분, 원재료, 알레르기 정보,
          가격 정보를 한곳에 모아 비교할 수 있게 정리합니다.
        </p>
        <p className="d-about-hero-count">
          현재 {productCount.toLocaleString()}개 제품의 정보를 분석하고 있습니다.
        </p>
      </section>

      <section className="d-about-features">
        <h2 className="d-about-section-title">핵심 기능</h2>
        <div className="d-about-feature-grid">
          {FEATURES.map((f) => (
            <div key={f.title} className="d-about-feature-card">
              <div className="d-about-feature-icon">
                <f.Icon size={24} />
              </div>
              <h3 className="d-about-feature-title">{f.title}</h3>
              <p className="d-about-feature-desc">{f.desc}</p>
              <div className="d-about-chip-list" aria-label={`${f.title} 예시`}>
                {f.chips.map((chip) => (
                  <span key={chip} className="d-about-chip">{chip}</span>
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="d-about-story">
        <h2 className="d-about-section-title">왜 만들었나요?</h2>
        <div className="d-about-story-body">
          <p>
            다이어트 식품을 고를 때 필요한 정보는 한곳에 있지 않습니다. 제품 패키지에는 영양성분표가 있고,
            제조사 페이지에는 원재료와 알레르기 정보가 있고, 쇼핑몰에는 가격과 묶음 구성이 따로 올라옵니다.
          </p>
          <p>
            정보가 흩어져 있을수록 비교는 어려워집니다. "저당", "고단백", "식사 대용"이라는 문구는 많지만,
            실제로 당류가 몇 g인지, 단백질 원료가 무엇인지, 나에게 피해야 할 성분이 있는지는 직접 찾아봐야 합니다.
          </p>
          <p>
            다분해.는 이 흩어진 정보를 모아 제품을 같은 기준으로 다시 보여주기 위해 시작했습니다.
            어떤 제품이 무조건 좋다고 말하기보다, 사용자가 자기 목적에 맞게 판단할 수 있는 재료를 정리합니다.
          </p>
        </div>
      </section>

      <section className="d-about-cta">
        <h2 className="d-about-cta-title">지금 바로 확인해보세요</h2>
        <div className="d-about-cta-actions">
          <Link to="/list" className="d-about-cta-btn is-primary">제품 둘러보기</Link>
          <Link to="/compare" className="d-about-cta-btn">비교함 가기</Link>
        </div>
      </section>
    </div>
  );
}
