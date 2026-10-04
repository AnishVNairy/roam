"use client";

import { useActionState } from "react";
import { followRiderAction, unfollowRiderAction } from "@/app/actions/follows";
import { initialActionState } from "@/lib/forms";

function FollowButtonAction({ profileId, isFollowing }: { profileId: string; isFollowing: boolean }) {
  const action = isFollowing ? unfollowRiderAction : followRiderAction;
  const [state, formAction, pending] = useActionState(action, initialActionState);

  return <div className="flex flex-col items-start gap-1">
    <form action={formAction}>
      <input type="hidden" name="profileId" value={profileId} />
      <button
        type="submit"
        disabled={pending}
        aria-label={pending ? (isFollowing ? "Unfollowing rider" : "Following rider") : (isFollowing ? "Following" : "Follow rider")}
        aria-pressed={isFollowing}
        className={`inline-flex min-h-11 items-center justify-center rounded-control px-4 text-sm font-semibold focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-signal disabled:cursor-wait disabled:opacity-60 ${isFollowing ? "border border-line bg-white text-petrol hover:border-sage" : "bg-petrol text-white hover:bg-petrol/90"}`}
      >
        {pending ? (isFollowing ? "Unfollowing…" : "Following…") : (isFollowing ? "Following" : "Follow rider")}
      </button>
    </form>
    {state.status === "error" && state.message ? <p role="alert" className="text-xs text-danger">{state.message}</p> : null}
  </div>;
}

export function FollowButton(props: { profileId: string; isFollowing: boolean }) {
  return <FollowButtonAction key={props.isFollowing ? "following" : "not-following"} {...props} />;
}
