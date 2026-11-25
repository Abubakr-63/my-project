"use server";

import { adminCatalogContext, revalidateCatalog } from "@/lib/admin/catalog-mutations";
import { colorImagePath } from "@/lib/admin/validation";
import { isCartId } from "@/lib/cart";

type ErrorKey = "imageInvalid" | "imageTooLarge" | "imageLimit" | "imageNotFound" | "imageUploadFailed" | "imageUpdateFailed";
type Result = { ok: true } | { ok: false; error: ErrorKey };
type AdminClient = Awaited<ReturnType<typeof adminCatalogContext>>["supabase"];
const bucketName = "product-images";
const maxUploadBytes = 400 * 1024;

function failure(error: ErrorKey): Result {
  return { ok: false, error };
}

async function detectImage(file: Blob) {
  const bytes = new Uint8Array(await file.slice(0, 12).arrayBuffer());
  if (bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff) {
    return { extension: "jpg", contentType: "image/jpeg" };
  }
  if (bytes.length === 12 &&
    String.fromCharCode(...bytes.slice(0, 4)) === "RIFF" &&
    String.fromCharCode(...bytes.slice(8, 12)) === "WEBP") {
    return { extension: "webp", contentType: "image/webp" };
  }
  return null;
}

function loadColor(supabase: AdminClient, id: string) {
  return supabase.from("product_colors").select("id,product_id,image_urls").eq("id", id).maybeSingle();
}

async function replaceImages(supabase: AdminClient, id: string, previous: string[], next: string[]) {
  // Match the prior array so concurrent changes cannot overwrite each other.
  const literal = `{${previous.map((url) => `"${url.replace(/["\\]/g, "\\$&")}"`).join(",")}}`;
  const { data, error } = await supabase.from("product_colors").update({ image_urls: next })
    .eq("id", id).filter("image_urls", "eq", literal).select("id").single();
  return !error && data?.id === id;
}

export async function uploadColorImage(colorId: string, form: FormData): Promise<Result> {
  const { supabase } = await adminCatalogContext();
  if (!isCartId(colorId)) return failure("imageNotFound");
  const file = form instanceof FormData ? form.get("image") : null;
  if (!(file instanceof Blob) || file.size === 0) return failure("imageInvalid");
  if (file.size > maxUploadBytes) return failure("imageTooLarge");

  const bucket = supabase.storage.from(bucketName);
  let uploadedPath: string | undefined;

  try {
    const type = await detectImage(file);
    if (!type) return failure("imageInvalid");
    const { data: color, error } = await loadColor(supabase, colorId);
    if (error) return failure("imageUploadFailed");
    if (!color) return failure("imageNotFound");
    if (color.image_urls.length >= 10) return failure("imageLimit");

    const path = `products/${color.product_id}/${color.id}/${crypto.randomUUID()}.${type.extension}`;
    const uploaded = await bucket.upload(path, file, {
      upsert: false, contentType: type.contentType, cacheControl: "31536000",
    });
    if (uploaded.error) return failure("imageUploadFailed");
    uploadedPath = path;
    const { data: { publicUrl } } = bucket.getPublicUrl(path);
    if (publicUrl.length > 500 || colorImagePath(publicUrl, process.env.NEXT_PUBLIC_SUPABASE_URL) !== path) {
      return failure("imageUploadFailed");
    }
    if (!await replaceImages(supabase, color.id, color.image_urls, [...color.image_urls, publicUrl])) {
      return failure("imageUploadFailed");
    }
    uploadedPath = undefined;
  } catch {
    return failure("imageUploadFailed");
  } finally {
    if (uploadedPath) await bucket.remove([uploadedPath]).catch(() => {});
  }

  revalidateCatalog();
  return { ok: true };
}

async function changeColorImages(colorId: string, url: string, operation: "remove" | "first"): Promise<Result> {
  const { supabase } = await adminCatalogContext();
  if (!isCartId(colorId) || typeof url !== "string") return failure("imageNotFound");

  try {
    const { data: color, error } = await loadColor(supabase, colorId);
    if (error) return failure("imageUpdateFailed");
    if (!color || !color.image_urls.includes(url)) return failure("imageNotFound");

    const index = color.image_urls.indexOf(url);
    const next = operation === "first"
      ? [url, ...color.image_urls.slice(0, index), ...color.image_urls.slice(index + 1)]
      : color.image_urls.filter((image) => image !== url);
    if (!await replaceImages(supabase, color.id, color.image_urls, next)) return failure("imageUpdateFailed");
    if (operation === "remove") {
      const path = colorImagePath(url, process.env.NEXT_PUBLIC_SUPABASE_URL);
      if (path) {
        // Manually entered URLs can be shared by more than one color.
        try {
          const references = await supabase.from("product_colors").select("id").contains("image_urls", [url]).limit(1);
          if (!references.error && !references.data.length) await supabase.storage.from(bucketName).remove([path]);
        } catch {
          // The database change has already succeeded.
        }
      }
    }
  } catch {
    return failure("imageUpdateFailed");
  }

  revalidateCatalog();
  return { ok: true };
}

export async function removeColorImage(colorId: string, url: string): Promise<Result> {
  return changeColorImages(colorId, url, "remove");
}

export async function moveColorImageFirst(colorId: string, url: string): Promise<Result> {
  return changeColorImages(colorId, url, "first");
}
