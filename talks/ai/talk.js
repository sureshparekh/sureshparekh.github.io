// "Something on AI": one continuous GSAP timeline with a label after every beat.
// Next/back tween the playhead between labels, so going back plays the
// animation in reverse instead of cutting.
(function () {
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const SITE = "https://sureshparekh.github.io/";
  const chan = "BroadcastChannel" in window ? new BroadcastChannel("talk-ai") : null;
  const PRESENTER = new URLSearchParams(location.search).has("presenter");

  // ------------------------------------------------------------------ steps
  // Each step: name (presenter view), notes (talking points), build(at) adds
  // tweens to the master timeline starting at time `at`.
  const STEPS = [];
  const step = (name, notes, build) => STEPS.push({ name, notes, build });

  // ------------------------------------------------------------------ helpers
  let tl, cur = null;
  const IN = { autoAlpha: 1, y: 0, x: 0, scale: 1, filter: "blur(0px)" };
  const show = (sel, at, o = {}) =>
    tl.to(sel, { ...IN, duration: 1, ease: "expo.out", stagger: o.stagger || 0, ...o.v }, at);
  const hide = (sel, at, o = {}) =>
    tl.to(sel, { autoAlpha: 0, y: -22, filter: "blur(8px)", duration: 0.55, ease: "power2.in", stagger: o.stagger || 0, ...o.v }, at);
  const gal = (at, v, d = 2.2) => tl.to(window.GAL, { ...v, duration: d, ease: "power2.inOut" }, at);
  const scene = (id, at) => {
    const n = $("#" + id);
    let t = at;
    if (cur) { tl.to(cur, { autoAlpha: 0, duration: 0.6, ease: "power2.in" }, at); t = at + 0.55; }
    tl.set(n, { autoAlpha: 1 }, t);
    cur = n;
    return t;
  };
  const count = (el, from, to, at, d, fmt) => {
    const o = { v: from };
    el.textContent = fmt(from);
    tl.to(o, { v: to, duration: d, ease: "power2.out", onUpdate: () => (el.textContent = fmt(o.v)) }, at);
  };
  const comma = (v) => Math.round(v).toLocaleString("en-US");
  const splitChars = (el) => {
    const txt = el.textContent;
    el.innerHTML = [...txt].map((c) => `<span class="ch">${c === " " ? "&nbsp;" : c}</span>`).join("");
    return $$(".ch", el);
  };

  const BOTTY = `<svg viewBox="0 0 200 230"><defs><linearGradient id="bh" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#f4f6fb"/><stop offset="1" stop-color="#aeb7cc"/></linearGradient></defs>
    <line x1="100" y1="38" x2="100" y2="14" stroke="#aeb7cc" stroke-width="5" stroke-linecap="round"/>
    <circle class="b-ant" cx="100" cy="11" r="9" fill="#f4a259"/>
    <rect x="10" y="84" width="18" height="38" rx="9" fill="#8f98ad"/><rect x="172" y="84" width="18" height="38" rx="9" fill="#8f98ad"/>
    <rect x="22" y="36" width="156" height="124" rx="42" fill="url(#bh)"/>
    <rect x="40" y="56" width="120" height="82" rx="28" fill="#0d1322"/>
    <g class="b-eyes"><ellipse cx="76" cy="92" rx="11" ry="13" fill="#8fd8ff"/><ellipse cx="124" cy="92" rx="11" ry="13" fill="#8fd8ff"/></g>
    <path d="M82 114 Q100 128 118 114" stroke="#8fd8ff" stroke-width="5" fill="none" stroke-linecap="round"/>
    <circle cx="58" cy="122" r="6" fill="#ff8fa3" opacity=".55"/><circle cx="142" cy="122" r="6" fill="#ff8fa3" opacity=".55"/>
    <rect x="62" y="166" width="76" height="54" rx="18" fill="url(#bh)"/><circle cx="100" cy="192" r="8" fill="#f4a259"/></svg>`;

  // ------------------------------------------------------------------ data
  const TL = [
    { yr: "Nov 2022", em: "💬", b: "ChatGPT", s: "chat with a frozen model" },
    { yr: "Mar 2023", em: "🧠", b: "GPT-4 · Claude", s: "it can reason… a bit" },
    { yr: "2023", em: "🌐", b: "Web browsing", s: "it can look things up" },
    { yr: "Feb 2024", em: "📚", b: "1M-token context", s: "reads a whole bookshelf" },
    { yr: "Sep 2024", em: "🤔", b: "Reasoning models", s: "thinks before it talks" },
    { yr: "Feb 2025", em: "🛠️", b: "Coding agents", s: "it does things" },
    { yr: "Jul 2025", em: "🥇", b: "IMO gold", s: "Maths Olympiad, gold-medal level" },
    { yr: "Sep 2026", em: "🌊", b: "Navier–Stokes", s: "a Millennium Problem?" },
  ];
  const HUB = { id: "jarvis", em: "🤖", n: "Jarvis", r: "the orchestrator: plans, delegates", m: "opus" };
  const TEAM = [
    { id: "stark", em: "🦾", n: "Stark", r: "builds new features", m: "opus" },
    { id: "batman", em: "🦇", n: "Batman", r: "reads the literature", m: "opus" },
    { id: "banner", em: "💚", n: "Banner", r: "is the physics right?", m: "opus", ro: 1 },
    { id: "vision", em: "💎", n: "Vision", r: "did the maths work?", m: "opus", ro: 1 },
    { id: "cap", em: "🛡️", n: "Cap", r: "did the numbers move?", m: "sonnet", ro: 1 },
    { id: "friday", em: "🔍", n: "Friday", r: "attacks the docs", m: "sonnet", ro: 1 },
    { id: "parker", em: "🕷️", n: "Parker", r: "writes the docs", m: "sonnet" },
    { id: "fury", em: "🕶️", n: "Fury", r: "keeps the record", m: "sonnet" },
    { id: "flash", em: "⚡", n: "Flash", r: "faster, same answer", m: "opus" },
    { id: "strange", em: "🌀", n: "Strange", r: "benchmarks vs other codes", m: "opus" },
  ];

  // ------------------------------------------------------------------ the story
  step("Title", ["Welcome. Rafael gave the big picture; this is the practical, personal side.", "Three parts: how we got here, how it works, how I actually use it."], (at) => {
    gal(at, { alpha: 1, zoom: 1.0 }, 3.2);
    tl.to($$("#t-title .ch"), { autoAlpha: 1, y: 0, filter: "blur(0px)", duration: 1.2, ease: "expo.out", stagger: 0.045 }, at + 0.6);
    tl.fromTo("#brand", { autoAlpha: 0, x: -24, filter: "blur(8px)" }, { autoAlpha: 1, x: 0, filter: "blur(0px)", duration: 1.2, ease: "expo.out", immediateRender: false }, at + 1.4);
  });

  step("30 Nov 2022", ["The tweet that started it all: 'try talking with it'.", "Before this, language models were a research curiosity."], (at) => {
    gal(at, { alpha: 0.32, zoom: 1.7, ox: 0.62, oy: -0.25 }, 2.6);
    const t = scene("sc-2022", at);
    tl.to($$("#d2022 .ch"), { autoAlpha: 1, y: 0, duration: 0.9, ease: "expo.out", stagger: 0.04 }, t);
    show("#samTweet", t + 0.5, { v: { duration: 1.4 } });
  });

  step("1M users", ["1 million users in 5 days. Instagram took about 2.5 months."], (at) => {
    show("#stat1m", at);
    count($("#c1m"), 0, 1e6, at + 0.2, 2.2, comma);
  });

  step("Quip: stochastic parrot", ["Sam's own tweet a few days after launch.", "The 'stochastic parrot' debate: is it understanding or just pattern-matching? Keep this question for later."], (at) => {
    show("#q-sam", at, { v: { duration: 0.9, ease: "back.out(1.6)" } });
  });

  step("Timeline 2022–2024", ["Watch the gaps between milestones shrink.", "Browsing = the first form of RAG (more in a minute)."], (at) => {
    hide(["#q-sam", "#stat1m", "#d2022"], at);
    tl.to("#samTweet", { x: -800, y: -10, scale: 0.02, autoAlpha: 0, duration: 1.1, ease: "power3.in" }, at + 0.2);
    gal(at, { alpha: 0.2, zoom: 1.25, ox: 0, oy: -0.9 }, 2.4);
    const t = scene("sc-time", at + 0.9);
    show("#tl-k", t);
    tl.to("#tl-line", { drawSVG: "0% 47%", duration: 1.6, ease: "power2.inOut" }, t);
    $$(".ti").slice(0, 4).forEach((el, i) => show(el, t + 0.3 + i * 0.32, { v: { duration: 0.9 } }));
  });

  step("Timeline 2025–2026 + Elon", ["Reasoning models, then agents, then real maths.", "Elon's yearly prediction. Laugh, but the curve really is steep."], (at) => {
    tl.to("#tl-line", { drawSVG: "0% 100%", duration: 1.8, ease: "power2.inOut" }, at);
    $$(".ti").slice(4).forEach((el, i) => show(el, at + 0.3 + i * 0.34, { v: { duration: 0.9 } }));
    show("#q-elon", at + 1.9, { v: { ease: "back.out(1.5)" } });
  });

  step("Navier–Stokes", ["8 Sep 2026: OpenAI claims a proof of finite-time blow-up for 3D Navier–Stokes, formalised in Lean.", "About 10,000 agents for 88 hours. Remember that number when we get to agents.", "Honest caveats: mathematicians are still checking it; there's a credit fight with Buckmaster (NYU) and Alpöge (Anthropic), who were working on it in parallel with Codex; Clay hasn't awarded anything."], (at) => {
    hide(["#q-elon", "#tl-k"], at);
    tl.to("#tl-group", { y: -270, scale: 0.82, duration: 1.4, ease: "power3.inOut" }, at);
    tl.to($$(".ti").slice(0, 7), { opacity: 0.35, duration: 1 }, at);
    tl.to(".ti:last-child", { scale: 1.12, duration: 1 }, at);
    show("#ns-card", at + 0.7, { v: { duration: 1.3 } });
    tl.to(".vx", { drawSVG: "0% 100%", duration: 2.4, ease: "power2.out", stagger: 0.2 }, at + 0.9);
  });

  step("No internet: the library", ["2022 ChatGPT: trained once, frozen, no internet. Knowledge cutoff.", "Everything it 'knows' is compressed into its weights."], (at) => {
    gal(at, { alpha: 0.1, zoom: 2.2, ox: -0.3, oy: 0 }, 2.4);
    const t = scene("sc-frozen", at);
    show("#ice", t, { v: { duration: 1.4 } });
    show("#sc-frozen .col-right > .h-kicker, #sc-frozen .col-right > .h2, #sc-frozen .col-right > .body", t + 0.35, { stagger: 0.15 });
  });

  step("World Cup", ["Ask it something after its cutoff: it doesn't say 'I don't know', it makes something plausible up.", "(Argentina won, Dec 2022.) This is what hallucination is."], (at) => {
    show("#qa-q", at, { v: { x: 0 } });
    show("#qa-a", at + 0.9);
    tl.fromTo("#stamp", { autoAlpha: 0, scale: 2.4 }, { autoAlpha: 1, scale: 1, duration: 0.45, ease: "power4.in", immediateRender: false }, at + 1.8);
    tl.to("#ice", { x: -10, duration: 0.06, repeat: 5, yoyo: true }, at + 2.25);
  });

  step("Next-token prediction", ["How it works: it gives every possible next word a probability, picks one, repeats. Nothing is looked up.", "Little Red Dots were discovered by JWST in 2023. A model frozen in 2021 has never seen the phrase used that way, so it falls back on older meanings: rashes, ladybugs, a children's book.", "The right answer (black holes, or at least AGN) gets almost nothing. Fluent, confident, and wrong: the no-internet problem. (Numbers are illustrative.)"], (at) => {
    hide(["#qa-q", "#qa-a", "#stamp"], at);
    show("#ntp-s", at + 0.4);
    $$("#ntp-bars .bar").forEach((b, i) => {
      show(b, at + 0.8 + i * 0.18);
      tl.to(b, { "--k": 1, duration: 1.3, ease: "power3.out" }, at + 1 + i * 0.18);
      const pct = $("b", b), v = +pct.dataset.v;
      count(pct, 0, v, at + 1 + i * 0.18, 1.3, (x) => (v < 1 ? x.toFixed(1) : Math.round(x)) + "%");
    });
    show("#ntp-m", at + 2.2);
  });

  step("RAG", ["RAG: before answering, search the web or your own PDFs, paste the best chunks into the prompt, then answer from them.", "Retrieval uses embeddings: text becomes vectors, and we take the nearest neighbours to the question.", "This is what 'internet access' really means for a model."], (at) => {
    gal(at, { alpha: 0.14, zoom: 1.1, ox: 0, oy: 0.8 }, 2.4);
    const t = scene("sc-rag", at);
    show("#sc-rag .top-title > *", t, { stagger: 0.15 });
    tl.to(".pipe-line", { drawSVG: "0% 100%", duration: 1.8, ease: "power2.inOut" }, t + 0.5);
    show("#pipe .node", t + 0.6, { stagger: 0.22, v: { duration: 0.9 } });
    tl.to("#pkts", { autoAlpha: 1, duration: 0.6 }, t + 1.8);
  });

  step("RAG answer", ["Same model, better context, right answer, with a source you can check.", "Takeaway: RAG makes it better informed, not smarter."], (at) => {
    show("#bot2", at);
    show("#rag-a", at + 0.4);
    show("#rag-m", at + 1);
  });

  step("Parameters: what", ["A parameter is one number, one connection weight. One knob.", "Training = nudging all the knobs, over and over, so the predicted next word gets closer to the real one."], (at) => {
    gal(at, { alpha: 0.16, zoom: 1.6, ox: -0.55, oy: 0.1 }, 2.4);
    const t = scene("sc-param", at);
    tl.to("#net circle", { autoAlpha: 1, scale: 1, duration: 0.5, ease: "back.out(2)", stagger: 0.03 }, t);
    tl.to("#net line", { drawSVG: "0% 100%", duration: 0.9, ease: "power1.out", stagger: 0.004 }, t + 0.3);
    show("#w-label", t + 1.6);
    show("#param-text > *", t + 0.4, { stagger: 0.16 });
  });

  step("Parameters: growth", ["Log scale. GPT-3 to today's open models is roughly another factor of 5–10.", "Labs stopped publishing sizes; likely trillions. Your brain: ~100 trillion synapses (not the same thing, but fun)."], (at) => {
    hide(["#net-wrap", "#param-text"], at);
    show("#chart > .h-kicker", at + 0.5);
    $$("#chart .crow").forEach((r, i) => {
      show(r, at + 0.6 + i * 0.2, { v: { duration: 0.8 } });
      const f = Math.max(0.015, (Math.log10(+r.dataset.n) - 8) / 6);
      tl.to($("i", r), { width: Math.round(f * 990), duration: 1.4, ease: "power3.out" }, at + 0.75 + i * 0.2);
    });
    show("#chart .fine", at + 2);
  });

  step("Parameters: what it buys + Jensen", ["More parameters: more stored knowledge, subtler patterns, abilities nobody trained explicitly.", "But: more GPUs to train and run. Jensen, of course, approves."], (at) => {
    hide("#chart", at);
    show("#buys .buy", at + 0.5, { stagger: 0.18 });
    show("#q-jensen", at + 1.4, { v: { ease: "back.out(1.5)" } });
  });

  step("Context window", ["Context = working memory: everything it can see at once.", "4k tokens in 2022 (a few pages), 100k in 2023, 1M now.", "1M tokens ≈ 750k words ≈ 2,500 pages: a thesis, every cited paper and the code, together."], (at) => {
    gal(at, { alpha: 0.14, zoom: 1.3, ox: 0.6, oy: -0.3 }, 2.4);
    const t = scene("sc-ctx", at);
    show("#sc-ctx .col-left > .h-kicker, #sc-ctx .col-left > .h2, #sc-ctx .col-left > .body, #sc-ctx .ctr", t, { stagger: 0.14 });
    show("#win", t + 0.3, { v: { duration: 1.3 } });
    const o = { v: 4096 }, el = $("#ctx-n"), era = $("#ctx-era");
    const upd = () => {
      el.textContent = comma(o.v);
      era.textContent = o.v < 60000 ? "tokens · ChatGPT, 2022" : o.v < 600000 ? "tokens · Claude, 2023" : "tokens · today";
    };
    tl.to(o, { v: 100000, duration: 1.6, ease: "power2.inOut", onUpdate: upd }, t + 1.4);
    tl.to(o, { v: 1000000, duration: 2.2, ease: "power2.inOut", onUpdate: upd }, t + 3.1);
    tl.to("#win-fill", { height: "92%", duration: 3.9, ease: "power2.inOut" }, t + 1.4);
    show("#ctx-eq li", t + 4.4, { stagger: 0.3 });
  });

  step("Lost in the middle", ["A big window doesn't mean perfect attention: details buried in the middle of a long context get missed more often.", "Practical tip: put the important things at the start or end, and ask for specifics."], (at) => {
    hide(["#sc-ctx .col-left", "#sc-ctx .col-right"], at);
    tl.to("#tiles i", { autoAlpha: 1, y: 0, duration: 0.5, ease: "back.out(2)", stagger: 0.03 }, at + 0.5);
    show(".tile-lab", at + 1);
    tl.to($$("#tiles i").slice(6, 14), { opacity: 0.18, filter: "blur(3px)", scale: 0.86, duration: 1, stagger: 0.04 }, at + 1.4);
    show("#lost .body", at + 1.8, { stagger: 0.4 });
  });

  step("Agents", ["Big shift in 2025: agents. A model that can use tools (terminal, files, web, Python) in a loop.", "Think → act → observe the result → think again. It fixes its own errors.", "Claude Code, Codex, etc. live here."], (at) => {
    gal(at, { alpha: 0.18, zoom: 0.9, ox: 0.45, oy: 0 }, 2.4);
    const t = scene("sc-agent", at);
    show("#sc-agent .col-left > *", t, { stagger: 0.16 });
    tl.to("#loop-c", { drawSVG: "0% 100%", duration: 1.6, ease: "power2.inOut" }, t + 0.3);
    show(".lnode", t + 0.7, { stagger: 0.2, v: { ease: "back.out(1.7)" } });
    show("#bot3", t + 1.2);
    tl.to(".orbit-dot", { autoAlpha: 1, duration: 0.5 }, t + 1.6);
    show(".tool", t + 1.5, { stagger: 0.12 });
  });

  step("Quip: Dario 90%", ["Dario, March 2025. Exaggerated in general, but in my own repos it's not far off."], (at) => {
    show("#q-dario", at, { v: { ease: "back.out(1.5)" } });
  });

  step("My Avengers", ["My stack: eleven specialists. Jarvis is the only one I talk to; it plans and calls the others.", "Each has one job: physics, maths, regression checks, literature, docs, speed, benchmarks, the record."], (at) => {
    gal(at, { alpha: 0.22, zoom: 1.0, ox: 0, oy: 0 }, 2.4);
    const t = scene("sc-av", at);
    show(".av-title > *", t, { stagger: 0.15 });
    show("#card-jarvis", t + 0.4, { v: { ease: "back.out(1.6)", duration: 1.1 } });
    tl.to(".av-lines line", { drawSVG: "0% 100%", duration: 0.8, ease: "power2.out", stagger: 0.07 }, t + 0.9);
    show($$(".card:not(.hub)"), t + 1.1, { stagger: 0.09, v: { ease: "back.out(1.5)", duration: 0.8 } });
  });

  step("Read-only auditors", ["Design rule: four auditors (Banner, Vision, Cap, Friday) are read-only.", "If the reviewer can also fix things, it quietly fixes instead of reporting. Separation of powers."], (at) => {
    tl.to($$(".card").filter((c) => !c.dataset.ro), { opacity: 0.22, duration: 0.6 }, at);
    tl.to($$(".card[data-ro] .lock"), { autoAlpha: 1, y: 0, duration: 0.5, ease: "back.out(2)", stagger: 0.1 }, at + 0.3);
    tl.to($$(".card[data-ro]"), { scale: 1.08, "--glow": "0 0 50px rgba(244,162,89,.55)", duration: 0.7, stagger: 0.08 }, at + 0.3);
    show("#av-ro", at + 0.6);
  });

  step("Models + the record", ["Opus where a mistake is silent and expensive (physics, maths, solvers); Sonnet for mechanical work (regression diffs, docs, minutes).", "A shell hook logs every prompt, edit and report; Fury writes it up. No agent can turn it off."], (at) => {
    hide("#av-ro", at);
    tl.to($$(".card"), { opacity: 1, duration: 0.6 }, at);
    tl.to($$(".card[data-ro]"), { scale: 1, "--glow": "0 0 0px rgba(244,162,89,0)", duration: 0.6 }, at);
    tl.to($$(".card .mdl"), { autoAlpha: 1, duration: 0.4, stagger: 0.05 }, at + 0.4);
    show("#av-md", at + 0.8);
  });

  step("…the token bill", ["The catch: agents are expensive. Every specialist re-reads the code, briefs the next one, reports back.", "The same context gets paid for again and again."], (at) => {
    hide("#av-md", at);
    show("#meter", at + 0.2);
    tl.to("#m-fill", { width: "100%", duration: 2.6, ease: "power1.in" }, at + 0.5);
    $$("#money span").forEach((m, i) => {
      tl.fromTo(m, { autoAlpha: 1, y: 0, rotation: 0 }, { y: 1300, rotation: (i % 2 ? 1 : -1) * 120, duration: 2.2, ease: "power1.in", immediateRender: false }, at + 0.6 + i * 0.12);
    });
    tl.to($$(".card"), { rotation: 2.5, duration: 0.08, repeat: 9, yoyo: true, stagger: 0.02 }, at + 2.2);
  });

  step("Snap → Opus 5.5", ["*snap*. With Opus 5.5 I mostly don't need the team any more.", "One model with a 1M context holds the whole project; no hand-offs, no duplicated reading.", "Fewer tokens, and in my experience a better, more coherent job. (The 10,000-agent Navier–Stokes run is the exception that cost millions.)"], (at) => {
    tl.fromTo("#snap", { autoAlpha: 0, scale: 0.4 }, { autoAlpha: 1, scale: 1, duration: 0.5, ease: "back.out(2)", immediateRender: false }, at);
    tl.to("#snap", { autoAlpha: 0, scale: 1.6, duration: 0.5, ease: "power2.in" }, at + 1.0);
    hide(["#meter", ".av-title"], at + 0.8);
    tl.to(".av-lines line", { drawSVG: "0% 0%", duration: 0.6 }, at + 1.1);
    tl.to($$(".card"), { autoAlpha: 0, filter: "blur(6px)", duration: 0.8, stagger: { each: 0.08, from: "random" } }, at + 1.2);
    $$("#dust i").forEach((d) => {
      const k = +d.dataset.k;
      tl.fromTo(d, { autoAlpha: 1, x: 0, y: 0 }, { autoAlpha: 0, x: 80 + Math.random() * 220, y: -40 - Math.random() * 160, rotation: Math.random() * 360, duration: 1.6 + Math.random(), ease: "power2.out", immediateRender: false }, at + 1.2 + k * 0.08 + Math.random() * 0.3);
    });
    gal(at + 2, { alpha: 0.3, zoom: 1.4, ox: -0.5, oy: 0 }, 2.4);
    show("#opus", at + 2.6, { v: { duration: 1.4 } });
    show("#opus li", at + 3.2, { stagger: 0.25 });
    show("#opus .fine", at + 4.1);
  });

  step("Every AI has a superpower", ["Different labs, different goals. I use several.", "ChatGPT for images; Claude for anything built from code: vectors, layouts, documents, software; Gemini for video and Google stuff."], (at) => {
    gal(at, { alpha: 0.14, zoom: 1.1, ox: 0, oy: -0.7 }, 2.4);
    const t = scene("sc-spec", at);
    show("#spec-title > *", t, { stagger: 0.15 });
    show(".spec", t + 0.4, { stagger: 0.2, v: { duration: 1.1 } });
    show("#spec-why", t + 1.4);
  });

  step("LRD figure", ["Real example from our Little Red Dots paper figure. Who made what?"], (at) => {
    hide(["#spec-row", "#spec-why", "#spec-title"], at);
    gal(at, { alpha: 0.04 }, 1.2);
    tl.fromTo("#lrd", { autoAlpha: 0, scale: 0.92, filter: "blur(10px)" }, { autoAlpha: 1, scale: 1, filter: "blur(0px)", duration: 1.4, ease: "expo.out", immediateRender: false }, at + 0.5);
  });

  step("Zoom: ChatGPT art", ["The glowing renders (shell, BLR clouds, cones) are ChatGPT's image generation: pixels."], (at) => {
    tl.to("#lrd-zoom", { scale: 2.6, y: 175, duration: 2.2, ease: "power3.inOut" }, at);
    show("#tag-gpt", at + 1.4, { v: { xPercent: -50 } });
  });

  step("Zoom out: Claude layout", ["Everything else (panels, annotations, the mean spectra, component bars, the log-radius scale) is Claude writing vector graphics as code.", "Claude can't paint, but it can draw precisely."], (at) => {
    hide("#tag-gpt", at, { v: { xPercent: -50 } });
    tl.to("#lrd-zoom", { scale: 1, y: 0, duration: 2, ease: "power3.inOut" }, at + 0.2);
    show("#tag-cl", at + 1.6, { v: { xPercent: -50 } });
  });

  step("Think like an AI", ["My rule: I don't trust AI with science. I trust it with my science, after I've done the thinking.", "To get good output you have to see the prompt the way the model does."], (at) => {
    gal(at, { alpha: 0.14, zoom: 1.5, ox: 0.6, oy: 0.4 }, 2.4);
    const t = scene("sc-think", at);
    show("#sc-think .top-title > *", t, { stagger: 0.15 });
    show(".trow", t + 0.5, { stagger: 0.25 });
  });

  step("Vague vs specific", ["Same model. Vague prompt → the most average galaxy imaginable.", "Specific prompt with the physics, numbers, method and look → my galaxy."], (at) => {
    hide(".trow", at, { stagger: 0.08 });
    show(".cmp-col", at + 0.5, { stagger: 0.35, v: { duration: 1.1 } });
    tl.from(".spiral path:not(.cone)", { drawSVG: "0% 0%", duration: 1.6, ease: "power2.out", stagger: 0.15, immediateRender: false }, at + 1.1);
  });

  step("The message", ["The key message of the talk: do the research first. What science, how, with which tools, what the result should look like.", "Then the AI is an excellent, very fast intern."], (at) => {
    hide([".cmp-col", "#sc-think .top-title"], at);
    show("#msg > *", at + 0.6, { stagger: 0.35, v: { duration: 1.2 } });
  });

  step("One month of curiosity", ["Story: for the past month I've been curious about N-body simulations: how they're built, what they're used for.", "Read, looked at codes, built my own Seyfert galaxy as a hobby. Okay-ish.", "One month is nothing for really understanding N-body, but it's enough for outreach."], (at) => {
    gal(at, { alpha: 0.3, zoom: 1.6, ox: 0, oy: -0.9 }, 2.6);
    const t = scene("sc-case", at);
    show("#sc-case .top-title > *", t, { stagger: 0.15 });
    tl.to("#wk-line", { drawSVG: "0% 100%", duration: 2.2, ease: "power2.inOut" }, t + 0.4);
    show(".wk", t + 0.5, { stagger: 0.4, v: { ease: "back.out(1.4)" } });
  });

  step("The brief", ["Before touching Claude: improved the sim, did the stellar population analysis, wrote down the exact layout and every feature.", "Then one session. No agents. Very few tokens. Because the thinking was already done."], (at) => {
    tl.to("#weeks", { y: -150, scale: 0.8, duration: 1.2, ease: "power3.inOut" }, at);
    show("#brief", at + 0.6, { v: { duration: 1.2 } });
    show("#brief li", at + 1, { stagger: 0.18 });
    show("#case-m", at + 2.2);
  });

  step("Live: the website", ["Press W (or click) to open the site in a new tab. Walk through: home, 3D explore, maps, click-for-spectrum, research, CV.", "Come back to this tab and press → to continue."], (at) => {
    gal(at, { alpha: 0.75, zoom: 1.15, ox: 0, oy: 0 }, 2.6);
    const t = scene("sc-live", at);
    show("#sc-live .h-kicker", t);
    tl.to($$("#url .ch"), { autoAlpha: 1, y: 0, filter: "blur(0px)", duration: 0.6, ease: "expo.out", stagger: 0.035 }, t + 0.3);
    show("#go", t + 1.4, { v: { ease: "back.out(1.6)" } });
  });

  step("Jensen: nobody has to program", ["Jensen, Feb 2024: the goal is that nobody has to program.", "…and the internet's reply:"], (at) => {
    gal(at, { alpha: 0.12, zoom: 1.6 }, 2);
    const t = scene("sc-end", at);
    show("#q-jensen2", t, { v: { duration: 1.2 } });
  });

  step("Do not forget how to code", ["The punchline. AI won't build illegal apps. You will. 😄", "(Seriously: keep the skills. You need them to check the AI.)"], (at) => {
    hide("#q-jensen2", at);
    show("#endTweet", at + 0.5, { v: { duration: 1.3 } });
  });

  step("Thank You", ["Open the floor: what does everyone else use? What do you trust it with, and what don't you?"], (at) => {
    hide("#endTweet", at);
    gal(at, { alpha: 1, zoom: 1.05, ox: 0, oy: 0 }, 3);
    show("#thanks > *", at + 0.8, { stagger: 0.3, v: { duration: 1.3 } });
  });

  // ------------------------------------------------------------------ presenter window
  if (PRESENTER) {
    document.body.classList.add("presenter");
    $("#presenter").hidden = false;
    let i = 0, t0 = Date.now();
    const render = () => {
      const s = STEPS[i] || {}, nx = STEPS[i + 1];
      $("#pv-i").textContent = `${i + 1} / ${STEPS.length}`;
      $("#pv-name").textContent = s.name || "";
      $("#pv-notes").innerHTML = "<ul>" + (s.notes || []).map((n) => `<li>${n}</li>`).join("") + "</ul>";
      $("#pv-next").textContent = nx ? nx.name : "(end)";
    };
    const send = (cmd) => chan && chan.postMessage({ cmd });
    chan && (chan.onmessage = (e) => { if (e.data.type === "state") { i = e.data.i; render(); } });
    send("hello");
    $("#pv-go").onclick = () => send("next");
    $("#pv-prev").onclick = () => send("prev");
    $("#pv-reset").onclick = () => (t0 = Date.now());
    addEventListener("keydown", (e) => {
      if (["ArrowRight", "ArrowDown", "PageDown", " ", "Enter"].includes(e.key)) { e.preventDefault(); send("next"); }
      if (["ArrowLeft", "ArrowUp", "PageUp", "Backspace"].includes(e.key)) { e.preventDefault(); send("prev"); }
    });
    setInterval(() => {
      const s = Math.floor((Date.now() - t0) / 1000);
      $("#pv-t").textContent = `${String(Math.floor(s / 60)).padStart(2, "0")}:${String(s % 60).padStart(2, "0")}`;
      $("#pv-clock").textContent = new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
    }, 500);
    render();
    return;
  }

  // ------------------------------------------------------------------ build DOM bits
  const stage = $("#stage");
  const fit = () => stage.style.setProperty("--s", Math.min(innerWidth / 1920, innerHeight / 1080));
  addEventListener("resize", fit);
  fit();

  $$(".botty").forEach((b) => (b.innerHTML = BOTTY));
  ["#t-title", "#d2022", "#url"].forEach((s) => splitChars($(s)));

  // timeline items
  const tlBox = $("#tl-items");
  TL.forEach((d, i) => {
    const x = 160 + (i * 1620) / 7, up = i % 2 === 0;
    const el = document.createElement("div");
    el.className = `ti ${up ? "up" : "dn"}${i === TL.length - 1 ? " hot" : ""}`;
    el.style.left = `${x - 115}px`;
    el.style[up ? "bottom" : "top"] = up ? "580px" : "580px";
    el.innerHTML = up
      ? `<span class="em">${d.em}</span><div class="yr">${d.yr}</div><b>${d.b}</b><small>${d.s}</small><i class="dot"></i>`
      : `<i class="dot"></i><div class="yr">${d.yr}</div><b>${d.b}</b><small>${d.s}</small><span class="em">${d.em}</span>`;
    tlBox.appendChild(el);
  });

  // neural net
  const net = $("#net"), layers = [4, 6, 6, 3], xs = [70, 280, 490, 690], NS = "http://www.w3.org/2000/svg";
  const pos = layers.map((n, l) => Array.from({ length: n }, (_, k) => [xs[l], 300 + (k - (n - 1) / 2) * 88]));
  for (let l = 0; l < layers.length - 1; l++)
    pos[l].forEach((a, ia) => pos[l + 1].forEach((b, ib) => {
      const ln = document.createElementNS(NS, "line");
      ln.setAttribute("x1", a[0]); ln.setAttribute("y1", a[1]); ln.setAttribute("x2", b[0]); ln.setAttribute("y2", b[1]);
      if (l === 1 && ia === 1 && ib === 3) ln.classList.add("hot");
      net.appendChild(ln);
    }));
  pos.flat().forEach(([x, y]) => {
    const c = document.createElementNS(NS, "circle");
    c.setAttribute("cx", x); c.setAttribute("cy", y); c.setAttribute("r", 17);
    net.appendChild(c);
  });
  $("#w-label").innerHTML = `<span class="mono">w = 0.73</span>: the orange line is <b>one</b> parameter`;

  // context pages + lost tiles
  const pages = $("#pages");
  for (let i = 0; i < 16; i++) {
    const p = document.createElement("i");
    p.className = "pg";
    p.style.left = `${30 + ((i * 97) % 640)}px`;
    p.style.animationDuration = `${4 + (i % 5) * 0.7}s`;
    p.style.animationDelay = `${-i * 0.55}s`;
    pages.appendChild(p);
  }
  const tiles = $("#tiles");
  for (let i = 0; i < 20; i++) tiles.appendChild(document.createElement("i"));

  // avengers
  const cards = $("#av-cards"), lines = $(".av-lines"), C = [960, 590], R = [700, 300];
  const mkCard = (d, cx, cy, hub) => {
    const w = hub ? 320 : 270, h = hub ? 140 : 112;
    const el = document.createElement("div");
    el.className = "card" + (hub ? " hub" : "");
    el.id = "card-" + d.id;
    if (d.ro) el.dataset.ro = 1;
    el.style.left = `${cx - w / 2}px`; el.style.top = `${cy - h / 2}px`;
    el.innerHTML = `<span class="av">${d.em}</span><div><b>${d.n}</b><small>${d.r}</small></div>${d.ro ? '<span class="lock">🔒 READ-ONLY</span>' : ""}<span class="mdl m-${d.m}">${d.m.toUpperCase()}</span>`;
    cards.appendChild(el);
    return { x: cx - w / 2, y: cy - h / 2, w, h };
  };
  mkCard(HUB, C[0], C[1], true);
  const dust = $("#dust"), DC = ["#f4a259", "#8fb6ff", "#c8a2ff", "#eef0f5", "#7fd0a8"];
  TEAM.forEach((d, k) => {
    const a = ((-90 + k * 36) * Math.PI) / 180, cx = C[0] + R[0] * Math.cos(a), cy = C[1] + R[1] * Math.sin(a);
    const ln = document.createElementNS(NS, "line");
    ln.setAttribute("x1", C[0]); ln.setAttribute("y1", C[1]); ln.setAttribute("x2", cx); ln.setAttribute("y2", cy);
    lines.appendChild(ln);
    const r = mkCard(d, cx, cy);
    for (let j = 0; j < 26; j++) {
      const p = document.createElement("i");
      p.dataset.k = k;
      p.style.left = `${r.x + Math.random() * r.w}px`; p.style.top = `${r.y + Math.random() * r.h}px`;
      p.style.background = DC[j % DC.length];
      dust.appendChild(p);
    }
  });
  for (let j = 0; j < 26; j++) { // Jarvis turns to dust too
    const p = document.createElement("i");
    p.dataset.k = 10;
    p.style.left = `${800 + Math.random() * 320}px`; p.style.top = `${520 + Math.random() * 140}px`;
    p.style.background = DC[j % DC.length];
    dust.appendChild(p);
  }
  const money = $("#money");
  for (let i = 0; i < 16; i++) {
    const m = document.createElement("span");
    m.textContent = ["💸", "🔥", "🪙"][i % 3];
    m.style.left = `${80 + ((i * 113) % 1760)}px`; m.style.top = "-90px";
    money.appendChild(m);
  }

  // ------------------------------------------------------------------ initial states
  gsap.registerPlugin(DrawSVGPlugin);
  gsap.set(".in", { autoAlpha: 0, y: 30, filter: "blur(10px)" });
  gsap.set(["#t-title .ch", "#url .ch"], { autoAlpha: 0, y: 60, filter: "blur(12px)" });
  gsap.set("#d2022 .ch", { autoAlpha: 0, y: 40 });
  gsap.set(".ti", { autoAlpha: 0, y: 20, filter: "blur(8px)" });
  gsap.set(["#tl-line", ".vx", ".pipe-line", "#loop-c", ".av-lines line", "#wk-line", "#net line"], { drawSVG: "0% 0%" });
  gsap.set("#net circle", { autoAlpha: 0, scale: 0.3, transformOrigin: "50% 50%" });
  gsap.set(".lnode", { xPercent: -50, yPercent: -50 });
  gsap.set(".tag", { xPercent: -50 });
  gsap.set("#snap", { xPercent: -50, yPercent: -50 });
  gsap.set(".card", { autoAlpha: 0, scale: 0.6, filter: "blur(8px)" });
  gsap.set(".card .lock", { y: 8 });
  gsap.set("#tiles i", { autoAlpha: 0, y: 20 });
  gsap.set(".orbit-dot", { autoAlpha: 0 });
  gsap.set("#samTweet", { scale: 0.9 });
  gsap.set("#qa-q", { x: 60 });

  // ------------------------------------------------------------------ master timeline
  tl = gsap.timeline({ paused: true });
  const labels = [];
  tl.set("#sc-intro", { autoAlpha: 1 }, 0);
  cur = $("#sc-intro");
  STEPS.forEach((s, i) => {
    const at = tl.duration();
    s.build(at);
    tl.to({}, { duration: 0.05 }, tl.duration());
    labels.push(tl.duration());
  });

  // ------------------------------------------------------------------ navigation
  let idx = -1, nav = null;
  const progress = $("#progress i");
  const broadcast = () => chan && chan.postMessage({ type: "state", i: idx });
  const go = (k, instant) => {
    k = Math.max(0, Math.min(STEPS.length - 1, k));
    if (nav) { nav.kill(); nav = null; tl.seek(labels[idx], false); }
    const back = k < idx;
    if (instant) tl.seek(labels[k], false);
    else nav = tl.tweenTo(labels[k], { ease: "none", onComplete: () => (nav = null) }).timeScale(back ? 1.8 : 1);
    idx = k;
    progress.style.width = `${(100 * idx) / (STEPS.length - 1)}%`;
    history.replaceState(null, "", "#" + (idx + 1));
    broadcast();
  };
  const next = () => go(idx + 1), prev = () => go(idx - 1);


  const black = document.createElement("div");
  black.style.cssText = "position:fixed;inset:0;background:#000;z-index:9;display:none";
  document.body.appendChild(black);

  addEventListener("keydown", (e) => {
    if (e.metaKey || e.ctrlKey || e.altKey) return;
    const k = e.key;
    if (["ArrowRight", "ArrowDown", "PageDown", " ", "Enter"].includes(k)) { e.preventDefault(); next(); }
    else if (["ArrowLeft", "ArrowUp", "PageUp", "Backspace"].includes(k)) { e.preventDefault(); prev(); }
    else if (k === "Home") go(0, true);
    else if (k === "End") go(STEPS.length - 1, true);
    else if (k === "f" || k === "F") toggleFS();
    else if (k === "p" || k === "P") window.open(location.pathname + "?presenter", "talk-presenter", "width=1200,height=760");
    else if (k === "w" || k === "W") window.open(SITE, "_blank", "noopener");
    else if (k === "b" || k === "B" || k === ".") black.style.display = black.style.display === "none" ? "block" : "none";
  });
  const toggleFS = () => (document.fullscreenElement ? document.exitFullscreen() : document.documentElement.requestFullscreen());
  addEventListener("dblclick", toggleFS);
  $("#viewport").addEventListener("click", (e) => { if (!e.target.closest("a")) next(); });
  let tx = null;
  addEventListener("touchstart", (e) => (tx = e.touches[0].clientX), { passive: true });
  addEventListener("touchend", (e) => {
    if (tx === null) return;
    const dx = e.changedTouches[0].clientX - tx;
    if (Math.abs(dx) > 50) (dx < 0 ? next : prev)();
    tx = null;
  });
  chan && (chan.onmessage = (e) => {
    const c = e.data.cmd;
    if (c === "next") next(); else if (c === "prev") prev(); else if (c === "hello") broadcast();
  });

  let idleT;
  addEventListener("mousemove", () => {
    document.body.classList.remove("idle");
    clearTimeout(idleT);
    idleT = setTimeout(() => document.body.classList.add("idle"), 2500);
  });

  const start = parseInt(location.hash.slice(1), 10);
  const instant = new URLSearchParams(location.search).has("instant");
  const boot = () => (start > 1 || instant ? go((start || 1) - 1, true) : go(0));
  document.fonts && document.fonts.ready ? document.fonts.ready.then(boot) : boot();

  window.TALK = { go, next, prev, steps: STEPS, labels, tl };
})();
