import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "../styles/globals.css";
import { Providers } from "./providers";
const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "SNEC",
  description: "Project & Task Management Dashboard",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.className} bg-surface dark:bg-slate-900 text-slate-900 dark:text-slate-100`}>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
