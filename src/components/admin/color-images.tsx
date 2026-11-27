"use client";

import { DeleteIcon, StarIcon } from "@/components/ui/icons";
import { ui } from "@/components/ui/styles";
import Image from "next/image";
import { useTranslations } from "next-intl";

export type SavedColorImage = { url: string; preview: string | null };
export const colorPhotoButton = ui.secondary;

export function ColorImages({ colorName, images, disabled, onUpdate }: {
  colorName: string;
  images: SavedColorImage[];
  disabled: boolean;
  onUpdate: (url: string, remove: boolean) => void;
}) {
  const t = useTranslations("Admin");
  if (!images.length) return null;

  return (
    <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
      {images.map(({ url, preview }, index) => (
        <li key={`${index}:${url}`} className="space-y-2 rounded-m3-sm border border-outline-variant p-2">
          {preview ? (
            <div className="relative aspect-[4/3] overflow-hidden rounded-m3-xs bg-surface-container">
              <Image src={preview} alt={t("colorImageAlt", { color: colorName, number: index + 1 })}
                fill loading="lazy" sizes="(min-width: 1280px) 350px, (min-width: 1024px) 32vw, (min-width: 640px) 48vw, 90vw"
                className="object-contain" />
            </div>
          ) : <p className="text-sm">{t("imagePreviewUnavailable", { number: index + 1 })}</p>}
          <div className="flex flex-wrap gap-2">
            {index > 0 && <button className={colorPhotoButton} type="button" disabled={disabled}
              onClick={() => onUpdate(url, false)}><StarIcon size={18} />{t("imageMakeFirst")}</button>}
            <button className={colorPhotoButton} type="button" disabled={disabled}
              aria-label={t("imageRemoveNumber", { number: index + 1 })}
              onClick={() => onUpdate(url, true)}><DeleteIcon size={18} />{t("imageRemove")}</button>
          </div>
        </li>
      ))}
    </ul>
  );
}
