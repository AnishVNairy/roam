import type { FieldErrors } from "@/lib/validation";

export function validatePost(input: { caption: string; mediaUrl: string }): FieldErrors {
  const errors: FieldErrors = {};
  const caption = input.caption.trim();
  const mediaUrl = input.mediaUrl.trim();

  if (!caption) errors.caption = "Write a caption before posting.";
  else if (caption.length > 2000) errors.caption = "Keep your caption under 2,000 characters.";

  if (mediaUrl) {
    try {
      const url = new URL(mediaUrl);
      if (url.protocol !== "http:" && url.protocol !== "https:") {
        errors.mediaUrl = "Enter a valid http or https image URL.";
      }
    } catch {
      errors.mediaUrl = "Enter a valid http or https image URL.";
    }
  }

  return errors;
}
