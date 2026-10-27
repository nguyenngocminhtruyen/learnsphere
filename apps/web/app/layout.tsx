import type { ReactNode } from "react";
import type { Metadata } from "next";
import { DemoProvider } from "../lib/demo-context";
import { SiteShell } from "../components/site-shell";
import "./globals.css";
export const metadata: Metadata = {
  title: {
    default: "LearnSphere — A little curiosity. A world of possibility.",
    template: "%s | LearnSphere",
  },
  description:
    "Discover a thoughtful way to build your skills in technology, cloud, and AI. An interactive learning platform demo.",
};
export default function Layout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body>
        <DemoProvider>
          <SiteShell>{children}</SiteShell>
        </DemoProvider>
      </body>
    </html>
  );
}
