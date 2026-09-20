"use client";

import { useCallback, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/components/auth/AuthProvider";
import { useSiteToast } from "@/components/ui/SiteToast";
import {
  IDLE_ACTIVITY_THROTTLE_MS,
  USER_IDLE_TIMEOUT_MS,
} from "@/lib/auth/idle";

const ACTIVITY_EVENTS = ["mousedown", "keydown", "scroll", "touchstart", "pointerdown"] as const;

export default function SessionIdleMonitor() {
  const { user, setUser } = useAuth();
  const router = useRouter();
  const toast = useSiteToast();
  const deadlineRef = useRef(0);
  const lastBumpRef = useRef(0);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const signingOutRef = useRef(false);

  const signOutIdle = useCallback(async () => {
    if (signingOutRef.current) return;
    signingOutRef.current = true;
    try {
      await fetch("/api/auth/logout", { method: "POST" });
    } catch {
      /* still clear client state */
    }
    setUser(null);
    toast({
      tone: "info",
      title: "Signed out",
      message: "You were signed out after a period of inactivity.",
    });
    router.refresh();
    signingOutRef.current = false;
  }, [setUser, router, toast]);

  useEffect(() => {
    if (!user) {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
        timerRef.current = null;
      }
      return;
    }

    const schedule = () => {
      if (timerRef.current) clearTimeout(timerRef.current);
      const delay = Math.max(0, deadlineRef.current - Date.now());
      timerRef.current = setTimeout(() => {
        if (Date.now() >= deadlineRef.current) {
          void signOutIdle();
        } else {
          schedule();
        }
      }, delay);
    };

    const bump = () => {
      const now = Date.now();
      if (now - lastBumpRef.current < IDLE_ACTIVITY_THROTTLE_MS) return;
      lastBumpRef.current = now;
      deadlineRef.current = now + USER_IDLE_TIMEOUT_MS;
      schedule();
    };

    deadlineRef.current = Date.now() + USER_IDLE_TIMEOUT_MS;
    schedule();

    for (const event of ACTIVITY_EVENTS) {
      window.addEventListener(event, bump, { passive: true });
    }
    const onVisibility = () => {
      if (document.visibilityState === "visible" && Date.now() >= deadlineRef.current) {
        void signOutIdle();
      } else if (document.visibilityState === "visible") {
        schedule();
      }
    };
    document.addEventListener("visibilitychange", onVisibility);

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
      for (const event of ACTIVITY_EVENTS) {
        window.removeEventListener(event, bump);
      }
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, [user, signOutIdle]);

  return null;
}
