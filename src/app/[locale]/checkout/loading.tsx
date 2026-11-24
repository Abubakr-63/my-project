import { getTranslations } from "next-intl/server";

export default async function CheckoutLoading() {
  const t = await getTranslations("Checkout");
  return <p role="status" className="mx-auto max-w-xl px-4 py-8">{t("loading")}</p>;
}
