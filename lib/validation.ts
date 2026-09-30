export type FieldErrors = Record<string, string>;

export function normalizeUsername(username: string) {
  return username.trim().toLowerCase();
}

export function validateSignup(input: {
  email: string;
  password: string;
  confirmPassword: string;
}): FieldErrors {
  const errors: FieldErrors = {};
  const email = input.email.trim();

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    errors.email = "Enter a valid email address.";
  }
  if (input.password.length < 8) {
    errors.password = "Use at least 8 characters.";
  }
  if (input.confirmPassword !== input.password) {
    errors.confirmPassword = "Passwords do not match.";
  }

  return errors;
}

export function validateLogin(input: { email: string; password: string }): FieldErrors {
  const errors: FieldErrors = {};
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(input.email.trim())) {
    errors.email = "Enter a valid email address.";
  }
  if (!input.password) errors.password = "Enter your password.";
  return errors;
}

export function validateRiderDetails(input: {
  username: string;
  displayName: string;
  city?: string;
  bio?: string;
}): FieldErrors {
  const errors: FieldErrors = {};
  const username = normalizeUsername(input.username);
  const displayName = input.displayName.trim();

  if (!/^[a-z0-9_]{3,24}$/.test(username)) {
    errors.username = "Use 3–24 lowercase letters, numbers, or underscores.";
  }
  if (!displayName || displayName.length > 60) {
    errors.displayName = "Enter a display name up to 60 characters.";
  }
  if ((input.city?.trim().length ?? 0) > 80) {
    errors.city = "Keep your city under 80 characters.";
  }
  if ((input.bio?.trim().length ?? 0) > 280) {
    errors.bio = "Keep your bio under 280 characters.";
  }

  return errors;
}

export function validateMotorcycle(input: {
  make: string;
  model: string;
  year: string;
}): FieldErrors {
  const errors: FieldErrors = {};
  const make = input.make.trim();
  const model = input.model.trim();
  const year = input.year.trim();

  if (Boolean(make) !== Boolean(model)) {
    const message = "Enter both the make and model, or leave both blank.";
    if (!make) errors.make = message;
    if (!model) errors.model = message;
  }
  if (make.length > 60) errors.make = "Keep the make under 60 characters.";
  if (model.length > 80) errors.model = "Keep the model under 80 characters.";
  if (year && (!/^\d{4}$/.test(year) || Number(year) < 1885 || Number(year) > 2100)) {
    errors.year = "Enter a four-digit model year.";
  }

  return errors;
}

export function validateAvatarUrl(value: string): string | undefined {
  const url = value.trim();
  if (!url) return undefined;

  try {
    const parsed = new URL(url);
    if (parsed.protocol === "http:" || parsed.protocol === "https:") return undefined;
  } catch {
    // Report malformed URLs with the same field guidance.
  }

  return "Enter a valid http or https image URL.";
}
