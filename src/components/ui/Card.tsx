"use client";

import { motion, type HTMLMotionProps } from "motion/react";
import { cn } from "@/lib/cn";

/** Card with a subtle spring lift on hover — beui.dev tilt-card inspired, simplified. */
export default function Card({
  className,
  ...props
}: HTMLMotionProps<"div">) {
  return (
    <motion.div
      whileHover={{ y: -4 }}
      transition={{ type: "spring", stiffness: 300, damping: 24 }}
      className={cn(
        "rounded-2xl panel",
        className
      )}
      {...props}
    />
  );
}
