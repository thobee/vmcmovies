"use client";

import { useId } from "react";

/** Off-screen honeypot — leave empty. */
export default function HoneypotField() {
  const id = useId();
  return (
    <div aria-hidden className="absolute -left-[9999px] h-0 w-0 overflow-hidden">
      <label htmlFor={id}>Website</label>
      <input id={id} name="website" type="text" tabIndex={-1} autoComplete="off" />
    </div>
  );
}
