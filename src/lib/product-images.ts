const publicBucketPath = "/storage/v1/object/public/product-images/";

export function productImagePattern(supabaseUrl: string | undefined) {
  const url = supabaseUrl ? URL.parse(supabaseUrl) : null;
  if (!url || (url.protocol !== "http:" && url.protocol !== "https:")) return null;

  return new URL(`${publicBucketPath}**`, url.origin);
}

export function productImageSource(candidate: string | undefined) {
  if (!candidate) return null;

  const url = URL.parse(candidate);
  const pattern = productImagePattern(process.env.NEXT_PUBLIC_SUPABASE_URL);
  if (
    !url || !pattern || url.origin !== pattern.origin ||
    !url.pathname.startsWith(publicBucketPath) || url.pathname === publicBucketPath ||
    url.search || url.hash || url.username || url.password
  ) return null;

  return url.href;
}
