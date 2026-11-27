"use client";

import { AddPhotoIcon, CameraIcon, CloseIcon, RefreshIcon } from "@/components/ui/icons";
import { ui } from "@/components/ui/styles";
import Image from "next/image";
import { useTranslations } from "next-intl";
import { useId, useRef, type ChangeEvent } from "react";
import type { uploadColorImage } from "@/app/[locale]/admin/images-actions";
import type { compressColorImage } from "@/lib/admin/compress-image";
import { colorPhotoButton } from "./color-images";

export type ImageError = Extract<Awaited<ReturnType<typeof uploadColorImage>>, { ok: false }>["error"];
type CompressionError = Extract<Awaited<ReturnType<typeof compressColorImage>>, { error: string }>["error"];

export type StagedPhoto = {
  id: number;
  name: string;
  stage: "imageCompressing" | "imageReady" | "imageUploading" | "imageDone" | ImageError | CompressionError;
  preview?: string;
  blob?: Blob;
  warning?: boolean;
  uploadFailed?: boolean;
};

export function StagedColorPhotos({ photos, disabled, canPick, onPick, onRemove, onRetry }: {
  photos: StagedPhoto[];
  disabled: boolean;
  canPick: boolean;
  onPick: (files: File[]) => void;
  onRemove: (id: number) => void;
  onRetry: (id: number) => void;
}) {
  const t = useTranslations("Admin");
  const hintId = useId();
  const picker = useRef<HTMLInputElement>(null);
  const camera = useRef<HTMLInputElement>(null);

  function selectFiles(event: ChangeEvent<HTMLInputElement>) {
    const files = Array.from(event.currentTarget.files ?? []);
    event.currentTarget.value = "";
    onPick(files);
  }

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap gap-2">
        <button type="button" className={colorPhotoButton} disabled={disabled || !canPick}
          aria-describedby={hintId} onClick={() => picker.current?.click()}><AddPhotoIcon size={18} />{t("choosePhotos")}</button>
        <input ref={picker} type="file" accept="image/jpeg,image/png,image/webp" multiple hidden
          disabled={disabled || !canPick} onChange={selectFiles} />
        <button type="button" className={colorPhotoButton} disabled={disabled || !canPick}
          aria-describedby={hintId} onClick={() => camera.current?.click()}><CameraIcon size={18} />{t("takePhoto")}</button>
        <input ref={camera} type="file" accept="image/*" capture="environment" hidden
          disabled={disabled || !canPick} onChange={selectFiles} />
      </div>
      <p id={hintId} className="text-sm text-on-surface-variant">{t("imageHint")}</p>
      {photos.length > 0 && (
        <ul className="grid gap-2 sm:grid-cols-2">
          {photos.map((photo) => (
            <li key={photo.id} className="flex items-start gap-3 rounded-m3-sm border border-outline-variant p-2">
              {photo.preview && <Image unoptimized src={photo.preview} alt={t("stagedPhotoAlt", { name: photo.name })}
                width={72} height={72} className="size-[72px] shrink-0 rounded-m3-xs bg-surface-container object-contain" />}
              <div className="min-w-0 space-y-1">
                <p role="status" aria-live="polite" className="wrap-anywhere text-sm">
                  {t("imageProgress", { name: photo.name, status: t(photo.stage) })}
                  {photo.warning && <span className="block text-tertiary">{t("imageBelowRecommended")}</span>}
                </p>
                <div className="flex flex-wrap gap-2">
                  {photo.uploadFailed && (
                    <button type="button" className={colorPhotoButton} disabled={disabled}
                      onClick={() => onRetry(photo.id)}><RefreshIcon size={18} />{t("retry")}</button>
                  )}
                  {photo.stage !== "imageDone" && (
                    <button type="button" className={ui.danger} disabled={disabled}
                      aria-label={t("removeStagedPhoto", { name: photo.name })}
                      onClick={() => onRemove(photo.id)}><CloseIcon size={18} />{t("imageRemove")}</button>
                  )}
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
