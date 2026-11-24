export type CartCatalogLine = {
  slug: string;
  name: string;
  color: string;
  image: string | null;
  pricePerPair: number;
  pairsPerPack: number;
  minPacks: number;
};

export type CartDetails = {
  items: Record<string, CartCatalogLine>;
  currency: string;
  minimumOrderAmount: number;
};
