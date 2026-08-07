import { supabase } from '../lib/supabase.js';

function positiveProfileId(value) {
  const parsed = Number(value);
  if (!Number.isInteger(parsed) || parsed <= 0) {
    throw new Error('제품 버전 정보를 확인할 수 없습니다.');
  }
  return parsed;
}

export async function fetchProductProfileReviews(productProfileId) {
  const { data, error } = await supabase.rpc('get_product_profile_review_bundle', {
    p_product_profile_id: positiveProfileId(productProfileId),
  });
  if (error) throw error;

  return {
    reviewCount: Number(data?.review_count) || 0,
    averageRating: data?.average_rating == null ? null : Number(data.average_rating),
    metrics: Array.isArray(data?.metrics) ? data.metrics : [],
    reviews: Array.isArray(data?.reviews) ? data.reviews : [],
  };
}

export async function fetchProductProfileReviewPage(productProfileId, offset, limit = 50) {
  const parsedOffset = Number(offset);
  const parsedLimit = Number(limit);
  if (!Number.isInteger(parsedOffset) || parsedOffset < 0) {
    throw new Error('리뷰 목록 위치를 확인할 수 없습니다.');
  }
  if (!Number.isInteger(parsedLimit) || parsedLimit < 1 || parsedLimit > 50) {
    throw new Error('리뷰 목록 크기를 확인할 수 없습니다.');
  }

  const { data, error } = await supabase.rpc('get_product_profile_review_page', {
    p_product_profile_id: positiveProfileId(productProfileId),
    p_offset: parsedOffset,
    p_limit: parsedLimit,
  });
  if (error) throw error;
  return Array.isArray(data) ? data : [];
}

export async function saveProductProfileReview(productProfileId, scores, content) {
  const { data, error } = await supabase.rpc('save_product_profile_review', {
    p_product_profile_id: positiveProfileId(productProfileId),
    p_scores: scores,
    p_content: String(content || '').trim() || null,
  });
  if (error) throw error;
  return data;
}

export async function deleteProductProfileReview(productProfileId) {
  const { error } = await supabase.rpc('delete_own_product_profile_review', {
    p_product_profile_id: positiveProfileId(productProfileId),
  });
  if (error) throw error;
}

export async function fetchMyProductProfileReviews() {
  const { data, error } = await supabase.rpc('get_my_product_profile_review_history');
  if (error) throw error;
  if (!Array.isArray(data)) return [];
  return data.map((review) => ({
    ...review,
    thumbnail: review.storage_image_path
      ? supabase.storage.from('food-images').getPublicUrl(review.storage_image_path).data.publicUrl
      : review.image_url || '',
  }));
}
