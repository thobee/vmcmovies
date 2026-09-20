"use client";

import { Eye, EyeSlash, Lock } from "@phosphor-icons/react";
import { useId, useState } from "react";

import {
  PASSWORD_HINT,
  PASSWORD_MAX_LENGTH,
  PASSWORD_MIN_LENGTH,
  passwordFieldHint,
} from "@/lib/validation/password";

export default function PasswordField({
  id: idProp,
  label,
  value,
  onChange,
  autoComplete,
  minLength,
  maxLength,
  placeholder,
  showPolicyHint = false,
}: {
  id?: string;
  label: string;
  value: string;
  onChange: (v: string) => void;
  autoComplete: string;
  minLength?: number;
  maxLength?: number;
  placeholder?: string;
  /** Show 8–12 character guidance (signup / reset). */
  showPolicyHint?: boolean;
}) {
  const autoId = useId();
  const id = idProp ?? autoId;
  const [visible, setVisible] = useState(false);
  const policyMessage = showPolicyHint ? passwordFieldHint(value) : null;
  const policyOk = showPolicyHint && value.length >= PASSWORD_MIN_LENGTH && value.length <= PASSWORD_MAX_LENGTH;

  return (
    <div>
      <label htmlFor={id} className="mb-2 block text-sm font-medium text-white/80">
        {label}
      </label>
      <div className="relative">
        <Lock className="pointer-events-none absolute left-4 top-1/2 h-[18px] w-[18px] -translate-y-1/2 text-white/35" weight="light" />
        <input
          id={id}
          type={visible ? "text" : "password"}
          required
          minLength={minLength}
          maxLength={maxLength}
          autoComplete={autoComplete}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className="auth-field w-full rounded-2xl py-3.5 pl-11 pr-12 text-sm text-white placeholder:text-white/30 focus:outline-none"
        />
        <button
          type="button"
          onClick={() => setVisible((v) => !v)}
          aria-label={visible ? "Hide password" : "Show password"}
          className="absolute right-0 top-0 flex h-full w-12 items-center justify-center text-white/35 hover:text-white/70"
        >
          {visible ? <EyeSlash className="h-[18px] w-[18px]" weight="light" /> : <Eye className="h-[18px] w-[18px]" weight="light" />}
        </button>
      </div>
      {showPolicyHint && (
        <p
          className={
            policyOk
              ? "mt-1.5 text-xs text-emerald-400/80"
              : policyMessage && value.length > 0
                ? "mt-1.5 text-xs text-amber-300/90"
                : "mt-1.5 text-xs text-white/40"
          }
        >
          {policyOk ? "Password length looks good." : (policyMessage ?? PASSWORD_HINT)}
        </p>
      )}
    </div>
  );
}
