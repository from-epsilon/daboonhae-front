import { Link } from 'react-router-dom';
import { BarChart3, Scale, ShieldCheck, Users } from 'lucide-react';
import { useProducts } from '../store/ProductsContext.jsx';
import './AboutPage.css';

const FEATURES = [
  {
    Icon: BarChart3,
    title: '성분 분해',
    desc: '제품 하나를 12개 이상의 영양 지표로 분해해 시각화합니다.',
  },
  {
    Icon: Scale,
    title: '비교 도구',
    desc: '최대 5개 제품을 나란히 놓고 지표별로 비교할 수 있습니다.',
  },
  {
    Icon: ShieldCheck,
    title: '공식 데이터',
    desc: '식약처 공시 영양정보표를 기준으로, 광고 문구 없이 숫자만 전달합니다.',
  },
  {
    Icon: Users,
    title: '사용자 후기',
    desc: '실제 섭취 경험을 바탕으로 맛·포만감·재구매 의향을 공유합니다.',
  },
];

export default function AboutPage() {
  const { products } = useProducts();
  const productCount = products.length;

  return (
    <div className="page d-about">
      <section className="d-about-hero">
        <h1 className="d-about-hero-title">
          광고 말고, <span className="d-about-hero-accent">숫자</span>로 고르세요
        </h1>
        <p className="d-about-hero-sub">
          다분해.는 다이어트 식품의 영양성분을 분해하고 비교해주는 서비스입니다.<br />
          현재 {productCount}개 제품의 영양 정보를 분석하고 있으며, 매주 업데이트됩니다.
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
            </div>
          ))}
        </div>
      </section>

      <section className="d-about-story">
        <h2 className="d-about-section-title">왜 만들었나요?</h2>
        <div className="d-about-story-body">
          <p>
            편의점과 온라인에서 "저당", "고단백", "다이어트"를 표방하는 제품이 늘어나고 있지만,
            정작 뒷면의 영양정보표를 꼼꼼히 비교하기는 쉽지 않습니다.
          </p>
          <p>
            다분해.는 이 문제를 해결하기 위해 시작되었습니다. 브랜드 광고가 아닌
            영양성분표 원본 데이터를 기반으로, 사용자가 스스로 판단할 수 있는 정보를 제공합니다.
          </p>
          <p>
            "좋다/나쁘다"를 말하지 않습니다. 숫자를 보여주고 비교할 수 있게 할 뿐입니다.
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
