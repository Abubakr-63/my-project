"use client";

import Image from "next/image";
import { useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import { useId, useRef, useState, type FormEvent, type ReactNode } from "react";
import { moveColorImageFirst, removeColorImage, uploadColorImage } from "@/app/[locale]/admin/images-actions";
import { compressColorImage } from "@/lib/admin/compress-image";

type UploadResult = Awaited<ReturnType<typeof uploadColorImage>>;
type ImageError = Extract<UploadResult, { ok: false }>["error"];
type CompressionError = Extract<Awaited<ReturnType<typeof compressColorImage>>, { error: string }>["error"];
type Progress = {
  name: string;
  stage: "imageWaiting" | "imageCompressing" | "imageUploading" | "imageDone" | ImageError | CompressionError;
};

const button = "inline-flex min-h-11 items-center rounded-md border border-stone-300 bg-white px-3 text-sm hover:bg-stone-100 focus-visible:outline-2 focus-visible:outline-offset-2 disabled:opacity-50";

export function ColorImages({ colorId, colorName, images, children }: {
  colorId: string;
  colorName: string;
  images: { url: string; preview: string | null }[];
  children: ReactNode;
}) {
  const t = useTranslations("Admin");
  const router = useRouter();
  const hintId = useId();
  const running = useRef(false);
  const [files, setFiles] = useState<File[]>([]);
  const [progress, setProgress] = useState<Progress[]>([]);
  const [busy, setBusy] = useState(false);
  const [imageFeedback, setImageFeedback] = useState<ImageError | "imageUpdated" | null>(null);

  function setStage(index: number, stage: Progress["stage"]) {
    setProgress((current) => current.map((item, itemIndex) => itemIndex === index ? { ...item, stage } : item));
  }

  async function upload(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (running.current || !files.length) return;
    running.current = true;
    setBusy(true);
    setImageFeedback(null);
    const uploadForm = event.currentTarget;
    setProgress(files.map((file) => ({ name: file.name, stage: "imageWaiting" })));
    let changed = false;

    try {
      for (const [index, file] of files.entries()) {
        setStage(index, "imageCompressing");
        const result = await compressColorImage(file);
        if ("error" in result) {
          setStage(index, result.error);
          continue;
        }

        setStage(index, "imageUploading");
        const fields = new FormData();
        fields.set("image", result.blob);
        try {
          const response = await uploadColorImage(colorId, fields);
          if (response.ok) changed = true;
          setStage(index, response.ok ? "imageDone" : response.error);
        } catch {
          setStage(index, "imageUploadFailed");
        }
      }
    } finally {
      uploadForm.reset();
      setFiles([]);
      running.current = false;
      setBusy(false);
      if (changed) router.refresh();
    }
  }

  async function update(url: string, remove: boolean) {
    if (running.current || (remove && !window.confirm(t("confirmImageRemove")))) return;
    running.current = true;
    setBusy(true);
    setImageFeedback(null);
    try {
      const result = await (remove ? removeColorImage(colorId, url) : moveColorImageFirst(colorId, url));
      setImageFeedback(result.ok ? "imageUpdated" : result.error);
      if (result.ok) router.refresh();
    } catch {
      setImageFeedback("imageUpdateFailed");
    } finally {
      running.current = false;
      setBusy(false);
    }
  }

  return (
    <>
      <fieldset disabled={busy} className="min-w-0 space-y-3">{children}</fieldset>
      <section className="space-y-3 border-t border-stone-200 pt-3" aria-label={t("colorImages")}>
        {images.length > 0 && (
          <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {images.map(({ url, preview }, index) => (
              <li key={`${index}:${url}`} className="space-y-2 rounded-md border border-stone-200 p-2">
                {preview ? (
                  <div className="relative aspect-[4/3] overflow-hidden rounded bg-stone-100">
                    <Image src={preview} alt={t("colorImageAlt", { color: colorName, number: index + 1 })}
                      fill sizes="(min-width: 1024px) 32vw, (min-width: 640px) 48vw, 90vw" className="object-contain" />
                  </div>
                ) : <p className="text-sm">{t("imagePreviewUnavailable", { number: index + 1 })}</p>}
                <div className="flex flex-wrap gap-2">
                  {index > 0 && <button className={button} type="button" disabled={busy}
                    onClick={() => void update(url, false)}>{t("imageMakeFirst")}</button>}
                  <button className={button} type="button" disabled={busy}
                    aria-label={t("imageRemoveNumber", { number: index + 1 })}
                    onClick={() => void update(url, true)}>{t("imageRemove")}</button>
                </div>
              </li>
            ))}
          </ul>
        )}
        <p role="status" aria-live="polite" className="text-sm">{imageFeedback && t(imageFeedback)}</p>
        <form onSubmit={upload} aria-busy={busy} className="space-y-2">
          <label className="block text-sm font-medium">{t("imageChoose")}
            <input type="file" accept="image/jpeg,image/png,image/webp" multiple disabled={busy}
              aria-describedby={hintId} onChange={(event) => setFiles(Array.from(event.currentTarget.files ?? []))}
              className="mt-1 block min-h-11 w-full rounded text-sm file:mr-3 file:min-h-11 file:rounded-md file:border file:border-stone-300 file:bg-white file:px-3 focus-visible:outline-2" />
          </label>
          <p id={hintId} className="text-sm text-stone-600">{t("imageHint")}</p>
          <button type="submit" disabled={busy || !files.length} className={button}>{t("imageUpload")}</button>
        </form>
        {progress.length > 0 && (
          <ul className="space-y-1 text-sm">
            {progress.map(({ name, stage }, index) => (
              <li key={index} role="status" aria-live="polite" className="wrap-anywhere">{t("imageProgress", { name, status: t(stage) })}</li>
            ))}
          </ul>
        )}
      </section>
    </>
  );
}
