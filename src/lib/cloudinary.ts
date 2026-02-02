import { v2 as cloudinary } from "cloudinary";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export { cloudinary };

export interface UploadResult {
  public_id: string;
  secure_url: string;
  width: number;
  height: number;
  format: string;
  bytes: number;
}

export async function uploadImage(
  file: string | Buffer,
  options?: {
    folder?: string;
    publicId?: string;
    transformation?: object;
  }
): Promise<UploadResult> {
  const uploadOptions = {
    folder: options?.folder || "marketplace",
    public_id: options?.publicId,
    transformation: options?.transformation || {
      quality: "auto",
      fetch_format: "auto",
    },
    resource_type: "image" as const,
  };

  const result = await cloudinary.uploader.upload(
    typeof file === "string" ? file : `data:image/png;base64,${file.toString("base64")}`,
    uploadOptions
  );

  return {
    public_id: result.public_id,
    secure_url: result.secure_url,
    width: result.width,
    height: result.height,
    format: result.format,
    bytes: result.bytes,
  };
}

export async function deleteImage(publicId: string): Promise<void> {
  await cloudinary.uploader.destroy(publicId);
}

export async function deleteImages(publicIds: string[]): Promise<void> {
  await cloudinary.api.delete_resources(publicIds);
}

export function getOptimizedUrl(
  publicId: string,
  options?: {
    width?: number;
    height?: number;
    crop?: string;
    quality?: string | number;
    format?: string;
  }
): string {
  return cloudinary.url(publicId, {
    width: options?.width,
    height: options?.height,
    crop: options?.crop || "fill",
    quality: options?.quality || "auto",
    fetch_format: options?.format || "auto",
    secure: true,
  });
}

export function getResponsiveUrl(
  publicId: string,
  widths: number[] = [320, 640, 768, 1024, 1280]
): string[] {
  return widths.map((width) =>
    cloudinary.url(publicId, {
      width,
      crop: "scale",
      quality: "auto",
      fetch_format: "auto",
      secure: true,
    })
  );
}

export async function listImages(
  folder: string,
  options?: {
    maxResults?: number;
    nextCursor?: string;
  }
) {
  const result = await cloudinary.api.resources({
    type: "upload",
    prefix: folder,
    max_results: options?.maxResults || 50,
    next_cursor: options?.nextCursor,
  });

  return {
    images: result.resources,
    nextCursor: result.next_cursor,
  };
}
