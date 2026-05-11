"use client";

import { forwardRef, useId } from "react";
import type { InputHTMLAttributes, TextareaHTMLAttributes } from "react";

/**
 * Input — BRIEF §8.4
 * States: default | focused | filled | error
 * Default: 0.5px Graphite 600 border (Tailwind border is 1px — minimum stroke).
 * Focused: Brand 600 border + 2px Brand 200 focus ring (global focus-visible).
 * Error:   Danger border + error message below.
 */

type BaseProps = {
  label: string;
  hint?: string;
  error?: string;
  required?: boolean;
  className?: string;
};

const fieldBase =
  "block w-full rounded-md bg-white px-3 py-2 text-body text-graphite-900 placeholder:text-graphite-400 transition-colors duration-150 focus:outline-none focus:border-brand-600";

const borderDefault = "border border-graphite-600";
const borderError =
  "border border-[var(--color-danger-text)] focus:border-[var(--color-danger-text)]";

type InputProps = BaseProps &
  Omit<InputHTMLAttributes<HTMLInputElement>, "className">;

export const Input = forwardRef<HTMLInputElement, InputProps>(function Input(
  { label, hint, error, required, className = "", id, ...rest },
  ref,
) {
  const reactId = useId();
  const fieldId = id ?? reactId;
  const describedBy = error
    ? `${fieldId}-error`
    : hint
      ? `${fieldId}-hint`
      : undefined;

  return (
    <div className={`flex flex-col gap-1 ${className}`.trim()}>
      <label
        htmlFor={fieldId}
        className="text-caption text-graphite-800 font-medium"
      >
        {label}
        {required && <span className="text-safety-600 ml-1">*</span>}
      </label>
      <input
        ref={ref}
        id={fieldId}
        aria-invalid={error ? "true" : undefined}
        aria-describedby={describedBy}
        aria-required={required || undefined}
        className={`${fieldBase} ${error ? borderError : borderDefault}`}
        {...rest}
      />
      {error ? (
        <p
          id={`${fieldId}-error`}
          className="text-caption text-[var(--color-danger-text)]"
        >
          {error}
        </p>
      ) : hint ? (
        <p id={`${fieldId}-hint`} className="text-caption text-graphite-600">
          {hint}
        </p>
      ) : null}
    </div>
  );
});

type TextareaProps = BaseProps &
  Omit<TextareaHTMLAttributes<HTMLTextAreaElement>, "className">;

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  function Textarea(
    { label, hint, error, required, className = "", id, ...rest },
    ref,
  ) {
    const reactId = useId();
    const fieldId = id ?? reactId;
    const describedBy = error
      ? `${fieldId}-error`
      : hint
        ? `${fieldId}-hint`
        : undefined;
    return (
      <div className={`flex flex-col gap-1 ${className}`.trim()}>
        <label
          htmlFor={fieldId}
          className="text-caption text-graphite-800 font-medium"
        >
          {label}
          {required && <span className="text-safety-600 ml-1">*</span>}
        </label>
        <textarea
          ref={ref}
          id={fieldId}
          aria-invalid={error ? "true" : undefined}
          aria-describedby={describedBy}
          aria-required={required || undefined}
          className={`${fieldBase} min-h-24 ${error ? borderError : borderDefault}`}
          {...rest}
        />
        {error ? (
          <p
            id={`${fieldId}-error`}
            className="text-caption text-[var(--color-danger-text)]"
          >
            {error}
          </p>
        ) : hint ? (
          <p id={`${fieldId}-hint`} className="text-caption text-graphite-600">
            {hint}
          </p>
        ) : null}
      </div>
    );
  },
);
