import { createFileRoute, Link, useRouter } from "@tanstack/react-router";
import { queryOptions, useQueryClient, useSuspenseQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { useState } from "react";
import { MessageCircle, Trash2, Send } from "lucide-react";
import { AppShell } from "@/components/AppShell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { discussionSchema, replySchema } from "@/lib/community-schema";
import { listDiscussions, createDiscussion, createReply, deleteCommunityEntry } from "@/lib/community.functions";
import { pageMeta } from "@/lib/page-meta";

const discussionsQuery = queryOptions({ queryKey: ["community-discussions"], queryFn: () => listDiscussions() });
export const Route = createFileRoute("/_authenticated/discussions")({
  staticData: { sitemap: false },
  head: () => pageMeta("Member discussions", "SoulSkill member career conversations and practical encouragement."),
  loader: ({ context }) => context.queryClient.ensureQueryData(discussionsQuery),
  errorComponent: DiscussionError,
  notFoundComponent: () => <AppShell><p className="p-8">Discussion not found.</p></AppShell>,
  component: DiscussionsPage,
});
function DiscussionError() {
  const router = useRouter();
  return <AppShell><div className="p-8"><p role="alert">Discussions couldn’t load right now.</p><Button onClick={() => void router.invalidate()}>Try again</Button></div></AppShell>;
}
function DiscussionsPage() {
  const { data } = useSuspenseQuery(discussionsQuery);
  const qc = useQueryClient();
  const publish = useServerFn(createDiscussion);
  const reply = useServerFn(createReply);
  const remove = useServerFn(deleteCommunityEntry);
  const [name, setName] = useState("");
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [replyTo, setReplyTo] = useState<string | null>(null);
  const [replyBody, setReplyBody] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  async function run(action: () => Promise<unknown>, done: () => void) {
    setBusy(true); setError(""); setNotice("");
    try { await action(); done(); await qc.invalidateQueries({ queryKey: discussionsQuery.queryKey }); }
    catch (e) { setError(e instanceof Error ? e.message : "Please try again."); }
    finally { setBusy(false); }
  }
  function submit(e: React.FormEvent) {
    e.preventDefault();
    const parsed = discussionSchema.safeParse({ display_name: name, title, body });
    if (!parsed.success) { setError("Add a display name (2–60 characters), title (5–160) and message (5–3000)."); return; }
    void run(() => publish({ data: parsed.data }), () => { setTitle(""); setBody(""); setNotice("Your discussion is published."); });
  }
  function submitReply(e: React.FormEvent) {
    e.preventDefault();
    const parsed = replySchema.safeParse({ display_name: name, body: replyBody, parent_id: replyTo });
    if (!parsed.success) { setError("Add your display name (2–60 characters) and a reply (5–3000 characters)."); return; }
    void run(() => reply({ data: parsed.data }), () => { setReplyBody(""); setReplyTo(null); setNotice("Your reply is published."); });
  }
  function deleteEntry(id: string, isPost: boolean) {
    if (!window.confirm(isPost ? "Delete this discussion and all its replies?" : "Delete this reply?")) return;
    void run(() => remove({ data: { id } }), () => setNotice("Message deleted."));
  }
  return <AppShell><main className="mx-auto w-full max-w-4xl space-y-8 p-5 md:p-10">
    <header><p className="text-sm text-primary">SoulSkill Community</p><h1 className="mt-2 font-display text-4xl">Member discussions</h1><p className="mt-3 text-muted-foreground">Share a question, a lesson or a little encouragement.</p><Link to="/community" className="text-sm text-primary underline">Community guidelines</Link></header>
    <form onSubmit={submit} className="space-y-4 border-y border-border py-6"><h2 className="font-display text-2xl">Start a conversation</h2>
      <label className="block space-y-2">Display name<Input required minLength={2} maxLength={60} value={name} onChange={e => setName(e.target.value)} autoComplete="nickname" /></label>
      <label className="block space-y-2">Discussion title<Input required minLength={5} maxLength={160} value={title} onChange={e => setTitle(e.target.value)} /></label>
      <label className="block space-y-2">Message<Textarea required minLength={5} maxLength={3000} rows={4} value={body} onChange={e => setBody(e.target.value)} /></label>
      <p className="text-sm text-muted-foreground">Visible to signed-in members. Keep sensitive personal information private.</p>
      <Button variant="ink" disabled={busy}><Send />{busy ? "Sending…" : "Publish discussion"}</Button>
    </form>
    {error && <p role="alert" className="text-destructive">{error}</p>}{notice && <p role="status" className="text-foreground">{notice}</p>}
    <section className="space-y-6"><h2 className="font-display text-2xl">Latest conversations</h2>{!data.posts.length && <div className="py-8 text-center text-muted-foreground"><MessageCircle className="mx-auto mb-3 size-8 text-primary" /><p>No discussions yet. Yours could be the first.</p></div>}
      {data.posts.map(post => <article key={post.id} className="rounded-lg border border-border bg-card p-5 shadow-soft">
        <div className="flex items-start justify-between gap-3"><div className="min-w-0"><h3 className="break-words font-display text-2xl text-card-foreground">{post.title}</h3><p className="mt-1 break-words text-xs text-muted-foreground">{post.display_name} · {post.created_at.slice(0, 10)}</p></div>{(data.admin || post.user_id === data.userId) && <Button variant="ghost" size="icon" title="Delete discussion" aria-label={`Delete discussion ${post.title}`} disabled={busy} onClick={() => deleteEntry(post.id, true)}><Trash2 /></Button>}</div>
        <p className="mt-4 whitespace-pre-wrap break-words text-card-foreground">{post.body}</p>
        <div className="mt-5 space-y-4 border-t border-border pt-4">{data.replies.filter(r => r.parent_id === post.id).map(r => <div key={r.id} className="flex items-start justify-between gap-3"><div className="min-w-0"><p className="break-words text-xs text-muted-foreground">{r.display_name} · {r.created_at.slice(0, 10)}</p><p className="mt-1 whitespace-pre-wrap break-words">{r.body}</p></div>{(data.admin || r.user_id === data.userId) && <Button variant="ghost" size="icon" aria-label="Delete reply" title="Delete reply" disabled={busy} onClick={() => deleteEntry(r.id, false)}><Trash2 /></Button>}</div>)}</div>
        <Button variant="ghost" className="mt-3" onClick={() => { setReplyTo(replyTo === post.id ? null : post.id); setReplyBody(""); }}><MessageCircle />Reply</Button>
        {replyTo === post.id && <form onSubmit={submitReply} className="mt-3 space-y-3"><label className="block space-y-2">Reply message<Textarea required minLength={5} maxLength={3000} value={replyBody} onChange={e => setReplyBody(e.target.value)} /></label><p className="text-xs text-muted-foreground">Posting as {name || "the display name entered above"}.</p><Button disabled={busy} variant="ink"><Send />Post reply</Button></form>}
      </article>)}
    </section>
  </main></AppShell>;
}