import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { AppBar } from '../components/ds/AppBar.jsx';
import { SummaryCard } from '../components/summary/SummaryCard.jsx';
import Seo from '../components/global/Seo.jsx';
import { getAdapted } from '../data/adapters.js';
import { productPath } from '../data/productUrl.js';
import { useCompare } from '../store/CompareContext.jsx';
import { useProducts } from '../store/ProductsContext.jsx';
import { useWishlist } from '../store/WishlistContext.jsx';
import { useIsMobile } from '../hooks/useMediaQuery.js';
import './WishlistPage.css';

function EmptyWishlist({ onBrowse }) {
  return (
    <section className="d-wishlist-empty">
      <h2>찜한 제품이 없어요</h2>
      <p>나중에 다시 보고 싶은 제품을 하트로 담아둘 수 있어요.</p>
      <button type="button" className="d-wishlist-browse" onClick={onBrowse}>
        제품 보러가기
      </button>
    </section>
  );
}

export default function WishlistPage() {
  const navigate = useNavigate();
  const wishlist = useWishlist();
  const compare = useCompare();
  const { products: allProducts, loading } = useProducts();
  const isMobile = useIsMobile();

  const products = useMemo(
    () => wishlist.ids
      .map((id) => allProducts.find((p) => String(p.id) === String(id)))
      .filter(Boolean),
    [wishlist.ids, allProducts],
  );

  const handleToggleCompare = (id) => {
    if (!compare.has(id) && compare.isFull) {
      window.alert(`비교함은 최대 ${compare.max}개까지 담을 수 있어요.`);
      return;
    }
    compare.toggle(id);
  };

  const handleBrowse = () => navigate('/list');

  return (
    <>
      <Seo title="찜함" noindex />
      {isMobile && (
        <AppBar
          title="찜함"
          onBack={() => navigate(-1)}
          onCompare={() => navigate('/compare')}
          compareCount={compare.count}
        />
      )}
      <div className="page d-wishlist">
        <header className="d-wishlist-header">
          <div className="d-wishlist-titlewrap">
            <h1 className="d-wishlist-title">
            찜함
            <span className="d-wishlist-count">({products.length})</span>
          </h1>
        </div>
          {products.length > 0 && (
            <button type="button" className="d-wishlist-clear" onClick={wishlist.clear}>
              전체 지우기
            </button>
          )}
        </header>

        {loading ? (
          <div className="d-wishlist-loading" aria-busy="true" />
        ) : products.length === 0 ? (
          <EmptyWishlist onBrowse={handleBrowse} />
        ) : (
          <div className="d-wishlist-list">
            {products.map((p) => {
              const food = getAdapted(p);
              return (
                <div key={p.id} className="d-wishlist-cell">
                  <SummaryCard
                    food={food}
                    onClick={() => navigate(productPath(food))}
                    onCompare={() => handleToggleCompare(p.id)}
                    inCompare={compare.has(p.id)}
                    onWishlist={() => wishlist.toggle(p.id)}
                    inWishlist={wishlist.has(p.id)}
                    showPurchase
                  />
                </div>
              );
            })}
          </div>
        )}
      </div>
    </>
  );
}
