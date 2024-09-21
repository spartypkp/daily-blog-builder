import "./globals.css";
import type { Metadata } from "next";
export const metadata: Metadata = {
	title: "Daily Blog Builder",
	description:
		"Local tool for writing daily progress blogs with an AI editor.",
};
export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
