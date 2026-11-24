import { getTranslations } from "next-intl/server";

export default async function AdminLoading() {
  const t = await getTranslations("Admin");
  return <p role="status">{t("loading")}</p>;
}
