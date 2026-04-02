export function getSessionIdFromUrl() {
  if (typeof window === "undefined") {
    return null;
  }

  const sessionId = new URLSearchParams(window.location.search).get("sessionId");
  return sessionId && sessionId.length > 0 ? sessionId : null;
}

export function replaceSessionIdInUrl(sessionId: string | null) {
  if (typeof window === "undefined") {
    return;
  }

  const url = new URL(window.location.href);

  if (sessionId) {
    url.searchParams.set("sessionId", sessionId);
  } else {
    url.searchParams.delete("sessionId");
  }

  window.history.replaceState(window.history.state, "", `${url.pathname}${url.search}`);
}
