const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

export type Thought = {
  id: string;
  title: string;
  claim: string;
  evidence: string;
  reasoning: string;
  conclusion: string;
  status: string;
  created_at: string;
  updated_at: string;
  analyses: Analysis[];
  arguments: Argument[];
};

export type ThoughtListItem = {
  id: string;
  title: string;
  claim: string;
  status: string;
  created_at: string;
};

export type Analysis = {
  id: string;
  agent_type: string;
  content: string;
  created_at: string;
};

export type Argument = {
  id: string;
  type: string;
  content: string;
  score: number;
  created_at: string;
};

export type ThoughtCreate = {
  title: string;
  claim: string;
  evidence?: string;
  reasoning?: string;
  conclusion?: string;
};

export type Forum = {
  id: string;
  title: string;
  description: string;
  topic: string;
  publication_count: number;
  created_at: string;
};

export type Publication = {
  id: string;
  thought_id: string;
  forum_id: string;
  thought_title: string;
  thought_claim: string;
  created_at: string;
};

export type Synthesis = {
  id: string;
  forum_id: string;
  content: string;
  created_at: string;
};

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${API_URL}${path}`, {
    headers: { "Content-Type": "application/json" },
    ...options,
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`API error ${res.status}: ${text}`);
  }
  if (res.status === 204) return undefined as T;
  return res.json();
}

export const api = {
  listThoughts: () => request<ThoughtListItem[]>("/api/thoughts"),
  getThought: (id: string) => request<Thought>(`/api/thoughts/${id}`),
  createThought: (data: ThoughtCreate) =>
    request<Thought>("/api/thoughts", { method: "POST", body: JSON.stringify(data) }),
  deleteThought: (id: string) =>
    request<void>(`/api/thoughts/${id}`, { method: "DELETE" }),
  analyzeThought: (id: string) =>
    request<Analysis[]>(`/api/analysis/${id}/analyze`, { method: "POST" }),
  getAnalysis: (id: string) => request<Analysis[]>(`/api/analysis/${id}`),
  addArgument: (thoughtId: string, data: { type: string; content: string; score?: number }) =>
    request<Argument>(`/api/thoughts/${thoughtId}/arguments`, {
      method: "POST",
      body: JSON.stringify(data),
    }),

  listForums: () => request<Forum[]>("/api/forums"),
  getForum: (id: string) => request<Forum>(`/api/forums/${id}`),
  createForum: (data: { title: string; description: string; topic: string }) =>
    request<Forum>("/api/forums", { method: "POST", body: JSON.stringify(data) }),

  listPublications: (forumId: string) =>
    request<Publication[]>(`/api/publications/forum/${forumId}`),
  publishThought: (thoughtId: string, forumId: string) =>
    request<Publication>("/api/publications", {
      method: "POST",
      body: JSON.stringify({ thought_id: thoughtId, forum_id: forumId }),
    }),
  unpublish: (publicationId: string) =>
    request<void>(`/api/publications/${publicationId}`, { method: "DELETE" }),

  synthesize: (forumId: string) =>
    request<Synthesis>(`/api/synthesis/${forumId}/synthesize`, { method: "POST" }),
  listSyntheses: (forumId: string) =>
    request<Synthesis[]>(`/api/synthesis/${forumId}`),
};
