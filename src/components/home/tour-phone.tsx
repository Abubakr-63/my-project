import { getTranslations } from "next-intl/server";
import { AddIcon, CartIcon, CategoryIcon, CheckCircleIcon, ImageIcon, InventoryIcon, MinusIcon, ReceiptIcon, SendIcon } from "@/components/ui/icons";

export async function TourPhone() {
  const t = await getTranslations("Home");
  const catalogImages = [0, 1, 2, 3];

  return (
    <div className="home-phone-stage" aria-hidden="true">
      <div className="home-phone">
        <div className="home-phone-speaker" />
        <div className="home-phone-display">
          <div className="home-phone-screen">
            <div className="home-screen-label"><CategoryIcon size={16} />{t("demoCatalog")}</div>
            <div className="grid grow grid-cols-2 gap-2">
              {catalogImages.map((tile) => (
                <div className="home-demo-tile grid place-items-center rounded-m3-md" key={tile}><ImageIcon size={22} /></div>
              ))}
            </div>
          </div>
          <div className="home-phone-screen">
            <div className="home-screen-label"><InventoryIcon size={16} />{t("demoProduct")}</div>
            <div className="grid grow place-items-center rounded-m3-md bg-primary-container text-on-primary-container"><ImageIcon size={44} /></div>
            <div className="flex items-center justify-between gap-1">
              {t("demoColors")}<span className="flex gap-1"><span className="size-4 rounded-full bg-primary" /><span className="size-4 rounded-full border border-outline bg-surface-container-high" /></span>
            </div>
            <div className="home-screen-row"><MinusIcon size={14} />{t("demoPacks")}<AddIcon size={14} /></div>
          </div>
          <div className="home-phone-screen">
            <div className="home-screen-label"><CartIcon size={16} />{t("demoCart")}</div>
            <div className="grid grow place-items-center rounded-m3-md bg-secondary-container text-on-secondary-container"><ReceiptIcon size={44} /></div>
            <div className="home-screen-row">{t("demoPairs")}<span className="h-1.5 w-5 rounded-full bg-on-surface-variant" /></div>
            <div className="home-screen-row">{t("demoTotal")}<span className="h-1.5 w-8 rounded-full bg-on-surface-variant" /></div>
          </div>
          <div className="home-phone-screen">
            <div className="home-screen-label"><SendIcon size={16} />{t("demoChat")}</div>
            <div className="grid grow content-center gap-3">
              <div className="me-5 h-10 rounded-m3-lg bg-surface-container-high" />
              <div className="ms-3 flex items-center gap-2 rounded-m3-lg bg-success-container p-2 text-on-success-container"><CheckCircleIcon size={16} />{t("demoSent")}</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
