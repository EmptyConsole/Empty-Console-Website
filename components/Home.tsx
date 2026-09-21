"use client";

import { useEffect, useState } from "react";
import BootOverlay from "@/components/BootOverlay";
import { startSite } from "@/lib/site";

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
          <p className="scroll-hint">v scroll to mount</p>
        </section>

        <main className="page">
          <section id="projects" className="block">
            <h2 className="block-label" data-reveal>
              # ./projects
            </h2>
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
          </section>

          <section id="team" className="block">
            <h2 className="block-label" data-reveal>
              # ./usr
            </h2>
            <div className="team-row">
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
          </section>
        </main>

        <footer className="foot" data-reveal="">
          empty-console v0.0.1 by empty console
        </footer>
      </div>
    </>
  );
}
