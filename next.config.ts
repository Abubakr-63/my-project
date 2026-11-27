import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";
import { locales } from "./src/lib/locales";
import { productImagePattern } from "./src/lib/product-images";

const withNextIntl = createNextIntlPlugin("./src/lib/request.ts");
const storageImages = productImagePattern(process.env.NEXT_PUBLIC_SUPABASE_URL);

const legacyTajikPath = `/${locales.tj.htmlLang}/:path*`;
const tajikPath = `/${locales.tj.routeLocale}/:path*`;

const nextConfig: NextConfig = {
  async redirects() {
    return [{ source: legacyTajikPath, destination: tajikPath, permanent: true }];
  },
  images: {
    remotePatterns: storageImages ? [storageImages] : [],
    formats: ["image/avif", "image/webp"],
  },
};

export default withNextIntl(nextConfig);
