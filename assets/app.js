/* Creative Prompt Vault — app logic. No dependencies. */
(function () {
  "use strict";

  const V = window.VAULT;
  const $ = (s, el) => (el || document).querySelector(s);
  const $$ = (s, el) => Array.from((el || document).querySelectorAll(s));
  const STORE_KEY = "promptVault.v1";
  const VAR_RE = /\{\{\s*([^{}|]+?)\s*(?:\|([^{}]*))?\}\}/g;

  /* ---------- Storage (per browser, failure-tolerant) ---------- */
  const blank = () => ({ favs: [], used: {}, recent: [], custom: [], fills: {}, builder: {} });
  let store = blank();
  try {
    const raw = localStorage.getItem(STORE_KEY);
    if (raw) store = Object.assign(blank(), JSON.parse(raw));
  } catch (e) { /* storage unavailable: run in memory */ }
  function save() {
    try { localStorage.setItem(STORE_KEY, JSON.stringify(store)); } catch (e) { /* ignore */ }
  }

  /* ---------- Helpers ---------- */
  const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  const catById = Object.fromEntries(V.categories.map((c) => [c.id, c]));
  const allPrompts = () => V.prompts.concat(store.custom);
  const findPrompt = (id) => allPrompts().find((p) => p.id === id);

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
    toastTimer = setTimeout(() => { t.hidden = true; }, 2200);
  }
  function copyText(text, label) {
    const done = () => toast(label || "Copied");
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
      toast(ok ? (label || "Copied") : "Copy blocked here. Select the text and copy it manually.");
    };
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(text).then(done, fallback);
    } else { fallback(); }
  }
  function markUsed(id) {
    store.used[id] = (store.used[id] || 0) + 1;
    store.recent = [id].concat(store.recent.filter((x) => x !== id)).slice(0, 12);
    save();
  }
  const ICON = {
    star: '<svg viewBox="0 0 16 16" aria-hidden="true"><path d="M8 1.8l1.9 3.9 4.3.6-3.1 3 .7 4.3L8 11.6l-3.8 2 .7-4.3-3.1-3 4.3-.6z"/></svg>',
    all: '<svg viewBox="0 0 16 16" aria-hidden="true"><rect x="2" y="2" width="5" height="5" rx="1"/><rect x="9" y="2" width="5" height="5" rx="1"/><rect x="2" y="9" width="5" height="5" rx="1"/><rect x="9" y="9" width="5" height="5" rx="1"/></svg>',
    clock: '<svg viewBox="0 0 16 16" aria-hidden="true"><circle cx="8" cy="8" r="6"/><path d="M8 4.5V8l2.5 1.5"/></svg>'
  };

  /* ---------- Library state ---------- */
  const state = { filter: "all", query: "", sort: "featured" };
  try {
    const f = sessionStorage.getItem("promptVault.filter");
    if (f) state.filter = f;
  } catch (e) { /* ignore */ }

  function matches(p, tokens) {
    if (!tokens.length) return 1;
    const cat = catById[p.cat];
    const title = p.title.toLowerCase();
    const hay = [p.title, p.desc, (p.tags || []).join(" "), (p.tools || []).join(" "), p.body, cat ? cat.name + " " + cat.skill : ""].join(" ").toLowerCase();
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
    if (state.filter === "fav") list = list.filter((p) => store.favs.includes(p.id));
    else if (state.filter === "recent") list = store.recent.map(findPrompt).filter(Boolean);
    else if (state.filter !== "all") list = list.filter((p) => p.cat === state.filter);

    const scored = list.map((p, i) => ({ p, i, s: matches(p, tokens) })).filter((x) => x.s > 0);
    const by = {
      featured: (a, b) => (tokens.length ? b.s - a.s : 0) || a.i - b.i,
      az: (a, b) => a.p.title.localeCompare(b.p.title),
      used: (a, b) => (store.used[b.p.id] || 0) - (store.used[a.p.id] || 0) || a.i - b.i,
      vars: (a, b) => parseVars(a.p.body).length - parseVars(b.p.body).length || a.i - b.i
    }[state.sort];
    if (!(state.filter === "recent" && state.sort === "featured" && !tokens.length)) scored.sort(by);
    return scored.map((x) => x.p);
  }

  function countFor(filter) {
    if (filter === "all") return allPrompts().length;
    if (filter === "fav") return store.favs.filter(findPrompt).length;
    if (filter === "recent") return store.recent.filter(findPrompt).length;
    return allPrompts().filter((p) => p.cat === filter).length;
  }

  function renderSidebar() {
    const views = [["all", "All prompts", ICON.all], ["fav", "Favorites", ICON.star], ["recent", "Recently copied", ICON.clock]];
    $("#sideViews").innerHTML = views.map(([id, label, icon]) =>
      `<button class="side-btn" type="button" data-filter="${id}" aria-pressed="${state.filter === id}"><span class="glyph">${icon}</span><span>${label}</span><span class="n">${countFor(id)}</span></button>`
    ).join("");
    $("#sideCats").innerHTML = V.categories.map((c) =>
      `<button class="side-btn" type="button" data-filter="${c.id}" aria-pressed="${state.filter === c.id}" title="${esc(c.skill)}"><span class="code">${c.code}</span><span>${esc(c.name)}</span><span class="n">${countFor(c.id)}</span></button>`
    ).join("");
    const chips = [["all", "All"], ["fav", "Favorites"], ["recent", "Recent"]].concat(V.categories.map((c) => [c.id, c.name]));
    $("#catChips").innerHTML = chips.map(([id, label]) =>
      `<button class="chip" type="button" data-filter="${id}" aria-pressed="${state.filter === id}">${esc(label)} <span>${countFor(id)}</span></button>`
    ).join("");
  }

  function renderStats() {
    const builtIn = V.prompts.length;
    const skills = V.categories.filter((c) => c.id !== "custom").length;
    const blanks = V.prompts.reduce((n, p) => n + parseVars(p.body).length, 0);
    $("#stats").innerHTML =
      `<div><dt>Prompts</dt><dd>${builtIn + store.custom.length}</dd></div>` +
      `<div><dt>Skills</dt><dd>${skills}</dd></div>` +
      `<div><dt>Fill-in blanks</dt><dd>${blanks}</dd></div>`;
  }

  function cardHtml(p) {
    const cat = catById[p.cat] || catById.custom;
    const n = parseVars(p.body).length;
    const fav = store.favs.includes(p.id);
    const tags = (p.tags || []).slice(0, 4).map((t) => `<span class="tag">${esc(t)}</span>`).join("");
    return `<article class="card" data-id="${esc(p.id)}">
      <div class="card-top"><span class="code">${cat.code}</span><span>${esc(cat.name)}</span>${p.cat === "custom" ? '<span class="mine">Yours</span>' : ""}</div>
      <h3><button type="button" data-open="${esc(p.id)}">${esc(p.title)}</button></h3>
      <p class="desc">${esc(p.desc || "")}</p>
      <div class="tags">${tags}</div>
      <div class="card-foot">
        <span class="blanks">${n} blank${n === 1 ? "" : "s"}</span>
        ${store.used[p.id] ? `<span>· copied ${store.used[p.id]}×</span>` : ""}
        <span class="spacer"></span>
        <button class="iconbtn" type="button" data-fav="${esc(p.id)}" aria-pressed="${fav}" aria-label="${fav ? "Remove from" : "Add to"} favorites">${ICON.star}</button>
        <button class="btn" type="button" data-quickcopy="${esc(p.id)}">Copy</button>
      </div>
    </article>`;
  }

  function renderGrid() {
    const list = currentList();
    $("#grid").innerHTML = list.map(cardHtml).join("");
    const empty = list.length === 0;
    $("#empty").hidden = !empty;
    const label = state.filter === "all" ? "all skills"
      : state.filter === "fav" ? "favorites"
      : state.filter === "recent" ? "recently copied"
      : (catById[state.filter] || {}).name;
    const extra = state.filter === "fav" && empty && !state.query ? " Tap the star on any prompt to keep it here." : "";
    $("#resultMeta").textContent = `${list.length} prompt${list.length === 1 ? "" : "s"} in ${label}${state.query ? ` matching “${state.query}”` : ""}.${extra}`;
    if (state.filter === "custom" && empty && !state.query) {
      $("#empty h3").textContent = "No prompts of your own yet";
      $("#empty p").textContent = "Write one from scratch, duplicate any template, or save one from the builder.";
    } else {
      $("#empty h3").textContent = "No prompts match";
      $("#empty p").textContent = "Try a shorter search, pick another skill, or write your own template.";
    }
  }

  function refreshLibrary() {
    renderSidebar();
    renderStats();
    renderGrid();
  }

  function setFilter(f) {
    state.filter = f;
    try { sessionStorage.setItem("promptVault.filter", f); } catch (e) { /* ignore */ }
    refreshLibrary();
  }

  function toggleFav(id) {
    const i = store.favs.indexOf(id);
    if (i >= 0) store.favs.splice(i, 1); else store.favs.push(id);
    save();
    return i < 0;
  }

  /* ---------- Library events ---------- */
  document.addEventListener("click", (e) => {
    const f = e.target.closest("[data-filter]");
    if (f) { setFilter(f.dataset.filter); return; }
    const fav = e.target.closest("[data-fav]");
    if (fav) {
      const on = toggleFav(fav.dataset.fav);
      toast(on ? "Added to favorites" : "Removed from favorites");
      refreshLibrary();
      return;
    }
    const qc = e.target.closest("[data-quickcopy]");
    if (qc) {
      const p = findPrompt(qc.dataset.quickcopy);
      copyText(fillText(p.body, store.fills[p.id] || {}), "Prompt copied with " + (store.fills[p.id] ? "your saved values" : "example values"));
      markUsed(p.id);
      refreshLibrary();
      return;
    }
    const op = e.target.closest("[data-open]");
    if (op) { openDrawer(op.dataset.open); return; }
  });

  const searchEl = $("#search");
  searchEl.addEventListener("input", () => { state.query = searchEl.value; renderGrid(); });
  $("#sort").addEventListener("change", (e) => { state.sort = e.target.value; renderGrid(); });
  $("#emptyNew").addEventListener("click", () => openEditor());
  $("#newPromptBtn").addEventListener("click", () => openEditor());

  /* ---------- Drawer ---------- */
  let current = null;
  let lastFocus = null;

  function openDrawer(id, opts) {
    const p = findPrompt(id);
    if (!p) return;
    current = p;
    lastFocus = document.activeElement;
    const cat = catById[p.cat] || catById.custom;
    $("#dCode").textContent = cat.code;
    $("#dCat").textContent = cat.name;
    $("#dTitle").textContent = p.title;
    $("#dDesc").textContent = p.desc || "";
    $("#dTools").innerHTML = (p.tools && p.tools.length ? "<span>Works with</span>" + p.tools.map((t) => `<span class="tool">${esc(t)}</span>`).join("") : "") +
      (p.tags || []).map((t) => `<span class="tag">${esc(t)}</span>`).join("");
    renderForm();
    updatePreview();
    syncFavBtn();
    const mine = p.cat === "custom";
    $("#dEdit").hidden = !mine;
    $("#dDelete").hidden = !mine;
    resetDelete();
    $("#scrim").hidden = false;
    $("#drawer").hidden = false;
    document.body.style.overflow = "hidden";
    if (!(opts && opts.fromHash)) setHash(p.id);
    const first = $("#dForm input, #dForm textarea");
    (first || $("#dClose")).focus({ preventScroll: true });
  }

  function closeDrawer() {
    if ($("#drawer").hidden) return;
    $("#drawer").hidden = true;
    $("#scrim").hidden = true;
    document.body.style.overflow = "";
    current = null;
    setHash("library");
    refreshLibrary();
    if (lastFocus && document.contains(lastFocus)) lastFocus.focus({ preventScroll: true });
  }

  function renderForm() {
    const vars = parseVars(current.body);
    const fills = store.fills[current.id] || {};
    const form = $("#dForm");
    if (!vars.length) {
      form.innerHTML = '<p class="none">This prompt has no blanks. Copy it as it is.</p>';
      return;
    }
    form.innerHTML = vars.map((v, i) => {
      const id = "fv-" + i;
      const val = fills[v.name] !== undefined ? fills[v.name] : v.def;
      const long = v.def.length > 70 || /paste|transcript|notes|feedback|data|prompt|script/i.test(v.name + " " + v.def);
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

  function updatePreview() {
    const vals = currentValues();
    $("#dOut").innerHTML = fillHtml(current.body, vals);
    const text = fillText(current.body, vals);
    $("#dCount").textContent = `${words(text)} words · ${text.length} characters`;
  }

  function syncFavBtn() {
    const on = store.favs.includes(current.id);
    const b = $("#dFav");
    b.setAttribute("aria-pressed", String(on));
    b.setAttribute("aria-label", on ? "Remove from favorites" : "Add to favorites");
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

  $("#dCopy").addEventListener("click", () => {
    copyText(fillText(current.body, currentValues()), "Prompt copied");
    markUsed(current.id);
  });
  $("#dCopyRaw").addEventListener("click", () => copyText(current.body, "Template copied with blanks"));
  $("#dReset").addEventListener("click", () => {
    delete store.fills[current.id];
    save();
    renderForm();
    updatePreview();
    toast("Blanks reset to examples");
  });
  $("#dFav").addEventListener("click", () => {
    const on = toggleFav(current.id);
    syncFavBtn();
    toast(on ? "Added to favorites" : "Removed from favorites");
  });
  $("#dDuplicate").addEventListener("click", () => {
    const p = current;
    closeDrawer();
    openEditor({ title: p.title + " (my version)", cat: "custom", origCat: p.origCat || p.cat, tags: p.tags, desc: p.desc, body: p.body, tools: p.tools });
  });
  $("#dEdit").addEventListener("click", () => {
    const p = current;
    closeDrawer();
    openEditor(p, true);
  });
  function resetDelete() {
    const b = $("#dDelete");
    b.classList.remove("confirm");
    b.textContent = "Delete";
  }
  $("#dDelete").addEventListener("click", (e) => {
    const b = e.currentTarget;
    if (!b.classList.contains("confirm")) {
      b.classList.add("confirm");
      b.textContent = "Click again to delete";
      return;
    }
    const id = current.id;
    store.custom = store.custom.filter((p) => p.id !== id);
    store.favs = store.favs.filter((x) => x !== id);
    store.recent = store.recent.filter((x) => x !== id);
    delete store.fills[id];
    delete store.used[id];
    save();
    closeDrawer();
    toast("Prompt deleted");
  });
  $("#dClose").addEventListener("click", closeDrawer);
  $("#scrim").addEventListener("click", closeDrawer);

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
    const rec = {
      id: editingId || "own-" + Date.now().toString(36),
      cat: "custom",
      origCat: chosen,
      title,
      desc: $("#eDesc").value.trim(),
      tags: $("#eTags").value.split(",").map((t) => t.trim()).filter(Boolean).concat(chosen !== "custom" ? [catById[chosen].name] : []).filter((t, i, a) => a.indexOf(t) === i),
      tools: [],
      body
    };
    if (editingId) {
      const old = store.custom.find((x) => x.id === editingId);
      if (old) rec.tools = old.tools || [];
      store.custom = store.custom.map((x) => (x.id === editingId ? rec : x));
      delete store.fills[editingId];
    } else {
      store.custom.unshift(rec);
    }
    save();
    hideModal("#editor");
    setFilter("custom");
    showView("library");
    toast(editingId ? "Prompt updated" : "Prompt saved to My prompts");
    openDrawer(rec.id);
  });

  /* ---------- Modals ---------- */
  let modalReturn = null;
  function showModal(sel) {
    modalReturn = document.activeElement;
    $(sel).hidden = false;
    document.body.style.overflow = "hidden";
  }
  function hideModal(sel) {
    $(sel).hidden = true;
    if ($("#drawer").hidden) document.body.style.overflow = "";
    if (modalReturn && document.contains(modalReturn)) modalReturn.focus({ preventScroll: true });
  }
  $$(".modal").forEach((m) => {
    m.addEventListener("click", (e) => {
      if (e.target === m || e.target.closest("[data-close]")) hideModal("#" + m.id);
    });
  });

  /* ---------- Import / export ---------- */
  function exportData() {
    return JSON.stringify({
      app: "creative-prompt-vault", version: 1, exported: new Date().toISOString(),
      favorites: store.favs, custom: store.custom, fills: store.fills
    }, null, 2);
  }
  $("#exportBtn").addEventListener("click", () => {
    $("#ioTitle").textContent = "Export your prompts";
    $("#ioHint").textContent = `${store.custom.length} of your own prompts, ${store.favs.length} favorites and your saved blanks. Copy this text (or download it) and use Import on any device.`;
    const ta = $("#ioText");
    ta.value = exportData();
    ta.readOnly = true;
    $("#ioFileWrap").hidden = true;
    $("#ioError").hidden = true;
    // Embedded viewers (iframes) usually block downloads, so offer Copy only there.
    let canDownload = true;
    try { canDownload = window.self === window.top; } catch (e) { canDownload = false; }
    $("#ioFoot").innerHTML = '<button class="btn btn-ghost" type="button" data-close>Close</button>' +
      (canDownload ? '<button class="btn" type="button" id="ioDownload">Download .json</button>' : "") +
      '<button class="btn btn-primary" type="button" id="ioCopy">Copy</button>';
    $("#ioCopy").addEventListener("click", () => copyText(ta.value, "Backup copied"));
    if (canDownload) $("#ioDownload").addEventListener("click", () => {
      try {
        const url = URL.createObjectURL(new Blob([ta.value], { type: "application/json" }));
        const a = document.createElement("a");
        a.href = url;
        a.download = "prompt-vault-backup.json";
        document.body.appendChild(a);
        a.click();
        a.remove();
        setTimeout(() => URL.revokeObjectURL(url), 1000);
        toast("Download started. If nothing saved, use Copy instead.");
      } catch (e) { toast("Download isn't available here. Use Copy instead."); }
    });
    showModal("#io");
    ta.focus();
    ta.select();
  });
  $("#importBtn").addEventListener("click", () => {
    $("#ioTitle").textContent = "Import prompts";
    $("#ioHint").textContent = "Paste a backup exported from this library. Prompts with the same ID are replaced; everything else is added.";
    const ta = $("#ioText");
    ta.value = "";
    ta.readOnly = false;
    ta.placeholder = '{ "custom": [ ... ], "favorites": [ ... ] }';
    $("#ioFileWrap").hidden = false;
    $("#ioFile").value = "";
    $("#ioError").hidden = true;
    $("#ioFoot").innerHTML = '<button class="btn btn-ghost" type="button" data-close>Cancel</button><button class="btn btn-primary" type="button" id="ioDoImport">Import</button>';
    $("#ioDoImport").addEventListener("click", () => doImport(ta.value));
    showModal("#io");
    ta.focus();
  });
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
    if (!valid.length && !(data.favorites && data.favorites.length)) {
      err.textContent = "No prompts or favorites found in that text.";
      err.hidden = false;
      return;
    }
    valid.forEach((p) => {
      const rec = {
        id: typeof p.id === "string" && p.id.startsWith("own-") ? p.id : "own-" + Math.random().toString(36).slice(2, 9),
        cat: "custom", origCat: catById[p.origCat] ? p.origCat : "custom",
        title: p.title.slice(0, 120), desc: String(p.desc || "").slice(0, 300),
        tags: Array.isArray(p.tags) ? p.tags.map(String).slice(0, 12) : [],
        tools: Array.isArray(p.tools) ? p.tools.map(String).slice(0, 8) : [],
        body: p.body
      };
      store.custom = store.custom.filter((x) => x.id !== rec.id);
      store.custom.push(rec);
    });
    if (Array.isArray(data.favorites)) data.favorites.forEach((id) => { if (typeof id === "string" && !store.favs.includes(id)) store.favs.push(id); });
    if (data.fills && typeof data.fills === "object") Object.assign(store.fills, data.fills);
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
      if (list) {
        used.add(list);
        dl = ` list="dl-${list.replace(/\W+/g, "")}"`;
      }
      return `<label class="field${wide ? " wide" : ""}" for="${id}"><span>${esc(label)}</span><input id="${id}" data-key="${key}" placeholder="${esc(ph)}" value="${esc(saved[key] || "")}"${dl}></label>`;
    }).join("") + Array.from(used).map((g) =>
      `<datalist id="dl-${g.replace(/\W+/g, "")}">${vocab[g].map((t) => `<option value="${esc(t)}"></option>`).join("")}</datalist>`
    ).join("");
  }

  function rawBuilderValues() {
    const vals = {};
    $$("#builderFields [data-key]").forEach((el) => { vals[el.dataset.key] = el.value.trim(); });
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

  const listKeys = new Set(BF.video.concat(BF.image).filter((f) => f[2]).map((f) => f[0]));
  const lcFirst = (s) => (/^[A-Z][a-z]/.test(s) ? s[0].toLowerCase() + s.slice(1) : s);
  function builderValues() {
    const vals = {};
    $$("#builderFields [data-key]").forEach((el) => {
      const v = el.value.trim();
      vals[el.dataset.key] = listKeys.has(el.dataset.key) ? lcFirst(v) : v;
    });
    return vals;
  }

  function updateBuilder() {
    const vals = rawBuilderValues();
    store.builder[bmode] = vals;
    store.builder.mode = bmode;
    save();
    const shown = builderValues();
    const text = assemble((k) => shown[k] || "", bmode);
    const out = $("#builderOut");
    if (text) {
      out.textContent = text;
    } else {
      out.innerHTML = '<span class="v empty-v">Start typing in any field, or pick a suggested term.</span>';
    }
    $("#builderCount").textContent = text ? `${words(text)} words` : "";
  }

  $("#builderForm").addEventListener("change", (e) => {
    if (e.target.name === "bmode") {
      bmode = e.target.value;
      renderBuilderFields();
    }
    updateBuilder();
  });
  $("#builderForm").addEventListener("input", updateBuilder);
  $("#builderForm").addEventListener("submit", (e) => e.preventDefault());
  $("#builderCopy").addEventListener("click", () => {
    const vals = builderValues();
    const text = assemble((k) => vals[k] || "", bmode);
    if (!text) { toast("Fill in at least one field first"); return; }
    copyText(text, "Prompt copied");
  });
  $("#builderReset").addEventListener("click", () => {
    store.builder[bmode] = {};
    save();
    renderBuilderFields();
    updateBuilder();
  });
  $("#builderSave").addEventListener("click", () => {
    const vals = builderValues();
    const labels = Object.fromEntries(BF[bmode].map(([k, l]) => [k, l]));
    const body = assemble((k) => (vals[k] ? `{{${labels[k]}|${vals[k].replace(/[{}|]/g, "")}}}` : ""), bmode);
    if (!body) { toast("Fill in at least one field first"); return; }
    openEditor({
      title: (vals.subject ? vals.subject.slice(0, 50) : "Untitled") + (bmode === "video" ? " (video)" : " (image)"),
      cat: bmode, desc: "Built with the prompt builder.", tags: [bmode === "video" ? "video" : "image", "builder"], body
    });
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
  $("#vocab").addEventListener("click", (e) => {
    const b = e.target.closest("[data-term]");
    if (b) copyText(b.dataset.term, `Copied “${b.dataset.term}”`);
  });
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
  const VIEWS = ["library", "builder", "vocab", "roadmap"];
  function setHash(h) {
    try { history.replaceState(null, "", "#" + h); } catch (e) { /* ignore */ }
  }
  function showView(name) {
    VIEWS.forEach((v) => { $("#view-" + v).hidden = v !== name; });
    $$(".tabs a").forEach((a) => {
      if (a.dataset.tab === name) a.setAttribute("aria-current", "page"); else a.removeAttribute("aria-current");
    });
  }
  function route() {
    const h = decodeURIComponent((location.hash || "").slice(1));
    if (VIEWS.includes(h)) { closeDrawerSilently(); showView(h); window.scrollTo(0, 0); return; }
    if (h && findPrompt(h)) { showView("library"); openDrawer(h, { fromHash: true }); return; }
    showView("library");
  }
  function closeDrawerSilently() {
    if ($("#drawer").hidden) return;
    $("#drawer").hidden = true;
    $("#scrim").hidden = true;
    document.body.style.overflow = "";
    current = null;
  }
  window.addEventListener("hashchange", route);

  /* ---------- Keyboard ---------- */
  document.addEventListener("keydown", (e) => {
    const typing = /^(INPUT|TEXTAREA|SELECT)$/.test(e.target.tagName);
    if (e.key === "Escape") {
      const open = $$(".modal").find((m) => !m.hidden);
      if (open) { hideModal("#" + open.id); return; }
      if (!$("#drawer").hidden) { closeDrawer(); return; }
      if (typing && e.target === searchEl && searchEl.value) { searchEl.value = ""; state.query = ""; renderGrid(); }
      return;
    }
    if (e.key === "/" && !typing && !e.metaKey && !e.ctrlKey) {
      e.preventDefault();
      showView("library");
      setHash("library");
      searchEl.focus();
    }
    if ((e.metaKey || e.ctrlKey) && e.key === "Enter" && current && !$("#drawer").hidden) {
      e.preventDefault();
      $("#dCopy").click();
    }
  });

  /* ---------- Boot ---------- */
  if (state.filter !== "all" && state.filter !== "fav" && state.filter !== "recent" && !catById[state.filter]) state.filter = "all";
  refreshLibrary();
  renderBuilderFields();
  updateBuilder();
  renderFormulas();
  renderVocab();
  renderRoadmap();
  route();
})();
