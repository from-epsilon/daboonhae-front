import { Helmet } from 'react-helmet-async';
import {
  SITE_NAME,
  SITE_TAGLINE,
  DEFAULT_DESCRIPTION,
  DEFAULT_OG_IMAGE,
  OG_LOCALE,
  absUrl,
} from '../../config/site.js';

// 모든 페이지가 이 컴포넌트 하나로 메타를 선언한다.
// JSON-LD(Phase 2)도 jsonLd prop으로 함께 주입.
//
// props:
//  title         페이지 제목 (브랜드 suffix 자동) | 미지정 시 기본 타이틀
//  description   메타 설명 | 미지정 시 DEFAULT_DESCRIPTION
//  canonicalPath 정규 경로(쿼리 제거) 예: '/product/123'
//  ogImage       OG 이미지 (절대/상대 모두 허용) | 미지정 시 기본 이미지
//  ogType        'website' | 'article' 등
//  noindex       true면 robots noindex,nofollow
//  jsonLd        객체 또는 객체 배열 (Phase 2)
export default function Seo({
  title,
  description,
  canonicalPath,
  ogImage,
  ogType = 'website',
  noindex = false,
  jsonLd,
}) {
  const fullTitle = title ? `${title} | ${SITE_NAME}` : `${SITE_NAME} — ${SITE_TAGLINE}`;
  const desc = description ?? DEFAULT_DESCRIPTION;
  const canonical = canonicalPath ? absUrl(canonicalPath) : undefined;
  const image = ogImage ? absUrl(ogImage) : DEFAULT_OG_IMAGE;
  const ldArray = jsonLd ? (Array.isArray(jsonLd) ? jsonLd : [jsonLd]) : [];

  return (
    <Helmet>
      <title>{fullTitle}</title>
      <meta name="description" content={desc} />
      {canonical && <link rel="canonical" href={canonical} />}
      {noindex && <meta name="robots" content="noindex,nofollow" />}

      {/* Open Graph */}
      <meta property="og:site_name" content={SITE_NAME} />
      <meta property="og:locale" content={OG_LOCALE} />
      <meta property="og:type" content={ogType} />
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={desc} />
      <meta property="og:image" content={image} />
      {canonical && <meta property="og:url" content={canonical} />}

      {/* Twitter */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={desc} />
      <meta name="twitter:image" content={image} />

      {/* JSON-LD (Phase 2) */}
      {ldArray.map((ld, i) => (
        <script key={i} type="application/ld+json">
          {JSON.stringify(ld)}
        </script>
      ))}
    </Helmet>
  );
}
