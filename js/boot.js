(function () {
  const overlay = document.getElementById("boot");
  const promptEl = document.getElementById("boot-prompt");
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

  if ("scrollRestoration" in history) history.scrollRestoration = "manual";
  window.scrollTo(0, 0);

  let done = false;

  async function typeText(el, text, speed) {
    el.textContent = "";
    for (const ch of text) {
      el.textContent += ch;
      await sleep(speed);
      if (window.__ecSkipBoot) return;
    }
  }

  function finish() {
    if (done) return;
    done = true;
    window.scrollTo(0, 0);
    if (location.hash) history.replaceState(null, "", location.pathname + location.search);
    document.body.classList.remove("booting", "unfolding");
    document.body.classList.add("booted");
    document.dispatchEvent(new Event("ec:ready"));
  }

  function skipNow() {
    window.__ecSkipBoot = true;
    if (overlay) overlay.remove();
    finish();
  }

  async function reveal() {
    if (!overlay) {
      finish();
      return;
    }
    if (window.__ecSkipBoot || reduceMotion) {
      overlay.remove();
      finish();
      return;
    }

    overlay.classList.add("fading");
    await sleep(180);
    overlay.remove();
    finish();
  }

  async function run() {
    if (reduceMotion) {
      if (overlay) overlay.remove();
      finish();
      return;
    }

    document.addEventListener("keydown", (e) => {
      if (e.key === "Enter" || e.key === "Escape") skipNow();
    });
    if (overlay) overlay.addEventListener("click", skipNow);

    await sleep(280);
    if (window.__ecSkipBoot) return;

    promptEl.textContent = "";
    await typeText(promptEl, "$ ./load empty-console", 28);
    if (window.__ecSkipBoot) return;

    const cursor = document.createElement("span");
    cursor.className = "cursor";
    cursor.textContent = "█";
    promptEl.appendChild(cursor);
    await sleep(280);
    if (window.__ecSkipBoot) return;

    await reveal();
  }

  run();
})();
