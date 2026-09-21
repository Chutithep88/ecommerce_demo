"use client";

import { useRef, useState, useTransition } from "react";
import {
  deleteProductImage,
  moveProductImage,
  uploadProductImage,
} from "@/actions/admin/products";

type ProductImage = {
  id: string;
  url: string;
  alt: string | null;
  position: number;
};

export default function ProductImageManager({
  productId,
  images,
}: {
  productId: string;
  images: ProductImage[];
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState("");

  function upload() {
    const file = inputRef.current?.files?.[0];

    if (!file) {
      setError("Please select an image.");
      return;
    }

    setError("");

    const formData = new FormData();
    formData.append("file", file);

    startTransition(async () => {
      try {
        await uploadProductImage(productId, formData);

        if (inputRef.current) {
          inputRef.current.value = "";
        }
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Upload failed."
        );
      }
    });
  }

  function remove(imageId: string) {
    if (!confirm("Delete this image?")) return;

    startTransition(async () => {
      try {
        await deleteProductImage(imageId);
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Delete failed."
        );
      }
    });
  }

  function move(
    imageId: string,
    direction: "up" | "down"
  ) {
    startTransition(async () => {
      try {
        await moveProductImage(imageId, direction);
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Could not move image."
        );
      }
    });
  }

  return (
    <div className="space-y-5">
      <div>
        <label className="mb-2 block text-sm font-medium">
          Product images
        </label>

        <div className="flex gap-3">
          <input
            ref={inputRef}
            type="file"
            accept="image/*"
            disabled={pending}
            className="block w-full rounded-xl border border-gray-300 bg-white px-3 py-2 text-sm"
          />

          <button
            type="button"
            onClick={upload}
            disabled={pending}
            className="rounded-xl bg-black px-5 py-2 text-sm font-semibold text-white disabled:opacity-50"
          >
            {pending ? "Uploading..." : "Upload"}
          </button>
        </div>

        <p className="mt-2 text-xs text-gray-500">
          JPG, PNG, WEBP — maximum 5MB.
        </p>

        {error && (
          <p className="mt-2 text-sm text-red-600">
            {error}
          </p>
        )}
      </div>

      {images.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-gray-300 p-10 text-center text-sm text-gray-500">
          No images yet.
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
          {images
            .sort((a, b) => a.position - b.position)
            .map((image, index) => (
              <div
                key={image.id}
                className="overflow-hidden rounded-2xl border bg-white"
              >
                <div className="relative aspect-square bg-gray-100">
                  <img
                    src={image.url}
                    alt={image.alt || "Product image"}
                    className="h-full w-full object-cover"
                  />

                  {index === 0 && (
                    <span className="absolute left-2 top-2 rounded-full bg-black px-2.5 py-1 text-xs font-semibold text-white">
                      Main
                    </span>
                  )}
                </div>

                <div className="space-y-2 p-3">
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => move(image.id, "up")}
                      disabled={pending || index === 0}
                      className="flex-1 rounded-lg border px-2 py-1.5 text-xs disabled:opacity-30"
                    >
                      ←
                    </button>

                    <button
                      type="button"
                      onClick={() => move(image.id, "down")}
                      disabled={
                        pending || index === images.length - 1
                      }
                      className="flex-1 rounded-lg border px-2 py-1.5 text-xs disabled:opacity-30"
                    >
                      →
                    </button>
                  </div>

                  <button
                    type="button"
                    onClick={() => remove(image.id)}
                    disabled={pending}
                    className="w-full rounded-lg border border-red-200 px-3 py-1.5 text-xs font-medium text-red-600 hover:bg-red-50 disabled:opacity-50"
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
        </div>
      )}
    </div>
  );
}