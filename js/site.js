(function () {
  const GLYPHS = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789$#/._";

  const randGlyph = () => GLYPHS[Math.floor(Math.random() * GLYPHS.length)];

  const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

  function scramble(text) {
    return Array.from(text, (ch) => (ch === " " ? " " : randGlyph())).join("");
  }

  function linkify(el, text) {
    const href = el.dataset.href;
    if (!href) return;
    const idx = text.indexOf(href);
    if (idx === -1) return;
    el.replaceChildren();
    if (idx > 0) el.append(text.slice(0, idx));
    const a = document.createElement("a");
    a.href = href;
    a.target = "_blank";
    a.rel = "noopener noreferrer";
    a.textContent = href;
    el.append(a);
    if (idx + href.length < text.length) el.append(text.slice(idx + href.length));
  }

  async function printLine(el, text, cancelled) {
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

  async function printPane(root, cancelled) {
    const lines = root.querySelectorAll(".ln");
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

  async function printTerm(term) {
    const gen = Number(term.dataset.gen || "0") + 1;
    term.dataset.gen = String(gen);
    const cancelled = () => term.dataset.gen !== String(gen);
    term.classList.add("is-pictured");
    const pane = term.querySelector(".pane.is-on") || term.querySelector(".term-body");
    await printPane(pane, cancelled);
    if (cancelled()) return;
    term.classList.add("is-printed");
  }

  function bindTabs() {
    const term = document.querySelector("#projects .term");
    if (!term) return;
    const tabs = term.querySelectorAll(".term-tabs .tab");
    tabs.forEach((tab) => {
      tab.addEventListener("click", async () => {
        const id = tab.dataset.tab;
        tabs.forEach((t) => {
          t.classList.toggle("is-on", t === tab);
          t.setAttribute("aria-selected", t === tab ? "true" : "false");
        });
        term.querySelectorAll(".pane").forEach((pane) => {
          const on = pane.id === id;
          pane.classList.toggle("is-on", on);
          pane.hidden = !on;
          pane.querySelectorAll(".ln").forEach((ln) => {
            ln.textContent = "";
          });
        });
        term.classList.remove("is-printed");
        await printTerm(term);
      });
    });
  }

  function bindChromeTabs() {
    const links = document.querySelectorAll('.tabstrip a[href^="#"], .hero-ls a[href^="#"]');
    const sync = () => {
      const hash = location.hash || "#home";
      document.querySelectorAll(".tabstrip .tab").forEach((link) => {
        link.classList.toggle("is-on", link.getAttribute("href") === hash);
      });
    };
    links.forEach((link) => {
      link.addEventListener("click", (event) => {
        const id = link.getAttribute("href");
        const target = document.querySelector(id);
        if (!target) return;
        event.preventDefault();
        target.scrollIntoView({ behavior: "smooth", block: "start" });
        history.pushState(null, "", id);
        sync();
      });
    });
    window.addEventListener("hashchange", sync);
    sync();
  }

  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  function settleReveal(el) {
    el.classList.remove("is-revealing");
    el.classList.add("is-revealed");
  }

  function revealEl(el) {
    if (el.classList.contains("is-revealing") || el.classList.contains("is-revealed")) return;
    if (reduceMotion) {
      settleReveal(el);
      if (el.hasAttribute("data-print") && !el.classList.contains("is-printed")) printTerm(el);
      return;
    }
    el.classList.add("is-revealing");
    const onEnd = (event) => {
      if (event.target !== el || event.animationName !== "boot-diag") return;
      el.removeEventListener("animationend", onEnd);
      window.setTimeout(() => settleReveal(el), 100);
    };
    el.addEventListener("animationend", onEnd);
    window.setTimeout(() => {
      if (el.classList.contains("is-revealing")) settleReveal(el);
    }, 560);
    if (el.hasAttribute("data-print") && !el.classList.contains("is-printed")) printTerm(el);
  }

  function isInView(el) {
    const rect = el.getBoundingClientRect();
    const viewH = window.innerHeight;
    if (rect.height <= 0 || rect.bottom <= 0 || rect.top >= viewH) return false;
    const visible = Math.min(rect.bottom, viewH) - Math.max(rect.top, 0);
    return visible / rect.height >= 0.12;
  }

  function watchReveal() {
    const nodes = document.querySelectorAll("[data-reveal]");
    const revealIfVisible = (el) => {
      if (el.classList.contains("is-revealing") || el.classList.contains("is-revealed")) return;
      if (isInView(el)) revealEl(el);
    };
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          revealEl(entry.target);
          io.unobserve(entry.target);
        });
      },
      { threshold: 0.12, rootMargin: "0px 0px -8% 0px" }
    );
    nodes.forEach((el) => {
      io.observe(el);
      revealIfVisible(el);
    });
    window.addEventListener(
      "scroll",
      () => {
        nodes.forEach(revealIfVisible);
      },
      { passive: true }
    );
  }

  async function printHero() {
    const nodes = document.querySelectorAll(".hero [data-k]");
    for (const el of nodes) {
      await printLine(el, el.dataset.k ?? "", () => false);
    }
  }

  function start() {
    bindTabs();
    bindChromeTabs();
    printHero();
    watchReveal();
  }

  if (document.body.classList.contains("booted")) start();
  else document.addEventListener("ec:ready", start, { once: true });
})();
