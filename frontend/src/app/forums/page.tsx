"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { api, Forum } from "@/lib/api";
import { useToast } from "@/components/Toast";

export default function ForumsPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [forums, setForums] = useState<Forum[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [form, setForm] = useState({ title: "", description: "", topic: "" });
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    try {
      setForums(await api.listForums());
      setError("");
    } catch (err) {
      console.error(err);
      setError("Não foi possível carregar os fóruns.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreating(true);
    try {
      await api.createForum(form);
      setShowCreate(false);
      setForm({ title: "", description: "", topic: "" });
      toast("Fórum criado com sucesso!", "success");
      await load();
    } catch (err) {
      console.error(err);
      toast("Erro ao criar fórum.", "error");
    } finally {
      setCreating(false);
    }
  };

  return (
    <div className="mx-auto max-w-5xl px-6 py-10">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Cérebro Coletivo</h1>
          <p className="mt-1 text-zinc-500">
            Fóruns de debate onde a IA sintetiza consensos e revela insights.
          </p>
        </div>
        <button
          onClick={() => setShowCreate(!showCreate)}
          className="rounded-lg bg-violet-600 px-5 py-2.5 text-sm font-medium text-white hover:bg-violet-700"
        >
          + Novo Fórum
        </button>
      </div>

      {showCreate && (
        <form onSubmit={handleCreate} className="mb-8 rounded-xl border border-zinc-200 bg-white p-6">
          <h2 className="mb-4 text-lg font-semibold">Criar novo fórum</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-zinc-700">Título *</label>
              <input required value={form.title} onChange={(e) => setForm({...form, title: e.target.value})}
                placeholder="Ex: Inteligência Artificial e Trabalho"
                className="mt-1 w-full rounded-lg border border-zinc-300 px-4 py-2.5 text-sm focus:border-violet-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-zinc-700">Pergunta central *</label>
              <input required value={form.topic} onChange={(e) => setForm({...form, topic: e.target.value})}
                placeholder="Ex: A IA vai substituir a maioria dos empregos formais até 2030?"
                className="mt-1 w-full rounded-lg border border-zinc-300 px-4 py-2.5 text-sm focus:border-violet-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-zinc-700">Descrição</label>
              <textarea value={form.description} onChange={(e) => setForm({...form, description: e.target.value})}
                rows={3} placeholder="Contexto e regras do debate..."
                className="mt-1 w-full rounded-lg border border-zinc-300 px-4 py-2.5 text-sm focus:border-violet-500 focus:outline-none"
              />
            </div>
            <div className="flex gap-2">
              <button type="submit" disabled={creating}
                className="rounded-lg bg-violet-600 px-5 py-2 text-sm font-medium text-white hover:bg-violet-700 disabled:opacity-50"
              >
                {creating ? "Criando..." : "Criar Fórum"}
              </button>
              <button type="button" onClick={() => setShowCreate(false)}
                className="rounded-lg border border-zinc-300 px-5 py-2 text-sm text-zinc-600 hover:bg-zinc-50"
              >
                Cancelar
              </button>
            </div>
          </div>
        </form>
      )}

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-violet-200 border-t-violet-600" />
        </div>
      ) : error ? (
        <div className="rounded-xl border-2 border-red-200 bg-red-50 py-16 text-center">
          <h2 className="text-lg font-semibold text-red-800">Erro ao carregar</h2>
          <p className="mt-1 text-sm text-red-600">{error}</p>
        </div>
      ) : forums.length === 0 ? (
        <div className="rounded-xl border-2 border-dashed border-zinc-200 py-20 text-center">
          <h2 className="text-lg font-semibold">Nenhum fórum ainda</h2>
          <p className="mt-1 text-sm text-zinc-500">
            Crie um fórum para começar um debate coletivo.
          </p>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          {forums.map((forum) => (
            <button
              key={forum.id}
              onClick={() => router.push(`/forums/${forum.id}`)}
              className="group rounded-xl border border-zinc-200 bg-white p-5 text-left transition-shadow hover:shadow-md"
            >
              <div className="flex items-start justify-between gap-2">
                <h3 className="font-semibold text-zinc-900 group-hover:text-violet-700">
                  {forum.title}
                </h3>
                <span className="shrink-0 rounded-full bg-violet-50 px-2.5 py-0.5 text-xs font-medium text-violet-700">
                  {forum.publication_count} {forum.publication_count === 1 ? "publicação" : "publicações"}
                </span>
              </div>
              <p className="mt-1 text-xs font-medium text-zinc-400">Tema: {forum.topic}</p>
              {forum.description && (
                <p className="mt-2 line-clamp-2 text-sm text-zinc-500">{forum.description}</p>
              )}
              <p className="mt-3 text-xs text-zinc-400">
                {new Date(forum.created_at).toLocaleDateString("pt-BR")}
              </p>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
