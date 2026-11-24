// Handwritten from supabase/migrations. Keep this file in sync with schema changes.
export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

type ProductSeason = "spring_autumn" | "summer" | "winter" | "all";
type StoreLocale = "ru" | "tg" | "en";
type OrderStatus = "new" | "in_progress" | "done" | "cancelled";

type LocalizedName = {
  name_ru: string;
  name_tg: string | null;
  name_en: string | null;
};

type Category = LocalizedName & {
  id: string;
  slug: string;
  sort_order: number;
  created_at: string;
};

type Product = LocalizedName & {
  id: string;
  slug: string;
  category_id: string;
  description_ru: string | null;
  description_tg: string | null;
  description_en: string | null;
  season: ProductSeason;
  price_per_pair: number;
  pairs_per_pack: number;
  size_range: string;
  min_packs: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
};

type ProductColor = LocalizedName & {
  id: string;
  product_id: string;
  image_urls: string[];
  sort_order: number;
};

type Order = {
  id: string;
  order_number: number;
  customer_name: string;
  customer_phone: string;
  locale: StoreLocale;
  status: OrderStatus;
  total_pairs: number;
  total_amount: number;
  created_at: string;
};

type OrderItem = {
  id: string;
  order_id: string;
  product_id: string;
  color_id: string;
  product_name: string;
  color_name: string;
  packs: number;
  pairs_per_pack: number;
  price_per_pair: number;
  line_total: number;
};

type Setting = { key: string; value: string };
type Admin = { user_id: string };

type Relationship<Name, Columns, Relation, ReferencedColumns> = {
  foreignKeyName: Name;
  columns: Columns;
  isOneToOne: false;
  referencedRelation: Relation;
  referencedColumns: ReferencedColumns;
};

type Table<
  Row,
  Required extends keyof Row,
  Relationships extends unknown[] = [],
  Generated extends Exclude<keyof Row, Required> = never,
> = {
  Row: Row;
  Insert: Pick<Row, Required> &
    Partial<Omit<Row, Required | Generated>> &
    { [Key in Generated]?: never };
  Update: Partial<Omit<Row, Generated>> & { [Key in Generated]?: never };
  Relationships: Relationships;
};

export type Database = {
  public: {
    Tables: {
      categories: Table<Category, "slug" | "name_ru">;
      products: Table<
        Product,
        "slug" | "category_id" | "name_ru" | "price_per_pair" | "pairs_per_pack" | "size_range",
        [Relationship<"products_category_id_fkey", ["category_id"], "categories", ["id"]>]
      >;
      product_colors: Table<
        ProductColor,
        "product_id" | "name_ru",
        [Relationship<"product_colors_product_id_fkey", ["product_id"], "products", ["id"]>]
      >;
      orders: Table<
        Order,
        "customer_name" | "customer_phone" | "locale" | "total_pairs" | "total_amount",
        [],
        "order_number"
      >;
      order_items: Table<
        OrderItem,
        | "order_id"
        | "product_id"
        | "color_id"
        | "product_name"
        | "color_name"
        | "packs"
        | "pairs_per_pack"
        | "price_per_pair",
        [
          Relationship<"order_items_order_id_fkey", ["order_id"], "orders", ["id"]>,
          Relationship<"order_items_product_id_fkey", ["product_id"], "products", ["id"]>,
          Relationship<
            "order_items_product_color_fkey",
            ["product_id", "color_id"],
            "product_colors",
            ["product_id", "id"]
          >,
        ],
        "line_total"
      >;
      settings: Table<Setting, "key" | "value">;
      admins: Table<Admin, "user_id">;
    };
    Views: Record<never, never>;
    Functions: {
      create_order: {
        Args: { p_name: string; p_phone: string; p_locale: string; p_items: Json };
        Returns: { order_number: number; order_id: string }[];
      };
      is_admin: {
        Args: Record<never, never>;
        Returns: boolean;
      };
    };
    Enums: {
      product_season: ProductSeason;
      store_locale: StoreLocale;
      order_status: OrderStatus;
    };
    CompositeTypes: Record<never, never>;
  };
};
