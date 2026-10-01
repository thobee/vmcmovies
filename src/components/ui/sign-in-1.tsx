"use client";

import Image from "next/image";
import * as React from "react";
import { cn } from "@/lib/cn";

type AuthAction = {
  label: string;
  icon?: React.ReactNode;
  onClick: () => void;
};

interface AuthFormProps extends React.HTMLAttributes<HTMLDivElement> {
  logoSrc: string;
  logoAlt?: string;
  title: string;
  description?: string;
  primaryAction: AuthAction;
  secondaryActions?: AuthAction[];
  skipAction?: {
    label: string;
    onClick: () => void;
  };
  footerContent?: React.ReactNode;
}

const actionButton =
  "inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-full px-4 text-sm font-bold transition duration-300 ease-[cubic-bezier(0.32,0.72,0,1)] hover:scale-[1.02] active:scale-[0.98]";

const AuthForm = React.forwardRef<HTMLDivElement, AuthFormProps>(
  (
    {
      className,
      logoSrc,
      logoAlt = "Company logo",
      title,
      description,
      primaryAction,
      secondaryActions,
      skipAction,
      footerContent,
      ...props
    },
    ref,
  ) => {
    return (
      <div className={cn("flex flex-col items-center justify-center", className)}>
        <div className="w-full max-w-sm rounded-[2rem] bg-white/[0.04] p-1.5 ring-1 ring-white/10">
          <div
            ref={ref}
            className="fade-up rounded-[calc(2rem-0.375rem)] border border-white/10 bg-[#080a09] p-6 shadow-[inset_0_1px_1px_rgba(255,255,255,0.08),0_24px_80px_rgba(0,0,0,0.42)]"
            {...props}
          >
            <div className="text-center">
              <div className="mb-4 flex justify-center">
                <Image
                  src={logoSrc}
                  alt={logoAlt}
                  width={48}
                  height={48}
                  unoptimized
                  className="h-12 w-12 rounded-[4px] object-contain"
                />
              </div>
              <h2
                className="text-2xl font-semibold tracking-tight text-white"
                style={{ fontFamily: "var(--font-display)" }}
              >
                {title}
              </h2>
              {description && (
                <p className="mt-2 text-sm leading-6 text-white/50">{description}</p>
              )}
            </div>

            <div className="mt-6 grid gap-4">
              <button
                type="button"
                onClick={primaryAction.onClick}
                className={cn(actionButton, "bg-emerald-400 text-black shadow-[0_12px_32px_rgba(52,211,153,0.28)]")}
              >
                {primaryAction.icon}
                {primaryAction.label}
              </button>

              {secondaryActions && secondaryActions.length > 0 && (
                <div className="relative my-1">
                  <div className="absolute inset-0 flex items-center">
                    <span className="w-full border-t border-white/10" />
                  </div>
                  <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-[#080a09] px-2 text-white/36">or</span>
                  </div>
                </div>
              )}

              <div className="grid gap-2">
                {secondaryActions?.map((action) => (
                  <button
                    key={action.label}
                    type="button"
                    className={cn(actionButton, "border border-white/10 bg-white/[0.04] text-white hover:bg-white/[0.08]")}
                    onClick={action.onClick}
                  >
                    {action.icon}
                    {action.label}
                  </button>
                ))}
              </div>
            </div>

            {skipAction && (
              <button
                type="button"
                className={cn(actionButton, "mt-4 border border-white/10 bg-transparent text-white/68 hover:bg-white/[0.05] hover:text-white")}
                onClick={skipAction.onClick}
              >
                {skipAction.label}
              </button>
            )}
          </div>
        </div>

        {footerContent && (
          <div className="fade-up delay-2 mt-6 w-full max-w-sm px-8 text-center text-sm text-white/45">
            {footerContent}
          </div>
        )}
      </div>
    );
  },
);

AuthForm.displayName = "AuthForm";

export { AuthForm };
