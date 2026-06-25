"use client";

import type { Article } from "@/types/domain";
import { SlideOver } from "@/components/ui/slide-over";
import { ProductDetail } from "./product-detail";

/** Convenience wrapper: product detail rendered inside the right slide-over. */
export function ProductDetailSlideOver({
  article,
  store,
  onClose,
}: {
  article: Article | null;
  store: string;
  onClose: () => void;
}) {
  return (
    <SlideOver open={!!article} onClose={onClose}>
      {article && <ProductDetail article={article} store={store} />}
    </SlideOver>
  );
}
