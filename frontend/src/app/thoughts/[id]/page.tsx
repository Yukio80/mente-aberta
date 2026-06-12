"use client";

import { use, useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { api, Argument, Forum, Thought } from "@/lib/api";

const agentMeta: Record<string, { name: string; icon: string; color: string }> = {
  socratic: { name: "Agente Socrático", icon: "?", color: "border-l-blue-500 bg-blue-50" },
  devil: { name: "Advogado do Diabo", icon: "", color: "border-l-red-500 bg-red-50" },
  bias: { name: "Detector de Vieses", icon: "", color: "border-l-amber-500 bg-amber-50" },
};

function AgentPanel({ type, content }: { type: string; content: string }) {
  const meta = agentMeta[type] || { name: type, icon: "", color: "border-l-zinc-500 bg-zinc-50" };

  if (!content) {
    return (
      <div className={`rounded-lg border-l-4 p-4 ${meta.color}`}>
        <h3 className="font-semibold">
          {meta.icon} {meta.name}
        </h3>
        <p className="mt-1 text-sm text-zinc-500">Análise não disponível.</p>
      </div>
    );
  }

  const lines = content.split("\n").filter(Boolean);

  return (
    <div className={`rounded-lg border-l-4 p-4 ${meta.color}`}>
      <h3 className="font-semibold">
        {meta.icon} {meta.name}
      </h3>
      <div className="mt-3 space-y-2 text-sm leading-relaxed text-zinc-700">
        {lines.map((line, i) => (
          <p key={i}>{line}</p>
        ))}
      </div>
    </div>
  );
}

function ArgumentList({
  args,
  thoughtId,
  onAdded,
}: {
  args: Argument[];
  thoughtId: string;
  onAdded: () => void;
}) {
  const [showForm, setShowForm] = useState(false);
  const [argType, setArgType] = useState<"pro" | "con">("pro");
  const [argContent, setArgContent] = useState("");
  const [adding, setAdding] = useState(false);

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    setAdding(true);
    try {
      await api.addArgument(thoughtId, { type: argType, content: argContent });
      setArgContent("");
      setShowForm(false);
      onAdded();
    } catch (err) {
      console.error(err);
    } finally {
      setAdding(false);
    }
  };

  const pros = args.filter((a) => a.type === "pro");
  const cons = args.filter((a) => a.type === "con");

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold text-zinc-800">Argumentos ({args.length})</h3>
        <button
          onClick={() => setShowForm(!showForm)}
          className="text-sm font-medium text-violet-600 hover:text-violet-700"
        >
          {showForm ? "Cancelar" : "+ Adicionar"}
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleAdd} className="rounded-lg border border-zinc-200 bg-white p-4">
          <div className="flex gap-2 mb-3">
            <button
              type="button"
              onClick={() => setArgType("pro")}
              className={`rounded-full px-3 py-1 text-xs font-medium ${
                argType === "pro"
                  ? "bg-emerald-100 text-emerald-800"
                  : "bg-zinc-100 text-zinc-500"
              }`}
            >
              A Favor
            </button>
            <button
              type="button"
              onClick={() => setArgType("con")}
              className={`rounded-full px-3 py-1 text-xs font-medium ${
                argType === "con"
                  ? "bg-red-100 text-red-800"
                  : "bg-zinc-100 text-zinc-500"
              }`}
            >
              Contra
            </button>
          </div>
          <textarea
            value={argContent}
            onChange={(e) => setArgContent(e.target.value)}
            rows={3}
            placeholder="Seu argumento..."
            className="w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm focus:border-violet-500 focus:outline-none focus:ring-2 focus:ring-violet-200"
          />
          <button
            type="submit"
            disabled={adding || !argContent.trim()}
            className="mt-2 rounded-lg bg-violet-600 px-4 py-1.5 text-sm text-white hover:bg-violet-700 disabled:opacity-50"
          >
            {adding ? "Adicionando..." : "Adicionar"}
          </button>
        </form>
      )}

      <div className="grid gap-3 sm:grid-cols-2">
        <div className="space-y-2">
          <h4 className="text-xs font-semibold uppercase text-emerald-700">A Favor</h4>
          {pros.length === 0 && (
            <p className="text-sm text-zinc-400">Nenhum ainda</p>
          )}
          {pros.map((a) => (
            <div key={a.id} className="rounded-lg border border-emerald-100 bg-emerald-50 p-3">
              <p className="text-sm text-zinc-700">{a.content}</p>
              {a.score > 0 && (
                <span className="mt-1 inline-block text-xs text-emerald-600">
                  Força: {a.score.toFixed(1)}
                </span>
              )}
            </div>
          ))}
        </div>
        <div className="space-y-2">
          <h4 className="text-xs font-semibold uppercase text-red-700">Contra</h4>
          {cons.length === 0 && (
            <p className="text-sm text-zinc-400">Nenhum ainda</p>
          )}
          {cons.map((a) => (
            <div key={a.id} className="rounded-lg border border-red-100 bg-red-50 p-3">
              <p className="text-sm text-zinc-700">{a.content}</p>
              {a.score > 0 && (
                <span className="mt-1 inline-block text-xs text-red-600">
                  Força: {a.score.toFixed(1)}
                </span>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default function ThoughtPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const [thought, setThought] = useState<Thought | null>(null);
  const [loading, setLoading] = useState(true);
  const [analyzing, setAnalyzing] = useState(false);
  const [publishForums, setPublishForums] = useState<Forum[]>([]);
  const [showPublishModal, setShowPublishModal] = useState(false);
  const [selectedForumId, setSelectedForumId] = useState("");
  const [publishing, setPublishing] = useState(false);

  const loadThought = useCallback(async () => {
    try {
      const data = await api.getThought(id);
      setThought(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    loadThought();
  }, [loadThought]);

  const handleAnalyze = async () => {
    setAnalyzing(true);
    try {
      await api.analyzeThought(id);
      await loadThought();
    } catch (err) {
      console.error(err);
      alert("Erro ao analisar. Verifique a chave da API.");
    } finally {
      setAnalyzing(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm("Tem certeza?")) return;
    try {
      await api.deleteThought(id);
      router.push("/");
    } catch (err) {
      console.error(err);
    }
  };

  const handleOpenPublish = async () => {
    try {
      const forums = await api.listForums();
      setPublishForums(forums);
      setSelectedForumId("");
      setShowPublishModal(true);
    } catch (err) {
      console.error(err);
    }
  };

  const handlePublishForum = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedForumId) return;
    setPublishing(true);
    try {
      await api.publishThought(id, selectedForumId);
      setShowPublishModal(false);
    } catch (err) {
      console.error(err);
      alert("Erro ao publicar.");
    } finally {
      setPublishing(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-violet-200 border-t-violet-600" />
      </div>
    );
  }

  if (!thought) {
    return (
      <div className="mx-auto max-w-3xl px-6 py-20 text-center">
        <h2 className="text-xl font-semibold">Pensamento não encontrado</h2>
        <button onClick={() => router.push("/")} className="mt-4 text-violet-600 hover:underline">
          Voltar ao início
        </button>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl px-6 py-10">
      <div className="mb-6 flex items-start justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">{thought.title}</h1>
          <p className="mt-1 text-sm text-zinc-400">
            Criado em {new Date(thought.created_at).toLocaleString("pt-BR")}
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={handleAnalyze}
            disabled={analyzing}
            className="rounded-lg bg-violet-600 px-4 py-2 text-sm font-medium text-white hover:bg-violet-700 disabled:opacity-50"
          >
            {analyzing ? "Analisando..." : "Analisar com IA"}
          </button>
          <button
            onClick={handleDelete}
            className="rounded-lg border border-red-200 px-4 py-2 text-sm font-medium text-red-600 hover:bg-red-50"
          >
            Excluir
          </button>
          <button
            onClick={handleOpenPublish}
            className="rounded-lg border border-violet-200 px-4 py-2 text-sm font-medium text-violet-600 hover:bg-violet-50"
          >
            Publicar no Fórum
          </button>
        </div>
      </div>

      {showPublishModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30">
          <div className="w-full max-w-md rounded-xl bg-white p-6 shadow-xl">
            <h3 className="text-lg font-semibold">Publicar no Fórum</h3>
            <form onSubmit={handlePublishForum} className="mt-4 space-y-4">
              <div>
                <label className="block text-sm font-medium text-zinc-700">
                  Selecione um fórum
                </label>
                <select
                  value={selectedForumId}
                  onChange={(e) => setSelectedForumId(e.target.value)}
                  className="mt-1 w-full rounded-lg border border-zinc-300 px-4 py-2.5 text-sm focus:border-violet-500 focus:outline-none"
                >
                  <option value="">-- Selecione --</option>
                  {publishForums.map((f) => (
                    <option key={f.id} value={f.id}>
                      {f.title}
                    </option>
                  ))}
                </select>
              </div>
              <div className="flex gap-2">
                <button
                  type="submit"
                  disabled={publishing || !selectedForumId}
                  className="rounded-lg bg-violet-600 px-5 py-2 text-sm font-medium text-white hover:bg-violet-700 disabled:opacity-50"
                >
                  {publishing ? "Publicando..." : "Publicar"}
                </button>
                <button
                  type="button"
                  onClick={() => setShowPublishModal(false)}
                  className="rounded-lg border border-zinc-300 px-5 py-2 text-sm text-zinc-600 hover:bg-zinc-50"
                >
                  Cancelar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="space-y-6">
        <section className="rounded-xl border border-zinc-200 bg-white p-6">
          <h2 className="text-xs font-semibold uppercase tracking-wider text-zinc-400">Tese</h2>
          <p className="mt-2 text-lg leading-relaxed">{thought.claim}</p>
        </section>

        {thought.evidence && (
          <section className="rounded-xl border border-zinc-200 bg-white p-6">
            <h2 className="text-xs font-semibold uppercase tracking-wider text-zinc-400">
              Evidências
            </h2>
            <p className="mt-2 whitespace-pre-wrap text-sm leading-relaxed text-zinc-700">
              {thought.evidence}
            </p>
          </section>
        )}

        {thought.reasoning && (
          <section className="rounded-xl border border-zinc-200 bg-white p-6">
            <h2 className="text-xs font-semibold uppercase tracking-wider text-zinc-400">
              Raciocínio
            </h2>
            <p className="mt-2 whitespace-pre-wrap text-sm leading-relaxed text-zinc-700">
              {thought.reasoning}
            </p>
          </section>
        )}

        {thought.conclusion && (
          <section className="rounded-xl border border-zinc-200 bg-white p-6">
            <h2 className="text-xs font-semibold uppercase tracking-wider text-zinc-400">
              Conclusão
            </h2>
            <p className="mt-2 whitespace-pre-wrap text-sm leading-relaxed text-zinc-700">
              {thought.conclusion}
            </p>
          </section>
        )}

        {thought.analyses.length > 0 && (
          <section className="space-y-4">
            <h2 className="text-lg font-semibold">Análises dos Agentes</h2>
            {thought.analyses.map((a) => (
              <AgentPanel key={a.id} type={a.agent_type} content={a.content} />
            ))}
          </section>
        )}

        <section className="rounded-xl border border-zinc-200 bg-white p-6">
          <ArgumentList
            args={thought.arguments}
            thoughtId={thought.id}
            onAdded={loadThought}
          />
        </section>
      </div>
    </div>
  );
}
