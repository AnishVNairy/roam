import type { ReactNode } from "react";
import Link from "next/link";
import { redirect } from "next/navigation";
import { AppHeader } from "@/components/app-header";
import { Wordmark } from "@/components/brand";
import { PostFeed } from "@/components/post-feed";
import type { Comment, Post, Profile } from "@/lib/supabase/database.types";
import { createClient } from "@/lib/supabase/server";

type FeedComment = Comment & {
  author: Pick<Profile, "username" | "display_name" | "avatar_url"> | null;
};

type FeedPost = Post & {
  like_count: number;
  liked_by_current_user: boolean;
  comment_count: number;
  comments: FeedComment[];
  author: Pick<Profile, "username" | "display_name" | "avatar_url"> | null;
};

function LandingPage() {
  return <main className="relative min-h-screen overflow-hidden bg-paper">
    <div className="absolute inset-y-0 right-0 hidden w-[48%] bg-[radial-gradient(circle_at_75%_48%,rgba(196,95,59,0.28),transparent_15%),radial-gradient(circle_at_75%_48%,transparent_24%,rgba(255,255,255,0.12)_24.2%,transparent_24.7%),radial-gradient(circle_at_75%_48%,transparent_38%,rgba(255,255,255,0.1)_38.2%,transparent_38.6%),linear-gradient(145deg,#142c30,#29494a_62%,#82968a)] lg:block" aria-hidden="true" />
    <header className="relative z-10 mx-auto flex max-w-[1200px] items-center justify-between px-5 py-6 sm:px-8"><Wordmark /><nav className="flex items-center gap-3"><Link href="/login" className="rounded-control px-4 py-2.5 text-sm font-semibold text-petrol hover:bg-white">Sign in</Link><Link href="/signup" className="rounded-control bg-petrol px-4 py-2.5 text-sm font-semibold text-white hover:bg-petrol/90">Join ROAM</Link></nav></header>
    <section className="relative z-10 mx-auto grid min-h-[calc(100vh-88px)] max-w-[1200px] items-center px-5 pb-16 pt-12 sm:px-8 lg:grid-cols-[1fr_0.8fr] lg:py-20">
      <div className="max-w-2xl"><p className="font-mono text-[11px] font-semibold tracking-[0.2em] text-signal">A RIDING COMMUNITY, BUILT FOR THE ROAD</p><h1 className="mt-6 max-w-[12ch] text-5xl font-semibold leading-[0.99] tracking-[-0.055em] text-ink sm:text-6xl lg:text-7xl">Good roads are better <span className="text-signal">together.</span></h1><p className="mt-7 max-w-lg text-base leading-8 text-muted sm:text-lg">Meet riders, share the bike you ride, and find your next reason to take the long way home.</p><div className="mt-9 flex flex-wrap gap-3"><Link href="/signup" className="inline-flex min-h-12 items-center justify-center rounded-control bg-petrol px-6 text-sm font-semibold text-white hover:bg-petrol/90">Build your rider card</Link><Link href="/login" className="inline-flex min-h-12 items-center justify-center rounded-control border border-line bg-white/70 px-6 text-sm font-semibold text-petrol hover:border-sage">I already have an account</Link></div><p className="mt-8 font-mono text-[10px] tracking-[0.15em] text-muted">RIDER FIRST&nbsp; · &nbsp;OPEN ROAD&nbsp; · &nbsp;YOUR PACE</p></div>
      <div className="relative mt-16 aspect-[4/3] max-w-xl rounded-panel border border-white/30 bg-[radial-gradient(circle_at_70%_50%,rgba(196,95,59,0.75),transparent_3%),radial-gradient(ellipse_at_70%_50%,transparent_31%,rgba(242,243,241,0.65)_31.3%,transparent_32%),radial-gradient(ellipse_at_70%_50%,transparent_42%,rgba(242,243,241,0.45)_42.3%,transparent_42.6%),linear-gradient(135deg,#29494a,#142c30_54%,#82968a)] shadow-[0_24px_60px_rgba(20,44,48,0.2)] lg:hidden" aria-hidden="true"><div className="absolute bottom-5 left-5 rounded-control border border-white/15 bg-petrol/70 px-4 py-3 font-mono text-[10px] tracking-[0.15em] text-white">THE ROAD IS BETTER SHARED</div></div>
    </section>
  </main>;
}

function FeedFrame({ email, children }: { email?: string | null; children: ReactNode }) {
  return <main className="min-h-screen bg-paper"><AppHeader email={email} /><div className="mx-auto max-w-[760px] px-4 py-7 sm:px-8 sm:py-10">{children}</div></main>;
}

