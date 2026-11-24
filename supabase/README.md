# Supabase setup

## Apply the migrations

1. Open your Supabase project and go to **SQL Editor → New query**. Use the project owner's SQL Editor role. [Supabase SQL Editor instructions](https://supabase.com/docs/guides/database/functions)
2. Copy and run the entire contents of each file in a separate query, in this order.
   1. [001_schema.sql](migrations/001_schema.sql) creates the tables and enums, enables RLS, and inserts the default settings.
   2. [002_access_and_storage.sql](migrations/002_access_and_storage.sql) grants catalog access, adds admin policies, and creates the public image bucket.
   3. [003_create_order.sql](migrations/003_create_order.sql) exposes the order creation RPC.
3. Confirm each query succeeds before moving on. Each migration runs in a transaction. Apply each numbered migration once.
4. For test data, run [seed.sql](seed.sql) in a separate query. It adds two products with two colors each. The color image lists start empty. Re-running it preserves existing rows with the same seed identifiers.
5. Set the real store values in the SQL Editor or as an admin in the application when an admin interface exists. Initially `whatsapp_number` is blank, `min_order_amount` is `0`, and `currency` is `TJS`. Use a nonnegative decimal with up to two fractional digits for `min_order_amount`.

The storage policies target the `product-images` bucket. The bucket restricts writes by anonymous and signed-in users to admins even when other permissive policies cover it. Public object URLs remain readable when a product is deactivated.

## Create the first admin

1. Open **Authentication → Users → Add user → Create new user** in the Supabase dashboard.
2. Enter the intended admin's email and password, and confirm the user through your normal email confirmation process or the dashboard's auto-confirm option. You can also choose **Send invitation** and let the admin set their own password. [Supabase Auth user invitations](https://supabase.com/docs/guides/auth/users#inviting-users)
3. Open the user record and copy its **User UID**.
4. Run this statement in the SQL Editor after replacing the placeholder with that UID.

```sql
insert into public.admins (user_id)
values ('REPLACE_WITH_AUTH_USER_UUID'::uuid)
on conflict (user_id) do nothing;
```

The admin signs in as a regular authenticated user. RLS checks membership by their Auth UUID. Removing their row from `public.admins` revokes admin access.

## Create an order

Call `create_order` as `anon` or `authenticated`. It accepts the customer name, phone, locale, and a JSON array with one object per color. Each line supplies `product_id`, `color_id`, and integer `packs`. Use the matching product and color UUIDs from the catalog. The function returns one row containing `order_number` and `order_id`.

The minimum pack quantity applies per color line. The RPC accepts 1–100 distinct colors and up to 10,000 packs per line. It uses the current catalog price and pack size and snapshots names in the order's language with Russian as the fallback. The minimum order amount is checked against the whole order. Sequence numbers start at 1001 and can have gaps. Deactivate a product to hide it from the public catalog. Orders retain their snapshots and references to purchased products and colors.

## Configure the Next.js helpers

Use Node.js 22 or later for the Supabase SDK. Copy the root `.env.example` to `.env.local`. Set `NEXT_PUBLIC_SUPABASE_URL` to the project URL and `NEXT_PUBLIC_SUPABASE_ANON_KEY` to the project's public publishable or legacy anon key. Keep the service role key out of these variables.

The browser and server helpers use the same public key and rely on RLS. When adding Auth flows, integrate cookie refresh with the existing Next.js proxy so updated sessions can reach the browser. [Supabase SSR guide](https://supabase.com/docs/guides/auth/server-side/creating-a-client?framework=nextjs&queryGroups=framework&router=app)
