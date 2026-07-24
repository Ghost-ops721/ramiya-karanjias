"use client";

import type { ReactNode } from "react";

const fieldClass =
  "admin-field mt-1 w-full px-3 py-3 text-xl leading-relaxed";

const labelClass = "block text-[1.05rem] font-semibold text-ink";

export function EditField({
  label,
  value,
  onChange,
  type = "text",
  rows,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  type?: "text" | "email" | "url";
  rows?: number;
}) {
  return (
    <label className="block">
      <span className={labelClass}>{label}</span>
      {rows ? (
        <textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          rows={rows}
          className={fieldClass}
          spellCheck
        />
      ) : (
        <input
          type={type}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className={fieldClass}
          spellCheck={type === "text"}
        />
      )}
    </label>
  );
}

export function EditColorField({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <label className="block">
      <span className={labelClass}>{label}</span>
      <div className="mt-1 flex items-center gap-3">
        <input
          type="color"
          value={normalizeHex(value)}
          onChange={(e) => onChange(e.target.value)}
          className="h-14 w-16 cursor-pointer border border-rule bg-paper p-1"
          aria-label={`${label} color picker`}
        />
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className={`${fieldClass} mt-0 flex-1`}
          spellCheck={false}
        />
      </div>
    </label>
  );
}

export function EditPanel({
  title,
  children,
}: {
  title: string;
  children: ReactNode;
}) {
  return (
    <section className="mb-8 border border-rule bg-paper-deep/40 p-5">
      <p className="kicker mb-4">{title}</p>
      <div className="space-y-4">{children}</div>
    </section>
  );
}

function normalizeHex(value: string) {
  const v = value.trim();
  if (/^#[0-9a-fA-F]{6}$/.test(v)) return v;
  return "#000000";
}
