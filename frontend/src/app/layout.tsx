import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import Link from "next/link";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Mente Aberta",
  description: "Thinking Lab — ferramenta de pensamento crítico com IA",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="pt-BR"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-zinc-50 text-zinc-900">
        <header className="border-b border-zinc-200 bg-white">
          <div className="mx-auto flex max-w-5xl items-center justify-between px-6 py-4">
            <Link href="/" className="flex items-center gap-2 text-xl font-bold tracking-tight">
              <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-violet-600 text-sm text-white">
                MA
              </span>
              Mente Aberta
            </Link>
            <nav className="flex items-center gap-4 text-sm font-medium text-zinc-600">
              <Link href="/" className="hover:text-zinc-900">
                Pensamentos
              </Link>
              <Link href="/forums" className="hover:text-zinc-900">
                Fóruns
              </Link>
              <Link
                href="/thoughts/new"
                className="rounded-lg bg-violet-600 px-4 py-2 text-white hover:bg-violet-700"
              >
                Novo Pensamento
              </Link>
            </nav>
          </div>
        </header>
        <main className="flex-1">{children}</main>
      </body>
    </html>
  );
}
