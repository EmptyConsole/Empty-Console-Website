const GLYPHS =
  "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789$#/._";

const randGlyph = () => GLYPHS[Math.floor(Math.random() * GLYPHS.length)];

const sleep = (ms: number) =>
  new Promise((resolve) => {
    window.setTimeout(resolve, ms);
  });

function scramble(text: string) {
  return Array.from(text, (ch) => (ch === " " ? " " : randGlyph())).join("");
}

function linkify(el: HTMLElement, text: string) {
  const href = el.dataset.href;
  if (!href) return;
  let needle = href;
  let idx = text.indexOf(href);
  if (idx === -1 && href.startsWith("mailto:")) {
    needle = href.slice("mailto:".length);
    idx = text.indexOf(needle);
  }
  if (idx === -1) return;
  el.replaceChildren();
  if (idx > 0) el.append(text.slice(0, idx));
  const a = document.createElement("a");
  a.href = href;
  a.target = "_blank";
  a.rel = "noopener noreferrer";
  a.textContent = needle;
  el.append(a);
  if (idx + needle.length < text.length) {
    el.append(text.slice(idx + needle.length));
  }
}

async function printLine(
  el: HTMLElement,
  text: string,
  cancelled: () => boolean,
) {
  const frames = 4;
  for (let i = 0; i < frames; i += 1) {
    if (cancelled()) return;
    el.textContent = scramble(text);
    await sleep(28);
  }
  el.textContent = "";
  for (let i = 0; i < text.length; i += 1) {
    if (cancelled()) return;
    el.textContent = text.slice(0, i + 1);
    if (i % 2 === 1) await sleep(12);
  }
  if (cancelled()) return;
  el.textContent = text;
  linkify(el, text);
}

async function printPane(root: Element, cancelled: () => boolean) {
  const lines = root.querySelectorAll<HTMLElement>(".ln");
  for (const line of lines) {
    if (cancelled()) return;
    const text = line.dataset.k ?? "";
    if (text === "") {
      line.textContent = "";
      continue;
    }
    await printLine(line, text, cancelled);
  }
}

function cancelPrint(term: HTMLElement) {
  const gen = Number(term.dataset.gen || "0") + 1;
  term.dataset.gen = String(gen);
  delete term.dataset.printing;
}

function clearTermLines(term: HTMLElement) {
  term.querySelectorAll<HTMLElement>(".ln").forEach((line) => {
    line.textContent = "";
  });
}

async function printTerm(term: HTMLElement) {
  const gen = Number(term.dataset.gen || "0") + 1;
  term.dataset.gen = String(gen);
  const cancelled = () => term.dataset.gen !== String(gen);
  term.dataset.printing = "1";
  term.classList.remove("is-printed");
  term.classList.add("is-pictured");
  const pane =
    term.querySelector(".pane.is-on") || term.querySelector(".term-body");
  if (!pane) return;
  pane.querySelectorAll<HTMLElement>(".ln").forEach((line) => {
    line.textContent = "";
  });
  await printPane(pane, cancelled);
  if (cancelled()) return;
  delete term.dataset.printing;
  term.classList.add("is-printed");
}

