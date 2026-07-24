"use client";

import type { InputHTMLAttributes, TextareaHTMLAttributes } from "react";

/** Minimal underline field — focus only brightens the bottom edge. */
const baseInline = "inline-edit w-full max-w-full bg-transparent px-0.5 py-0.5 text-inherit leading-inherit";

export function InlineText({
  className = "",
  ...props
}: InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      type="text"
      spellCheck
      className={`${baseInline} ${className}`}
      {...props}
    />
  );
}

export function InlineArea({
  className = "",
  rows = 3,
  ...props
}: TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <textarea
      rows={rows}
      spellCheck
      className={`${baseInline} resize-none ${className}`}
      {...props}
    />
  );
}
