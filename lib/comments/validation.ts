export const MAX_COMMENT_LENGTH = 1000;

export function normalizeComment(value: string) {
  return value.trim();
}

export function validateComment(value: string) {
  const content = normalizeComment(value);
  if (!content) return "Write a comment before sending.";
  if ([...content].length > MAX_COMMENT_LENGTH) return "Comments must be 1,000 characters or fewer.";
  return null;
}
