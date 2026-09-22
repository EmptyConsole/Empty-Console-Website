"use client";

import { useEffect, useRef, useState } from "react";
import BootOverlay from "@/components/BootOverlay";
import SnakeField from "@/components/SnakeField";
import { startSite } from "@/lib/site";

type HeroTermId = "contact" | "github" | "play";

type HeroLine = {
  k: string;
  className?: string;
  href?: string;
};

const HERO_TERMS: {
  id: HeroTermId;
  title: string;
  lines: HeroLine[];
}[] = [
  {
    id: "contact",
    title: "cat ./contact",
    lines: [
      { k: "$ cat ./contact" },
      { k: "Shoot us an email!", className: "ln mag" },
      {
        k: "consoleempty@gmail.com",
        href: "mailto:consoleempty@gmail.com",
      },
      { k: "Message us!", className: "ln mag" },
      { k: "Discord: emptyconsolegamedev" },
    ],
  },
  {
    id: "github",
    title: "cat ./github",
    lines: [
      { k: "$ cat ./github" },
      { k: "Check us out on github!", className: "ln mag" },
      {
        k: "https://github.com/EmptyConsole",
        href: "https://github.com/EmptyConsole",
      },
      {
        k: "Our latest project! https://github.com/EmptyConsole/Student-Atlas",
        href: "https://github.com/EmptyConsole/Student-Atlas",
      },
    ],
  },
  {
    id: "play",
    title: "cat ./play",
    lines: [
      { k: "$ cat ./play" },
      {
        k: "Check out our Itch.io! https://emptyconsole.itch.io/",
        className: "ln mag",
        href: "https://emptyconsole.itch.io/",
      },
      {
        k: "Play a game! https://emptyconsole.itch.io/bugged-out",
        href: "https://emptyconsole.itch.io/bugged-out",
      },
    ],
  },
];

const READABLE_KEY = "ec-readable";

