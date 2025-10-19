import { useEffect } from "react";

type ReviewSchemaItem = {
  id: string;
  quote: string;
  author: string;
  rating: number | null;
};

type SchemaInjectorProps = {
  items: ReviewSchemaItem[];
};

export default function SchemaInjector({ items }: SchemaInjectorProps) {
  useEffect(() => {
    if (typeof document === "undefined") return;
    const scriptId = "json-ld-reviews";
    const existing = document.getElementById(scriptId);
    if (existing) {
      existing.remove();
    }
    const script = document.createElement("script");
    script.type = "application/ld+json";
    script.id = scriptId;

    const reviewItems = items.slice(0, 10).map((item) => ({
      "@type": "Review",
      author: {
        "@type": "Person",
        name: item.author || "Verified member",
      },
      reviewBody: item.quote,
      reviewRating: {
        "@type": "Rating",
        ratingValue: item.rating ?? 10,
        bestRating: "10",
        worstRating: "0",
      },
      itemReviewed: {
        "@type": "Product",
        name: "Player’s Budget – Sponsors Tool",
      },
    }));

    script.text = JSON.stringify({
      "@context": "https://schema.org",
      "@type": "ItemList",
      itemListElement: reviewItems,
    });
    document.head.appendChild(script);
  }, [items]);

  return null;
}