export function startSite(): () => void {
  let stopped = false;
  const abort = new AbortController();
  const { signal } = abort;
  const reduceMotion = window.matchMedia(
    "(prefers-reduced-motion: reduce)",
  ).matches;

  function bindTabs() {
    const term = document.querySelector<HTMLElement>("#projects .term");
    if (!term) return;
    const tabs = term.querySelectorAll<HTMLElement>(".term-tabs .tab");
    tabs.forEach((tab) => {
      tab.addEventListener(
        "click",
        async () => {
          if (stopped) return;
          const id = tab.dataset.tab;
          tabs.forEach((item) => {
            item.classList.toggle("is-on", item === tab);
            item.setAttribute(
              "aria-selected",
              item === tab ? "true" : "false",
            );
          });
          term.querySelectorAll<HTMLElement>(".pane").forEach((pane) => {
            const on = pane.id === id;
            pane.classList.toggle("is-on", on);
            pane.hidden = !on;
            pane.querySelectorAll<HTMLElement>(".ln").forEach((ln) => {
              ln.textContent = "";
            });
          });
          term.classList.remove("is-printed");
          await printTerm(term);
        },
        { signal },
      );
    });
  }

  function bindChromeTabs() {
    const links = document.querySelectorAll<HTMLAnchorElement>(
      '.tabstrip a[href^="#"], .hero-ls a[href^="#"]',
    );
    const sync = () => {
      const hash = location.hash || "#home";
      document.querySelectorAll<HTMLAnchorElement>(".tabstrip .tab").forEach(
        (link) => {
          link.classList.toggle("is-on", link.getAttribute("href") === hash);
        },
      );
    };
    links.forEach((link) => {
      link.addEventListener(
        "click",
        (event) => {
          const id = link.getAttribute("href");
          if (!id) return;
          const target = document.querySelector(id);
          if (!target) return;
          event.preventDefault();
          target.scrollIntoView({ behavior: "smooth", block: "start" });
          history.pushState(null, "", id);
          sync();
        },
        { signal },
      );
    });
    window.addEventListener("hashchange", sync, { signal });
    sync();
  }

  const revealToken = new WeakMap<HTMLElement, number>();
  let revealSeq = 0;

  function bumpReveal(el: HTMLElement) {
    const token = (revealSeq += 1);
    revealToken.set(el, token);
    return token;
  }

  function isCurrentReveal(el: HTMLElement, token: number) {
    return revealToken.get(el) === token;
  }

  function isReplayable(el: HTMLElement) {
    return el.hasAttribute("data-print");
  }

  function settleReveal(el: HTMLElement) {
    el.classList.remove("is-revealing", "is-unloading");
    el.classList.add("is-revealed");
  }

  function resetTerm(el: HTMLElement) {
    cancelPrint(el);
    el.classList.remove(
      "is-revealing",
      "is-revealed",
      "is-unloading",
      "is-printed",
      "is-pictured",
    );
    clearTermLines(el);
  }

  function revealEl(el: HTMLElement) {
    if (
      el.classList.contains("is-revealing") ||
      el.classList.contains("is-revealed")
    ) {
      return;
    }
    const token = bumpReveal(el);
    el.classList.remove("is-unloading");
    if (reduceMotion) {
      settleReveal(el);
      if (shouldPrintOnReveal(el)) void printTerm(el);
      return;
    }
    void el.offsetWidth;
    el.classList.add("is-revealing");
    const onEnd = (event: AnimationEvent) => {
      if (event.target !== el || event.animationName !== "boot-diag") return;
      el.removeEventListener("animationend", onEnd);
      if (!el.classList.contains("is-revealing")) return;
      if (!isCurrentReveal(el, token)) return;
      window.setTimeout(() => {
        if (!isCurrentReveal(el, token)) return;
        settleReveal(el);
      }, 100);
    };
    el.addEventListener("animationend", onEnd, { signal });
    window.setTimeout(() => {
      if (!isCurrentReveal(el, token)) return;
      if (el.classList.contains("is-revealing")) settleReveal(el);
    }, 720);
    if (shouldPrintOnReveal(el)) void printTerm(el);
  }

  function concealEl(el: HTMLElement) {
    if (!isReplayable(el)) return;
    if (el.classList.contains("is-unloading")) return;
    if (
      !el.classList.contains("is-revealing") &&
      !el.classList.contains("is-revealed")
    ) {
      return;
    }
    const token = bumpReveal(el);
    cancelPrint(el);
    el.classList.remove("is-revealing", "is-revealed");
    if (reduceMotion) {
      resetTerm(el);
      return;
    }
    void el.offsetWidth;
    el.classList.add("is-unloading");
    const finish = () => {
      if (!isCurrentReveal(el, token)) return;
      resetTerm(el);
    };
    const onEnd = (event: AnimationEvent) => {
      if (event.target !== el || event.animationName !== "boot-diag-out") return;
      el.removeEventListener("animationend", onEnd);
      if (!el.classList.contains("is-unloading")) return;
      finish();
    };
    el.addEventListener("animationend", onEnd, { signal });
    window.setTimeout(finish, 720);
  }

  function chromeBottom() {
    const chrome = document.querySelector<HTMLElement>(".chrome");
    return chrome ? chrome.getBoundingClientRect().bottom : 0;
  }

  function isInView(el: HTMLElement) {
    const rect = el.getBoundingClientRect();
    const viewH = window.innerHeight;
    if (rect.height <= 0 || rect.bottom <= 0 || rect.top >= viewH) return false;
    const visible = Math.min(rect.bottom, viewH) - Math.max(rect.top, 0);
    return visible / rect.height >= 0.12;
  }

  function isFullyOnScreen(el: HTMLElement) {
    const rect = el.getBoundingClientRect();
    const viewH = window.innerHeight;
    const viewW = window.innerWidth;
    if (rect.height <= 0 || rect.width <= 0) return false;
    const topPad = chromeBottom();
    const availH = viewH - topPad;
    const fullyHoriz = rect.left >= -2 && rect.right <= viewW + 2;
    if (rect.width <= viewW + 4 && !fullyHoriz) return false;
    if (rect.height <= availH + 4) {
      return rect.top >= topPad - 2 && rect.bottom <= viewH + 2;
    }
    return rect.top <= topPad + 2 && rect.bottom >= viewH - 2;
  }

  function shouldPrintOnReveal(el: HTMLElement) {
    return el.hasAttribute("data-print");
  }

  function shouldReveal(el: HTMLElement) {
    if (el.matches(".hero-term")) return isInView(el);
    if (el.matches(".term[data-print]")) return isFullyOnScreen(el);
    return isInView(el);
  }

  const nodes = Array.from(
    document.querySelectorAll<HTMLElement>("[data-reveal]"),
  );
  const io = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        const el = entry.target as HTMLElement;
        if (isReplayable(el)) {
          if (entry.isIntersecting) {
            if (shouldReveal(el)) revealEl(el);
          } else {
            concealEl(el);
          }
          return;
        }
        if (!entry.isIntersecting) return;
        if (!shouldReveal(el)) return;
        revealEl(el);
        io.unobserve(el);
      });
    },
    { threshold: [0, 0.12, 1], rootMargin: "0px" },
  );

  function watchReveal() {
    const syncReveal = (el: HTMLElement) => {
      if (isReplayable(el)) {
        if (shouldReveal(el)) revealEl(el);
        else if (!isInView(el)) concealEl(el);
        return;
      }
      if (
        el.classList.contains("is-revealing") ||
        el.classList.contains("is-revealed")
      ) {
        return;
      }
      if (shouldReveal(el)) {
        revealEl(el);
        io.unobserve(el);
      }
    };
    nodes.forEach((el) => {
      io.observe(el);
      syncReveal(el);
    });
    window.addEventListener(
      "scroll",
      () => {
        nodes.forEach(syncReveal);
      },
      { passive: true, signal },
    );
    window.addEventListener(
      "resize",
      () => {
        nodes.forEach(syncReveal);
      },
      { signal },
    );
  }

  async function printHero() {
    const heroNodes = document.querySelectorAll<HTMLElement>(
      ".hero-copy [data-k]",
    );
    for (const el of heroNodes) {
      if (stopped) return;
      await printLine(el, el.dataset.k ?? "", () => stopped);
    }
  }

  bindTabs();
  bindChromeTabs();
  void printHero();
  watchReveal();

  return () => {
    stopped = true;
    abort.abort();
    io.disconnect();
  };
}
