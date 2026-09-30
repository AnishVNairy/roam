"use client";

import { useState } from "react";
import type { InputHTMLAttributes, ReactNode, TextareaHTMLAttributes } from "react";

export const fieldControlClass =
  "block w-full rounded-control border border-line bg-white px-4 py-3 text-sm text-ink shadow-[0_1px_1px_rgba(18,40,44,0.03)] outline-none transition placeholder:text-muted/65 hover:border-sage/70 focus-visible:border-petrol focus-visible:ring-2 focus-visible:ring-signal/25 disabled:cursor-not-allowed disabled:bg-paper disabled:text-muted";

function Field({
  id,
  label,
  error,
  hint,
  children,
}: {
  id: string;
  label: string;
  error?: string;
  hint?: string;
  children: ReactNode;
}) {
  return (
    <div className="space-y-2">
      <label htmlFor={id} className="block text-sm font-medium text-ink">
        {label}
      </label>
      {children}
      {hint && !error ? (
        <p id={`${id}-hint`} className="text-xs leading-5 text-muted">{hint}</p>
      ) : null}
      {error ? (
        <p id={`${id}-error`} className="text-xs leading-5 text-danger">{error}</p>
      ) : null}
    </div>
  );
}

type TextInputProps = Omit<InputHTMLAttributes<HTMLInputElement>, "id"> & {
  id: string;
  label: string;
  error?: string;
  hint?: string;
};

export function TextInput({ id, label, error, hint, className, ...props }: TextInputProps) {
  const descriptionId = error ? `${id}-error` : hint ? `${id}-hint` : undefined;

  return (
    <Field id={id} label={label} error={error} hint={hint}>
      <input
        id={id}
        aria-invalid={error ? true : undefined}
        aria-describedby={descriptionId}
        className={`${fieldControlClass} ${className ?? ""}`}
        {...props}
      />
    </Field>
  );
}

type TextAreaProps = Omit<TextareaHTMLAttributes<HTMLTextAreaElement>, "id"> & {
  id: string;
  label: string;
  error?: string;
  hint?: string;
};

export function TextAreaField({ id, label, error, hint, className, ...props }: TextAreaProps) {
  const descriptionId = error ? `${id}-error` : hint ? `${id}-hint` : undefined;

  return (
    <Field id={id} label={label} error={error} hint={hint}>
      <textarea
        id={id}
        aria-invalid={error ? true : undefined}
        aria-describedby={descriptionId}
        className={`${fieldControlClass} resize-y ${className ?? ""}`}
        {...props}
      />
    </Field>
  );
}

export function PasswordField({
  id,
  label,
  error,
  hint,
  ...props
}: Omit<TextInputProps, "type">) {
  const [visible, setVisible] = useState(false);
  const descriptionId = error ? `${id}-error` : hint ? `${id}-hint` : undefined;

  return (
    <Field id={id} label={label} error={error} hint={hint}>
      <div className="relative">
        <input
          id={id}
          type={visible ? "text" : "password"}
          aria-invalid={error ? true : undefined}
          aria-describedby={descriptionId}
          className={`${fieldControlClass} pr-20`}
          {...props}
        />
        <button
          type="button"
          className="absolute inset-y-0 right-3 my-auto h-9 rounded-sm px-2 text-xs font-medium text-muted hover:text-ink focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-signal"
          aria-label={visible ? "Hide password" : "Show password"}
          onClick={() => setVisible((current) => !current)}
        >
          {visible ? "Hide" : "Show"}
        </button>
      </div>
    </Field>
  );
}
