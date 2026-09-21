"use client";

import { useEffect, useState } from "react";
import BootOverlay from "@/components/BootOverlay";
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
      {
        k: "Shoot us an email! consoleempty@gmail.com",
        className: "ln mag",
        href: "mailto:consoleempty@gmail.com",
      },
      { k: "Message us! Discord: emptyconsolegamedev" },
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

export default function Home() {
  const [booted, setBooted] = useState(false);

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
            <a className="tab" href="#projects">
              projects
            </a>
            <a className="tab" href="#team">
              usr
            </a>
          </nav>
          <div className="chip" tabIndex={0}>
            v0.0.1
          </div>
        </header>

        <section id="home" className="hero">
          <div className="hero-row">
            <div className="hero-copy">
              <p className="kicker" data-k="./empty-console" />
              <h1 data-k="EMPTY CONSOLE" />
              <p className="prompt">
                <span data-k="$ ls /" />
                <span className="cursor">█</span>
              </p>
              <p className="hero-ls">
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
                className="term"
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
                  <div className="ln" data-k="role:    code, design" />
                  <div className="ln" data-k="status:  active" />
                  <div className="ln dim" data-k="tty:     pts/2" />
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
                  <div className="ln" data-k="role:    code, marketing" />
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
