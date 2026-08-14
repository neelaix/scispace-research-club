import type { ReactNode } from "react";
import { Navbar } from "./Navbar";
import { ScrollProgress } from "./ScrollProgress";
import { Footer } from "./Footer";

export function Layout({ children }: { children: ReactNode }) {
  return (
    <>
      <Navbar />
      <ScrollProgress />
      <main className="min-h-[70vh]">{children}</main>
      <Footer />
    </>
  );
}