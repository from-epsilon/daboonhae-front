import { supabase } from '../lib/supabase.js';

function normalizeProductKeys(keys) {
  return [...new Set(
    (Array.isArray(keys) ? keys : [])
      .map((key) => String(key ?? '').trim())
      .filter(Boolean),
  )];
}

export async function fetchAccountWishlist() {
  const { data, error } = await supabase.rpc('get_own_wishlist_product_keys');
  if (error) throw error;
  return normalizeProductKeys(data);
}

export async function setAccountWishlistProduct(productKey, wished) {
  const { error } = await supabase.rpc('set_own_wishlist_product', {
    p_product_key: String(productKey),
    p_wished: Boolean(wished),
  });
  if (error) throw error;
}

export async function clearAccountWishlist(userId) {
  const { error } = await supabase
    .from('user_product_profile_wishlist_items')
    .delete()
    .eq('user_id', userId);
  if (error) throw error;
}

export async function completeLocalWishlistImport(productKeys) {
  const { data, error } = await supabase.rpc('complete_local_wishlist_import', {
    p_product_keys: normalizeProductKeys(productKeys),
  });
  if (error) throw error;
  return normalizeProductKeys(data);
}
