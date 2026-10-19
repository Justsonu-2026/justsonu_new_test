#!/usr/bin/env python3
"""Bundle the site into one self-contained HTML file.

    python3 tools/build.py                 -> dist/prompt-vault.html (full page, works offline)
    python3 tools/build.py --fragment OUT  -> page body only, for hosts that add their own <html>/<head>
"""
import pathlib
import re
import sys

ROOT = pathlib.Path(__file__).resolve().parent.parent


def read(rel):
    return (ROOT / rel).read_text(encoding="utf-8")


def parts():
    html = read("index.html")
    title = re.search(r"<title>.*?</title>", html, re.S).group(0)
    desc = re.search(r'<meta name="description"[^>]*>', html).group(0)
    fonts = re.search(r'<link rel="stylesheet" href="https://fonts[^>]*>', html).group(0)
    body = re.search(r"<!--APP-START-->(.*?)<!--APP-END-->", html, re.S).group(1)
    css = read("assets/styles.css")
    js = read("assets/data.js") + "\n" + read("assets/app.js")
    if "</script" in js.lower() or "</style" in css.lower():
        sys.exit("Refusing to inline: closing tag found inside CSS/JS")
    return title, desc, fonts, body, css, js


def full():
    title, desc, fonts, body, css, js = parts()
    return f"""<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
{title}
{desc}
{fonts}
<style>
{css}
</style>
</head>
<body>
{body}
<script>
{js}
</script>
</body>
</html>
"""


def fragment():
    title, desc, fonts, body, css, js = parts()
    return f"""{title}
<meta name="claude:viewport-fit-sides" content="cover">
{fonts}
<style>
{css}
</style>
{body}
<script>
{js}
</script>
"""


if __name__ == "__main__":
    if len(sys.argv) == 3 and sys.argv[1] == "--fragment":
        out = pathlib.Path(sys.argv[2])
        out.write_text(fragment(), encoding="utf-8")
    else:
        out = ROOT / "dist" / "prompt-vault.html"
        out.parent.mkdir(exist_ok=True)
        out.write_text(full(), encoding="utf-8")
    print(f"wrote {out} ({out.stat().st_size // 1024} KB)")