export default function Home() {
  const [booted, setBooted] = useState(false);
  const [readable, setReadable] = useState(false);
  const addSnake = useRef<(() => void) | null>(null);
  const shiftTimer = useRef<number | null>(null);

  useEffect(() => {
    const on = localStorage.getItem(READABLE_KEY) === "1";
    setReadable(on);
    document.documentElement.classList.toggle("readable", on);
    const frame = requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        document.documentElement.classList.add("ready");
      });
    });
    return () => {
      cancelAnimationFrame(frame);
      if (shiftTimer.current != null) window.clearTimeout(shiftTimer.current);
    };
  }, []);

  function toggleReadable() {
    setReadable((prev) => {
      const next = !prev;
      const root = document.documentElement;
      root.classList.toggle("readable", next);
      localStorage.setItem(READABLE_KEY, next ? "1" : "0");
      const reduce = window.matchMedia(
        "(prefers-reduced-motion: reduce)",
      ).matches;
      if (!reduce) {
        root.classList.remove("is-shifting");
        void root.offsetWidth;
        root.classList.add("is-shifting");
        if (shiftTimer.current != null) window.clearTimeout(shiftTimer.current);
        shiftTimer.current = window.setTimeout(() => {
          root.classList.remove("is-shifting");
          shiftTimer.current = null;
        }, 700);
      }
      return next;
    });
  }

  useEffect(() => {
    if (!booted) return;
    return startSite();
  }, [booted]);

  return (
    <>
      {booted ? null : <BootOverlay onDone={() => setBooted(true)} />}
      <div id="site">
        <header className="chrome">
          <nav className="tabstrip" aria-label="sections">
            <a className="tab is-on" href="#home">
              Home
            </a>
            <a className="tab" href="#meet">
              meet
            </a>
            <a className="tab" href="#projects">
              projects
            </a>
            <a className="tab" href="#team">
              usr
            </a>
          </nav>
          <div className="chrome-end">
            <button
              type="button"
              className="chip snake-add"
              disabled={!booted}
              onClick={() => addSnake.current?.()}
            >
              + snake
            </button>
            <button
              type="button"
              className={readable ? "chip readable-toggle is-on" : "chip readable-toggle"}
              aria-pressed={readable}
              onClick={toggleReadable}
            >
              readable
            </button>
            <div className="chip" tabIndex={0}>
              v0.0.1
            </div>
          </div>
        </header>

        <section id="home" className="hero">
          {booted ? <SnakeField addRef={addSnake} /> : null}
          <div className="hero-row">
            <div className="hero-copy">
              <p className="kicker" data-k="./empty-console" />
              <h1 data-k="EMPTY CONSOLE" />
              <p className="prompt">
                <span data-k="$ ls /" />
                <span className="cursor">█</span>
              </p>
              <p className="hero-ls">
                <a href="#meet">meet/</a>
                <a href="#projects">projects/</a>
                <a href="#team">usr/</a>
              </p>
            </div>
            <div className="hero-stack" aria-label="links">
              {HERO_TERMS.map((term) => (
                <article
                  key={term.id}
                  className="panel term hero-term"
                  data-hero={term.id}
                  data-print=""
                  data-reveal=""
                >
                  <div className="titlebar">{term.title}</div>
                  <div className="term-body">
                    {term.lines.map((line) => (
                      <div
                        key={line.k}
                        className={line.className ?? "ln"}
                        data-k={line.k}
                        {...(line.href ? { "data-href": line.href } : {})}
                      />
                    ))}
                  </div>
                </article>
              ))}
            </div>
          </div>
          <p className="scroll-hint">v scroll to mount</p>
        </section>

        <main className="page">
          <section id="meet" className="block">
            <h2 className="block-label" data-reveal>
              # Meet the Team!
            </h2>
            <div className="term-slot">
              <div className="term-stub" aria-hidden="true">
                <span>$ ls ./meet</span>
                <span>empty_console  contact</span>
              </div>
              <article
                className="term deck"
                data-print=""
                data-reveal=""
                tabIndex={0}
              >
                <div className="term-tabs" role="tablist" aria-label="Meet the Team">
                  <button
                    className="tab is-on"
                    role="tab"
                    aria-selected="true"
                    data-tab="m1"
                    id="tab-m1"
                    type="button"
                  >
                    Empty Console
                  </button>
                  <button
                    className="tab"
                    role="tab"
                    aria-selected="false"
                    data-tab="m2"
                    id="tab-m2"
                    type="button"
                  >
                    Contact
                  </button>
                </div>
                <div className="term-frame panel">
                  <div className="titlebar">cat README</div>
                  <div className="term-body">
                    <div
                      className="pane is-on"
                      id="m1"
                      role="tabpanel"
                      aria-labelledby="tab-m1"
                    >
                      <div className="ln" data-k="$ cat ./meet/empty_console/README" />
                      <div className="ln mag" data-k="Empty Console" />
                      <div className="ln dim" data-k="/empty/meet/empty_console" />
                      <div className="ln" data-k="" />
                      <div className="ln" data-k="name:             Empty Console" />
                      <div className="ln" data-k="size:             3" />
                      <div
                        className="ln"
                        data-k="current project:  Student Atlas"
                        data-href="https://github.com/EmptyConsole/Student-Atlas"
                        data-link="Student Atlas"
                      />
                      <div className="ln" data-k="status:           active" />
                      <div
                        className="ln"
                        data-k="description:      We build apps and websites for real life uses for schools, developers, and gamers!"
                      />
                    </div>
                    <div
                      className="pane"
                      id="m2"
                      role="tabpanel"
                      aria-labelledby="tab-m2"
                      hidden
                    >
                      <div className="ln" data-k="$ cat ./meet/contact" />
                      <div className="ln mag" data-k="Contact" />
                      <div className="ln dim" data-k="/empty/meet/contact" />
                      <div className="ln" data-k="" />
                      <div
                        className="ln"
                        data-k="github:   https://github.com/EmptyConsole"
                        data-href="https://github.com/EmptyConsole"
                      />
                      <div className="ln" data-k="discord:  emptyconsolegamedev" />
                      <div
                        className="ln"
                        data-k="email:    consoleempty@gmail.com"
                        data-href="mailto:consoleempty@gmail.com"
                      />
                    </div>
                  </div>
                </div>
              </article>
            </div>
          </section>

          <section id="projects" className="block">
            <h2 className="block-label" data-reveal>
              # ./projects
            </h2>
            <div className="term-slot">
              <div className="term-stub" aria-hidden="true">
                <span>$ ls ./projects</span>
                <span>student_atlas  propose</span>
              </div>
              <article
                className="term deck"
                data-print=""
                data-reveal=""
                tabIndex={0}
              >
              <div className="term-tabs" role="tablist" aria-label="projects">
                <button
                  className="tab is-on"
                  role="tab"
                  aria-selected="true"
                  data-tab="p1"
                  id="tab-p1"
                  type="button"
                >
                  Student Atlas
                </button>
                <button
                  className="tab"
                  role="tab"
                  aria-selected="false"
                  data-tab="p2"
                  id="tab-p2"
                  type="button"
                >
                  Propose Project
                </button>
              </div>
              <div className="term-frame panel">
                <div className="titlebar">cat README</div>
                <div className="term-body">
                  <div
                    className="pane is-on"
                    id="p1"
                    role="tabpanel"
                    aria-labelledby="tab-p1"
                  >
                    <div
                      className="ln"
                      data-k="$ cat ./projects/student_atlas/README"
                    />
                    <div className="ln mag" data-k="Student Atlas" />
                    <div
                      className="ln dim"
                      data-k="/empty/projects/student_atlas"
                    />
                    <div className="ln" data-k="" />
                    <div
                      className="ln"
                      data-k="path:    /empty/projects/student_atlas"
                    />
                    <div className="ln" data-k="status:  in progress" />
                    <div className="ln" data-k="type:    website" />
                    <div
                      className="ln"
                      data-k="readme:  A course catalog selector for all students and schools."
                    />
                    <div
                      className="ln"
                      data-k="github:  https://github.com/EmptyConsole/Student-Atlas"
                      data-href="https://github.com/EmptyConsole/Student-Atlas"
                    />
                  </div>
                  <div
                    className="pane"
                    id="p2"
                    role="tabpanel"
                    aria-labelledby="tab-p2"
                    hidden
                  >
                    <div
                      className="ln"
                      data-k="$ cat ./projects/propose/README"
                    />
                    <div className="ln mag" data-k="Propose Project" />
                    <div className="ln dim" data-k="/empty/projects/propose" />
                    <div className="ln" data-k="" />
                    <div className="ln" data-k="path:    /empty/projects/propose" />
                    <div className="ln" data-k="status:  untracked" />
                    <div className="ln" data-k="type:    [open]" />
                    <div
                      className="ln"
                      data-k="readme:  a slot waiting on the next build"
                    />
                    <div className="ln" data-k="" />
                    <div className="ln dim" data-k="# TODO: propose a project" />
                  </div>
                </div>
              </div>
            </article>
            </div>
          </section>

          <section id="team" className="block">
            <h2 className="block-label" data-reveal>
              # ./usr
            </h2>
            <div className="team-row">
              <div className="term-slot">
                <div className="term-stub" aria-hidden="true">
                  <span>$ whoami</span>
                  <span>emey</span>
                </div>
                <article
                  className="panel term member"
                  data-print=""
                  data-reveal=""
                  tabIndex={0}
                  style={{ ["--member-accent" as string]: "#2dd4bf" }}
                >
                <div className="titlebar">usr@emey</div>
                <div className="term-body">
                  <div className="avatar-frame">
                    <img
                      className="avatar"
                      src="/assets/emey.webp"
                      alt="Emey"
                      width={256}
                      height={256}
                    />
                  </div>
                  <div className="ln" data-k="$ whoami" />
                  <div className="ln mag" data-k="Emey / Tooffu" />
                  <div className="ln" data-k="discord: qorachniuphorbia" />
                  <div className="ln" data-k="role:    music, art, database" />
                  <div className="ln" data-k="status:  active" />
                  <div className="ln dim" data-k="tty:     pts/1" />
                </div>
              </article>
              </div>
              <div className="term-slot">
                <div className="term-stub" aria-hidden="true">
                  <span>$ whoami</span>
                  <span>shyguy</span>
                </div>
                <article
                  className="panel term member"
                  data-print=""
                  data-reveal=""
                  tabIndex={0}
                  style={{ ["--member-accent" as string]: "#e23b3b" }}
                >
                <div className="titlebar">usr@shyguy</div>
                <div className="term-body">
                  <div className="avatar-frame">
                    <img
                      className="avatar"
                      src="/assets/shyguy.webp"
                      alt="ShyGuy"
                      width={256}
                      height={256}
                    />
                  </div>
                  <div className="ln" data-k="$ whoami" />
                  <div className="ln mag" data-k="ShyGuy" />
                  <div className="ln" data-k="discord: shyguygamedev" />
                  <div
                    className="ln"
                    data-k="role:    product positioning, code"
                  />
                  <div className="ln" data-k="status:  active" />
                  <div className="ln dim" data-k="tty:     pts/2" />
                </div>
              </article>
              </div>
              <div className="term-slot">
                <div className="term-stub" aria-hidden="true">
                  <span>$ whoami</span>
                  <span>hucklberi</span>
                </div>
                <article
                  className="panel term member"
                  data-print=""
                  data-reveal=""
                  tabIndex={0}
                  style={{ ["--member-accent" as string]: "#f5c518" }}
                >
                <div className="titlebar">usr@hucklberi</div>
                <div className="term-body">
                  <div className="avatar-frame">
                    <img
                      className="avatar"
                      src="/assets/hucklberi.png"
                      alt="hucklberi"
                      width={256}
                      height={256}
                    />
                  </div>
                  <div className="ln" data-k="$ whoami" />
                  <div className="ln mag" data-k="HF_ang / hucklberi" />
                  <div className="ln" data-k="discord: basicallyahucklberi" />
                  <div className="ln" data-k="role:    code, design, art" />
                  <div className="ln" data-k="status:  active" />
                  <div className="ln dim" data-k="tty:     pts/3" />
                </div>
              </article>
              </div>
            </div>
          </section>
        </main>

        <footer className="foot" data-reveal="">
          empty-console v0.0.1 by empty console
        </footer>
      </div>
    </>
  );
}
