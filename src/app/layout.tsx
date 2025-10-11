import type { ReactNode } from "react";
import "@/styles/globals.css";
import { Toaster } from "@/components/ui/toaster";

export const metadata = {
  title: "The Fifth Slam",
  description: "Season-first tennis finance",
} as const;

function Providers() {
  "use client";
  return (
    <>
      <Toaster />
    </>
  );
}

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body className="bg-background text-foreground">
        {children}
        <Providers />
      </body>
    </html>
  );
}
