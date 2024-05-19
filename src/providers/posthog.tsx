"use client";

import { isProd } from "@/lib/utils";
import posthog from "posthog-js";
import { PostHogProvider } from "posthog-js/react";

if (typeof window !== "undefined") {
  posthog.init(process.env.NEXT_PUBLIC_POSTHOG_KEY!, {
    api_host: process.env.NEXT_PUBLIC_POSTHOG_HOST,
    enable_recording_console_log: true,
    disable_session_recording: !isProd,
    loaded: (ph) => {
      if (!isProd) ph.debug();
    },
  });
}

interface CSPostHogProviderProps {
  children: React.ReactNode;
}

export function CSPostHogProvider({ children }: CSPostHogProviderProps) {
  return <PostHogProvider client={posthog}>{children}</PostHogProvider>;
}
