"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { api, ThoughtListItem } from "@/lib/api";

const agentIcons: Record<string, string> = {
  socratic: "?" ,
  devil: "",
  bias: "",
};

export default function Dashboard() {
  const [thoughts, setThoughts] = useState<ThoughtListItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.listThoughts().then(setThoughts).catch(console.error).finally(() => setLoading(false));
  }, []);

  return (
    <div className="mx-auto max-w-5xl px-6 py-10">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Meus Pensamentos</h1>
          <p className="mt-1 text-zinc-500">
            Seus exercícios de pensamento crítico, analisados por IA.
          </p>
        </div>
        <Link
          href="/thoughts/new"
          className="rounded-lg bg-violet-600 px-5 py-2.5 text-sm font-medium text-white hover:bg-violet-700"
        >
          + Novo Pensamento
        </Link>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-violet-200 border-t-violet-600" />
        </div>
      ) : thoughts.length === 0 ? (
        <div className="rounded-xl border-2 border-dashed border-zinc-200 py-20 text-center">
          <div className="text-4xl"></div>
          <h2 className="mt-4 text-lg font-semibold">Nenhum pensamento ainda</h2>
          <p className="mt-1 text-sm text-zinc-500">
            Crie seu primeiro pensamento para começar a explorar suas ideias com a ajuda da IA.
          </p>
          <Link
            href="/thoughts/new"
            className="mt-6 inline-block rounded-lg bg-violet-600 px-5 py-2.5 text-sm font-medium text-white hover:bg-violet-700"
          >
            Criar Primeiro Pensamento
          </Link>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          {thoughts.map((thought) => (
            <Link
              key={thought.id}
              href={`/thoughts/${thought.id}`}
              className="group rounded-xl border border-zinc-200 bg-white p-5 transition-shadow hover:shadow-md"
            >
              <div className="flex items-start justify-between gap-2">
                <h3 className="font-semibold text-zinc-900 group-hover:text-violet-700">
                  {thought.title}
                </h3>
                <span
                  className={`shrink-0 rounded-full px-2.5 py-0.5 text-xs font-medium ${
                    thought.status === "completed"
                      ? "bg-emerald-50 text-emerald-700"
                      : "bg-amber-50 text-amber-700"
                  }`}
                >
                  {thought.status === "completed" ? "Analisado" : "Rascunho"}
                </span>
              </div>
              <p className="mt-2 line-clamp-2 text-sm text-zinc-500">{thought.claim}</p>
              <p className="mt-3 text-xs text-zinc-400">
                {new Date(thought.created_at).toLocaleDateString("pt-BR")}
              </p>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
