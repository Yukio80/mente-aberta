"use client";

import { use, useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { api, Forum, Publication, Synthesis } from "@/lib/api";

function PublicationCard({ pub }: { pub: Publication }) {
  const router = useRouter();
  return (
    <button
      onClick={() => router.push(`/thoughts/${pub.thought_id}`)}
      className="group w-full rounded-lg border border-zinc-200 bg-white p-4 text-left transition-shadow hover:shadow-sm"
    >
      <h4 className="font-medium text-zinc-900 group-hover:text-violet-700">{pub.thought_title}</h4>
      <p className="mt-1 line-clamp-2 text-sm text-zinc-500">{pub.thought_claim}</p>
      <p className="mt-2 text-xs text-zinc-400">
        {new Date(pub.created_at).toLocaleString("pt-BR")}
      </p>
    </button>
  );
}

function SynthesisPanel({
  synthesis,
  forumId,
  onRefresh,
}: {
  synthesis: Synthesis | null;
  forumId: string;
  onRefresh: () => void;
}) {
  const [synthesizing, setSynthesizing] = useState(false);

  const handleSynthesize = async () => {
    setSynthesizing(true);
    try {
      await api.synthesize(forumId);
      onRefresh();
    } catch (err) {
      console.error(err);
      alert("Erro ao gerar síntese. Verifique a chave da API.");
    } finally {
      setSynthesizing(false);
    }
  };

  let data: Record<string, any> | null = null;
  if (synthesis) {
    try {
      const cleaned = synthesis.content.replace(/```json|```/g, "").trim();
      data = JSON.parse(cleaned);
    } catch {
      data = null;
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">Síntese do Debate</h2>
        <button
          onClick={handleSynthesize}
          disabled={synthesizing}
          className="rounded-lg bg-violet-600 px-4 py-2 text-sm font-medium text-white hover:bg-violet-700 disabled:opacity-50"
        >
          {synthesizing ? "Sintetizando..." : "Gerar Síntese com IA"}
        </button>
      </div>

      {!synthesis && (
        <p className="text-sm text-zinc-400">
          Nenhuma síntese ainda. Clique em "Gerar Síntese" para analisar todas as publicações.
        </p>
      )}

      {synthesis && !data && (
        <div className="rounded-lg border border-zinc-200 bg-white p-4">
          <p className="text-sm text-zinc-700 whitespace-pre-wrap">{synthesis.content}</p>
        </div>
      )}

      {data && (
        <div className="space-y-4">
          {data.nivel_de_consenso_geral !== undefined && (
            <div className="rounded-xl border border-zinc-200 bg-white p-5">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-zinc-700">Nível de Consenso Geral</span>
                <span className="text-2xl font-bold text-violet-700">
                  {((data.nivel_de_consenso_geral as number) * 100).toFixed(0)}%
                </span>
              </div>
              <div className="mt-2 h-2 rounded-full bg-zinc-100">
                <div
                  className="h-2 rounded-full bg-violet-600 transition-all"
                  style={{ width: `${((data.nivel_de_consenso_geral as number) * 100).toFixed(0)}%` }}
                />
              </div>
            </div>
          )}

          {data.consenso && (data.consenso as string[]).length > 0 && (
            <SectionCard title="✅ Pontos de Consenso" color="emerald">
              <ul className="space-y-2">
                {(data.consenso as string[]).map((item, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-zinc-700">
                    <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-emerald-500" />
                    {item}
                  </li>
                ))}
              </ul>
            </SectionCard>
          )}

          {data.dissenso && (data.dissenso as string[]).length > 0 && (
            <SectionCard title=" Pontos de Dissenso" color="red">
              <ul className="space-y-2">
                {(data.dissenso as string[]).map((item, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-zinc-700">
                    <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-red-500" />
                    {item}
                  </li>
                ))}
              </ul>
            </SectionCard>
          )}

          {data.pontos_de_maior_tensao && (data.pontos_de_maior_tensao as string[]).length > 0 && (
            <SectionCard title="⚡ Pontos de Maior Tensão" color="amber">
              <ul className="space-y-2">
                {(data.pontos_de_maior_tensao as string[]).map((item, i) => (
                  <li key={i} className="text-sm text-zinc-700">• {item}</li>
                ))}
              </ul>
            </SectionCard>
          )}

          {data.vieses_coletivos && (data.vieses_coletivos as any[]).length > 0 && (
            <SectionCard title=" Vieses Coletivos Identificados" color="rose">
              <div className="space-y-3">
                {(data.vieses_coletivos as any[]).map((bias: any, i) => (
                  <div key={i} className="rounded-lg border border-rose-100 bg-rose-50 p-3">
                    <h4 className="text-sm font-semibold text-rose-800">{bias.vies as string}</h4>
                    <p className="mt-1 text-sm text-rose-700">{bias.descricao as string}</p>
                    {bias.publicacoes_afetadas && (
                      <p className="mt-1 text-xs text-rose-500">
                        Publicações: {(bias.publicacoes_afetadas as string[]).join(", ")}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </SectionCard>
          )}

          {data.assuncoes_ocultas && (data.assuncoes_ocultas as string[]).length > 0 && (
            <SectionCard title="🔍 Assunções Ocultas" color="purple">
              <ul className="space-y-2">
                {(data.assuncoes_ocultas as string[]).map((item, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-zinc-700">
                    <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-purple-500" />
                    {item}
                  </li>
                ))}
              </ul>
            </SectionCard>
          )}

          {data.insights_emergentes && (data.insights_emergentes as string[]).length > 0 && (
            <SectionCard title="💡 Insights Emergentes" color="blue">
              <ul className="space-y-2">
                {(data.insights_emergentes as string[]).map((item, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-zinc-700">
                    <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-blue-500" />
                    {item}
                  </li>
                ))}
              </ul>
            </SectionCard>
          )}

          {data.lacunas && (data.lacunas as string[]).length > 0 && (
            <SectionCard title=" Lacunas no Debate" color="slate">
              <ul className="space-y-2">
                {(data.lacunas as string[]).map((item, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-zinc-700">
                    <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-slate-500" />
                    {item}
                  </li>
                ))}
              </ul>
            </SectionCard>
          )}
        </div>
      )}
    </div>
  );
}

function SectionCard({
  title,
  color,
  children,
}: {
  title: string;
  color: string;
  children: React.ReactNode;
}) {
  const borderClass: Record<string, string> = {
    emerald: "border-emerald-500",
    red: "border-red-500",
    amber: "border-amber-500",
    rose: "border-rose-500",
    purple: "border-purple-500",
    blue: "border-blue-500",
    slate: "border-slate-500",
  };

  return (
    <div className={`rounded-xl border-l-4 bg-white p-5 shadow-sm ${borderClass[color] || "border-zinc-500"}`}>
      <h3 className="mb-3 text-sm font-semibold uppercase tracking-wider text-zinc-500">
        {title}
      </h3>
      {children}
    </div>
  );
}

export default function ForumPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const [forum, setForum] = useState<Forum | null>(null);
  const [publications, setPublications] = useState<Publication[]>([]);
  const [syntheses, setSyntheses] = useState<Synthesis[]>([]);
  const [loading, setLoading] = useState(true);
  const [availableThoughts, setAvailableThoughts] = useState<{ id: string; title: string }[]>([]);
  const [showPublish, setShowPublish] = useState(false);
  const [selectedThought, setSelectedThought] = useState("");
  const [publishing, setPublishing] = useState(false);

  const load = useCallback(async () => {
    try {
      const [f, pubs, syns] = await Promise.all([
        api.getForum(id),
        api.listPublications(id),
        api.listSyntheses(id),
      ]);
      setForum(f);
      setPublications(pubs);
      setSyntheses(syns);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => { load(); }, [load]);

  const handlePublish = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedThought) return;
    setPublishing(true);
    try {
      await api.publishThought(selectedThought, id);
      setShowPublish(false);
      setSelectedThought("");
      await load();
    } catch (err) {
      console.error(err);
      alert("Erro ao publicar. Talvez já esteja publicado neste fórum.");
    } finally {
      setPublishing(false);
    }
  };

  const openPublishModal = async () => {
    try {
      const thoughts = await api.listThoughts();
      setAvailableThoughts(thoughts.map((t) => ({ id: t.id, title: t.title })));
      setShowPublish(true);
    } catch (err) {
      console.error(err);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-violet-200 border-t-violet-600" />
      </div>
    );
  }

  if (!forum) {
    return (
      <div className="mx-auto max-w-4xl px-6 py-20 text-center">
        <h2 className="text-xl font-semibold">Fórum não encontrado</h2>
        <button onClick={() => router.push("/forums")} className="mt-4 text-violet-600 hover:underline">
          Ver todos os fóruns
        </button>
      </div>
    );
  }

  const latestSynthesis = syntheses.length > 0 ? syntheses[0] : null;

  return (
    <div className="mx-auto max-w-4xl px-6 py-10">
      <button onClick={() => router.push("/forums")} className="mb-4 text-sm text-violet-600 hover:underline">
        ← Todos os Fóruns
      </button>

      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">{forum.title}</h1>
        <p className="mt-2 text-lg text-zinc-500">Tema: {forum.topic}</p>
        {forum.description && <p className="mt-1 text-sm text-zinc-400">{forum.description}</p>}
      </div>

      <div className="mb-8">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold">
            Publicações ({publications.length})
          </h2>
          <button
            onClick={openPublishModal}
            className="rounded-lg bg-violet-600 px-4 py-2 text-sm font-medium text-white hover:bg-violet-700"
          >
            + Publicar Pensamento
          </button>
        </div>

        {publications.length === 0 ? (
          <div className="rounded-lg border-2 border-dashed border-zinc-200 py-10 text-center">
            <p className="text-sm text-zinc-400">
              Nenhuma publicação ainda. Publique um pensamento para iniciar o debate.
            </p>
          </div>
        ) : (
          <div className="grid gap-3 sm:grid-cols-2">
            {publications.map((pub) => (
              <PublicationCard key={pub.id} pub={pub} />
            ))}
          </div>
        )}
      </div>

      {showPublish && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30">
          <div className="w-full max-w-md rounded-xl bg-white p-6 shadow-xl">
            <h3 className="text-lg font-semibold">Publicar no fórum</h3>
            <form onSubmit={handlePublish} className="mt-4 space-y-4">
              <div>
                <label className="block text-sm font-medium text-zinc-700">
                  Selecione um pensamento
                </label>
                <select
                  value={selectedThought}
                  onChange={(e) => setSelectedThought(e.target.value)}
                  className="mt-1 w-full rounded-lg border border-zinc-300 px-4 py-2.5 text-sm focus:border-violet-500 focus:outline-none"
                >
                  <option value="">-- Selecione --</option>
                  {availableThoughts.map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.title}
                    </option>
                  ))}
                </select>
              </div>
              <div className="flex gap-2">
                <button
                  type="submit"
                  disabled={publishing || !selectedThought}
                  className="rounded-lg bg-violet-600 px-5 py-2 text-sm font-medium text-white hover:bg-violet-700 disabled:opacity-50"
                >
                  {publishing ? "Publicando..." : "Publicar"}
                </button>
                <button
                  type="button"
                  onClick={() => setShowPublish(false)}
                  className="rounded-lg border border-zinc-300 px-5 py-2 text-sm text-zinc-600 hover:bg-zinc-50"
                >
                  Cancelar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <SynthesisPanel
        synthesis={latestSynthesis}
        forumId={id}
        onRefresh={load}
      />
    </div>
  );
}
