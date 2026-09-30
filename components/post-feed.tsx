import { Compass, Image as ImageIcon, MoveUpRight } from "lucide-react";
import Link from "next/link";
import { DeletePostButton } from "@/components/delete-post-button";
import { LikeButton } from "@/components/like-button";
import type { Post, Profile } from "@/lib/supabase/database.types";

type FeedPost = Post & {
  like_count: number;
  liked_by_current_user: boolean;
  author: Pick<Profile, "username" | "display_name" | "avatar_url"> | null;
};

function RiderAvatar({ author }: { author: FeedPost["author"] }) {
  const name = author?.display_name ?? "ROAM rider";
  const initials = name.split(/\s+/).map((part) => part[0]).join("").slice(0, 2).toUpperCase();
  if (author?.avatar_url) {
    // Direct image URLs avoid routing riders' photos through an image processing service.
    // eslint-disable-next-line @next/next/no-img-element
    return <img src={author.avatar_url} alt={`${name}'s avatar`} width="44" height="44" loading="lazy" className="size-11 rounded-full border border-line bg-paper object-cover" />;
  }
  return <span role="img" aria-label={`${name}'s initials`} className="grid size-11 shrink-0 place-items-center rounded-full border border-white bg-sage text-xs font-semibold text-petrol shadow-sm">{initials}</span>;
}

function formatPostTime(value: string) {
  return new Intl.DateTimeFormat(undefined, { dateStyle: "medium", timeStyle: "short" }).format(new Date(value));
}

function PostCard({ post, currentUserId }: { post: FeedPost; currentUserId: string }) {
  return <article className="overflow-hidden rounded-panel border border-line bg-white shadow-panel">
    <header className="flex items-center gap-3 px-4 py-4 sm:px-6">
      <RiderAvatar author={post.author} />
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-semibold text-ink">{post.author?.display_name ?? "ROAM rider"}</p>
        <p className="mt-0.5 truncate text-xs text-muted">@{post.author?.username ?? "rider"}</p>
      </div>
      <time dateTime={post.created_at} className="shrink-0 text-right text-[11px] leading-5 text-muted">{formatPostTime(post.created_at)}</time>
    </header>
    <div className="px-4 pb-5 sm:px-6 sm:pb-6">
      <p className="whitespace-pre-wrap text-sm leading-7 text-ink sm:text-[15px]">{post.caption}</p>
      {post.media_url ? <figure className="mt-4 overflow-hidden rounded-control border border-line bg-paper">
        {/* eslint-disable-next-line @next/next/no-img-element -- Post images remain direct URLs; no image service or optimizer is used. */}
        <img src={post.media_url} alt={`Photo shared by ${post.author?.display_name ?? "a ROAM rider"}`} loading="lazy" decoding="async" className="max-h-[560px] w-full object-cover" />
      </figure> : null}
      <footer className="mt-5 flex items-center justify-between gap-3 border-t border-line pt-3">
        <span className="inline-flex items-center gap-2 font-mono text-[9px] tracking-[0.14em] text-muted"><Compass size={13} aria-hidden="true" /> RIDER NOTE</span>
        <div className="ml-auto flex items-center gap-2">
          <LikeButton postId={post.id} likeCount={post.like_count} isLiked={post.liked_by_current_user} />
          {post.user_id === currentUserId ? <DeletePostButton postId={post.id} /> : null}
        </div>
      </footer>
    </div>
  </article>;
}

export function PostFeed({ posts, currentUserId }: { posts: FeedPost[]; currentUserId: string }) {
  if (!posts.length) {
    return <section className="rounded-panel border border-dashed border-sage/70 bg-white/70 px-6 py-12 text-center sm:py-16">
      <span className="mx-auto grid size-12 place-items-center rounded-full bg-sage/20 text-petrol"><ImageIcon size={20} aria-hidden="true" /></span>
      <h2 className="mt-4 text-xl font-semibold tracking-tight text-ink">The road is quiet for now.</h2>
      <p className="mx-auto mt-2 max-w-sm text-sm leading-6 text-muted">Share a small moment from your ride and get the home feed moving.</p>
      <Link href="/create-post" className="mt-5 inline-flex min-h-11 items-center gap-2 rounded-control bg-petrol px-5 text-sm font-semibold text-white hover:bg-petrol/90 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-signal">Share the first update <MoveUpRight size={15} aria-hidden="true" /></Link>
    </section>;
  }

  return <div className="space-y-4">{posts.map((post) => <PostCard key={post.id} post={post} currentUserId={currentUserId} />)}</div>;
}
