# Creative Prompt Vault

A searchable library of fill-in prompt templates for AI creative production: AI video, AI images, Blender previz, ads and UGC, characters, social, audio, brand, design review, research, client docs and building with Claude Code.

Open `index.html` in a browser. There's no build step, no server and no dependencies.

## What's inside

| Section | What it does |
| --- | --- |
| **Library** | 65 templates across 12 skills. Browse by skill, search, filter by favorites, top rated or recently copied, and sort. |
| **Example popup** | Click **Example** (or a title) to see what a prompt does, a sample of the result, what it's best for, the example input and a tip. Use ← → to flip through. |
| **Prompt studio** | Click **Use** to fill in the blanks with a live preview, copy it, log how well it worked (stars, model, notes), or **Improve with Claude**. |
| **Workflows** | Six step-by-step chains (ad from scratch, product launch, previz to final shot, character series, win a client, portfolio site). Project details fill matching blanks in every step. |
| **Quick search** | `Ctrl/⌘ + K` jumps to any prompt, workflow or action. |
| **Builder** | Put together an image or video prompt field by field with film-vocabulary suggestions, then save it as a template. |
| **Vocabulary** | About 100 camera, lens, lighting, look and audio terms (click to copy) plus prompt formulas with sources. |
| **Roadmap** | What's shipped, what's next, and prompt packs worth adding. |

Favorites, ratings, workflow progress, filled-in blanks and your own prompts are saved in your browser (`localStorage`). Use **Export / Import** in the footer to back them up or move them to another device.

**Improve with Claude** rewrites the prompt inside the page when it's opened as a published Claude artifact. Anywhere else (GitHub Pages, a local file) it copies a ready-made request you can paste into any Claude chat.

### Keyboard

- `/` jumps to search, `Ctrl/⌘ + K` opens quick search
- `←` `→` flip through example popups
- `Esc` closes a panel, `Ctrl/⌘ + Enter` copies the open prompt

### Deep links

Every prompt has its own link, for example `index.html#vid-02`. Workflows too (`#wf-ad`), and tabs: `#workflows`, `#builder`, `#vocab`, `#roadmap`.

## Adding prompts

Prompts live in `assets/data.js`. Add an object to `VAULT.prompts`:

```js
{ id: "vid-09", cat: "video", title: "Drone reveal",
  desc: "One line on when to use it.",
  tags: ["drone", "aerial"], tools: ["Kling", "Seedance"],
  body: `{{Subject|A lighthouse}} on {{Setting|a cliff at dusk}}. Camera: {{Camera move|aerial pullback}}.` }
```

Write blanks as `{{Name|default value}}`. If the same name appears twice it shares one value. Categories are listed in `VAULT.categories`.

Add the popup example for it in `assets/examples.js`, keyed by the same id:

```js
"vid-09": {
  does: "What the prompt does, in one or two sentences.",
  when: ["Use case one", "Use case two"],
  output: "A sample of the result it produces.",
  tip: "One practical tip." }
```

Workflows live in `VAULT.workflows` in `assets/data.js`.

You can also write prompts in the app itself with **New prompt**, or **Duplicate & edit** on any template.

## Single-file version

```bash
python3 tools/build.py
```

This writes `dist/prompt-vault.html`, a single file with everything inlined. You can email it, put it in a shared drive, or open it offline.

## Publishing on GitHub Pages

1. Merge this branch into `main`.
2. In the repository, go to **Settings → Pages**.
3. Under **Build and deployment**, choose **Deploy from a branch**, then pick `main` and `/ (root)`.
4. The site will be live at `https://<your-username>.github.io/<repo-name>/` after a minute or two.

## Files

```
index.html          page structure
assets/styles.css   dark cinematic theme and layout
assets/data.js      prompts, categories, workflows, vocabulary, formulas, roadmap
assets/examples.js  what each prompt does, sample results and tips
assets/app.js       library, example popup, studio, workflows, quick search, builder, import/export
tools/build.py      bundles everything into one HTML file
dist/               built single-file version
```
