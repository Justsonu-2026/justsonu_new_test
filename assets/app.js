/* Creative Prompt Vault — app logic. No dependencies. */
(function () {
  "use strict";

  const V = window.VAULT;
  const $ = (s, el) => (el || document).querySelector(s);
  const $$ = (s, el) => Array.from((el || document).querySelectorAll(s));
  const STORE_KEY = "promptVault.v1";
  const VAR_RE = /\{\{\s*([^{}|]+?)\s*(?:\|([^{}]*))?\}\}/g;

  /* ---------- Storage (per browser, failure-tolerant) ---------- */
  const blank = () => ({ favs: [], used: {}, recent: [], custom: [], fills: {}, builder: {}, results: {}, wf: {} });
  let store = blank();
  try {
    const raw = localStorage.getItem(STORE_KEY);
    if (raw) store = Object.assign(blank(), JSON.parse(raw));
  } catch (e) { /* storage unavailable: run in memory */ }
  function save() {
    try { localStorage.setItem(STORE_KEY, JSON.stringify(store)); } catch (e) { /* ignore */ }
  }

  /* ---------- Optional Claude viewer capabilities ---------- */
  let sampleFn = null;
  let downloadsApi = null;
  if (window.claude && typeof window.claude.use === "function") {
    window.claude.use("sample").then((fn) => { sampleFn = fn || null; }, () => {});
    window.claude.use("downloads").then((d) => { downloadsApi = d || null; }, () => {});
  }

  /* ---------- Helpers ---------- */
  const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  const catById = Object.fromEntries(V.categories.map((c) => [c.id, c]));
  const catOf = (p) => catById[p.cat] || catById.custom;
  const allPrompts = () => V.prompts.concat(store.custom);
  const findPrompt = (id) => allPrompts().find((p) => p.id === id);
  const wfById = (id) => V.workflows.find((w) => w.id === id);

  function parseVars(body) {
    const out = [];
    const seen = new Set();
    body.replace(VAR_RE, (m, name, def) => {
      const key = name.trim();
      if (!seen.has(key)) { seen.add(key); out.push({ name: key, def: (def || "").trim() }); }
      return m;
    });
    return out;
  }
  function fillText(body, values) {
    const defs = Object.fromEntries(parseVars(body).map((v) => [v.name, v.def]));
    return body.replace(VAR_RE, (m, name, def) => {
      const key = name.trim();
      const v = values[key];
      return v !== undefined && v !== "" ? v : (def || "").trim() || defs[key] || "[" + key + "]";
    });
  }
  function fillHtml(body, values) {
    const defs = Object.fromEntries(parseVars(body).map((v) => [v.name, v.def]));
    let html = "";
    let last = 0;
    body.replace(VAR_RE, (m, name, def, idx) => {
      html += esc(body.slice(last, idx));
      const key = name.trim();
      const v = values[key];
      const has = v !== undefined && v !== "";
      const d = (def || "").trim() || defs[key] || "";
      const shown = has ? v : d;
      html += shown
        ? `<span class="v${has && v !== d ? " edited" : ""}" data-var="${esc(key)}">${esc(shown)}</span>`
        : `<span class="v empty-v" data-var="${esc(key)}">${esc(key)}</span>`;
      last = idx + m.length;
      return m;
    });
    return html + esc(body.slice(last));
  }
  const words = (s) => (s.trim() ? s.trim().split(/\s+/).length : 0);

  let toastTimer;
  function toast(msg) {
    const t = $("#toast");
    t.textContent = msg;
    t.hidden = false;
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => { t.hidden = true; }, 2400);
  }
  function copyText(text, label) {
    const fallback = () => {
      const ta = document.createElement("textarea");
      ta.value = text;
      ta.setAttribute("readonly", "");
      ta.style.position = "fixed";
      ta.style.opacity = "0";
      document.body.appendChild(ta);
      ta.select();
      let ok = false;
      try { ok = document.execCommand("copy"); } catch (e) { ok = false; }
      ta.remove();
      toast(ok ? (label || "Copied") : "Copy is blocked here. Select the text and copy it manually.");
    };
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(text).then(() => toast(label || "Copied"), fallback);
    } else { fallback(); }
  }
  function markUsed(id) {
    store.used[id] = (store.used[id] || 0) + 1;
    store.recent = [id].concat(store.recent.filter((x) => x !== id)).slice(0, 12);
    save();
  }
  function avgRating(id) {
    const r = (store.results[id] || []).filter((x) => x.stars);
    return r.length ? r.reduce((n, x) => n + x.stars, 0) / r.length : 0;
  }
  function starsHtml(avg) {
    if (!avg) return "";
    const full = Math.round(avg);
    return `<span class="stars" title="Your rating: ${avg.toFixed(1)} of 5" aria-label="Rated ${avg.toFixed(1)} of 5">${"★".repeat(full)}<span class="off">${"★".repeat(5 - full)}</span></span>`;
  }
  function exampleFor(p) {
    return V.examples[p.id] || { does: p.desc || "", when: [], output: p.example || "", tip: "" };
  }

  const ICON = {
    video: '<rect x="3" y="6" width="13" height="12" rx="2"/><path d="M16 10.5l5-3v9l-5-3"/>',
    image: '<rect x="3" y="4" width="18" height="16" rx="2"/><circle cx="9" cy="10" r="2"/><path d="M21 16l-5-5-9 9"/>',
    previz: '<path d="M12 2.5l8.5 4.8v9.4L12 21.5l-8.5-4.8V7.3z"/><path d="M12 21.5V12M20.5 7.3L12 12 3.5 7.3"/>',
    ads: '<path d="M3 10.5v3a1 1 0 001 1h2.5l6.5 4.5v-14L6.5 9.5H4a1 1 0 00-1 1z"/><path d="M17 8.5a5 5 0 010 7M19.5 6a8.5 8.5 0 010 12"/>',
    character: '<circle cx="12" cy="8" r="4"/><path d="M4 21c1.4-4 4.4-6 8-6s6.6 2 8 6"/>',
    social: '<rect x="6.5" y="2.5" width="11" height="19" rx="3"/><path d="M12 15.5l-2.6-2.5a1.7 1.7 0 012.6-2.1 1.7 1.7 0 012.6 2.1z"/>',
    audio: '<path d="M3 12h1.5M7 8v8M11 4.5v15M15 8.5v7M19 6.5v11"/>',
    brand: '<path d="M12 3l9 9-9 9-9-9z"/><path d="M12 8.5l3.5 3.5-3.5 3.5L8.5 12z"/>',
    design: '<path d="M4 20l3.5-1 11-11a2.1 2.1 0 00-3-3l-11 11z"/><path d="M14 6.5l3 3"/>',
    research: '<circle cx="10.5" cy="10.5" r="6.5"/><path d="M20.5 20.5l-5.3-5.3M8 10.5h5M10.5 8v5"/>',
    docs: '<path d="M14 3H6.5A2.5 2.5 0 004 5.5v13A2.5 2.5 0 006.5 21h11a2.5 2.5 0 002.5-2.5V9z"/><path d="M14 3v6h6M8 13h8M8 17h5"/>',
    build: '<path d="M8.5 7L3.5 12l5 5M15.5 7l5 5-5 5M13.5 4.5l-3 15"/>',
    custom: '<path d="M12 3l2.4 6.6L21 12l-6.6 2.4L12 21l-2.4-6.6L3 12l6.6-2.4z"/>',
    star: '<path d="M12 2.8l2.8 5.8 6.3.9-4.6 4.4 1.1 6.3L12 17.2l-5.6 3 1.1-6.3L2.9 9.5l6.3-.9z"/>',
    eye: '<path d="M1.5 12S5.5 5 12 5s10.5 7 10.5 7-4 7-10.5 7S1.5 12 1.5 12z"/><circle cx="12" cy="12" r="3"/>',
    bulb: '<path d="M9 18h6M10 21h4M12 3a6 6 0 00-3.5 10.9c.6.5 1 1.2 1 2.1h5c0-.9.4-1.6 1-2.1A6 6 0 0012 3z"/>',
    flow: '<circle cx="5" cy="6" r="2.2"/><circle cx="5" cy="18" r="2.2"/><circle cx="19" cy="12" r="2.2"/><path d="M7.2 6h3.3a3 3 0 013 3v0a3 3 0 003 3M7.2 18h3.3a3 3 0 003-3v0a3 3 0 013-3"/>',
    plus: '<path d="M12 5v14M5 12h14"/>',
    shuffle: '<path d="M3 7h3.5l9 10H21M3 17h3.5l2.5-2.8M15.5 7H21M18 4l3 3-3 3M18 14l3 3-3 3"/>',
    grid: '<rect x="3.5" y="3.5" width="7" height="7" rx="1.5"/><rect x="13.5" y="3.5" width="7" height="7" rx="1.5"/><rect x="3.5" y="13.5" width="7" height="7" rx="1.5"/><rect x="13.5" y="13.5" width="7" height="7" rx="1.5"/>',
    book: '<path d="M4 5.5A2.5 2.5 0 016.5 3H20v15H6.5A2.5 2.5 0 004 20.5z"/><path d="M4 20.5A2.5 2.5 0 016.5 18H20v3H6.5"/>',
    map: '<path d="M9 4L3 6.5v13L9 17l6 2.5 6-2.5v-13L15 6.5z"/><path d="M9 4v13M15 6.5v13"/>',
    out: '<path d="M12 3v12M7 8l5-5 5 5M4 15v4a2 2 0 002 2h12a2 2 0 002-2v-4"/>',
    in: '<path d="M12 15V3M7 10l5 5 5-5M4 15v4a2 2 0 002 2h12a2 2 0 002-2v-4"/>',
    x: '<path d="M6 6l12 12M18 6L6 18"/>'
  };
  const icon = (name) => `<svg viewBox="0 0 24 24" aria-hidden="true">${ICON[name] || ICON.custom}</svg>`;
  const cStyle = (cat) => `--c:${cat.color}`;

  /* ---------- Library state ---------- */
  const state = { view: "all", cat: null, query: "", sort: "featured" };
  let lastList = [];

  function matches(p, tokens) {
    if (!tokens.length) return 1;
    const cat = catOf(p);
    const ex = exampleFor(p);
    const title = p.title.toLowerCase();
    const hay = [p.title, p.desc, ex.does, (ex.when || []).join(" "), (p.tags || []).join(" "), (p.tools || []).join(" "), p.body, cat.name, cat.skill].join(" ").toLowerCase();
    let score = 0;
    for (const t of tokens) {
      if (!hay.includes(t)) return 0;
      score += title.includes(t) ? 3 : 1;
    }
    return score;
  }

  function currentList() {
    const tokens = state.query.toLowerCase().split(/\s+/).filter(Boolean);
    let list = allPrompts();
    if (state.view === "fav") list = list.filter((p) => store.favs.includes(p.id));
    else if (state.view === "rated") list = list.filter((p) => avgRating(p.id) > 0);
    else if (state.view === "recent") list = store.recent.map(findPrompt).filter(Boolean);
    if (state.cat) list = list.filter((p) => p.cat === state.cat);

    const scored = list.map((p, i) => ({ p, i, s: matches(p, tokens) })).filter((x) => x.s > 0);
    const by = {
      featured: (a, b) => (tokens.length ? b.s - a.s : 0) || a.i - b.i,
      az: (a, b) => a.p.title.localeCompare(b.p.title),
      rating: (a, b) => avgRating(b.p.id) - avgRating(a.p.id) || a.i - b.i,
      used: (a, b) => (store.used[b.p.id] || 0) - (store.used[a.p.id] || 0) || a.i - b.i,
      vars: (a, b) => parseVars(a.p.body).length - parseVars(b.p.body).length || a.i - b.i
    }[state.view === "rated" && state.sort === "featured" ? "rating" : state.sort];
    if (!(state.view === "recent" && state.sort === "featured" && !tokens.length)) scored.sort(by);
    return scored.map((x) => x.p);
  }

  function renderStats() {
    $("#stats").innerHTML =
      `<div><dt>Prompts</dt><dd>${allPrompts().length}</dd></div>` +
      `<div><dt>Skills</dt><dd>${V.categories.length - 1}</dd></div>` +
      `<div><dt>Workflows</dt><dd>${V.workflows.length}</dd></div>` +
      `<div><dt>Examples</dt><dd>${Object.keys(V.examples).length}</dd></div>`;
  }

  function renderSkills() {
    const counts = {};
    allPrompts().forEach((p) => { counts[p.cat] = (counts[p.cat] || 0) + 1; });
    $("#skillGrid").innerHTML = V.categories.map((c) => `
      <button class="skill" type="button" data-skill="${c.id}" aria-pressed="${state.cat === c.id}" style="${cStyle(c)}">
        <span class="badge">${icon(c.id)}</span>
        <span><span class="name">${esc(c.name)}</span><span class="sub">${esc(c.skill)}</span></span>
        <span class="n">${counts[c.id] || 0}</span>
      </button>`).join("");
    $("#clearSkill").hidden = !state.cat;
  }

  function renderChips() {
    const views = [
      ["all", "All", allPrompts().length],
      ["fav", "Favorites", store.favs.filter(findPrompt).length],
      ["rated", "Top rated", allPrompts().filter((p) => avgRating(p.id) > 0).length],
      ["recent", "Recently copied", store.recent.filter(findPrompt).length]
    ];
    let html = views.map(([id, label, n]) =>
      `<button class="chip" type="button" data-show="${id}" aria-pressed="${state.view === id}">${label} <span class="n">${n}</span></button>`).join("");
    if (state.cat) {
      const c = catById[state.cat];
      html += `<button class="chip cat" type="button" data-skill="${c.id}" style="${cStyle(c)}" aria-label="Remove ${esc(c.name)} filter">${esc(c.name)} ${icon("x")}</button>`;
    }
    $("#viewChips").innerHTML = html;
  }

  function cardHtml(p, i) {
    const cat = catOf(p);
    const ex = exampleFor(p);
    const n = parseVars(p.body).length;
    const fav = store.favs.includes(p.id);
    const tags = (p.tags || []).slice(0, 3).map((t) => `<span class="tag">${esc(t)}</span>`).join("");
    return `<article class="card" style="${cStyle(cat)};--i:${Math.min(i, 18)}">
      <div class="card-top"><span class="badge sm">${icon(cat.id)}</span><span class="catname">${esc(cat.name)}</span>
        <span class="right">${starsHtml(avgRating(p.id))}${p.cat === "custom" ? '<span class="mine">Yours</span>' : ""}</span></div>
      <h3><button type="button" data-peek="${esc(p.id)}">${esc(p.title)}</button></h3>
      <p class="does">${esc(ex.does || p.desc || "")}</p>
      <div class="tags">${tags}</div>
      <div class="card-foot">
        <span class="meta">${n} blank${n === 1 ? "" : "s"}${store.used[p.id] ? ` · ${store.used[p.id]}× copied` : ""}</span>
        <span class="spacer"></span>
        <button class="iconbtn" type="button" data-fav="${esc(p.id)}" aria-pressed="${fav}" aria-label="${fav ? "Remove from" : "Add to"} favorites">${icon("star")}</button>
        <button class="btn btn-glass" type="button" data-peek="${esc(p.id)}">${icon("eye")}Example</button>
        <button class="btn btn-glow" type="button" data-open="${esc(p.id)}">Use</button>
      </div>
    </article>`;
  }

  function renderGrid() {
    const list = currentList();
    lastList = list.map((p) => p.id);
    $("#grid").innerHTML = list.map(cardHtml).join("");
    const empty = list.length === 0;
    $("#empty").hidden = !empty;
    const where = state.cat ? catById[state.cat].name : "all skills";
    const which = { all: "", fav: "favorite ", rated: "rated ", recent: "recently copied " }[state.view];
    $("#resultMeta").innerHTML = `<b>${list.length}</b> ${which}prompt${list.length === 1 ? "" : "s"} in ${esc(where)}${state.query ? ` matching “${esc(state.query)}”` : ""}`;
    const e = $("#empty");
    if (state.cat === "custom" && empty && !state.query) {
      $("h3", e).textContent = "No prompts of your own yet";
      $("p", e).textContent = "Write one from scratch, duplicate any template, or save one from the builder.";
    } else if (state.view === "fav" && empty && !state.query) {
      $("h3", e).textContent = "No favorites yet";
      $("p", e).textContent = "Tap the star on any prompt to keep it here.";
    } else if (state.view === "rated" && empty && !state.query) {
      $("h3", e).textContent = "Nothing rated yet";
      $("p", e).textContent = "Open a prompt, go to My results, and rate how well it worked.";
    } else {
      $("h3", e).textContent = "No prompts match";
      $("p", e).textContent = "Try a shorter search, pick another skill, or write your own template.";
    }
  }

  function refreshLibrary() {
    renderStats();
    renderSkills();
    renderChips();
    renderGrid();
  }

  function toggleFav(id) {
    const i = store.favs.indexOf(id);
    if (i >= 0) store.favs.splice(i, 1); else store.favs.push(id);
    save();
    return i < 0;
  }

  /* ---------- Global click delegation ---------- */
  document.addEventListener("click", (e) => {
    const sk = e.target.closest("[data-skill]");
    if (sk) {
      state.cat = state.cat === sk.dataset.skill ? null : sk.dataset.skill;
      refreshLibrary();
      if (state.cat && sk.classList.contains("skill")) $("#results").scrollIntoView({ behavior: "smooth", block: "start" });
      return;
    }
    const vw = e.target.closest("[data-show]");
    if (vw) { state.view = vw.dataset.show; refreshLibrary(); return; }
    const fav = e.target.closest("[data-fav]");
    if (fav) {
      const on = toggleFav(fav.dataset.fav);
      toast(on ? "Added to favorites" : "Removed from favorites");
      refreshLibrary();
      return;
    }
    const pk = e.target.closest("[data-peek]");
    if (pk) { openPeek(pk.dataset.peek, lastList); return; }
    const op = e.target.closest("[data-open]");
    if (op) { openDrawer(op.dataset.open); return; }
    const wf = e.target.closest("[data-wf]");
    if (wf) { location.hash = wf.dataset.wf; return; }
  });

  const searchEl = $("#search");
  searchEl.addEventListener("input", () => { state.query = searchEl.value; renderChips(); renderGrid(); });
  searchEl.addEventListener("keydown", (e) => { if (e.key === "Enter") $("#results").scrollIntoView({ behavior: "smooth", block: "start" }); });
  $("#sort").addEventListener("change", (e) => { state.sort = e.target.value; renderGrid(); });
  $("#clearSkill").addEventListener("click", () => { state.cat = null; refreshLibrary(); });
  $("#emptyNew").addEventListener("click", () => openEditor());
  $("#newPromptBtn").addEventListener("click", () => openEditor());
  $("#surpriseBtn").addEventListener("click", surprise);
  function surprise() {
    const list = allPrompts();
    const p = list[Math.floor(Math.random() * list.length)];
    openPeek(p.id, list.map((x) => x.id));
  }

  /* ---------- Example popup ---------- */
  let peekList = [];
  let peekId = null;
  function exampleHtml(p, withTitle) {
    const ex = exampleFor(p);
    const vars = parseVars(p.body).filter((v) => v.def).slice(0, 6);
    const parts = [];
    if (withTitle) parts.push(`<h2 id="pTitle">${esc(p.title)}</h2>`);
    if (ex.does) parts.push(`<p class="peek-does">${esc(ex.does)}</p>`);
    parts.push(`<div><p class="peek-label">What you get</p><div class="result-box">${ex.output ? esc(ex.output) : "No example yet. Use the prompt, then log what you got under My results."}</div></div>`);
    if (ex.when && ex.when.length) parts.push(`<div><p class="peek-label">Best for</p><div class="usecases">${ex.when.map((w) => `<span>${esc(w)}</span>`).join("")}</div></div>`);
    if (vars.length) parts.push(`<div><p class="peek-label">Example input</p><dl class="kv">${vars.map((v) => `<dt>${esc(v.name)}</dt><dd>${esc(v.def)}</dd>`).join("")}</dl></div>`);
    if (ex.tip) parts.push(`<div class="tipline">${icon("bulb")}<span><b>Tip:</b> ${esc(ex.tip)}</span></div>`);
    if (p.tools && p.tools.length) parts.push(`<p class="peek-note">Works with ${p.tools.map(esc).join(", ")}</p>`);
    return parts.join("");
  }
  function openPeek(id, list) {
    const p = findPrompt(id);
    if (!p) return;
    peekId = id;
    if (list) peekList = list.includes(id) ? list : [id];
    const cat = catOf(p);
    const wrap = $("#peek");
    wrap.style.setProperty("--c", cat.color);
    $("#pBadge").innerHTML = icon(cat.id);
    $("#pCat").textContent = cat.name;
    const pos = peekList.indexOf(id);
    $("#pPos").textContent = peekList.length > 1 ? `${pos + 1} of ${peekList.length}` : "";
    $("#pPrev").hidden = $("#pNext").hidden = peekList.length < 2;
    $("#pBody").innerHTML = exampleHtml(p, true);
    $("#pBody").scrollTop = 0;
    if (wrap.hidden) showModal("#peek");
    $("#pUse").focus({ preventScroll: true });
  }
  function stepPeek(d) {
    if (peekList.length < 2) return;
    const i = (peekList.indexOf(peekId) + d + peekList.length) % peekList.length;
    openPeek(peekList[i]);
  }
  $("#pPrev").addEventListener("click", () => stepPeek(-1));
  $("#pNext").addEventListener("click", () => stepPeek(1));
  $("#pUse").addEventListener("click", () => { const id = peekId; hideModal("#peek"); openDrawer(id); });
  $("#pCopy").addEventListener("click", () => {
    const p = findPrompt(peekId);
    copyText(fillText(p.body, {}), "Example prompt copied");
    markUsed(p.id);
  });

  /* ---------- Drawer ---------- */
  let current = null;
  let currentWf = null; // { id, i }
  let lastFocus = null;

  function openDrawer(id, opts) {
    const p = findPrompt(id);
    if (!p) return;
    opts = opts || {};
    current = p;
    currentWf = opts.wf || null;
    if (!$("#drawer").hidden) abortImprove();
    else lastFocus = document.activeElement;
    const cat = catOf(p);
    const drawer = $("#drawer");
    drawer.style.setProperty("--c", cat.color);
    $("#dBadge").innerHTML = icon(cat.id);
    $("#dCat").textContent = cat.name;
    $("#dTitle").textContent = p.title;
    $("#dDesc").textContent = exampleFor(p).does || p.desc || "";
    $("#dTools").innerHTML = (p.tools && p.tools.length ? "<span>Works with</span>" + p.tools.map((t) => `<span class="tool">${esc(t)}</span>`).join("") : "") +
      (p.tags || []).map((t) => `<span class="tag">${esc(t)}</span>`).join("");
    $("#panel-example").innerHTML = exampleHtml(p, false) + `<div class="actions"><button class="btn btn-glass" type="button" id="exCopy">Copy example prompt</button></div>`;
    $("#exCopy").addEventListener("click", () => copyText(fillText(p.body, {}), "Example prompt copied"));
    renderWfBanner();
    renderForm();
    updatePreview();
    syncFavBtn();
    renderRating();
    renderLog();
    resetStars();
    const mine = p.cat === "custom";
    $("#dEdit").hidden = !mine;
    $("#dDelete").hidden = !mine;
    resetDelete();
    $("#improve").hidden = true;
    switchTab("fill");
    $("#scrim").hidden = false;
    drawer.hidden = false;
    $(".drawer-body").scrollTop = 0;
    document.body.style.overflow = "hidden";
    if (!opts.fromHash) setHash(p.id);
    const first = $("#dForm input, #dForm textarea");
    (first || $("#dClose")).focus({ preventScroll: true });
  }

  function closeDrawer(silent) {
    if ($("#drawer").hidden) return;
    abortImprove();
    $("#drawer").hidden = true;
    $("#scrim").hidden = true;
    document.body.style.overflow = "";
    const wf = currentWf;
    current = null;
    currentWf = null;
    if (silent) return;
    if (wf) { setHash(wf.id); renderWorkflows(); } else { setHash(activeView === "library" ? "library" : activeView); refreshLibrary(); }
    if (lastFocus && document.contains(lastFocus)) lastFocus.focus({ preventScroll: true });
  }

  function switchTab(name) {
    ["fill", "example", "results"].forEach((t) => {
      $("#tab-" + t).setAttribute("aria-selected", String(t === name));
      $("#panel-" + t).hidden = t !== name;
    });
  }
  $(".dtabs").addEventListener("click", (e) => {
    const b = e.target.closest("[role=tab]");
    if (b) switchTab(b.id.replace("tab-", ""));
  });

  function wfPresets() {
    if (!currentWf) return {};
    const wf = wfById(currentWf.id);
    const saved = (store.wf[wf.id] && store.wf[wf.id].fields) || {};
    const out = {};
    Object.keys(wf.fields).forEach((k) => { out[k.toLowerCase()] = saved[k] !== undefined ? saved[k] : wf.fields[k]; });
    return out;
  }

  function renderForm() {
    const vars = parseVars(current.body);
    const fills = store.fills[current.id] || {};
    const presets = wfPresets();
    const form = $("#dForm");
    if (!vars.length) {
      form.innerHTML = '<p class="none">This prompt has no blanks. Copy it as it is.</p>';
      return;
    }
    form.innerHTML = vars.map((v, i) => {
      const id = "fv-" + i;
      const pre = presets[v.name.toLowerCase()];
      const val = fills[v.name] !== undefined ? fills[v.name] : pre !== undefined && pre !== "" ? pre : v.def;
      const long = v.def.length > 70 || /paste|transcript|notes|feedback|data|prompt|script|shot \d|line/i.test(v.name + " " + v.def);
      const input = long
        ? `<textarea id="${id}" rows="3" data-var="${esc(v.name)}">${esc(val)}</textarea>`
        : `<input id="${id}" data-var="${esc(v.name)}" value="${esc(val)}">`;
      return `<label class="field" for="${id}"><span>${esc(v.name)}</span>${input}</label>`;
    }).join("");
  }

  function currentValues() {
    const vals = {};
    $$("#dForm [data-var]").forEach((el) => { vals[el.dataset.var] = el.value; });
    return vals;
  }
  const currentText = () => fillText(current.body, currentValues());

  function updatePreview() {
    $("#dOut").innerHTML = fillHtml(current.body, currentValues());
    const text = currentText();
    $("#dCount").textContent = `${words(text)} words`;
  }
  function syncFavBtn() {
    const on = store.favs.includes(current.id);
    const b = $("#dFav");
    b.setAttribute("aria-pressed", String(on));
    b.setAttribute("aria-label", on ? "Remove from favorites" : "Add to favorites");
  }
  function renderRating() {
    const avg = avgRating(current.id);
    $("#dRating").innerHTML = starsHtml(avg);
    const n = (store.results[current.id] || []).length;
    $("#dResCount").textContent = n ? String(n) : "";
  }

  $("#dForm").addEventListener("input", (e) => {
    if (!current) return;
    const vals = currentValues();
    const defaults = Object.fromEntries(parseVars(current.body).map((v) => [v.name, v.def]));
    const changed = Object.keys(vals).some((k) => vals[k] !== defaults[k]);
    if (changed) store.fills[current.id] = vals; else delete store.fills[current.id];
    save();
    updatePreview();
    highlight(e.target.dataset.var);
  });
  $("#dForm").addEventListener("focusin", (e) => { if (e.target.dataset.var) highlight(e.target.dataset.var); });
  $("#dForm").addEventListener("focusout", () => highlight(null));
  $("#dForm").addEventListener("submit", (e) => e.preventDefault());
  function highlight(name) {
    $$("#dOut .v").forEach((s) => s.classList.toggle("hot", name !== null && s.dataset.var === name));
  }

  $("#dCopy").addEventListener("click", () => { copyText(currentText(), "Prompt copied"); markUsed(current.id); });
  $("#dCopyRaw").addEventListener("click", () => copyText(current.body, "Template copied with blanks"));
  $("#dReset").addEventListener("click", () => {
    delete store.fills[current.id];
    save();
    renderForm();
    updatePreview();
    toast("Blanks reset");
  });
  $("#dFav").addEventListener("click", () => {
    const on = toggleFav(current.id);
    syncFavBtn();
    toast(on ? "Added to favorites" : "Removed from favorites");
  });
  $("#dDuplicate").addEventListener("click", () => {
    const p = current;
    closeDrawer(true);
    openEditor({ title: p.title + " (my version)", cat: "custom", origCat: p.origCat || p.cat, tags: p.tags, desc: exampleFor(p).does || p.desc, body: p.body, tools: p.tools, example: exampleFor(p).output });
  });
  $("#dEdit").addEventListener("click", () => { const p = current; closeDrawer(true); openEditor(p, true); });
  function resetDelete() {
    const b = $("#dDelete");
    b.classList.remove("confirm");
    b.textContent = "Delete";
  }
  $("#dDelete").addEventListener("click", (e) => {
    const b = e.currentTarget;
    if (!b.classList.contains("confirm")) { b.classList.add("confirm"); b.textContent = "Click again to delete"; return; }
    const id = current.id;
    store.custom = store.custom.filter((p) => p.id !== id);
    store.favs = store.favs.filter((x) => x !== id);
    store.recent = store.recent.filter((x) => x !== id);
    delete store.fills[id];
    delete store.used[id];
    delete store.results[id];
    save();
    closeDrawer();
    toast("Prompt deleted");
  });
  $("#dClose").addEventListener("click", () => closeDrawer());
  $("#scrim").addEventListener("click", () => closeDrawer());

  /* ---------- Workflow banner inside the drawer ---------- */
  function renderWfBanner() {
    const el = $("#dWf");
    if (!currentWf) { el.hidden = true; return; }
    const wf = wfById(currentWf.id);
    const i = currentWf.i;
    const last = i === wf.steps.length - 1;
    el.innerHTML = `${icon("flow")}<span><strong>${esc(wf.title)}</strong> · Step ${i + 1} of ${wf.steps.length}</span><span class="spacer"></span>
      ${i > 0 ? '<button class="btn btn-ghost" type="button" data-wfnav="-1">Previous step</button>' : ""}
      <button class="btn btn-glow" type="button" data-wfnav="1">${last ? "Mark done & finish" : "Mark done & next"}</button>`;
    el.hidden = false;
  }
  $("#dWf").addEventListener("click", (e) => {
    const b = e.target.closest("[data-wfnav]");
    if (!b || !currentWf) return;
    const d = Number(b.dataset.wfnav);
    const wf = wfById(currentWf.id);
    const i = currentWf.i;
    if (d > 0) setStepDone(wf.id, i, true);
    const next = i + d;
    if (next >= wf.steps.length) { closeDrawer(); toast("Workflow complete"); return; }
    openDrawer(wf.steps[next][0], { wf: { id: wf.id, i: next } });
  });

  /* ---------- Improve with Claude ---------- */
  let impCtl = null;
  const NOTES_MARK = "===NOTES===";
  function improveRequest(p, text) {
    const tools = (p.tools && p.tools.length ? p.tools.join(", ") : "AI creative tools");
    return `You are an expert prompt engineer for AI creative production (${tools}).
Improve the prompt below so it gets better results. Keep the person's intent, subject and every specific value they chose. Make it more specific and better structured: subject, action, camera or composition, lighting, style, audio or format, and constraints where they apply. Remove vague words. Keep it under 220 words and in the same language.

Reply in exactly this format:
<the improved prompt as plain text, no heading, no code fence>
${NOTES_MARK}
- up to 3 short bullets on what you changed

Prompt to improve:
"""
${text}
"""`;
  }
  function splitImproved(text) {
    const i = text.indexOf(NOTES_MARK);
    return i < 0 ? { prompt: text.trim(), notes: "" } : { prompt: text.slice(0, i).trim(), notes: text.slice(i + NOTES_MARK.length).trim() };
  }
  function abortImprove() { if (impCtl) { impCtl.abort(); impCtl = null; } }

  $("#dImprove").addEventListener("click", async () => {
    const p = current;
    const req = improveRequest(p, currentText());
    if (!sampleFn) {
      copyText(req, "Request copied. Paste it into any Claude chat to get an improved prompt.");
      return;
    }
    abortImprove();
    impCtl = new AbortController();
    const box = $("#improve");
    box.hidden = false;
    $("#impOut").innerHTML = '<span class="thinking"><i></i><i></i><i></i></span> Thinking…';
    $("#impNotes").textContent = "";
    $("#impState").textContent = "";
    $("#impStop").hidden = false;
    $("#impCopy").disabled = $("#impSave").disabled = true;
    switchTab("fill");
    box.scrollIntoView({ behavior: "smooth", block: "nearest" });
    const show = (t) => { const s = splitImproved(t); $("#impOut").textContent = s.prompt; $("#impNotes").textContent = s.notes; };
    try {
      const res = await sampleFn(req, { signal: impCtl.signal, cache: false, onText: ({ text }) => show(text) });
      show(res.text);
      $("#impState").textContent = res.truncated ? "Cut short" : "Done";
      $("#impCopy").disabled = $("#impSave").disabled = false;
    } catch (err) {
      const code = err && err.code;
      if (err && err.text) show(err.text);
      if (code === "cancelled") { $("#impState").textContent = "Stopped"; $("#impCopy").disabled = $("#impSave").disabled = !(err && err.text); }
      else if (["not_granted", "sampling_disabled", "not_declared", "capability_disabled", "capability_removed"].includes(code)) {
        sampleFn = null;
        box.hidden = true;
        copyText(req, "Claude isn't available here, so the request was copied. Paste it into any Claude chat.");
      } else if (code === "rate_limited") { $("#impState").textContent = ""; $("#impOut").textContent = "Claude is busy right now. Try again in a minute."; }
      else if (code === "refused") { $("#impOut").textContent = "Claude couldn't improve this one. Try changing the wording."; }
      else { $("#impState").textContent = "Interrupted"; if (!(err && err.text)) $("#impOut").textContent = "Something went wrong. Try again."; }
    } finally {
      impCtl = null;
      $("#impStop").hidden = true;
    }
  });
  $("#impStop").addEventListener("click", abortImprove);
  $("#impCopy").addEventListener("click", () => copyText($("#impOut").textContent, "Improved prompt copied"));
  $("#impSave").addEventListener("click", () => {
    const p = current;
    const body = $("#impOut").textContent;
    closeDrawer(true);
    openEditor({ title: p.title + " (improved)", cat: "custom", origCat: p.origCat || p.cat, tags: p.tags, desc: exampleFor(p).does || p.desc, body, tools: p.tools });
  });

  /* ---------- Results log ---------- */
  let starPick = 0;
  function resetStars() {
    starPick = 0;
    $("#starsInput").innerHTML = [1, 2, 3, 4, 5].map((n) =>
      `<button type="button" role="radio" aria-checked="false" data-star="${n}" aria-label="${n} star${n > 1 ? "s" : ""}">${icon("star")}</button>`).join("");
    $("#logModel").value = "";
    $("#logLink").value = "";
    $("#logNote").value = "";
    $("#logHint").textContent = "";
  }
  function paintStars(n) {
    $$("#starsInput button").forEach((b) => {
      const on = Number(b.dataset.star) <= n;
      b.classList.toggle("on", on);
      b.setAttribute("aria-checked", String(Number(b.dataset.star) === starPick));
    });
  }
  $("#starsInput").addEventListener("click", (e) => {
    const b = e.target.closest("[data-star]");
    if (!b) return;
    starPick = Number(b.dataset.star);
    paintStars(starPick);
  });
  $("#starsInput").addEventListener("mouseover", (e) => { const b = e.target.closest("[data-star]"); if (b) paintStars(Number(b.dataset.star)); });
  $("#starsInput").addEventListener("mouseleave", () => paintStars(starPick));
  $("#logForm").addEventListener("submit", (e) => {
    e.preventDefault();
    const note = $("#logNote").value.trim();
    if (!starPick && !note) { $("#logHint").textContent = "Pick a star rating or write a note first."; return; }
    const link = $("#logLink").value.trim();
    const entry = { t: Date.now(), stars: starPick, model: $("#logModel").value.trim(), link: /^https?:\/\//i.test(link) ? link : "", note };
    (store.results[current.id] = store.results[current.id] || []).unshift(entry);
    save();
    resetStars();
    renderLog();
    renderRating();
    toast("Result saved");
  });
  function renderLog() {
    const list = store.results[current.id] || [];
    $("#logList").innerHTML = list.length ? list.map((r, i) => `
      <div class="log-item">
        <div>${starsHtml(r.stars) || '<span class="when">No rating</span>'} ${r.model ? `<b>${esc(r.model)}</b>` : ""}</div>
        <button class="iconbtn" type="button" data-dellog="${i}" aria-label="Delete this result">${icon("x")}</button>
        <span class="when">${new Date(r.t).toLocaleString(undefined, { dateStyle: "medium", timeStyle: "short" })}</span>
        ${r.note ? `<p>${esc(r.note)}</p>` : ""}
        ${r.link ? `<p><a href="${esc(r.link)}" target="_blank" rel="noopener">Open result</a></p>` : ""}
      </div>`).join("") : '<p class="log-empty">No results logged yet. After you run this prompt, rate it here and note the model and settings, so you know which wording works.</p>';
  }
  $("#logList").addEventListener("click", (e) => {
    const b = e.target.closest("[data-dellog]");
    if (!b) return;
    store.results[current.id].splice(Number(b.dataset.dellog), 1);
    if (!store.results[current.id].length) delete store.results[current.id];
    save();
    renderLog();
    renderRating();
  });

  /* ---------- Editor ---------- */
  let editingId = null;
  function openEditor(p, isEdit) {
    editingId = isEdit ? p.id : null;
    $("#eTitle").textContent = isEdit ? "Edit prompt" : "New prompt";
    $("#eCat").innerHTML = V.categories.map((c) => `<option value="${c.id}">${esc(c.name)}</option>`).join("");
    $("#eName").value = p ? p.title : "";
    $("#eCat").value = p ? (p.origCat || p.cat || "custom") : "custom";
    $("#eTags").value = p && p.tags ? p.tags.join(", ") : "";
    $("#eDesc").value = p ? p.desc || "" : "";
    $("#eBody").value = p ? p.body : "";
    $("#eExample").value = p ? p.example || "" : "";
    $("#eError").hidden = true;
    updateVarHint();
    showModal("#editor");
    $("#eName").focus();
  }
  function updateVarHint() {
    const vars = parseVars($("#eBody").value);
    $("#eVars").textContent = vars.length
      ? `Blanks found (${vars.length}): ${vars.map((v) => v.name).join(", ")}`
      : "No blanks yet. Wrap anything you want to change each time in {{ }}, for example {{Product|a red sneaker}}.";
  }
  $("#eBody").addEventListener("input", updateVarHint);
  $("#editorForm").addEventListener("submit", (e) => {
    e.preventDefault();
    const title = $("#eName").value.trim();
    const body = $("#eBody").value.trim();
    if (!title || !body) {
      $("#eError").textContent = "Add a title and the prompt text before saving.";
      $("#eError").hidden = false;
      return;
    }
    const chosen = $("#eCat").value;
    const old = editingId ? store.custom.find((x) => x.id === editingId) : null;
    const rec = {
      id: editingId || "own-" + Date.now().toString(36),
      cat: "custom",
      origCat: chosen,
      title,
      desc: $("#eDesc").value.trim(),
      example: $("#eExample").value.trim(),
      tags: $("#eTags").value.split(",").map((t) => t.trim()).filter(Boolean),
      tools: old ? old.tools || [] : [],
      body
    };
    if (chosen !== "custom" && !rec.tags.includes(catById[chosen].name)) rec.tags.push(catById[chosen].name);
    if (editingId) {
      store.custom = store.custom.map((x) => (x.id === editingId ? rec : x));
      delete store.fills[editingId];
    } else {
      store.custom.unshift(rec);
    }
    save();
    hideModal("#editor");
    state.cat = "custom";
    state.view = "all";
    showView("library");
    refreshLibrary();
    toast(editingId ? "Prompt updated" : "Saved to My prompts");
    openDrawer(rec.id);
  });

  /* ---------- Modals ---------- */
  const modalStack = [];
  function showModal(sel) {
    modalStack.push({ sel, ret: document.activeElement });
    $(sel).hidden = false;
    document.body.style.overflow = "hidden";
  }
  function hideModal(sel) {
    $(sel).hidden = true;
    const i = modalStack.map((m) => m.sel).lastIndexOf(sel);
    const entry = i >= 0 ? modalStack.splice(i, 1)[0] : null;
    if ($("#drawer").hidden && !modalStack.length) document.body.style.overflow = "";
    if (entry && entry.ret && document.contains(entry.ret)) entry.ret.focus({ preventScroll: true });
  }
  $$(".modal").forEach((m) => {
    m.addEventListener("click", (e) => {
      if (e.target === m || e.target.closest("[data-close]")) hideModal("#" + m.id);
    });
  });

  /* ---------- Quick search palette ---------- */
  let palItems = [];
  let palSel = 0;
  const ACTIONS = [
    { label: "New prompt", sub: "Write your own template", ico: "plus", run: () => openEditor() },
    { label: "Surprise me", sub: "Preview a random prompt", ico: "shuffle", run: surprise },
    { label: "Browse workflows", sub: "Step-by-step prompt chains", ico: "flow", run: () => { location.hash = "workflows"; } },
    { label: "Open prompt builder", sub: "Assemble an image or video prompt", ico: "grid", run: () => { location.hash = "builder"; } },
    { label: "Vocabulary & formulas", sub: "Camera, lens and lighting terms", ico: "book", run: () => { location.hash = "vocab"; } },
    { label: "Show favorites", sub: "Prompts you starred", ico: "star", run: () => { state.view = "fav"; state.cat = null; location.hash = "library"; refreshLibrary(); } },
    { label: "Show top rated", sub: "Prompts you rated", ico: "star", run: () => { state.view = "rated"; state.cat = null; location.hash = "library"; refreshLibrary(); } },
    { label: "Roadmap", sub: "What's shipped and what's next", ico: "map", run: () => { location.hash = "roadmap"; } },
    { label: "Export backup", sub: "Save favorites, ratings and your prompts", ico: "out", run: openExport },
    { label: "Import backup", sub: "Restore from an export", ico: "in", run: openImport }
  ];
  function openPalette() {
    if (!$("#palette").hidden) return;
    showModal("#palette");
    $("#palInput").value = "";
    renderPalette();
    $("#palInput").focus();
  }
  function renderPalette() {
    const q = $("#palInput").value.toLowerCase().trim();
    const tokens = q.split(/\s+/).filter(Boolean);
    const hit = (s) => tokens.every((t) => s.toLowerCase().includes(t));
    const acts = ACTIONS.filter((a) => !tokens.length || hit(a.label + " " + a.sub)).map((a) => ({ type: "action", ...a }));
    const wfs = V.workflows.filter((w) => !tokens.length || hit(w.title + " " + w.desc)).map((w) => ({ type: "wf", label: w.title, sub: `${w.steps.length} steps`, ico: "flow", run: () => { location.hash = w.id; } }));
    const prs = allPrompts().map((p) => ({ p, s: matches(p, tokens) })).filter((x) => x.s > 0)
      .sort((a, b) => b.s - a.s).slice(0, tokens.length ? 30 : 12)
      .map(({ p }) => ({ type: "prompt", id: p.id, label: p.title, sub: catOf(p).name + " · " + (exampleFor(p).does || "").slice(0, 80), cat: catOf(p), run: () => openDrawer(p.id) }));
    palItems = (tokens.length ? [] : acts.slice(0, 4)).concat(tokens.length ? acts : [], wfs.slice(0, tokens.length ? 6 : 3), prs);
    palSel = 0;
    const groups = [["Actions", (x) => x.type === "action"], ["Workflows", (x) => x.type === "wf"], ["Prompts", (x) => x.type === "prompt"]];
    let html = "";
    let idx = 0;
    groups.forEach(([name, f]) => {
      const items = palItems.filter(f);
      if (!items.length) return;
      html += `<li class="pal-group" role="presentation">${name}</li>`;
      items.forEach((it) => {
        const ico = it.cat ? `<span class="badge sm" style="${cStyle(it.cat)}">${icon(it.cat.id)}</span>` : `<span class="ico">${icon(it.ico)}</span>`;
        html += `<li class="pal-item" role="option" id="pal-${idx}" data-idx="${idx}" aria-selected="${idx === 0}">${ico}<span class="t"><b>${esc(it.label)}</b><small>${esc(it.sub)}</small></span><span class="go">${it.type === "prompt" ? "open" : "go"}</span></li>`;
        idx++;
      });
    });
    palItems = groups.flatMap(([, f]) => palItems.filter(f));
    $("#palList").innerHTML = html || '<li class="pal-empty">Nothing found. Try another word.</li>';
  }
  function movePal(d) {
    if (!palItems.length) return;
    palSel = (palSel + d + palItems.length) % palItems.length;
    $$("#palList .pal-item").forEach((el) => el.setAttribute("aria-selected", String(Number(el.dataset.idx) === palSel)));
    const el = $("#pal-" + palSel);
    if (el) el.scrollIntoView({ block: "nearest" });
    $("#palInput").setAttribute("aria-activedescendant", "pal-" + palSel);
  }
  function runPal(i, preview) {
    const it = palItems[i];
    if (!it) return;
    hideModal("#palette");
    if (preview && it.type === "prompt") openPeek(it.id, palItems.filter((x) => x.type === "prompt").map((x) => x.id));
    else it.run();
  }
  $("#palInput").addEventListener("input", renderPalette);
  $("#palInput").addEventListener("keydown", (e) => {
    if (e.key === "ArrowDown") { e.preventDefault(); movePal(1); }
    else if (e.key === "ArrowUp") { e.preventDefault(); movePal(-1); }
    else if (e.key === "Enter") { e.preventDefault(); runPal(palSel, e.shiftKey); }
  });
  $("#palList").addEventListener("click", (e) => { const li = e.target.closest(".pal-item"); if (li) runPal(Number(li.dataset.idx)); });
  $("#palList").addEventListener("mousemove", (e) => {
    const li = e.target.closest(".pal-item");
    if (li && Number(li.dataset.idx) !== palSel) { palSel = Number(li.dataset.idx); movePal(0); }
  });
  $("#cmdkBtn").addEventListener("click", openPalette);

  /* ---------- Workflows ---------- */
  function wfState(id) {
    return store.wf[id] || { done: [], fields: {} };
  }
  function setStepDone(id, i, on) {
    const s = wfState(id);
    s.done = s.done.filter((x) => x !== i);
    if (on) s.done.push(i);
    store.wf[id] = s;
    save();
  }
  function chainHtml(wf) {
    return wf.steps.map(([pid], i) => {
      const p = findPrompt(pid);
      const c = p ? catOf(p) : catById.custom;
      return `${i ? '<span class="arrow" aria-hidden="true">→</span>' : ""}<span class="badge" style="${cStyle(c)}" title="${esc(p ? p.title : pid)}">${icon(c.id)}</span>`;
    }).join("");
  }
  function renderWorkflows() {
    const h = decodeURIComponent((location.hash || "").slice(1));
    const wf = wfById(h);
    $("#wfList").hidden = !!wf;
    $("#wfDetail").hidden = !wf;
    $("#view-workflows .page-head").hidden = !!wf;
    if (!wf) {
      $("#wfList").innerHTML = V.workflows.map((w) => {
        const done = wfState(w.id).done.length;
        return `<button class="wf-card" type="button" data-wf="${w.id}">
          <div class="wf-chain">${chainHtml(w)}</div>
          <h3>${esc(w.title)}</h3>
          <p>${esc(w.desc)}</p>
          <div class="progress" aria-hidden="true"><i style="width:${(done / w.steps.length) * 100}%"></i></div>
          <div class="wf-foot"><span>${w.steps.length} steps</span><span>${done ? `${done} done` : "Not started"}</span></div>
        </button>`;
      }).join("");
      return;
    }
    const s = wfState(wf.id);
    const done = s.done.length;
    $("#wfDetail").innerHTML = `
      <aside class="wf-side">
        <a class="btn btn-ghost" href="#workflows" style="justify-self:start">← All workflows</a>
        <div class="wf-chain">${chainHtml(wf)}</div>
        <h2>${esc(wf.title)}</h2>
        <p>${esc(wf.desc)}</p>
        <div class="progress" aria-label="${done} of ${wf.steps.length} steps done"><i style="width:${(done / wf.steps.length) * 100}%"></i></div>
        <form class="wf-fields glass" id="wfFields" autocomplete="off">
          <h3>Project details</h3>
          <p class="hint" style="margin:0">These fill matching blanks in every step.</p>
          ${Object.keys(wf.fields).map((k, i) => `<label class="field" for="wff-${i}"><span>${esc(k)}</span><input id="wff-${i}" data-field="${esc(k)}" value="${esc(s.fields[k] !== undefined ? s.fields[k] : wf.fields[k])}"></label>`).join("")}
        </form>
        <button class="btn btn-ghost" type="button" id="wfReset" style="justify-self:start">Reset progress</button>
      </aside>
      <ol class="steps">
        ${wf.steps.map(([pid, note], i) => {
          const p = findPrompt(pid);
          if (!p) return "";
          const c = catOf(p);
          const isDone = s.done.includes(i);
          return `<li class="step${isDone ? " done" : ""}" style="${cStyle(c)}">
            <span class="step-num">${isDone ? "✓" : i + 1}</span>
            <div class="step-card">
              <div class="step-top"><span class="badge sm">${icon(c.id)}</span>${esc(c.name)}</div>
              <h3>${esc(p.title)}</h3>
              <p>${esc(note)}</p>
              <div class="step-actions">
                <button class="btn btn-glow" type="button" data-step="${i}">Open step</button>
                <button class="btn btn-glass" type="button" data-peek="${esc(p.id)}">${icon("eye")}Example</button>
                <label class="check" for="wfd-${i}"><input type="checkbox" id="wfd-${i}" data-done="${i}"${isDone ? " checked" : ""}> Done</label>
              </div>
            </div>
          </li>`;
        }).join("")}
      </ol>`;
    $("#wfFields").addEventListener("input", (e) => {
      const k = e.target.dataset.field;
      if (!k) return;
      const st = wfState(wf.id);
      st.fields[k] = e.target.value;
      store.wf[wf.id] = st;
      save();
    });
    $("#wfFields").addEventListener("submit", (e) => e.preventDefault());
    $("#wfReset").addEventListener("click", () => { store.wf[wf.id] = { done: [], fields: {} }; save(); renderWorkflows(); toast("Progress reset"); });
  }
  function wfDetailClick(e) {
    const b = e.target.closest("[data-step]");
    if (!b) return;
    const wf = wfById(decodeURIComponent(location.hash.slice(1)));
    const i = Number(b.dataset.step);
    openDrawer(wf.steps[i][0], { wf: { id: wf.id, i }, fromHash: true });
  }
  function wfDetailChange(e) {
    const c = e.target.closest("[data-done]");
    if (!c) return;
    const wf = wfById(decodeURIComponent(location.hash.slice(1)));
    setStepDone(wf.id, Number(c.dataset.done), c.checked);
    renderWorkflows();
  }

  $("#wfDetail").addEventListener("click", wfDetailClick);
  $("#wfDetail").addEventListener("change", wfDetailChange);

  /* ---------- Import / export ---------- */
  function exportData() {
    return JSON.stringify({
      app: "creative-prompt-vault", version: 2, exported: new Date().toISOString(),
      favorites: store.favs, custom: store.custom, fills: store.fills, results: store.results, workflows: store.wf
    }, null, 2);
  }
  function openExport() {
    $("#ioTitle").textContent = "Export your library";
    $("#ioHint").textContent = `${store.custom.length} of your own prompts, ${store.favs.length} favorites, ${Object.keys(store.results).length} rated prompts and your saved blanks. Copy or save this, then use Import on any device.`;
    const ta = $("#ioText");
    ta.value = exportData();
    ta.readOnly = true;
    $("#ioFileWrap").hidden = true;
    $("#ioError").hidden = true;
    let topLevel = true;
    try { topLevel = window.self === window.top; } catch (e) { topLevel = false; }
    const canSave = !!downloadsApi || topLevel;
    $("#ioFoot").innerHTML = '<button class="btn btn-ghost" type="button" data-close>Close</button>' +
      (canSave ? '<button class="btn btn-glass" type="button" id="ioDownload">Save .json file</button>' : "") +
      '<button class="btn btn-glow" type="button" id="ioCopy">Copy</button>';
    $("#ioCopy").addEventListener("click", () => copyText(ta.value, "Backup copied"));
    if (canSave) $("#ioDownload").addEventListener("click", () => saveFile("prompt-vault-backup.json", ta.value));
    showModal("#io");
    ta.focus();
    ta.select();
  }
  async function saveFile(name, text) {
    if (downloadsApi) {
      try { await downloadsApi.save({ filename: name, data: text }); toast("Saved"); }
      catch (e) { if (e && e.code !== "declined") toast("Saving isn't available here. Use Copy instead."); }
      return;
    }
    try {
      const url = URL.createObjectURL(new Blob([text], { type: "application/json" }));
      const a = document.createElement("a");
      a.href = url;
      a.download = name;
      document.body.appendChild(a);
      a.click();
      a.remove();
      setTimeout(() => URL.revokeObjectURL(url), 1000);
    } catch (e) { toast("Saving isn't available here. Use Copy instead."); }
  }
  function openImport() {
    $("#ioTitle").textContent = "Import a backup";
    $("#ioHint").textContent = "Paste a backup exported from this library. Prompts with the same ID are replaced; everything else is added.";
    const ta = $("#ioText");
    ta.value = "";
    ta.readOnly = false;
    ta.placeholder = '{ "custom": [ … ], "favorites": [ … ] }';
    $("#ioFileWrap").hidden = false;
    $("#ioFile").value = "";
    $("#ioError").hidden = true;
    $("#ioFoot").innerHTML = '<button class="btn btn-ghost" type="button" data-close>Cancel</button><button class="btn btn-glow" type="button" id="ioDoImport">Import</button>';
    $("#ioDoImport").addEventListener("click", () => doImport(ta.value));
    showModal("#io");
    ta.focus();
  }
  $("#exportBtn").addEventListener("click", openExport);
  $("#importBtn").addEventListener("click", openImport);
  $("#ioFile").addEventListener("change", (e) => {
    const file = e.target.files && e.target.files[0];
    if (!file) return;
    const r = new FileReader();
    r.onload = () => { $("#ioText").value = String(r.result); };
    r.readAsText(file);
  });
  function doImport(text) {
    const err = $("#ioError");
    let data;
    try { data = JSON.parse(text); } catch (e) {
      err.textContent = "That isn't valid JSON. Paste the full text from Export, starting with {.";
      err.hidden = false;
      return;
    }
    const incoming = Array.isArray(data) ? data : (data.custom || []);
    const valid = incoming.filter((p) => p && typeof p.title === "string" && typeof p.body === "string");
    const hasOther = data.favorites || data.results || data.workflows;
    if (!valid.length && !hasOther) {
      err.textContent = "No prompts or favorites found in that text.";
      err.hidden = false;
      return;
    }
    valid.forEach((p) => {
      const rec = {
        id: typeof p.id === "string" && p.id.startsWith("own-") ? p.id : "own-" + Math.random().toString(36).slice(2, 9),
        cat: "custom", origCat: catById[p.origCat] ? p.origCat : "custom",
        title: p.title.slice(0, 120), desc: String(p.desc || "").slice(0, 300), example: String(p.example || "").slice(0, 2000),
        tags: Array.isArray(p.tags) ? p.tags.map(String).slice(0, 12) : [],
        tools: Array.isArray(p.tools) ? p.tools.map(String).slice(0, 8) : [],
        body: p.body
      };
      store.custom = store.custom.filter((x) => x.id !== rec.id);
      store.custom.push(rec);
    });
    if (Array.isArray(data.favorites)) data.favorites.forEach((id) => { if (typeof id === "string" && !store.favs.includes(id)) store.favs.push(id); });
    if (data.fills && typeof data.fills === "object") Object.assign(store.fills, data.fills);
    if (data.results && typeof data.results === "object") Object.assign(store.results, data.results);
    if (data.workflows && typeof data.workflows === "object") Object.assign(store.wf, data.workflows);
    save();
    hideModal("#io");
    refreshLibrary();
    toast(`Imported ${valid.length} prompt${valid.length === 1 ? "" : "s"}`);
  }

  /* ---------- Builder ---------- */
  const vocab = Object.fromEntries(V.vocab.map((g) => [g.group, g.terms.map((t) => t[0])]));
  const BF = {
    video: [
      ["subject", "Subject", null, "A lone surfer in a black wetsuit", true],
      ["action", "Action", null, "paddles out through crashing waves", true],
      ["setting", "Setting", null, "rocky coastline at dawn, mist over the water", true],
      ["shot", "Shot size", "Shot sizes", "Wide shot"],
      ["angle", "Angle", "Camera angles", "Low angle"],
      ["move", "Camera move", "Camera moves", "Tracking shot"],
      ["lens", "Lens", "Lenses", "35mm"],
      ["trigger", "Camera moves when", null, "the first wave breaks"],
      ["light", "Lighting", "Lighting", "Golden hour"],
      ["style", "Style", "Looks & styles", "35mm film"],
      ["grade", "Color grade", "Color grades", "Teal and orange"],
      ["mood", "Mood", null, "lonely, determined"],
      ["audio", "Audio", "Audio", "roaring surf, wind, no music", true],
      ["duration", "Duration", null, "5 seconds"],
      ["ratio", "Aspect ratio", "Aspect ratios", "16:9"],
      ["avoid", "Constraints", null, "one continuous shot, no on-screen text, no morphing", true]
    ],
    image: [
      ["subject", "Subject", null, "A ceramic artist shaping a tall vase", true],
      ["detail", "Details", null, "clay-covered hands, linen apron, focused expression", true],
      ["setting", "Setting", null, "sunlit studio with shelves of glazed pottery", true],
      ["shot", "Shot size", "Shot sizes", "Medium shot"],
      ["angle", "Angle", "Camera angles", "Eye level"],
      ["lens", "Lens", "Lenses", "50mm"],
      ["light", "Lighting", "Lighting", "Softbox key"],
      ["style", "Style", "Looks & styles", "Editorial fashion"],
      ["grade", "Color grade", "Color grades", "Warm vintage"],
      ["mood", "Mood", null, "calm, crafted, quiet"],
      ["ratio", "Aspect ratio", "Aspect ratios", "4:5"],
      ["avoid", "Avoid", null, "text, watermark, extra fingers", true]
    ]
  };
  let bmode = store.builder.mode === "image" ? "image" : "video";
  $("#bmode-" + bmode).checked = true;

  function renderBuilderFields() {
    const saved = store.builder[bmode] || Object.fromEntries(BF[bmode].map(([k, , , ph]) => [k, ph]));
    const used = new Set();
    $("#builderFields").innerHTML = BF[bmode].map(([key, label, list, ph, wide]) => {
      const id = `bf-${bmode}-${key}`;
      let dl = "";
      if (list) { used.add(list); dl = ` list="dl-${list.replace(/\W+/g, "")}"`; }
      return `<label class="field${wide ? " wide" : ""}" for="${id}"><span>${esc(label)}</span><input id="${id}" data-key="${key}" placeholder="${esc(ph)}" value="${esc(saved[key] || "")}"${dl}></label>`;
    }).join("") + Array.from(used).map((g) =>
      `<datalist id="dl-${g.replace(/\W+/g, "")}">${vocab[g].map((t) => `<option value="${esc(t)}"></option>`).join("")}</datalist>`).join("");
  }
  function rawBuilderValues() {
    const vals = {};
    $$("#builderFields [data-key]").forEach((el) => { vals[el.dataset.key] = el.value.trim(); });
    return vals;
  }
  const listKeys = new Set(BF.video.concat(BF.image).filter((f) => f[2]).map((f) => f[0]));
  const lcFirst = (s) => (/^[A-Z][a-z]/.test(s) ? s[0].toLowerCase() + s.slice(1) : s);
  function builderValues() {
    const vals = rawBuilderValues();
    Object.keys(vals).forEach((k) => { if (listKeys.has(k)) vals[k] = lcFirst(vals[k]); });
    return vals;
  }
  const end = (s) => (/[.!?]$/.test(s) ? s : s + ".");
  function assemble(get, mode) {
    const lines = [];
    const join = (...xs) => xs.filter(Boolean).join(", ");
    const head = [get("subject"), mode === "video" ? get("action") : get("detail")].filter(Boolean);
    if (head.length) lines.push(end(mode === "video" ? head.join(" ") : head.join(", ")));
    if (get("setting")) lines.push(end("Setting: " + get("setting")));
    if (mode === "video") {
      const cam = join(get("shot"), get("move"), get("angle"), get("lens"));
      if (cam) lines.push(end("Camera: " + cam) + (get("trigger") ? " " + end("The camera starts moving when " + get("trigger")) : ""));
      else if (get("trigger")) lines.push(end("The camera starts moving when " + get("trigger")));
    } else {
      const comp = join(get("shot"), get("angle"));
      if (comp) lines.push(end("Composition: " + comp));
      if (get("lens")) lines.push(end("Camera: " + get("lens")));
    }
    if (get("light")) lines.push(end("Lighting: " + get("light")));
    const style = join(get("style"), get("grade"));
    if (style) lines.push(end("Style: " + style));
    if (get("mood")) lines.push(end("Mood: " + get("mood")));
    if (mode === "video" && get("audio")) lines.push(end("Audio: " + get("audio")));
    const fmt = join(mode === "video" ? get("duration") : "", get("ratio") ? "aspect ratio " + get("ratio") : "");
    if (fmt) lines.push(end("Format: " + fmt));
    if (get("avoid")) lines.push(end((mode === "video" ? "Constraints: " : "Avoid: ") + get("avoid")));
    return lines.join("\n");
  }
  function updateBuilder() {
    store.builder[bmode] = rawBuilderValues();
    store.builder.mode = bmode;
    save();
    const shown = builderValues();
    const text = assemble((k) => shown[k] || "", bmode);
    const out = $("#builderOut");
    if (text) out.textContent = text;
    else out.innerHTML = '<span class="v empty-v">Start typing in any field, or pick a suggested term.</span>';
    $("#builderCount").textContent = text ? `${words(text)} words` : "";
  }
  $("#builderForm").addEventListener("change", (e) => {
    if (e.target.name === "bmode") { bmode = e.target.value; renderBuilderFields(); }
    updateBuilder();
  });
  $("#builderForm").addEventListener("input", updateBuilder);
  $("#builderForm").addEventListener("submit", (e) => e.preventDefault());
  $("#builderCopy").addEventListener("click", () => {
    const v = builderValues();
    const text = assemble((k) => v[k] || "", bmode);
    if (!text) { toast("Fill in at least one field first"); return; }
    copyText(text, "Prompt copied");
  });
  $("#builderReset").addEventListener("click", () => { store.builder[bmode] = {}; save(); renderBuilderFields(); updateBuilder(); });
  $("#builderSave").addEventListener("click", () => {
    const v = builderValues();
    const labels = Object.fromEntries(BF[bmode].map(([k, l]) => [k, l]));
    const body = assemble((k) => (v[k] ? `{{${labels[k]}|${v[k].replace(/[{}|]/g, "")}}}` : ""), bmode);
    if (!body) { toast("Fill in at least one field first"); return; }
    openEditor({ title: (v.subject ? v.subject.slice(0, 50) : "Untitled") + (bmode === "video" ? " (video)" : " (image)"), cat: bmode, desc: "Built with the prompt builder.", tags: [bmode, "builder"], body });
  });

  /* ---------- Vocabulary ---------- */
  function renderFormulas() {
    $("#formulas").innerHTML = V.formulas.map((f) => `<article class="formula">
      <h3>${esc(f.title)}</h3>
      <ol>${f.parts.map((p) => `<li>${esc(p)}</li>`).join("")}</ol>
      <p>${esc(f.note)}</p>
      <p class="src">Sources: ${f.sources.map(([t, u]) => `<a href="${esc(u)}" target="_blank" rel="noopener">${esc(t)}</a>`).join(" · ")}</p>
    </article>`).join("");
  }
  function renderVocab(q) {
    const t = (q || "").toLowerCase().trim();
    $("#vocab").innerHTML = V.vocab.map((g) => {
      const terms = g.terms.filter(([a, b]) => !t || (a + " " + b + " " + g.group).toLowerCase().includes(t));
      if (!terms.length) return "";
      return `<section class="vgroup"><h3>${esc(g.group)} <span>${terms.length}</span></h3>${terms.map(([a, b]) =>
        `<button class="term" type="button" data-term="${esc(a)}"><b>${esc(a)}</b><small>${esc(b)}</small></button>`).join("")}</section>`;
    }).join("") || '<p class="hint">No terms match.</p>';
  }
  $("#vocab").addEventListener("click", (e) => { const b = e.target.closest("[data-term]"); if (b) copyText(b.dataset.term, `Copied “${b.dataset.term}”`); });
  $("#vocabSearch").addEventListener("input", (e) => renderVocab(e.target.value));

  /* ---------- Roadmap ---------- */
  function renderRoadmap() {
    const label = { done: "Shipped", next: "Next", later: "Later" };
    $("#roadmap").innerHTML = V.roadmap.map((s) => `<section class="rm-stage">
      <h2>${esc(s.stage)}</h2><p>${esc(s.note)}</p>
      <div class="rm-list">${s.items.map(([st, t, d]) => `<article class="rm-item"><span class="pill ${st}">${label[st]}</span><h3>${esc(t)}</h3><p>${esc(d)}</p></article>`).join("")}</div>
    </section>`).join("");
  }

  /* ---------- Routing ---------- */
  const VIEWS = ["library", "workflows", "builder", "vocab", "roadmap"];
  let activeView = "library";
  function setHash(h) {
    try { history.replaceState(null, "", "#" + h); } catch (e) { /* ignore */ }
  }
  function showView(name) {
    activeView = name;
    VIEWS.forEach((v) => { $("#view-" + v).hidden = v !== name; });
    $$(".tabs a").forEach((a) => {
      if (a.dataset.tab === name) a.setAttribute("aria-current", "page"); else a.removeAttribute("aria-current");
    });
  }
  function route() {
    const h = decodeURIComponent((location.hash || "").slice(1));
    if (VIEWS.includes(h)) {
      closeDrawer(true);
      showView(h);
      if (h === "workflows") renderWorkflows();
      if (h === "library") refreshLibrary();
      window.scrollTo(0, 0);
      return;
    }
    if (wfById(h)) { closeDrawer(true); showView("workflows"); renderWorkflows(); window.scrollTo(0, 0); return; }
    if (h && findPrompt(h)) { showView("library"); openDrawer(h, { fromHash: true }); return; }
    showView("library");
  }
  window.addEventListener("hashchange", route);

  /* ---------- Keyboard ---------- */
  document.addEventListener("keydown", (e) => {
    const typing = /^(INPUT|TEXTAREA|SELECT)$/.test(e.target.tagName);
    if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") { e.preventDefault(); openPalette(); return; }
    if (e.key === "Escape") {
      const top = modalStack[modalStack.length - 1];
      if (top) { hideModal(top.sel); return; }
      if (!$("#drawer").hidden) { closeDrawer(); return; }
      if (e.target === searchEl && searchEl.value) { searchEl.value = ""; state.query = ""; renderGrid(); }
      return;
    }
    if (!$("#peek").hidden && !typing) {
      if (e.key === "ArrowRight") { stepPeek(1); return; }
      if (e.key === "ArrowLeft") { stepPeek(-1); return; }
    }
    if (e.key === "/" && !typing && !e.metaKey && !e.ctrlKey && !modalStack.length) {
      e.preventDefault();
      closeDrawer(true);
      if (activeView !== "library") location.hash = "library";
      setTimeout(() => searchEl.focus(), 0);
    }
    if ((e.metaKey || e.ctrlKey) && e.key === "Enter" && current && !$("#drawer").hidden) { e.preventDefault(); $("#dCopy").click(); }
  });

  /* ---------- Boot ---------- */
  refreshLibrary();
  renderBuilderFields();
  updateBuilder();
  renderFormulas();
  renderVocab();
  renderRoadmap();
  route();
})();
