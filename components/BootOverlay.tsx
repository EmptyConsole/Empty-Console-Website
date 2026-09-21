"use client";

import { useEffect, useRef, useState } from "react";

const LOAD_TEXT = "$ ./load empty-console";

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export default function BootOverlay({ onDone }: { onDone: () => void }) {
  const [text, setText] = useState("");
  const [showCursor, setShowCursor] = useState(true);
  const [fading, setFading] = useState(false);
  const onDoneRef = useRef(onDone);
  const skipRef = useRef<(() => void) | null>(null);

  onDoneRef.current = onDone;

  useEffect(() => {
    let cancelled = false;
    let done = false;
    let skipped = false;

    if ("scrollRestoration" in history) history.scrollRestoration = "manual";
    window.scrollTo(0, 0);
    document.body.classList.add("booting");

    const finish = () => {
      if (cancelled || done) return;
      done = true;
      window.scrollTo(0, 0);
      if (location.hash) {
        history.replaceState(null, "", location.pathname + location.search);
      }
      document.body.classList.remove("booting", "unfolding");
      document.body.classList.add("booted");
      onDoneRef.current();
    };

    const skipNow = () => {
      skipped = true;
      finish();
    };
    skipRef.current = skipNow;

    const reduceMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;

    if (reduceMotion) {
      finish();
      return () => {
        cancelled = true;
      };
    }

    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Enter" || event.key === "Escape") skipNow();
    };
    document.addEventListener("keydown", onKey);

    void (async () => {
      await sleep(280);
      if (cancelled || skipped) return;

      setShowCursor(false);
      setText("");
      for (const ch of LOAD_TEXT) {
        if (cancelled || skipped) return;
        setText((current) => current + ch);
        await sleep(28);
      }
      if (cancelled || skipped) return;

      setShowCursor(true);
      await sleep(280);
      if (cancelled || skipped) return;

      setFading(true);
      await sleep(180);
      if (cancelled || skipped) return;
      finish();
    })();

    return () => {
      cancelled = true;
      document.removeEventListener("keydown", onKey);
    };
  }, []);

  return (
    <div
      id="boot"
      className={fading ? "fading" : undefined}
      aria-live="polite"
      onClick={() => skipRef.current?.()}
    >
      <div className="boot-prompt">
        {text}
        {showCursor ? <span className="cursor">█</span> : null}
      </div>
    </div>
  );
}
