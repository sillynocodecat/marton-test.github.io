/* MARATHON // TAU CETI IV — fan landing interactions */
(() => {
  "use strict";

  const shotMode = new URLSearchParams(location.search).has("shot"); // static capture
  const reduced =
    window.matchMedia("(prefers-reduced-motion: reduce)").matches || shotMode;
  if (shotMode) {
    document.documentElement.classList.add("static");
    // headless captures render from the document top: shift content instead of scrolling
    const at = new URLSearchParams(location.search).get("at");
    const target = at && document.getElementById(at);
    if (target) {
      const top = Math.round(target.getBoundingClientRect().top + window.scrollY);
      document.body.style.transform = `translateY(${-top}px)`;
    }
  }

  /* ---------- boot sequence ---------- */
  const boot = document.getElementById("boot");
  const bootLog = document.getElementById("boot-log");

  const BOOT_LINES = [
    "UESC FIELD TERMINAL v7.2.1",
    "ESTABLISHING UPLINK ........ OK",
    "SIGNAL SOURCE // TAU CETI IV",
    "RUNNER AUTHENTICATION ..... OK",
    "CAUTION: 30,000 SOULS UNACCOUNTED FOR",
    "> WELCOME TO THE MARATHON_",
  ];

  function endBoot() {
    if (!boot || boot.classList.contains("done")) return;
    boot.classList.add("done");
    setTimeout(() => boot.classList.add("gone"), 750);
  }

  if (boot && bootLog && !reduced) {
    document.body.style.overflow = "hidden";

    // time-based typing: stays correct in throttled/background tabs
    const CHAR_MS = 7;
    const LINE_PAUSE = 110;
    const schedule = [];
    let acc = 0;
    BOOT_LINES.forEach((line) => {
      schedule.push({ line, start: acc, end: acc + line.length * CHAR_MS });
      acc += line.length * CHAR_MS + LINE_PAUSE;
    });
    const total = acc + 240;
    const t0 = performance.now();
    let raf = 0;

    const finish = () => {
      cancelAnimationFrame(raf);
      document.body.style.overflow = "";
      endBoot();
    };

    const render = () => {
      const elapsed = performance.now() - t0;
      let out = "";
      for (const s of schedule) {
        if (elapsed >= s.end) {
          out += s.line + "\n";
        } else {
          if (elapsed > s.start) out += s.line.slice(0, Math.ceil((elapsed - s.start) / CHAR_MS));
          break;
        }
      }
      bootLog.textContent = out;
      if (elapsed >= total) finish();
      else raf = requestAnimationFrame(render);
    };
    raf = requestAnimationFrame(render);

    // hard safety: never keep the page locked, even if rAF is suspended
    setTimeout(() => {
      if (!boot.classList.contains("done")) {
        bootLog.textContent = BOOT_LINES.join("\n");
        finish();
      }
    }, 5000);

    boot.addEventListener("click", finish);
  } else if (boot) {
    boot.classList.add("gone");
  }

  /* ---------- nav ---------- */
  const nav = document.getElementById("nav");
  const onScroll = () => nav.classList.toggle("scrolled", window.scrollY > 40);
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  /* active nav link */
  const navLinks = [...document.querySelectorAll(".nav-links a")];
  const sections = navLinks
    .map((a) => document.getElementById(a.dataset.nav))
    .filter(Boolean);

  if ("IntersectionObserver" in window && sections.length) {
    const navObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          navLinks.forEach((a) =>
            a.classList.toggle("is-active", a.dataset.nav === entry.target.id)
          );
        });
      },
      { rootMargin: "-40% 0px -55% 0px" }
    );
    sections.forEach((s) => navObserver.observe(s));
  }

  /* ---------- scroll reveal ---------- */
  const revealEls = document.querySelectorAll(".reveal");
  if ("IntersectionObserver" in window && !reduced) {
    const revealObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          entry.target.classList.add("in");
          revealObserver.unobserve(entry.target);
        });
      },
      { threshold: 0.18, rootMargin: "0px 0px -8% 0px" }
    );
    revealEls.forEach((el) => revealObserver.observe(el));
  } else {
    revealEls.forEach((el) => el.classList.add("in"));
  }

  /* ---------- counters ---------- */
  const counters = document.querySelectorAll("[data-count]");
  const fmt = (n, comma) =>
    comma ? Math.round(n).toLocaleString("en-US") : String(Math.round(n));

  function animateCounter(el) {
    const target = parseInt(el.dataset.count, 10);
    const comma = el.hasAttribute("data-comma");
    if (reduced) {
      el.textContent = fmt(target, comma);
      return;
    }
    const dur = 1400;
    const t0 = performance.now();
    const tick = (t) => {
      const p = Math.min((t - t0) / dur, 1);
      const eased = 1 - Math.pow(1 - p, 3);
      el.textContent = fmt(target * eased, comma);
      if (p < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  }

  if ("IntersectionObserver" in window) {
    const counterObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          animateCounter(entry.target);
          counterObserver.unobserve(entry.target);
        });
      },
      { threshold: 0.6 }
    );
    counters.forEach((el) => counterObserver.observe(el));
  } else {
    counters.forEach((el) => {
      el.textContent = fmt(parseInt(el.dataset.count, 10), el.hasAttribute("data-comma"));
    });
  }

  /* ---------- terminal autotype ---------- */
  const term = document.getElementById("term-body");
  const TERM_LINES = [
    "> 2794.07.25 — CONTACT LOST: UESC MARATHON",
    "> 2795.11.02 — COLONY STATUS: UNKNOWN",
    "> 2812.03.13 — BIO-EVENT LOGGED // QUARANTINE",
    "> 2827.--.-- — ANOMALY ERUPTION DETECTED",
    "> 2893.__.__ — SALVAGE AUTHORIZATION GRANTED",
    "> 30,000 SOULS. ZERO REMAINS.",
    "> RUN._",
  ];

  if (term) {
    let started = false;
    const runTerm = () => {
      if (started) return;
      started = true;
      if (reduced) {
        term.textContent = TERM_LINES.join("\n");
        return;
      }
      let li = 0;
      let ci = 0;
      let done = "";
      const typeTerm = () => {
        if (li >= TERM_LINES.length) return;
        const cur = TERM_LINES[li];
        ci++;
        if (ci >= cur.length) {
          done += cur + "\n";
          term.textContent = done;
          li++;
          ci = 0;
          setTimeout(typeTerm, 320);
        } else {
          term.textContent = done + cur.slice(0, ci) + "▓";
          setTimeout(typeTerm, 18);
        }
      };
      typeTerm();
    };

    if ("IntersectionObserver" in window) {
      const termObserver = new IntersectionObserver(
        (entries) => {
          if (entries.some((e) => e.isIntersecting)) {
            runTerm();
            termObserver.disconnect();
          }
        },
        { threshold: 0.4 }
      );
      termObserver.observe(term);
    } else {
      runTerm();
    }
  }

  /* ---------- compass strip ---------- */
  const compass = document.getElementById("compass-track");
  if (compass) {
    const cards = ["N", "NE", "E", "SE", "S", "SW", "W", "NW"];
    let html = "";
    // two identical halves for a seamless -50% loop
    for (let half = 0; half < 2; half++) {
      for (let i = 0; i < 16; i++) {
        const cardinal = i % 2 === 0 ? cards[(i / 2) % 8] : null;
        const deg = String(i * 22.5 % 360).padStart(3, "0");
        html += cardinal
          ? `<span class="card">${cardinal}</span>`
          : `<span>${deg}°</span>`;
        html += `<span>·</span><span>${(200 + i * 7) % 999}</span>`;
      }
    }
    compass.innerHTML = html;
  }

  /* ---------- generic tabs (zones + runners) ---------- */
  function setupTabs(listSelector, btnSelector, panelSelector) {
    const lists = document.querySelectorAll(listSelector);
    lists.forEach((list) => {
      const buttons = [...list.querySelectorAll(btnSelector)];
      const root = list.parentElement;
      const panels = [...root.querySelectorAll(panelSelector)];

      const activate = (btn) => {
        buttons.forEach((b) => {
          const on = b === btn;
          b.classList.toggle("is-active", on);
          b.setAttribute("aria-selected", on ? "true" : "false");
          b.tabIndex = on ? 0 : -1;
        });
        panels.forEach((p) => {
          const on = p.id === btn.dataset.target;
          p.classList.toggle("is-active", on);
          p.toggleAttribute("hidden", !on);
        });
      };

      buttons.forEach((b) => (b.tabIndex = b.classList.contains("is-active") ? 0 : -1));

      buttons.forEach((btn, i) => {
        btn.addEventListener("click", () => activate(btn));
        btn.addEventListener("keydown", (e) => {
          let next = null;
          if (e.key === "ArrowDown" || e.key === "ArrowRight") next = buttons[(i + 1) % buttons.length];
          if (e.key === "ArrowUp" || e.key === "ArrowLeft") next = buttons[(i - 1 + buttons.length) % buttons.length];
          if (e.key === "Home") next = buttons[0];
          if (e.key === "End") next = buttons[buttons.length - 1];
          if (next) {
            e.preventDefault();
            next.focus();
            activate(next);
          }
        });
      });
    });
  }

  setupTabs(".zone-tabs", ".zone-btn", ".zone-panel");
  setupTabs(".runner-list", ".runner-btn", ".runner-panel");

  /* ---------- NuCaloric ration dispenser (gimmick) ---------- */
  const dispenseBtn = document.getElementById("na-dispense");
  if (dispenseBtn) {
    // product names are letters-only (NuCaloric face has no digits/punct);
    // every number lives in the mono spec line instead
    const RATIONS = [
      { name: "GREENLOAF", spec: "RESTORES 45 HP // OVER 6S", flavor: "Compressed marsh algae. Legally classified as food." },
      { name: "HAZARD JELLY", spec: "+30% HAZARD RESISTANCE // 120S", flavor: "Coats the stomach lining. Tastes of warning labels." },
      { name: "PROTEIN SLURRY", spec: "SHIELD REGEN +25% // 90S", flavor: "Nine essential proteins. Two known toxins." },
      { name: "SELF REVIVE GEL", spec: "SELF-REVIVE CHARGE ×1", flavor: "Death is a temporary logistics problem." },
      { name: "STIM PASTE", spec: "SPRINT HEAT −20% // 60S", flavor: "Move faster. Think about it later." },
      { name: "FIELD RATION", spec: "CURES TOXIN // HEALS 20 HP", flavor: "Best before: the day the colony fell." },
    ];
    const nameEl = document.getElementById("na-name");
    const specEl = document.getElementById("na-spec");
    const flavorEl = document.getElementById("na-flavor");
    const idxEl = document.getElementById("na-idx");
    const ghostEl = document.querySelector(".nm-ghost");
    const win = document.getElementById("na-window");
    let i = 0;

    const render = () => {
      const r = RATIONS[i];
      nameEl.textContent = r.name;
      specEl.textContent = r.spec;
      flavorEl.textContent = r.flavor;
      idxEl.textContent = String(i + 1).padStart(2, "0");
      if (ghostEl) ghostEl.textContent = r.name[0];
      if (!reduced) {
        win.classList.remove("vend");
        void win.offsetWidth; // restart the reveal animation
        win.classList.add("vend");
      }
    };

    dispenseBtn.addEventListener("click", () => {
      i = (i + 1) % RATIONS.length;
      render();
    });
  }

  /* ---------- extraction loop autoplay ---------- */
  const loop = document.getElementById("loop");
  if (loop && !reduced) {
    const steps = [...loop.querySelectorAll(".loop-step")];
    let idx = 0;
    let paused = false;
    let onScreen = false;

    loop.addEventListener("mouseenter", () => (paused = true));
    loop.addEventListener("mouseleave", () => (paused = false));

    if ("IntersectionObserver" in window) {
      new IntersectionObserver(
        (entries) => (onScreen = entries.some((e) => e.isIntersecting)),
        { threshold: 0.2 }
      ).observe(loop);
    } else {
      onScreen = true;
    }

    setInterval(() => {
      if (paused || !onScreen || document.hidden) return;
      idx = (idx + 1) % steps.length;
      steps.forEach((s, i) => s.classList.toggle("is-active", i === idx));
    }, 2200);
  }

  /* ---------- custom cursor ---------- */
  const cursor = document.getElementById("cursor");
  const finePointer = window.matchMedia("(pointer: fine)").matches;

  if (cursor && finePointer && !reduced) {
    document.documentElement.classList.add("has-cursor");
    let cx = innerWidth / 2, cy = innerHeight / 2;
    let tx = cx, ty = cy;

    window.addEventListener("mousemove", (e) => {
      tx = e.clientX;
      ty = e.clientY;
      cursor.classList.add("live");
    }, { passive: true });

    const lerp = () => {
      cx += (tx - cx) * 0.22;
      cy += (ty - cy) * 0.22;
      cursor.style.transform = `translate(${cx}px, ${cy}px)`;
      requestAnimationFrame(lerp);
    };
    requestAnimationFrame(lerp);

    const interactive = "a, button, [role='tab']";
    document.addEventListener("mouseover", (e) => {
      cursor.classList.toggle("on-target", !!e.target.closest(interactive));
    });
  }
})();
