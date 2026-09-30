import { CommentForm } from "@/components/comment-form";
import { DeleteCommentButton } from "@/components/delete-comment-button";
import type { Comment, Profile } from "@/lib/supabase/database.types";

type FeedComment = Comment & {
  author: Pick<Profile, "username" | "display_name" | "avatar_url"> | null;
};

function CommentAvatar({ author }: { author: FeedComment["author"] }) {
  const name = author?.display_name ?? "ROAM rider";
  if (author?.avatar_url) {
    // eslint-disable-next-line @next/next/no-img-element -- Rider avatars use their supplied public URL.
    return <img src={author.avatar_url} alt={`${name} avatar`} width="32" height="32" loading="lazy" className="size-8 shrink-0 rounded-full border border-line bg-paper object-cover" />;
  }
  const initials = name.split(/\s+/).map((part) => part[0]).join("").slice(0, 2).toUpperCase();
  return <span role="img" aria-label={`${name} avatar`} className="grid size-8 shrink-0 place-items-center rounded-full bg-sage/40 text-[10px] font-semibold text-petrol">{initials}</span>;
}

function formatCommentTime(value: string) {
  return new Intl.DateTimeFormat(undefined, { dateStyle: "medium", timeStyle: "short" }).format(new Date(value));
}

export function CommentSection({
  postId,
  comments,
  currentUserId,
}: {
  postId: string;
  comments: FeedComment[];
  currentUserId: string;
}) {
  return <section aria-label="Comments on this post" className="border-t border-line px-4 py-4 sm:px-6">
    {comments.length ? <ul className="space-y-3">
      {comments.map((comment) => <li key={comment.id} className="flex min-w-0 items-start gap-2.5">
        <CommentAvatar author={comment.author} />
        <div className="min-w-0 flex-1 rounded-control bg-paper/70 px-3 py-2.5">
          <div className="flex flex-wrap items-baseline gap-x-2 gap-y-0.5">
            <p className="text-xs font-semibold text-ink">{comment.author?.display_name ?? "ROAM rider"}</p>
            <p className="text-[11px] text-muted">@{comment.author?.username ?? "rider"}</p>
            <time dateTime={comment.created_at} className="ml-auto text-right text-[10px] text-muted">{formatCommentTime(comment.created_at)}</time>
          </div>
          <p className="mt-1 whitespace-pre-wrap break-words text-sm leading-6 text-ink">{comment.content}</p>
          {comment.user_id === currentUserId ? <DeleteCommentButton commentId={comment.id} /> : null}
        </div>
      </li>)}
    </ul> : null}
    <CommentForm postId={postId} />
  </section>;
}
