"use client";

import { ui } from "@/components/ui/styles";
import { useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState, type FormEvent, type ReactNode } from "react";
import { moveColorImageFirst, removeColorImage, uploadColorImage } from "@/app/[locale]/admin/images-actions";
import type { saveColor } from "@/app/[locale]/admin/manage-actions";
import { ColorImages, colorPhotoButton, type SavedColorImage } from "./color-images";
import { StagedColorPhotos, type ImageError, type StagedPhoto } from "./staged-color-photos";

type SaveResult = Awaited<ReturnType<typeof saveColor>>;
type Feedback = Extract<SaveResult, { ok: false }>["error"] | ImageError | "catalogSaved" | "imageUpdated";

export function ColorEditor({ colorId, colorName, images, action, children, deleteControl }: {
  colorId?: string;
  colorName: string;
  images: SavedColorImage[];
  action: (form: FormData) => Promise<SaveResult>;
  children: ReactNode;
  deleteControl?: ReactNode;
}) {
  const t = useTranslations("Admin");
  const router = useRouter();
  const form = useRef<HTMLFormElement>(null);
  const running = useRef(false);
  const mounted = useRef(false);
  const previews = useRef(new Set<string>());
  const serial = useRef(0);
  const [busy, setBusy] = useState(false);
  const [createdId, setCreatedId] = useState<string>();
  const [feedback, setFeedback] = useState<Feedback>();
  const [photos, setPhotos] = useState<StagedPhoto[]>([]);
  const slots = Math.max(0, 10 - images.length - photos.filter(({ stage }) => stage !== "imageDone").length);

  useEffect(() => {
    mounted.current = true;
    const urls = previews.current;
    return () => {
      mounted.current = false;
      for (const url of urls) URL.revokeObjectURL(url);
      urls.clear();
    };
  }, []);

  function releasePreview(photo: StagedPhoto) {
    if (photo.preview && previews.current.delete(photo.preview)) URL.revokeObjectURL(photo.preview);
  }

  function patchPhoto(id: number, patch: Partial<StagedPhoto>) {
    setPhotos((current) => current.map((photo) => photo.id === id ? { ...photo, ...patch } : photo));
  }

  async function run(work: () => Promise<void>) {
    if (running.current) return;
    running.current = true;
    setBusy(true);
    setFeedback(undefined);
    try {
      await work();
    } finally {
      running.current = false;
      setBusy(false);
    }
  }

  function stageFiles(files: File[]) {
    if (!files.length || createdId) return;
    void run(async () => {
      if (files.length > slots) setFeedback("imageLimit");
      const selected = files.slice(0, slots);
      const entries = selected.map((file): StagedPhoto => ({
        id: ++serial.current, name: file.name, stage: "imageCompressing",
      }));
      setPhotos((current) => [...current.filter(({ stage }) => stage !== "imageDone"), ...entries]);

      let compress: typeof import("@/lib/admin/compress-image").compressColorImage;
      try {
        ({ compressColorImage: compress } = await import("@/lib/admin/compress-image"));
      } catch {
        for (const entry of entries) patchPhoto(entry.id, { stage: "imageInvalid" });
        return;
      }

      for (const [index, file] of selected.entries()) {
        const result = await compress(file);
        if (!mounted.current) break;
        const id = entries[index].id;
        if ("error" in result) {
          patchPhoto(id, { stage: result.error });
        } else {
          const preview = URL.createObjectURL(result.blob);
          previews.current.add(preview);
          patchPhoto(id, { blob: result.blob, preview, warning: result.belowRecommended, stage: "imageReady" });
        }
      }
    });
  }

  async function uploadPhotos(id: string, entries: StagedPhoto[]) {
    for (const photo of entries) {
      if (!photo.blob || !mounted.current) continue;
      patchPhoto(photo.id, { stage: "imageUploading", uploadFailed: false });
      const fields = new FormData();
      fields.set("image", photo.blob);
      try {
        const result = await uploadColorImage(id, fields);
        if (result.ok) {
          releasePreview(photo);
          patchPhoto(photo.id, { stage: "imageDone", blob: undefined, preview: undefined });
        } else {
          patchPhoto(photo.id, { stage: result.error, uploadFailed: true });
        }
      } catch {
        patchPhoto(photo.id, { stage: "imageUploadFailed", uploadFailed: true });
      }
    }
    router.refresh();
  }

  function save(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (createdId) return;
    const fields = new FormData(event.currentTarget);
    void run(async () => {
      let result: SaveResult;
      try {
        result = await action(fields);
      } catch {
        setFeedback("catalogSaveFailed");
        return;
      }
      if (!result.ok) {
        setFeedback(result.error);
        return;
      }
      // Keep the persisted ID before any upload can fail.
      if (!colorId) setCreatedId(result.colorId);
      setFeedback("catalogSaved");
      await uploadPhotos(result.colorId, photos.filter(({ stage }) => stage === "imageReady"));
    });
  }

  function retry(id: number) {
    const savedId = colorId ?? createdId;
    const photo = photos.find((entry) => entry.id === id && entry.uploadFailed);
    if (savedId && photo) void run(() => uploadPhotos(savedId, [photo]));
  }

  function removeStaged(id: number) {
    const photo = photos.find((entry) => entry.id === id);
    if (!photo) return;
    releasePreview(photo);
    setPhotos((current) => current.filter((entry) => entry.id !== id));
  }

  function updateImage(url: string, remove: boolean) {
    if (running.current || (remove && !window.confirm(t("confirmImageRemove")))) return;
    if (!colorId) return;
    void run(async () => {
      try {
        const result = await (remove ? removeColorImage(colorId, url) : moveColorImageFirst(colorId, url));
        setFeedback(result.ok ? "imageUpdated" : result.error);
        if (result.ok) router.refresh();
      } catch {
        setFeedback("imageUpdateFailed");
      }
    });
  }

  return (
    <div className="space-y-3">
      <form ref={form} onSubmit={save} aria-busy={busy} className="space-y-3">
        <section aria-label={t("colorImages")} className="space-y-3">
          <h3 className="font-semibold">{t("colorImages")}</h3>
          <StagedColorPhotos photos={photos} disabled={busy} canPick={slots > 0 && !createdId}
            onPick={stageFiles} onRemove={removeStaged} onRetry={retry} />
          <ColorImages colorName={colorName} images={images} disabled={busy} onUpdate={updateImage} />
        </section>
        <fieldset disabled={busy || !!createdId} className="min-w-0 space-y-3">
          {children}
          <button type="submit" className={ui.primary}>{t("saveCatalog")}</button>
        </fieldset>
        {createdId && !photos.some((photo) => photo.blob) && (
          <button type="button" disabled={busy} className={colorPhotoButton} onClick={() => {
            form.current?.reset();
            setCreatedId(undefined);
            setPhotos([]);
            setFeedback(undefined);
          }}>{t("addAnotherColor")}</button>
        )}
        <p role="status" aria-live="polite" className="text-sm">{feedback && t(feedback)}</p>
      </form>
      {deleteControl && <fieldset disabled={busy}>{deleteControl}</fieldset>}
    </div>
  );
}
