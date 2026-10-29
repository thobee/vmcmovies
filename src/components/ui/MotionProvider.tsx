"use client";

import type { ReactNode } from "react";
import { MotionConfig } from "motion/react";

/** Makes every motion/react animation honour the OS "reduce motion" setting. */
export default function MotionProvider({ children }: { children: ReactNode }) {
  return <MotionConfig reducedMotion="user">{children}</MotionConfig>;
}