export default async function Home({ searchParams }: PageProps<"/">) {
  const { post } = await searchParams;
  const linkedPostId = typeof post === "string" ? post : null;
  let client;
  try {
    client = await createClient();
  } catch {
    return <LandingPage />;
  }

  let user;
  try {
    const { data } = await client.auth.getUser();
    user = data.user;
  } catch {
    return <LandingPage />;
  }
  if (!user) return <LandingPage />;

  const { data: rider, error: riderError } = await client.from("profiles")
    .select("username, display_name")
    .eq("id", user.id)
    .maybeSingle();
  if (riderError) {
    return <FeedFrame email={user.email}><p role="alert" className="rounded-panel border border-danger/20 bg-white p-6 text-sm leading-6 text-danger">We couldn&apos;t load your rider profile. Refresh to try again.</p></FeedFrame>;
  }
  if (!rider) redirect("/onboarding");

  const { data: posts, error: postsError } = await client.from("posts")
    .select("*")
    .order("created_at", { ascending: false })
    .order("id", { ascending: false })
    .limit(30);
  if (postsError) {
    return <FeedFrame email={user.email}><p role="alert" className="rounded-panel border border-danger/20 bg-white p-6 text-sm leading-6 text-danger">We couldn&apos;t load the home feed. Refresh to try again.</p></FeedFrame>;
  }

  const rows = posts ?? [];
  if (linkedPostId && !rows.some((post) => post.id === linkedPostId)) {
    const { data: linkedPost } = await client.from("posts")
      .select("*")
      .eq("id", linkedPostId)
      .maybeSingle();
    if (linkedPost) rows.unshift(linkedPost);
  }
  const postIds = rows.map((post) => post.id);
  let likeSummaries: { post_id: string; like_count: number; liked_by_current_user: boolean }[] = [];
  let commentCounts: { post_id: string; comment_count: number }[] = [];
  let commentRows: Comment[] = [];

  if (postIds.length) {
    const [likesResult, commentsResult, countsResult] = await Promise.all([
      client.from("post_likes_summary")
        .select("post_id, like_count, liked_by_current_user")
        .in("post_id", postIds),
      client.from("comments")
        .select("id, post_id, user_id, content, created_at")
        .in("post_id", postIds)
        .order("created_at", { ascending: true })
        .order("id", { ascending: true }),
      client.from("post_comment_counts")
        .select("post_id, comment_count")
        .in("post_id", postIds),
    ]);

    if (likesResult.error || commentsResult.error || countsResult.error) {
      return <FeedFrame email={user.email}><p role="alert" className="rounded-panel border border-danger/20 bg-white p-6 text-sm leading-6 text-danger">We couldn&apos;t load likes or comments for the home feed. Refresh to try again.</p></FeedFrame>;
    }
    likeSummaries = likesResult.data ?? [];
    commentRows = commentsResult.data ?? [];
    commentCounts = countsResult.data ?? [];
  }

  const authorIds = [...new Set([...rows.map((post) => post.user_id), ...commentRows.map((comment) => comment.user_id)])];
  let authors: Pick<Profile, "id" | "username" | "display_name" | "avatar_url">[] = [];
  if (authorIds.length) {
    const { data, error } = await client.from("profiles")
      .select("id, username, display_name, avatar_url")
      .in("id", authorIds);
    if (error) {
      return <FeedFrame email={user.email}><p role="alert" className="rounded-panel border border-danger/20 bg-white p-6 text-sm leading-6 text-danger">We couldn&apos;t load rider details for the home feed. Refresh to try again.</p></FeedFrame>;
    }
    authors = data ?? [];
  }

  const authorById = new Map(authors.map((author) => [author.id, author]));
  const likeSummaryByPostId = new Map(likeSummaries.map((summary) => [summary.post_id, summary]));
  const commentCountByPostId = new Map(commentCounts.map((summary) => [summary.post_id, summary.comment_count]));
  const commentsByPostId = new Map<string, FeedComment[]>();
  for (const comment of commentRows) {
    const postComments = commentsByPostId.get(comment.post_id) ?? [];
    postComments.push({ ...comment, author: authorById.get(comment.user_id) ?? null });
    commentsByPostId.set(comment.post_id, postComments);
  }
  const feedPosts: FeedPost[] = rows.map((post) => {
    const likes = likeSummaryByPostId.get(post.id);
    return {
      ...post,
      like_count: likes?.like_count ?? 0,
      liked_by_current_user: likes?.liked_by_current_user ?? false,
      comment_count: commentCountByPostId.get(post.id) ?? 0,
      comments: commentsByPostId.get(post.id) ?? [],
      author: authorById.get(post.user_id) ?? null,
    };
  });

  return <FeedFrame email={user.email}>
    <header className="mb-6">
      <p className="font-mono text-[10px] font-semibold tracking-[0.18em] text-signal">LATEST FROM THE ROAD</p>
      <h1 className="mt-2 text-3xl font-semibold tracking-[-0.045em] text-ink">Home feed</h1>
      <p className="mt-2 text-sm leading-6 text-muted">A chronological stream of moments shared by ROAM riders.</p>
    </header>
    <PostFeed posts={feedPosts} currentUserId={user.id} />
  </FeedFrame>;
}
