import { useEffect, useRef, useState } from "react";
import { useLocation } from "react-router-dom";

/**
 * Scrolls the window to an element id with smooth behaviour.
 * Falls back gracefully if the element does not exist yet.
 */
export function scrollToId(id: string) {
  if (id === "top") {
    window.scrollTo({ top: 0, behavior: "smooth" });
    return;
  }
  const el = document.getElementById(id);
  if (!el) return;
  const headerOffset = 84;
  const top = el.getBoundingClientRect().top + window.scrollY - headerOffset;
  window.scrollTo({ top, behavior: "smooth" });
}

/**
 * ScrollManager — restores scroll position on navigation and supports
 * deep links of the form `/#section` (scroll to section after mount).
 */
export function ScrollManager() {
  const location = useLocation();
  const [prevHash, setPrevHash] = useState<string | null>(null);

  const firstRender = useRef(true);

  useEffect(() => {
    if (firstRender.current) {
      firstRender.current = false;
    }
  }, []);

  useEffect(() => {
    const hash = location.hash.replace(/^#/, "");
    if (prevHash && prevHash === hash) return;

    if (hash) {
      // Slight delay so the target section is painted.
      const t = window.setTimeout(() => scrollToId(hash), 60);
      setPrevHash(hash);
      return () => window.clearTimeout(t);
    }

    if (prevHash !== null && prevHash !== "") {
      // navigated from a deep link to plain route — no scroll needed
      setPrevHash(null);
    } else {
      window.scrollTo({ top: 0, behavior: "auto" });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.pathname, location.hash]);

  return null;
}
