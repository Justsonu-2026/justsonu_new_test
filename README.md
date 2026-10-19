# Creative Prompt Vault

A searchable library of fill-in prompt templates for AI creative production: AI video, AI images, Blender previz, ads and UGC, characters, social, audio, brand, design review, research, client docs and building with Claude Code.

Open `index.html` in a browser. There's no build step, no server and no dependencies.

## What's inside

| Section | What it does |
| --- | --- |
| **Library** | 65 templates across 12 skills. Search, filter by skill, favorites or recently copied, and sort. Open a prompt to fill in its blanks with a live, highlighted preview, then copy it. |
| **Builder** | Put together an image or video prompt field by field, with suggestions from standard film vocabulary. Save the result as a reusable template. |
| **Vocabulary** | About 100 shot sizes, camera moves, lenses, lighting setups, looks, grades, aspect ratios, transitions and audio terms. Click a term to copy it. Also has prompt formulas with their sources. |
| **Roadmap** | What's shipped, what's next, and new prompt packs worth adding. |

Your favorites, copy counts, filled-in blanks and your own prompts are saved in your browser (`localStorage`). Use **Export / Import** in the footer to back them up or move them to another device.

### Keyboard

- `/` jumps to search
- `Esc` closes a panel
- `Ctrl/⌘ + Enter` copies the open prompt

### Deep links

Every prompt has its own link, for example `index.html#vid-02`. Tabs work the same way: `#builder`, `#vocab`, `#roadmap`.

## Adding prompts

Prompts live in `assets/data.js`. Add an object to `VAULT.prompts`:

```js
{ id: "vid-09", cat: "video", title: "Drone reveal",
  desc: "One line on when to use it.",
  tags: ["drone", "aerial"], tools: ["Kling", "Seedance"],
  body: `{{Subject|A lighthouse}} on {{Setting|a cliff at dusk}}. Camera: {{Camera move|aerial pullback}}.` }
```

Write blanks as `{{Name|default value}}`. If the same name appears twice it shares one value. Categories are listed in `VAULT.categories`.

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
assets/styles.css   design tokens (light + dark) and layout
assets/data.js      prompts, categories, vocabulary, formulas, roadmap
assets/app.js       search, drawer, editor, builder, import/export, routing
tools/build.py      bundles everything into one HTML file
dist/               built single-file version
```
