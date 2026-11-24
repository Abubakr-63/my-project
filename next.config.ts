import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";
import { productImagePattern } from "./src/lib/product-images";

const withNextIntl = createNextIntlPlugin("./src/lib/request.ts");
const storageImages = productImagePattern(process.env.NEXT_PUBLIC_SUPABASE_URL);

const nextConfig: NextConfig = {
  agentRules: false,
  images: { remotePatterns: storageImages ? [storageImages] : [] },
};

export default withNextIntl(nextConfig);
