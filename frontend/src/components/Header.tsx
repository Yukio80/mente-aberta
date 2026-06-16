"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";

export function Header() {
  const pathname = usePathname();
  const router = useRouter();
  const { user, loading, logout } = useAuth();

  if (loading) {
    return (
      <header className="border-b border-zinc-200 bg-white">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-6 py-4">
          <div className="flex items-center gap-2 text-xl font-bold tracking-tight">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-violet-600 text-sm text-white">MA</span>
            Mente Aberta
          </div>
        </div>
      </header>
    );
  }

  const isAuthPage = pathname.startsWith("/auth");

  return (
    <header className="border-b border-zinc-200 bg-white">
      <div className="mx-auto flex max-w-5xl items-center justify-between px-6 py-4">
        <Link href={user ? "/" : "/auth/login"} className="flex items-center gap-2 text-xl font-bold tracking-tight">
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-violet-600 text-sm text-white">
            MA
          </span>
          Mente Aberta
        </Link>

        {user && !isAuthPage ? (
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
            <span className="text-xs text-zinc-400">{user.email}</span>
            <button
              onClick={() => { logout(); router.push("/auth/login"); }}
              className="text-xs text-zinc-500 hover:text-red-600"
            >
              Sair
            </button>
          </nav>
        ) : !user ? (
          <nav className="flex items-center gap-3 text-sm font-medium">
            <Link href="/auth/login" className="text-zinc-600 hover:text-zinc-900">
              Entrar
            </Link>
            <Link
              href="/auth/register"
              className="rounded-lg bg-violet-600 px-4 py-2 text-white hover:bg-violet-700"
            >
              Cadastre-se
            </Link>
          </nav>
        ) : null}
      </div>
    </header>
  );
}
