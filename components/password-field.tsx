"use client";

import { useId, useState } from "react";

type PasswordFieldProps = {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  required?: boolean;
  minLength?: number;
  disabled?: boolean;
};

function EyeIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-4 w-4" aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 12s3.75-6.75 9.75-6.75S21.75 12 21.75 12 18 18.75 12 18.75 2.25 12 2.25 12Z" />
      <circle cx="12" cy="12" r="2.5" />
    </svg>
  );
}

function EyeOffIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-4 w-4" aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" d="M3 3 21 21" />
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M10.58 10.58a2 2 0 1 0 2.84 2.84M6.23 6.23C4.4 7.4 3.14 9.28 2.25 12c1.5 4.5 5.05 6.75 9.75 6.75 1.94 0 3.69-.38 5.23-1.13M14.82 5.45A10.76 10.76 0 0 0 12 5.25C7.3 5.25 3.75 7.5 2.25 12a13.32 13.32 0 0 0 3.1 4.93"
      />
    </svg>
  );
}

export function PasswordField({
  label,
  value,
  onChange,
  placeholder = "パスワードを入力",
  required = true,
  minLength = 6,
  disabled = false
}: PasswordFieldProps) {
  const [showPassword, setShowPassword] = useState(false);
  const inputId = useId();

  return (
    <label className="block space-y-1" htmlFor={inputId}>
      <span className="text-xs font-medium text-starsub">{label}</span>
      <div className="relative">
        <input
          id={inputId}
          type={showPassword ? "text" : "password"}
          value={value}
          onChange={(event) => onChange(event.target.value)}
          required={required}
          minLength={minLength}
          placeholder={placeholder}
          disabled={disabled}
          className="w-full rounded-xl border border-violet/35 bg-void/60 px-3 py-2 pr-10 text-sm text-star outline-none placeholder:text-starsub/70 focus:border-violet-glow focus:ring-1 focus:ring-violet-glow/35 disabled:opacity-60"
        />
        <button
          type="button"
          onClick={() => setShowPassword((prev) => !prev)}
          disabled={disabled}
          className="absolute inset-y-0 right-2 my-auto inline-flex h-7 w-7 items-center justify-center rounded-md text-starsub transition hover:bg-violet/15 hover:text-star disabled:opacity-50"
          aria-label={showPassword ? "パスワードを非表示" : "パスワードを表示"}
          aria-pressed={showPassword}
        >
          {showPassword ? <EyeOffIcon /> : <EyeIcon />}
        </button>
      </div>
    </label>
  );
}
