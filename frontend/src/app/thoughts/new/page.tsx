"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api";

export default function NewThoughtPage() {
  const router = useRouter();
  const [form, setForm] = useState({
    title: "",
    claim: "",
    evidence: "",
    reasoning: "",
    conclusion: "",
  });
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const thought = await api.createThought(form);
      await api.analyzeThought(thought.id);
      router.push(`/thoughts/${thought.id}`);
    } catch (err) {
      console.error(err);
      alert("Erro ao criar pensamento. Verifique se o backend está rodando.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="mx-auto max-w-3xl px-6 py-10">
      <h1 className="text-3xl font-bold tracking-tight">Novo Pensamento</h1>
      <p className="mt-1 text-zinc-500">
        Estruture seu raciocínio. Quanto mais completo, melhores as análises.
      </p>

      <form onSubmit={handleSubmit} className="mt-8 space-y-6">
        <div>
          <label className="block text-sm font-medium text-zinc-700">Título *</label>
          <input
            required
            value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
            placeholder="Ex: A renda básica universal é viável no Brasil?"
            className="mt-1 w-full rounded-lg border border-zinc-300 px-4 py-2.5 text-sm focus:border-violet-500 focus:outline-none focus:ring-2 focus:ring-violet-200"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-zinc-700">Tese / Afirmação *</label>
          <textarea
            required
            value={form.claim}
            onChange={(e) => setForm({ ...form, claim: e.target.value })}
            rows={3}
            placeholder="Qual é a sua tese central? Seja claro e direto."
            className="mt-1 w-full rounded-lg border border-zinc-300 px-4 py-2.5 text-sm focus:border-violet-500 focus:outline-none focus:ring-2 focus:ring-violet-200"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-zinc-700">Evidências</label>
          <textarea
            value={form.evidence}
            onChange={(e) => setForm({ ...form, evidence: e.target.value })}
            rows={4}
            placeholder="Dados, fatos, fontes que sustentam sua tese..."
            className="mt-1 w-full rounded-lg border border-zinc-300 px-4 py-2.5 text-sm focus:border-violet-500 focus:outline-none focus:ring-2 focus:ring-violet-200"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-zinc-700">Raciocínio</label>
          <textarea
            value={form.reasoning}
            onChange={(e) => setForm({ ...form, reasoning: e.target.value })}
            rows={4}
            placeholder="Explique o raciocínio que liga suas evidências à conclusão..."
            className="mt-1 w-full rounded-lg border border-zinc-300 px-4 py-2.5 text-sm focus:border-violet-500 focus:outline-none focus:ring-2 focus:ring-violet-200"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-zinc-700">Conclusão</label>
          <textarea
            value={form.conclusion}
            onChange={(e) => setForm({ ...form, conclusion: e.target.value })}
            rows={3}
            placeholder="Qual é sua conclusão provisória?"
            className="mt-1 w-full rounded-lg border border-zinc-300 px-4 py-2.5 text-sm focus:border-violet-500 focus:outline-none focus:ring-2 focus:ring-violet-200"
          />
        </div>

        <div className="flex items-center gap-3">
          <button
            type="submit"
            disabled={saving}
            className="rounded-lg bg-violet-600 px-6 py-2.5 text-sm font-medium text-white hover:bg-violet-700 disabled:opacity-50"
          >
            {saving ? "Salvando..." : "Criar e Analisar"}
          </button>
          <button
            type="button"
            onClick={() => router.push("/")}
            className="rounded-lg border border-zinc-300 px-6 py-2.5 text-sm font-medium text-zinc-600 hover:bg-zinc-50"
          >
            Cancelar
          </button>
        </div>
      </form>
    </div>
  );
}
