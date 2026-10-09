import type { Instrumentation } from "next";

export const onRequestError: Instrumentation.onRequestError = (error, request, context) => {
  // Route templates and digests allow grouping without logging tokens, cookies or user input.
  const digest = error && typeof error === "object" && "digest" in error
    ? String(error.digest) : undefined;
  console.error("[server-error]", JSON.stringify({
    event: "next_request_error",
    route: context.routePath,
    method: request.method,
    kind: context.routeType,
    digest,
    timestamp: new Date().toISOString(),
  }));
};
