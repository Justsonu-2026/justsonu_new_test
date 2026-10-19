/* Creative Prompt Vault — library data.
   Blanks are written as {{Name|default}}. The same Name used twice shares one value. */
var VAULT = window.VAULT = {};

VAULT.categories = [
  { id: "video",     code: "VID", color: "#ff4d6d", name: "AI Video",              skill: "Seedance, Kling, Higgsfield, Magnific video" },
  { id: "image",     code: "IMG", color: "#9b7bff", name: "AI Image",              skill: "Image models, edits, upscaling" },
  { id: "previz",    code: "PRV", color: "#22c3ee", name: "Blender Previz",        skill: "blender-ai, blender-scene-building" },
  { id: "ads",       code: "ADS", color: "#ff9f1c", name: "Ads & UGC",             skill: "Ads Studio, Marketing Studio" },
  { id: "character", code: "CHR", color: "#ff5cc8", name: "Characters",            skill: "AI influencer, character sheets" },
  { id: "social",    code: "SOC", color: "#34d399", name: "Social & Shorts",       skill: "TikTok, Reels, Shorts, virality" },
  { id: "audio",     code: "AUD", color: "#facc15", name: "Voice, Music & SFX",    skill: "TTS, music, sound effects" },
  { id: "brand",     code: "BRD", color: "#c084fc", name: "Brand & Design System", skill: "design-system, brand kits" },
  { id: "design",    code: "DSN", color: "#2dd4bf", name: "Design Review",         skill: "design-critique, accessibility-review, ux-copy, design-handoff" },
  { id: "research",  code: "RSC", color: "#60a5fa", name: "Research",              skill: "deep-research, user-research, research-synthesis" },
  { id: "docs",      code: "DOC", color: "#a3e635", name: "Docs, Decks & Sheets",  skill: "docs, pptx, xlsx, pdf, dataviz" },
  { id: "build",     code: "DEV", color: "#fb7c4a", name: "Build with Claude Code", skill: "websites, skill-creator, automation, RunPod" },
  { id: "custom",    code: "OWN", color: "#e5e7eb", name: "My prompts",            skill: "Written by you" }
];

VAULT.prompts = [
/* ---------------- AI VIDEO ---------------- */
{ id: "vid-01", cat: "video", title: "Cinematic single shot",
  desc: "One continuous shot built on the subject, action, setting, camera, mood formula. The camera move is tied to an event in the scene.",
  tags: ["text-to-video", "formula", "cinematic"], tools: ["Seedance", "Kling", "Higgsfield"],
  body: `{{Subject|A weathered fisherman in a yellow raincoat}} {{Action|hauls a net onto the deck as a wave breaks behind him}}.
Setting: {{Setting|small wooden boat, North Sea, overcast dawn}}.
Camera: {{Shot size|medium shot}}, {{Camera move|slow push-in}}, {{Angle|eye level}}. The camera starts moving when {{Camera trigger|the wave hits the hull}}.
Lighting & mood: {{Lighting|cold diffused daylight, backlit sea spray}}, {{Mood|tense and determined}}.
Style: {{Style|35mm film, muted teal-and-amber grade, fine grain, shallow depth of field}}.
Audio: {{Audio|wind, creaking rope, distant gulls, no music}}.
Constraints: one continuous {{Duration|5}}-second shot, no cuts, no on-screen text, stable anatomy, costume stays the same.` },

{ id: "vid-02", cat: "video", title: "Timeline multi-shot sequence",
  desc: "Timestamped shots inside one generation. Locks the character description so it stays the same across cuts.",
  tags: ["multi-shot", "timeline", "storyboard"], tools: ["Seedance 2.x", "Kling 3.0"],
  body: `{{Duration|10}}-second sequence, {{Aspect ratio|16:9}}.
Character (identical in every shot): {{Character lock|Maya, 28, short black bob, olive bomber jacket, silver hoop earrings}}.

[0–3s] Shot 1: {{Shot 1|Wide establishing. Neon-lit Tokyo alley in the rain, Maya walks toward camera, slow dolly back}}.
[3–6s] Shot 2: {{Shot 2|Medium close-up. Maya stops and looks up at a flickering sign, camera arcs 30° to her left}}.
[6–10s] Shot 3: {{Shot 3|Insert. Her hand pulls a glowing keycard from her pocket, rack focus from the card to the sign}}.

Global style: {{Style|anamorphic, cyan and magenta neon, wet reflections, light grain, shallow depth of field}}.
Audio: {{Audio|rain on metal, distant train, low synth drone building}}.
Rules: hard cuts between shots, no on-screen text, no face morphing, outfit never changes.` },

{ id: "vid-03", cat: "video", title: "Animate a still image",
  desc: "Image-to-video that keeps the reference frame intact and only adds the motion you describe.",
  tags: ["image-to-video", "subtle motion"], tools: ["Kling", "Seedance", "Higgsfield"],
  body: `Animate the attached image. Keep the composition, subject identity, colors and lighting exactly as in the reference.
Subject motion: {{Subject motion|her hair and scarf move gently in the wind, she blinks and turns her head slightly toward camera}}.
Environment motion: {{Environment motion|clouds drift left, grass sways}}.
Camera: {{Camera move|very slow push-in}}, motion intensity {{Intensity|subtle}}.
Duration: {{Duration|5}} seconds.
Do not add new objects, people or text. No warping of hands or face.` },

{ id: "vid-04", cat: "video", title: "Start frame to end frame transition",
  desc: "Keyframe prompt: describe the path between two images so the model doesn't invent a cut.",
  tags: ["keyframes", "transition", "first-last frame"], tools: ["Kling 3.0", "Seedance"],
  body: `Start frame: image 1. End frame: image 2.
Create one continuous {{Duration|5}}-second shot that travels from the start frame to the end frame.
Transition: {{Transition|the camera flies through the open window of the house and settles in the sunlit kitchen}}.
Camera path: {{Camera path|forward dolly that accelerates, then eases out}}.
Keep {{Consistent elements|the color palette, time of day and the cat on the windowsill}} consistent.
No cuts, no fades, no face morphing.` },

{ id: "vid-05", cat: "video", title: "Product hero shot",
  desc: "Premium commercial move around a product with controlled light and no distorted logos.",
  tags: ["product", "commercial", "macro"], tools: ["Kling", "Seedance", "Higgsfield"],
  body: `Premium product commercial shot of {{Product|a matte black wireless earbud case}} on {{Surface|a slab of wet black marble}}.
Action: {{Action|the lid snaps open and the earbuds rise slightly with a soft glow}}.
Camera: {{Camera move|macro orbit 90° around the product, ending on a three-quarter hero angle}}.
Lighting: {{Lighting|dark studio, single rim light, soft gradient backdrop, crisp specular highlights}}.
Style: {{Style|high-end tech ad, ultra sharp, slow-motion feel}}.
{{Duration|6}} seconds, {{Aspect ratio|9:16}}.
Logo and text must not distort. No extra products, no hands.` },

{ id: "vid-06", cat: "video", title: "Reverse-engineer a reference video",
  desc: "Turn a video you like into a shot-by-shot breakdown and a reusable prompt with a new subject.",
  tags: ["analysis", "reference", "breakdown"], tools: ["Claude", "video_analysis"],
  body: `I'll give you a reference video (or a description of it). Break it down shot by shot into a reusable prompt skeleton.

For each shot list: timestamp, shot size, angle, camera move and what triggers it, subject action, lighting, color grade, lens feel, transition, audio.

Then write:
1. One generation prompt for {{Target model|Seedance 2.0}} that recreates the style with a new subject: {{New subject|a barista making latte art}}.
2. A timestamped multi-shot version of the same prompt.
3. What the model will likely get wrong, and the prompt wording that prevents it.

Reference: {{Reference|paste a link or describe the video}}` },

{ id: "vid-07", cat: "video", title: "Fix a broken generation",
  desc: "Diagnose artifacts like face morphing or jitter and rewrite the prompt with tighter constraints.",
  tags: ["troubleshooting", "negative prompt", "iteration"], tools: ["Claude"],
  body: `My generated video has these problems: {{Problems|face morphs between frames, hands melt, camera jitters, logo warps}}.
Model: {{Model|Kling 3.0}}.
Original prompt:
{{Original prompt|paste the prompt here}}

Rewrite the prompt to fix these problems while keeping the creative intent. Explain each change in one line.
Add a short constraints line suited to this model.
Then give two alternatives: a safer version with less motion, and a version that keeps the ambition but splits the action into two shots.` },

{ id: "vid-08", cat: "video", title: "Dialogue scene with native audio",
  desc: "Two characters talking, with lip-sync, delivery notes and ambience for models that generate sound.",
  tags: ["dialogue", "lip-sync", "audio"], tools: ["Kling 3.0", "Seedance 2.x"],
  body: `{{Duration|8}}-second dialogue scene, {{Aspect ratio|16:9}}.
Characters: A = {{Character A|Leo, 40s, grey beard, denim shirt}}; B = {{Character B|Ana, 30s, red curly hair, white apron}}.
Setting: {{Setting|a small bakery at closing time, warm practical lights}}.

[0–4s] Over-the-shoulder on B. A says: "{{Line A|You kept the last loaf for me?}}" ({{Delivery A|surprised, soft}})
[4–8s] Close-up on A. B says: "{{Line B|Same as every Friday.}}" ({{Delivery B|smiling, teasing}})

Ambience: {{Ambience|quiet street outside, oven fan hum}}. No music.
Lips match the words. Faces and outfits stay the same in both shots.` },

/* ---------------- AI IMAGE ---------------- */
{ id: "img-01", cat: "image", title: "Photoreal image",
  desc: "Six-part formula: subject, setting, composition, lighting, camera, color and style.",
  tags: ["photoreal", "formula", "portrait"], tools: ["Higgsfield", "Magnific"],
  body: `{{Subject|Portrait of a 70-year-old tailor holding brass scissors}}, {{Detail|deep smile lines, measuring tape around his neck}}.
Setting: {{Setting|cluttered workshop with bolts of indigo fabric}}.
Composition: {{Composition|close-up, rule of thirds, subject on the left, eyes in sharp focus}}.
Lighting: {{Lighting|warm window light from camera left, soft shadows, dust in the air}}.
Camera: {{Camera|85mm f/1.4, shallow depth of field}}.
Color & mood: {{Color|warm ochre and indigo palette, calm and dignified}}.
Style: {{Style|editorial documentary photography, natural skin texture}}.
Aspect ratio {{Aspect ratio|4:5}}. Avoid: {{Avoid|plastic skin, extra fingers, text, watermark}}.` },

{ id: "img-02", cat: "image", title: "E-commerce packshot set",
  desc: "Clean product photos in four standard variations with the label kept intact.",
  tags: ["product", "packshot", "e-commerce"], tools: ["Higgsfield", "Magnific"],
  body: `Studio packshot of {{Product|an amber glass serum bottle with a gold dropper}}.
Background: {{Background|seamless soft beige}} with {{Props|a few rosemary sprigs and water droplets}}.
Lighting: {{Lighting|large softbox from above left, subtle reflection on the surface, clean shadow}}.
Angle: {{Angle|straight on, slightly above eye level}}, product centered and filling 60% of the frame.
Style: commercial catalogue photo, true-to-life color, razor-sharp label.
Make {{Count|4}} versions: plain white background, lifestyle bathroom, top-down flat lay, dark dramatic mood.
Keep the label text unchanged. Aspect ratio {{Aspect ratio|1:1}}.` },

{ id: "img-03", cat: "image", title: "Cinematic film still",
  desc: "A frame that works on its own and as the start frame of a video.",
  tags: ["film still", "keyframe", "cinematic"], tools: ["Higgsfield", "Magnific"],
  body: `Cinematic film still, {{Genre|neo-noir thriller}}. {{Scene|A woman in a red coat stands alone on a subway platform as the train leaves}}.
Shot: {{Shot|wide shot, low angle, symmetrical framing}}. Lens: {{Lens|anamorphic 40mm, horizontal flares}}.
Lighting: {{Lighting|sodium-vapor overheads, green fluorescent spill, deep shadows}}.
Grade: {{Grade|desaturated teal shadows, warm highlights, heavy film grain}}.
Aspect ratio {{Aspect ratio|2.39:1}}.
This frame will start a video, so keep the subject clear, unobstructed and in the mid-ground.` },

{ id: "img-04", cat: "image", title: "Restyle with a reference",
  desc: "Keep the layout of an image and change its style, palette and line work.",
  tags: ["style transfer", "restyle", "reference"], tools: ["Magnific", "Higgsfield"],
  body: `Use the attached image as the content reference. Keep the composition, poses and layout.
Restyle it as {{Target style|a 1970s Japanese anime cel with hand-painted backgrounds}}.
Palette: {{Palette|faded pastels on cream paper texture}}. Line work: {{Line work|clean ink outlines with varying weight}}.
Keep recognisable: {{Keep|faces, clothing colors, the dog}}.
Remove: {{Remove|modern logos and phone screens}}.` },

{ id: "img-05", cat: "image", title: "Precise image edit",
  desc: "Numbered edits with an explicit list of what must not change.",
  tags: ["edit", "inpaint", "retouch"], tools: ["Higgsfield", "Magnific"],
  body: `Edit the attached image. Change only the following:
1. {{Edit 1|Replace the grey sky with a golden-hour sky with soft pink clouds}}
2. {{Edit 2|Change the man's jacket from blue to forest green}}
3. {{Edit 3|Remove the trash can on the right}}

Keep everything else identical: faces, poses, framing, lighting direction, background architecture.
Match the grain and sharpness of the original. Output the same resolution and aspect ratio.` },

{ id: "img-06", cat: "image", title: "Prompt expander",
  desc: "Turn a one-line idea into several production-ready prompts with different creative directions.",
  tags: ["ideation", "art direction", "meta-prompt"], tools: ["Claude"],
  body: `Act as a senior art director. Expand my rough idea into {{Count|3}} production-ready image prompts for {{Model|a photoreal image model}}.
Idea: {{Idea|a cozy coffee shop on Mars}}
Purpose: {{Purpose|Instagram carousel cover}}

For each prompt cover subject, setting, composition, lighting, lens, color palette, mood, style and aspect ratio.
Each version must take a clearly different creative direction.
Finish with which one you'd pick and why, in two sentences.` },

{ id: "img-07", cat: "image", title: "Upscale and enhance brief",
  desc: "Settings and prompt hint for a faithful upscale for print or large screens.",
  tags: ["upscale", "print", "enhance"], tools: ["Magnific", "Higgsfield"],
  body: `Upscale this image {{Scale|4x}} for {{Use|a 60 x 90 cm print}}.
Content: {{Content|portrait with fine hair and fabric texture}}.
Creativity: {{Creativity|low, stay faithful to the original}}.
Enhance: {{Enhance|skin texture, eyelashes, fabric weave}}.
Do not change facial features, expression or colors.
Prompt hint for the upscaler: {{Prompt hint|natural skin pores, crisp detail, photographic, no over-sharpening}}.` },

{ id: "img-08", cat: "image", title: "Social graphic with exact text",
  desc: "Typography-led image where the words must render correctly.",
  tags: ["typography", "text rendering", "poster"], tools: ["Higgsfield", "Magnific"],
  body: `Design a {{Format|square Instagram post}} with the exact text "{{Headline|AI ads in 48 hours}}" and smaller text "{{Subline|Book a free test shoot}}".
Visual: {{Visual|a film clapperboard made of glowing glass on a dark gradient}}.
Typography: {{Typography|bold condensed sans-serif, left aligned, high contrast}}.
Colors: {{Colors|charcoal, warm white, one amber highlight}}.
Spell every word exactly as written. Keep text away from the edges. No extra words, no logos.` },

/* ---------------- BLENDER PREVIZ ---------------- */
{ id: "prv-01", cat: "previz", title: "Previz brief for an AI video shot",
  desc: "Starts the gated Blender_AI workflow: proxies, camera, timing, export, then the AI handoff.",
  tags: ["blender", "previz", "blockout"], tools: ["blender-ai skill", "Blender MCP"],
  body: `Use the Blender_AI workflow. Build a previz blockout whose only job is to lock camera, framing, placement and timing for an AI video model.

Shot: {{Shot description|A runner sprints across a rooftop and leaps to the next building}}
Duration: {{Duration|5}} s at {{FPS|24}} fps, {{Aspect ratio|16:9}}.
Characters as grey proxies: {{Characters|one runner, 1.8 m tall}}.
Environment blockout: {{Environment|two rooftops 4 m apart, water tanks, low walls}}.
Camera: {{Camera|side-on tracking at 3 m, 35 mm, whip-pan to follow the jump}}.
Timing: {{Beats|0–2 s run-up, 2–3 s jump, 3–5 s landing and roll}}.
Target model: {{Target model|Seedance 2.0}}.

Stop after each gated step (Brief, Blockout + Layout, Motion + Timing, Mood light + Export, AI handoff) and show me a viewport check before moving on.` },

{ id: "prv-02", cat: "previz", title: "Camera options to compare",
  desc: "Several cameras for the same shot, each with a marker and playblast.",
  tags: ["camera", "blocking", "playblast"], tools: ["blender-scene-building skill"],
  body: `In the current Blender scene, create {{Count|4}} camera options for the shot "{{Shot name|hero reveal}}", each on its own camera with a timeline marker:
1. {{Move 1|slow dolly-in from 6 m to 2 m, 50 mm}}
2. {{Move 2|crane up from knee height to 4 m, revealing the skyline}}
3. {{Move 3|180° orbit around the subject at 3 m}}
4. {{Move 4|handheld-style follow with slight rotation noise}}

{{Duration|5}} s each, Material Preview look.
Render a quick viewport playblast of each so I can compare framing side by side.` },

{ id: "prv-03", cat: "previz", title: "AI handoff from a previz render",
  desc: "Prompt that tells the video model to follow the previz camera and timing and only change the look.",
  tags: ["handoff", "video reference", "previz"], tools: ["Seedance", "Kling", "MiniMax"],
  body: `I have a previz reference video exported from Blender (grey proxies, simple lighting). Write the prompt for {{Target model|Seedance 2.0}} that uses it as the motion and camera reference.

Final look: {{Final look|photoreal golden-hour city rooftops}}.
Replace the proxies with: {{Characters|a young athletic woman with a ponytail, black tracksuit}}.

Tell the model to follow the reference camera path, framing and timing exactly and to change only the appearance.
Include style, lighting, audio and a constraints line.
Also give a shorter fallback prompt in case the first one drifts.` },

{ id: "prv-04", cat: "previz", title: "Procedural set from a description",
  desc: "Build an environment step by step with viewport checks and a polycount budget.",
  tags: ["environment", "procedural", "python"], tools: ["blender-scene-building skill"],
  body: `Using Blender over MCP with Python, build {{Scene|a stylized low-poly forest clearing with a campfire}}.
Requirements: {{Requirements|20–30 trees with random scale and rotation, rocks, a log seat, a campfire with emissive embers}}.
Look: {{Look|warm night, moonlight rim, orange fire glow, light volumetric fog}}.
Camera: {{Camera|24 mm, eye level, slow 10-second orbit}}.

Work in small steps, check each step with a viewport screenshot, and keep the scene under {{Polycount|200k}} polygons so the viewport stays responsive.
Ask me before anything destructive.` },

{ id: "prv-05", cat: "previz", title: "Seamless logo loop",
  desc: "A short motion-graphics loop where the last frame matches the first.",
  tags: ["loop", "motion graphics", "logo"], tools: ["Blender MCP"],
  body: `In Blender, create a seamless {{Duration|4}}-second loop at {{FPS|30}} fps: {{Animation|a glass logo cube rotates 90° and bounces slightly, ending exactly where it started}}.
Materials: {{Materials|clear glass with slight dispersion on a soft gradient backdrop}}.
Easing: {{Easing|ease in and out, no linear motion}}.
Frame 1 and the last frame must match for a perfect loop.
Export as {{Export|MP4, 1080 x 1080}}.` },

/* ---------------- ADS & UGC ---------------- */
{ id: "ads-01", cat: "ads", title: "UGC ad script",
  desc: "Hook, problem, product, proof, CTA in a timed table, plus five hooks with different angles.",
  tags: ["ugc", "script", "hooks"], tools: ["Claude", "Ads Studio"],
  body: `Write a {{Length|30}}-second UGC-style video ad for {{Product|a magnetic phone tripod}}.
Audience: {{Audience|travel creators aged 20–35}}. Platform: {{Platform|TikTok}}.
Main benefit: {{Benefit|set up a steady shot anywhere in 3 seconds}}.

Format as a table: time | spoken line | visual | on-screen text.
Beats: 0–3 s hook, 3–8 s problem, 8–20 s product in use with proof, 20–{{Length|30}} s CTA.
Voice: first person, natural, like a real person talking to their phone. No corporate words.
CTA: {{CTA|tap the link for 20% off this week}}.

Then give 5 alternative hooks under 12 words, each a different angle: curiosity, problem, comparison, social proof, bold claim.
Don't make claims we can't back up.` },

{ id: "ads-02", cat: "ads", title: "Ad concept batch",
  desc: "Eight concepts across formats, each testing a different variable, ranked by expected thumb-stop.",
  tags: ["strategy", "testing", "concepts"], tools: ["Claude"],
  body: `Act as a performance creative strategist.
Product: {{Product|a vegan protein bar}}. Offer: {{Offer|buy 2 boxes, get 1 free}}. Audience: {{Audience|busy gym-goers aged 25–40}}.

Generate {{Count|8}} ad concepts. For each give: angle, hook (first 2 seconds), format (UGC, demo, before/after, founder story, green screen, comparison, ASMR, meme), visual description, and why it should work.
Each concept should test a different variable.
Rank them by expected thumb-stop rate and explain the top 3.` },

{ id: "ads-03", cat: "ads", title: "Static ad or poster",
  desc: "Layout, brand colors and an exact headline with safe margins for the placement.",
  tags: ["static", "poster", "headline"], tools: ["Higgsfield", "Magnific"],
  body: `Design a static ad for {{Product|a citrus sparkling water}}.
Headline, rendered exactly: "{{Headline|Zero sugar. All zest.}}"
Layout: {{Layout|can centered, splashing water and orange slices around it, headline at top, logo bottom right}}.
Style: {{Style|bold, bright, high-contrast commercial photography}}.
Brand colors: {{Brand colors|#FF8A00, #FFFFFF, #0E3B2E}}.
Aspect ratio {{Aspect ratio|4:5}} with safe margins for {{Placement|Instagram feed}}.
Text must be legible, correctly spelled and must not overlap the product.` },

{ id: "ads-04", cat: "ads", title: "Product-in-hand UGC frame",
  desc: "A believable phone-camera frame of a creator holding the product.",
  tags: ["ugc", "lifestyle", "9:16"], tools: ["Higgsfield", "Marketing Studio"],
  body: `Casual smartphone selfie-video frame: {{Creator|a woman in her late 20s with curly hair and an oversized hoodie}} holds {{Product|a pastel pink water bottle}} toward the camera in {{Location|a bright apartment kitchen}}.
Expression: {{Expression|excited, mid-sentence}}.
Natural window light, slight handheld blur, realistic skin, no studio look.
The product label must match the reference image exactly. Aspect ratio 9:16.` },

{ id: "ads-05", cat: "ads", title: "Read ad results and iterate",
  desc: "Explain why the winner won and plan one-variable variations. Flags thin data.",
  tags: ["analysis", "iteration", "performance"], tools: ["Claude"],
  body: `Here are my ad results: {{Results|Ad A: CTR 0.8%, hook rate 22%. Ad B: CTR 1.9%, hook rate 41%. Ad C: CTR 1.1%, hook rate 35%.}}
What each ad is: {{Creative descriptions|A is a product demo, B is problem-first UGC, C is a founder story}}.

Explain why the winner won.
Give 5 new variations of the winner that each change exactly one variable: hook, first frame, creator, CTA or length.
Flag any numbers that are too small to trust.` },

{ id: "ads-06", cat: "ads", title: "Before / after demo ad",
  desc: "A two-state visual story with a clear transformation moment.",
  tags: ["before-after", "demo", "video"], tools: ["Kling", "Seedance", "Ads Studio"],
  body: `{{Duration|10}}-second before/after ad for {{Product|a robot vacuum}}, {{Aspect ratio|9:16}}.
[0–3s] Before: {{Before|living room floor covered in pet hair and cereal, owner sighs}}.
[3–4s] Transition: {{Transition|whip pan to the vacuum leaving its dock}}.
[4–8s] After: {{After|same room spotless, dog sleeping on a clean rug, soft morning light}}.
[8–10s] End card: product centered, text "{{End card text|Clean floors. Zero effort.}}".
Same room, same camera position for before and after. Text spelled exactly.` },

/* ---------------- CHARACTERS ---------------- */
{ id: "chr-01", cat: "character", title: "Character bible",
  desc: "A locked description you paste into every prompt, plus outfits, expressions and drift rules.",
  tags: ["consistency", "character", "bible"], tools: ["Claude", "AI Influencer"],
  body: `Create a character bible for {{Name|Kai}} so they stay consistent across images and video.
Base idea: {{Idea|a 24-year-old street-food chef from Bangkok, energetic and funny}}.

Give me:
1. One locked description paragraph (face shape, eyes, hair, skin, build, signature outfit, accessories) that I will paste unchanged into every prompt.
2. Personality and voice notes.
3. Three alternate outfits.
4. An expressions list for a sheet.
5. Things that must never change.
6. Common drift problems and the wording that prevents each one.` },

{ id: "chr-02", cat: "character", title: "Character turnaround sheet",
  desc: "Front, three-quarter, side and back views plus expression close-ups on a neutral background.",
  tags: ["turnaround", "reference sheet"], tools: ["Higgsfield", "Magnific"],
  body: `Character reference sheet of {{Character|Kai, 24, short dyed-blonde hair, black chef jacket with orange piping}}.
Show front, three-quarter, side and back full-body views, plus 4 head close-ups with these expressions: {{Expressions|happy, surprised, focused, laughing}}.
Neutral light grey background, even studio lighting, consistent proportions, same outfit in every view. No labels.
Style: {{Style|photoreal}}.` },

{ id: "chr-03", cat: "character", title: "AI influencer content plan",
  desc: "Two weeks of posts with captions, hooks and prompts that reuse the locked character.",
  tags: ["influencer", "content plan", "persona"], tools: ["AI Influencer", "Claude"],
  body: `I run an AI influencer named {{Name|Lumi}}: {{Persona|a 26-year-old digital artist in Seoul who loves film cameras and street fashion}}.
Niche: {{Niche|creative lifestyle}}. Platforms: {{Platforms|Instagram and TikTok}}.

Create a {{Days|14}}-day content plan with: post type, concept, caption, hook, image or video prompt (using the locked character description), and posting time.
Mix formats. Include 3 series ideas that can repeat weekly.
Suggest a short disclosure line for AI-generated content.` },

{ id: "chr-04", cat: "character", title: "Same character, new scene",
  desc: "Place a referenced character in a new setting without changing their identity.",
  tags: ["consistency", "scene"], tools: ["Higgsfield", "Magnific"],
  body: `Using the attached character reference, show {{Character name|Kai}} in a new scene. Keep the face, hair, body and outfit exactly the same.
Scene: {{Scene|cooking at a night-market stall, flames rising from a wok}}.
Action: {{Action|tossing noodles and laughing toward camera}}.
Camera: {{Camera|medium shot, 35 mm, eye level}}.
Lighting: {{Lighting|warm tungsten stall lights, neon sign bokeh}}.` },

/* ---------------- SOCIAL ---------------- */
{ id: "soc-01", cat: "social", title: "Short-form video script",
  desc: "Hook, beats with B-roll, pattern interrupts, loop ending, caption and alternative hooks.",
  tags: ["reels", "shorts", "tiktok", "script"], tools: ["Claude", "Shorts Studio"],
  body: `Write a {{Length|45}}-second short-form video about {{Topic|3 AI tools that save me 10 hours a week}} for {{Platform|Instagram Reels}}.
Audience: {{Audience|freelance designers}}. Tone: {{Tone|fast, practical, a little funny}}.

Give me: the hook (first 2 seconds, spoken and on-screen text), a beat-by-beat script with B-roll ideas, a pattern interrupt about every 5 seconds, an ending that loops back to the start, a caption with 3–5 niche hashtags, and 3 alternative hooks.` },

{ id: "soc-02", cat: "social", title: "Repurpose one video into many posts",
  desc: "Clips, a carousel, a thread, a LinkedIn post and a newsletter intro from one transcript.",
  tags: ["repurpose", "transcript", "multi-platform"], tools: ["Claude"],
  body: `Here is the transcript of my long video:
{{Transcript|paste transcript}}

Turn it into: {{Count|5}} short clips (start and end timestamps, hook, caption), 1 carousel (text per slide), 1 X thread, 1 LinkedIn post and 1 newsletter intro.
Keep my voice: {{Voice|direct, friendly, no buzzwords}}.` },

{ id: "soc-03", cat: "social", title: "Carousel post",
  desc: "One idea per slide with visual direction and a closing CTA.",
  tags: ["carousel", "instagram", "linkedin"], tools: ["Claude"],
  body: `Create a {{Slides|8}}-slide carousel about {{Topic|how to write better AI video prompts}}.
Slide 1: a scroll-stopping title. Middle slides: one idea each, max 25 words. Last slide: CTA to {{CTA|save this and follow for more}}.
For each slide add a short visual direction (layout, image or icon idea).
Brand style: {{Brand style|dark background, bold white type, amber highlights}}.` },

{ id: "soc-04", cat: "social", title: "Pre-post hook audit",
  desc: "Score a video on hook, pacing and retention risk, then get the top three fixes.",
  tags: ["virality", "retention", "audit"], tools: ["Claude", "virality predictor"],
  body: `Audit this video before I post it.
First 3 seconds: {{First 3 seconds|describe what's on screen and said}}
Script: {{Script|paste script}}
Platform: {{Platform|TikTok}}

Score 1–10 for hook strength, clarity of the promise, pacing, retention risk (with timestamps), payoff, rewatch value and CTA.
Then give the top 3 fixes ordered by impact, and rewrite the hook 3 ways.` },

{ id: "soc-05", cat: "social", title: "Monthly content calendar",
  desc: "A dated table mixing education, behind-the-scenes, portfolio and offers.",
  tags: ["calendar", "planning"], tools: ["Claude", "xlsx"],
  body: `Make a content calendar for {{Month|November}} for {{Brand|my AI creative studio}}.
Goals: {{Goals|grow followers and get 5 client leads}}. Platforms: {{Platforms|Instagram, TikTok, LinkedIn}}. Capacity: {{Capacity|4 posts per week}}.

Return a table: date, platform, format, topic, hook, CTA, asset needed.
Mix education, behind-the-scenes, portfolio pieces and offers. Tie posts to relevant dates in that month.` },

/* ---------------- AUDIO ---------------- */
{ id: "aud-01", cat: "audio", title: "Voiceover script with direction",
  desc: "Timed VO with pause and emphasis marks that TTS and voice actors both understand.",
  tags: ["voiceover", "tts", "script"], tools: ["TTS", "Claude"],
  body: `Write a {{Length|30}}-second voiceover for {{Project|a luxury watch launch film}}.
Voice: {{Voice|male, deep, calm, British, intimate}}. Pace: {{Pace|slow, with pauses}}.
Mark pauses with [pause], emphasis with *word*, and delivery notes in (parentheses).
Keep it under {{Word count|75}} words so it fits the time.` },

{ id: "aud-02", cat: "audio", title: "Music for a cut",
  desc: "Genre, tempo, mood arc and a clean ending so it can be edited to picture.",
  tags: ["music", "score"], tools: ["Music generation"],
  body: `{{Length|30}} seconds of music for {{Use|a tech product reveal}}.
Genre: {{Genre|cinematic electronic}}. Tempo: {{BPM|110}} BPM.
Mood arc: {{Mood arc|mysterious intro, building tension, big uplifting drop at 0:18}}.
Instruments: {{Instruments|analog synth pads, pulsing bass, light percussion, no vocals}}.
End cleanly on the beat with no fade so it can be cut to picture.` },

{ id: "aud-03", cat: "audio", title: "SFX spot list",
  desc: "Timestamped sound list with layers and a generation prompt for each sound.",
  tags: ["sfx", "foley", "sound design"], tools: ["SFX generation", "Claude"],
  body: `Here is my edit: {{Shot list|0–2 s door opens; 2–4 s footsteps on gravel; 4–6 s car engine starts; 6–8 s car drives away}}.

Create an SFX spot list: timestamp, sound, layers (close, room, sweetener), intensity, and a short generation prompt for each sound.
Add one ambience bed for the whole scene.` },

/* ---------------- BRAND ---------------- */
{ id: "brd-01", cat: "brand", title: "Brand identity starter",
  desc: "Positioning, taglines, tone, palette, type pairing and imagery rules in one pass.",
  tags: ["branding", "positioning", "identity"], tools: ["Claude", "Brand kit"],
  body: `Create a brand identity foundation for {{Brand|Sage Studio}}, {{What it does|an AI creative studio making ads and short films for D2C brands}}.
Audience: {{Audience|founders and marketing leads}}. Personality: {{Personality|bold, cinematic, trustworthy}}.

Deliver: positioning statement, 3 tagline options, tone of voice (do and don't), color palette with hex values and usage, a type pairing, logo direction ideas, imagery rules, and 5 example headlines.` },

{ id: "brd-02", cat: "brand", title: "Design system tokens",
  desc: "Light and dark color tokens with contrast checks, type and spacing scales, component states.",
  tags: ["tokens", "design system", "wcag"], tools: ["design-system skill"],
  body: `Use the design-system skill to define a design system for {{Product|my portfolio website}}.
Brand colors: {{Brand colors|#111827, #F97316, #F5F5F4}}. Fonts: {{Fonts|Bricolage Grotesque for headings, IBM Plex Sans for body}}.

Output: color tokens for light and dark with contrast ratios, type scale, spacing scale, radius, shadows, and specs for buttons, inputs, cards and tags in every state.
Flag any color pair below WCAG AA.` },

{ id: "brd-03", cat: "brand", title: "Brand suffix for every prompt",
  desc: "A short reusable line you append to any image or video prompt to keep outputs on-brand.",
  tags: ["consistency", "brand", "suffix"], tools: ["Claude"],
  body: `Read my brand guidelines: {{Guidelines|paste guidelines or describe the brand}}

Write a reusable brand suffix, max 60 words, that I can append to any image or video prompt so every output matches the brand: palette, lighting, mood, lens feel, textures and what to avoid.
Then show 3 example prompts that use it.` },

{ id: "brd-04", cat: "brand", title: "Moodboard brief",
  desc: "Twelve image prompts that share one visual DNA, split across setting, casting, product and texture.",
  tags: ["moodboard", "campaign", "art direction"], tools: ["Higgsfield", "Magnific", "Claude"],
  body: `Build a moodboard brief for {{Project|a summer campaign for a sunscreen brand}}.
Give 12 image prompts that form one cohesive board: 4 setting and atmosphere, 3 people and casting, 2 product, 2 textures and details, 1 typography reference.
Shared visual DNA: {{Visual DNA|sun-bleached colors, film grain, harsh noon shadows}}.` },

/* ---------------- DESIGN REVIEW ---------------- */
{ id: "dsn-01", cat: "design", title: "Design critique",
  desc: "Severity-ranked feedback on hierarchy, layout, type, color and the main action.",
  tags: ["critique", "feedback", "ui"], tools: ["design-critique skill"],
  body: `Use the design-critique skill. Review this design: {{Design|attach a screenshot or Figma link}}
Context: {{Context|landing page for an AI video studio, goal is to book a call}}. Stage: {{Stage|near final}}.

Give feedback on visual hierarchy, layout and spacing, typography, color, consistency, and how clear the main action is.
Rank issues as critical, major or minor and give a concrete fix for each.` },

{ id: "dsn-02", cat: "design", title: "Accessibility audit",
  desc: "WCAG 2.1 AA check returned as a table with criterion, severity and fix.",
  tags: ["a11y", "wcag", "audit"], tools: ["accessibility-review skill"],
  body: `Use the accessibility-review skill to audit {{Target|my website's home page}} against WCAG 2.1 AA.
Check color contrast, keyboard navigation and focus order, touch target sizes, alt text, heading structure, form labels and screen reader behavior.
Output a table: issue, WCAG criterion, where, severity, fix.` },

{ id: "dsn-03", cat: "design", title: "UX copy options",
  desc: "Three options per interface element with a recommendation.",
  tags: ["microcopy", "ux writing"], tools: ["ux-copy skill"],
  body: `Use the ux-copy skill. Write UX copy for {{Screen|the checkout page of a template marketplace}}.
Elements: {{Elements|page title, primary button, empty cart state, payment error, success message}}.
Voice: {{Voice|friendly, clear, short}}.
Give 3 options per element and mark the one you recommend.` },

{ id: "dsn-04", cat: "design", title: "Developer handoff spec",
  desc: "Layout, tokens, props, states, breakpoints, edge cases and animation timings.",
  tags: ["handoff", "spec", "frontend"], tools: ["design-handoff skill"],
  body: `Use the design-handoff skill. Create a developer handoff spec for {{Component or page|the pricing section}}.
Include: layout and grid, design tokens used, component props, every interaction state, responsive behavior at {{Breakpoints|375, 768 and 1280}} px, edge cases (long text, empty, loading, error) and animation timings.` },

{ id: "dsn-05", cat: "design", title: "Landing page plan with copy",
  desc: "Section-by-section structure with real headlines, body copy, CTAs and visuals.",
  tags: ["landing page", "copywriting", "conversion"], tools: ["Claude"],
  body: `Plan a landing page for {{Offer|my AI ad production service}}.
Audience: {{Audience|e-commerce brands doing $1M+ a year}}. Goal: {{Goal|book a discovery call}}.

Give the structure section by section (hero, proof, problem, offer, process, portfolio, pricing, FAQ, final CTA) with the actual headline, subheadline, body and CTA copy for each, plus the visual that goes there.` },

/* ---------------- RESEARCH ---------------- */
{ id: "rsc-01", cat: "research", title: "Deep research report",
  desc: "Cited comparison with a recommendation for your situation and vendor claims flagged.",
  tags: ["research", "comparison", "citations"], tools: ["deep-research skill"],
  body: `Use the deep-research skill. Research: {{Question|Which AI video models are best for ads right now, and how do they compare on quality, price, clip length and control?}}
Scope: {{Scope|the last 6 months, English sources}}.

Output: executive summary, comparison table, detailed findings with citations, a recommendation for {{My situation|a small studio producing 20 ads a month}}, and open questions.
Flag anything that is vendor marketing rather than independent testing.` },

{ id: "rsc-02", cat: "research", title: "Competitor analysis",
  desc: "Offer, pricing, positioning and content for each competitor, then gaps you could own.",
  tags: ["competitors", "positioning", "market"], tools: ["deep-research skill", "Claude"],
  body: `Analyze these competitors for {{My business|my AI creative studio}}: {{Competitors|Studio A, Studio B, Studio C (add links)}}.
For each: offer, pricing, positioning, target clients, content strategy, strengths and weaknesses.
Then a comparison table and 5 gaps I could own.` },

{ id: "rsc-03", cat: "research", title: "Interview guide",
  desc: "Screener, 30-minute guide and note template without leading questions.",
  tags: ["interviews", "user research"], tools: ["user-research skill"],
  body: `Use the user-research skill. I want to learn {{Goal|why brands hesitate to use AI-generated ads}}.
Participants: {{Participants|marketing managers at D2C brands}}.
Create a recruiting screener, a 30-minute interview guide (warm-up, core questions, probes, wrap-up) and a note-taking template. Avoid leading questions.` },

{ id: "rsc-04", cat: "research", title: "Turn feedback into insights",
  desc: "Themes with counts and quotes, segments and prioritized recommendations.",
  tags: ["synthesis", "feedback", "insights"], tools: ["research-synthesis skill"],
  body: `Use the research-synthesis skill. Here is raw feedback:
{{Feedback|paste interview notes, reviews, survey answers or client emails}}

Find the themes, count how often each appears, pull 1–2 direct quotes per theme, identify user segments, and give recommendations ranked by impact and effort.` },

{ id: "rsc-05", cat: "research", title: "Trend scan",
  desc: "Current trends with evidence, maturity and one way to use each this month.",
  tags: ["trends", "strategy"], tools: ["deep-research skill"],
  body: `Scan current trends in {{Field|AI video and creative production}} that matter to {{Who|a solo creator selling to brands}}.
For each trend: what it is, evidence with sources, how early or mature it is, and one concrete way I could use it this month.
End with 3 trends that are hype, and why.` },

/* ---------------- DOCS ---------------- */
{ id: "doc-01", cat: "docs", title: "Client creative brief",
  desc: "A shareable brief doc covering deliverables, mandatories, timeline and approvals.",
  tags: ["brief", "client", "document"], tools: ["docs skill"],
  body: `Use the docs skill to create a creative brief for {{Client|Bloom Skincare}}. Project: {{Project|3 x 15-second product videos for a spring launch}}.
Sections: background, objective, audience, key message, deliverables (formats, lengths, aspect ratios), mandatories (logo, legal lines), tone, references, timeline ({{Deadline|2 weeks}}), budget, approval process.` },

{ id: "doc-02", cat: "docs", title: "Proposal with pricing tiers",
  desc: "Approach, deliverables, timeline, three tiers, revisions and usage rights.",
  tags: ["proposal", "pricing", "sales"], tools: ["docs skill", "Claude"],
  body: `Write a proposal for {{Client|a coffee brand}} for {{Scope|10 AI-generated short ads and 30 product images per month}}.
Include: their goal in my words, approach and workflow, deliverables, timeline, 3 pricing tiers ({{Price range|$1.5k to $6k per month}}), revision policy, usage rights and next steps.
Tone: confident and clear.` },

{ id: "doc-03", cat: "docs", title: "Pitch deck",
  desc: "Ten slides, one message each, with a visual suggestion per slide.",
  tags: ["deck", "slides", "pitch"], tools: ["Slides", "pptx skill"],
  body: `Make a {{Slides|10}}-slide pitch deck for {{Topic|my AI creative studio}} aimed at {{Audience|brand marketing teams}}.
Slides: title, problem, solution, how it works, portfolio highlights, case study with results, process and timeline, pricing, team, CTA.
One key message per slide, minimal text, and a suggested visual for each.` },

{ id: "doc-04", cat: "docs", title: "Production tracker spreadsheet",
  desc: "Track every deliverable, its tool, prompt, status, cost and revisions, with a summary sheet.",
  tags: ["tracker", "spreadsheet", "operations"], tools: ["xlsx skill"],
  body: `Build a spreadsheet to track my creative production.
Columns: project, client, deliverable, model or tool used, prompt link, status ({{Statuses|brief, generating, editing, review, delivered}}), due date, credits or cost, revisions, notes.
Add a summary sheet with counts by status, total cost per client, and overdue items highlighted.` },

{ id: "doc-05", cat: "docs", title: "Campaign results dashboard",
  desc: "Spend, CTR, CPA and conversions over time with one insight per chart.",
  tags: ["dashboard", "analytics", "charts"], tools: ["dataviz skill"],
  body: `Use the dataviz skill. Here is my data:
{{Data|paste a CSV of campaigns: date, ad, spend, impressions, clicks, conversions}}

Build a dashboard showing spend, CTR, CPA and conversions over time, plus the top 5 ads, with one key insight per chart. It must read well in light and dark mode.` },

{ id: "doc-06", cat: "docs", title: "Meeting notes to action items",
  desc: "Summary, decisions, owners and deadlines, plus a follow-up email.",
  tags: ["meetings", "summary", "email"], tools: ["Claude"],
  body: `Turn these notes into a clean summary:
{{Notes|paste raw notes or a transcript}}

Output: a 3-line summary, decisions made, action items with owner and deadline, open questions, and a short follow-up email to {{Recipient|the client}}.` },

/* ---------------- BUILD ---------------- */
{ id: "dev-01", cat: "build", title: "Portfolio website",
  desc: "A fast, accessible portfolio with a work grid, services and contact, ready for GitHub Pages.",
  tags: ["website", "portfolio", "html"], tools: ["Claude Code"],
  body: `Build a fast, responsive portfolio website for {{Name|Sage}}, {{Role|AI creative director making ads, short films and AI images}}.
Sections: {{Sections|hero showreel, selected work grid with filters, services, process, testimonials, contact}}.
Style: {{Style|dark, cinematic, bold display type, subtle motion}}. Tech: {{Tech|plain HTML, CSS and JS, no build step}}.
Requirements: mobile first, accessible, lazy-loaded video thumbnails, SEO meta tags, fast first paint.
Commit to git when done and tell me how to publish it on GitHub Pages.` },

{ id: "dev-02", cat: "build", title: "Turn my workflow into a skill",
  desc: "Package a repeat process as a Claude skill with triggers, steps, checklist and evals.",
  tags: ["skill", "automation", "claude"], tools: ["skill-creator skill"],
  body: `Use the skill-creator skill. Turn this repeatable workflow into a skill: {{Workflow|how I turn a client brief into 5 video prompts, generate, review and deliver}}.
Name: {{Skill name|ad-video-pipeline}}.
Include: when it should trigger, step-by-step instructions, required inputs, output format, a quality checklist and 2 example runs.
Then write 3 eval cases to test it.` },

{ id: "dev-03", cat: "build", title: "Automate a weekly task",
  desc: "Design a scheduled automation with a dry run before anything destructive.",
  tags: ["automation", "schedule", "script"], tools: ["Claude Code", "scheduled tasks"],
  body: `Every {{Frequency|Monday at 9 am}} I {{Task|collect last week's generations, rename them by client and project, and write a summary of credits spent}}.
Design an automation for this with Claude Code: inputs it needs, the script, where it runs, the schedule, and how it reports to me.
Start with a dry run and show me the output before doing anything destructive.` },

{ id: "dev-04", cat: "build", title: "GPU workflow on RunPod",
  desc: "Pod vs serverless, GPU choice and hourly cost before anything billable is created.",
  tags: ["gpu", "comfyui", "runpod"], tools: ["RunPod"],
  body: `I want to run {{Workflow|a ComfyUI workflow for image upscaling and video interpolation}} on RunPod.
Recommend: pod or serverless, GPU type and expected hourly cost, template, network volume size, and the deployment steps.
Tell me the price before creating anything billable, and remind me how to stop it so I don't waste credits.` },

{ id: "dev-05", cat: "build", title: "Code review before shipping",
  desc: "Review a branch for bugs, fix the confirmed issues and summarize the changes.",
  tags: ["review", "quality", "bugs"], tools: ["code-review skill"],
  body: `Use the code-review skill at {{Level|high}} effort on {{Target|my current branch}}.
Focus on {{Focus|bugs, broken mobile layout, and the security of the contact form}}.
Then fix the confirmed issues and summarize what changed.` },

{ id: "dev-06", cat: "build", title: "Prompt improver",
  desc: "Meta-prompt that rewrites any prompt with role, inputs, steps, format and a quality bar.",
  tags: ["meta-prompt", "prompt engineering"], tools: ["Claude"],
  body: `You are a prompt engineer. Improve this prompt for {{Target|Claude}}:
{{Prompt|paste your prompt}}

Goal of the prompt: {{Goal|get a ready-to-post script}}.
Make it specific: add role and context, inputs, step-by-step task, output format, constraints and a quality bar. Use clear sections.
Return the improved prompt in a code block, then list what you changed and why in at most 5 bullets.` }
];

/* ---------------- VOCABULARY ---------------- */
VAULT.vocab = [
  { group: "Shot sizes", terms: [
    ["Extreme wide shot", "Subject tiny in a vast environment; sets location."],
    ["Wide shot", "Whole subject plus a lot of surroundings."],
    ["Full shot", "Head to toe, framed tight to the body."],
    ["Medium wide (cowboy)", "Mid-thigh up; good for action and gestures."],
    ["Medium shot", "Waist up; the default for dialogue."],
    ["Medium close-up", "Chest up; emotion plus some body language."],
    ["Close-up", "Face fills the frame."],
    ["Extreme close-up", "Eyes, lips, or a small detail."],
    ["Insert shot", "Detail of an object or action, like a hand on a key."],
    ["Over-the-shoulder", "Framed past one character toward another."],
    ["POV shot", "What the character sees."],
    ["Two-shot", "Two subjects in one frame."]
  ]},
  { group: "Camera angles", terms: [
    ["Eye level", "Neutral, natural perspective."],
    ["Low angle", "Camera looks up; subject feels powerful."],
    ["High angle", "Camera looks down; subject feels small."],
    ["Bird's-eye view", "Directly overhead."],
    ["Worm's-eye view", "From the ground looking straight up."],
    ["Dutch angle", "Tilted horizon; unease or energy."],
    ["Top-down flat lay", "Overhead product or food layout."],
    ["Three-quarter angle", "Halfway between front and profile; the classic hero angle."]
  ]},
  { group: "Camera moves", terms: [
    ["Static / locked-off", "No camera movement."],
    ["Slow push-in", "Camera moves toward the subject; builds focus or tension."],
    ["Pull-out", "Camera moves away; reveals context."],
    ["Pan left / right", "Camera rotates horizontally on a fixed point."],
    ["Tilt up / down", "Camera rotates vertically on a fixed point."],
    ["Tracking shot", "Camera moves alongside a moving subject."],
    ["Truck left / right", "Camera slides sideways without rotating."],
    ["Crane up / jib", "Camera rises vertically; often a reveal."],
    ["Orbit / arc", "Camera circles around the subject."],
    ["Handheld", "Organic shake; documentary feel."],
    ["Gimbal follow", "Smooth follow behind or ahead of the subject."],
    ["Whip pan", "Very fast pan with motion blur; energetic transition."],
    ["Crash zoom", "Sudden fast zoom in for emphasis."],
    ["Dolly zoom", "Dolly and zoom in opposite directions; background warps."],
    ["Rack focus", "Focus shifts from one subject to another."],
    ["FPV drone dive", "Fast, agile flight through spaces."],
    ["Aerial pullback", "Drone rises and pulls away to reveal scale."]
  ]},
  { group: "Lenses", terms: [
    ["14mm ultra-wide", "Huge field of view, strong distortion near edges."],
    ["24mm wide", "Environmental, a little dramatic."],
    ["35mm", "Natural, cinematic storytelling lens."],
    ["50mm", "Close to human vision."],
    ["85mm portrait", "Flattering faces, creamy background blur."],
    ["135mm telephoto", "Compressed background, isolated subject."],
    ["100mm macro", "Tiny details at life size."],
    ["Anamorphic", "Wide aspect, oval bokeh, horizontal flares."],
    ["Tilt-shift", "Miniature look with a thin focus band."],
    ["Fisheye", "Extreme curved distortion; skate and music-video feel."]
  ]},
  { group: "Lighting", terms: [
    ["Golden hour", "Warm, low sun shortly after sunrise or before sunset."],
    ["Blue hour", "Cool, soft twilight."],
    ["Rembrandt lighting", "Triangle of light on the shadow-side cheek."],
    ["Butterfly lighting", "Key light above the face; beauty look."],
    ["Split lighting", "Half the face lit, half in shadow."],
    ["Rim light / backlight", "Light outlines the subject from behind."],
    ["Softbox key", "Large, soft, flattering light source."],
    ["Hard light", "Crisp shadows; harsh sun or bare bulb."],
    ["Practical lights", "Lamps and screens visible in the scene."],
    ["Neon", "Saturated colored light from signs."],
    ["Volumetric light", "Visible beams through haze or dust."],
    ["Overcast diffused", "Even, shadowless daylight."],
    ["Chiaroscuro", "Strong contrast between light and dark."],
    ["High-key", "Bright, low contrast, few shadows."],
    ["Low-key", "Mostly dark with selective light."],
    ["Silhouette", "Subject dark against a bright background."],
    ["Candlelight", "Warm, flickering, intimate."],
    ["Moonlight", "Cool, dim, blue-silver."]
  ]},
  { group: "Looks & styles", terms: [
    ["35mm film", "Organic grain and color roll-off."],
    ["16mm film grain", "Heavier grain, indie or documentary feel."],
    ["Kodak Portra 400 look", "Warm, soft skin tones, gentle contrast."],
    ["Cinestill 800T look", "Tungsten film with red halation around lights."],
    ["Documentary handheld", "Observational, real-world."],
    ["Editorial fashion", "Polished, styled, magazine look."],
    ["Commercial product", "Clean, controlled, sharp."],
    ["Symmetrical pastel storybook", "Centered framing, pastel palette."],
    ["Film noir", "Black and white, hard shadows, venetian blinds."],
    ["Cyberpunk neon", "Rainy streets, neon, high tech."],
    ["Claymation", "Handmade clay texture and stop-motion feel."],
    ["Stylized 3D animation", "Soft, rounded animated-feature look."],
    ["Anime cel", "Flat color, ink lines, painted backgrounds."],
    ["Watercolor", "Soft washes and paper texture."],
    ["Isometric 3D", "Diorama seen from a fixed 3/4 angle."],
    ["Low-poly", "Faceted geometric 3D."]
  ]},
  { group: "Color grades", terms: [
    ["Teal and orange", "Blockbuster contrast of skin and shadows."],
    ["Bleach bypass", "Desaturated, high contrast, gritty."],
    ["Muted pastel", "Soft, low saturation."],
    ["High-contrast monochrome", "Deep blacks, bright whites."],
    ["Warm vintage", "Faded blacks, warm highlights."],
    ["Cool desaturated", "Cold, quiet, Nordic."],
    ["Day for night", "Daytime footage graded to look like night."],
    ["Cyan and magenta", "Neon night palette."]
  ]},
  { group: "Aspect ratios", terms: [
    ["16:9", "YouTube, TV, desktop."],
    ["9:16", "TikTok, Reels, Shorts, Stories."],
    ["1:1", "Square feed posts."],
    ["4:5", "Tall feed posts on Instagram."],
    ["2.39:1", "Widescreen cinema."],
    ["21:9", "Ultrawide banners and cinematic web."],
    ["3:2", "Classic photo frame."]
  ]},
  { group: "Transitions & edit", terms: [
    ["Hard cut", "Instant change between shots."],
    ["Match cut", "Cut between two shots with matching shape or motion."],
    ["Whip-pan transition", "Blur from one shot into the next."],
    ["Smash cut", "Abrupt cut for contrast or comedy."],
    ["Morph transition", "One subject transforms into another."],
    ["J-cut", "Next scene's audio starts before its picture."],
    ["L-cut", "Previous scene's audio continues over the next picture."],
    ["Speed ramp", "Slow motion that snaps to real time, or the reverse."]
  ]},
  { group: "Audio", terms: [
    ["Ambience bed", "Continuous background sound of the location."],
    ["Foley", "Recreated everyday sounds: steps, cloth, props."],
    ["Room tone", "Quiet natural sound of a space."],
    ["Diegetic music", "Music that exists in the scene."],
    ["Score", "Music added for mood, not heard by characters."],
    ["Riser", "Sound that builds tension into a moment."],
    ["Whoosh", "Movement sound for transitions."],
    ["Stinger", "Short hit that punctuates a moment."]
  ]}
];

/* ---------------- FORMULAS (from public prompting guides) ---------------- */
VAULT.formulas = [
  { title: "Image prompt", parts: ["Subject", "Setting", "Composition", "Lighting", "Camera / lens", "Color & mood", "Style", "Aspect ratio"],
    note: "Be specific about the subject and lighting; skip parts you don't need. Stacking quality buzzwords dilutes results.",
    sources: [["Luma: AI image prompting guide", "https://lumalabs.ai/news/ai-image-prompting-guide"], ["Kling: image prompt formula", "https://kling.ai/blog/best-way-to-write-image-prompts"]] },
  { title: "Video shot", parts: ["Subject", "Action", "Setting", "Camera", "Style", "Audio", "Constraints"],
    note: "Name shot size, movement and angle. Tie the camera move to an event in the scene so it feels motivated.",
    sources: [["Kapwing: prompting Seedance 2.5", "https://www.kapwing.com/resources/how-to-prompt-seedance-2-5-a-guide-for-ai-video-creators/"], ["fal: Kling 3.0 prompting guide", "https://blog.fal.ai/kling-3-0-prompting-guide/"]] },
  { title: "Timeline prompting", parts: ["[0–3s] Shot 1", "[3–6s] Shot 2", "[6–10s] Shot 3", "Global style line"],
    note: "Split the clip into timed beats of 2–3 sentences. Without timestamps the model decides cuts and camera on its own. Lock characters with identical wording in every shot.",
    sources: [["MindStudio: timeline prompting", "https://www.mindstudio.ai/blog/timeline-prompting-seedance-2-cinematic-ai-video"]] },
  { title: "UGC ad", parts: ["Hook 0–3s", "Problem", "Product + proof", "CTA"],
    note: "Test hooks by angle, not by rewording. Keep hooks under 12 words. Don't make claims you can't back up.",
    sources: [["Tolstoy: structuring UGC ads", "https://www.gotolstoy.com/blog/how-to-structure-ugc-ads"], ["Magic Hour: UGC-style ads with AI", "https://magichour.ai/blog/how-to-make-ugc-style-video-ads"]] }
];

/* ---------------- WORKFLOWS ----------------
   Each step opens a prompt. Project fields fill any blank with the same name. */
VAULT.workflows = [
  { id: "wf-ad", title: "AI ad from scratch",
    desc: "From brand rules to a posted UGC-style video ad: concepts, script, keyframe, motion, voice and a final hook check.",
    fields: { "Product": "a magnetic phone tripod", "Audience": "travel creators aged 20–35", "Platform": "TikTok", "Aspect ratio": "9:16" },
    steps: [
      ["brd-03", "Write the brand suffix you'll append to every visual prompt."],
      ["ads-02", "Generate concepts and pick the strongest angle."],
      ["ads-01", "Script the winning concept as a timed UGC ad."],
      ["img-03", "Make the opening frame as a still you can approve."],
      ["vid-03", "Animate the approved frame into the first shot."],
      ["aud-01", "Record the voiceover from the script."],
      ["soc-04", "Audit the hook before you post."]
    ] },
  { id: "wf-launch", title: "Product launch video",
    desc: "Packshots, a hero product shot, music and a short-form script, then repurpose it across every platform.",
    fields: { "Product": "a matte black wireless earbud case", "Aspect ratio": "9:16", "Platform": "Instagram Reels" },
    steps: [
      ["img-02", "Create the clean packshot set first; it's your visual reference."],
      ["vid-05", "Turn the packshot into a premium hero shot."],
      ["aud-02", "Score the reveal with music that ends on the beat."],
      ["soc-01", "Write the short-form launch video around the hero shot."],
      ["soc-02", "Cut it into clips, a carousel and posts for every platform."]
    ] },
  { id: "wf-previz", title: "Previz to final shot",
    desc: "Lock a complex camera move in Blender, compare options, hand it to a video model and fix what drifts.",
    fields: { "Target model": "Seedance 2.0", "Duration": "5", "Aspect ratio": "16:9" },
    steps: [
      ["prv-01", "Brief and block the shot with grey proxies."],
      ["prv-02", "Try camera options and pick one."],
      ["prv-03", "Write the handoff prompt that follows the previz exactly."],
      ["vid-07", "Fix anything that drifted in the generation."]
    ] },
  { id: "wf-character", title: "Consistent character series",
    desc: "Create a character once and keep them identical across images, talking scenes and a two-week content plan.",
    fields: { "Name": "Kai", "Character name": "Kai", "Character": "Kai, 24, short dyed-blonde hair, black chef jacket with orange piping" },
    steps: [
      ["chr-01", "Write the character bible and copy the locked description."],
      ["chr-02", "Generate the turnaround sheet to use as reference."],
      ["chr-04", "Place the character in a new scene."],
      ["vid-08", "Make them talk in a short dialogue scene."],
      ["chr-03", "Plan two weeks of posts with the same character."]
    ] },
  { id: "wf-client", title: "Win and run a client",
    desc: "Research the market, send a proposal and a deck, lock the brief, and track production.",
    fields: { "Client": "Bloom Skincare", "My business": "my AI creative studio", "Topic": "my AI creative studio" },
    steps: [
      ["rsc-02", "Know the competitors before you price."],
      ["doc-02", "Send a proposal with three tiers."],
      ["doc-03", "Back it up with a short pitch deck."],
      ["doc-01", "Once they say yes, agree the creative brief."],
      ["doc-04", "Track every deliverable, tool and cost."]
    ] },
  { id: "wf-site", title: "Launch your portfolio site",
    desc: "Brand foundation, design system and landing copy, then build, audit and review the site with Claude Code.",
    fields: { "Brand": "Sage Studio", "Name": "Sage", "Product": "my portfolio website" },
    steps: [
      ["brd-01", "Set positioning, palette and type."],
      ["brd-02", "Turn it into design tokens."],
      ["dsn-05", "Write the landing page copy section by section."],
      ["dev-01", "Build the site."],
      ["dsn-02", "Check accessibility."],
      ["dev-05", "Review the code and ship."]
    ] }
];

/* ---------------- ROADMAP ---------------- */
VAULT.roadmap = [
  { stage: "Shipped", note: "In this version.", items: [
    ["done", "Example previews", "Every prompt shows what it does, when to use it, a sample input and the kind of result you get."],
    ["done", "Workflows", "Six step-by-step pipelines. Project details carry into every step automatically."],
    ["done", "Quick search palette", "Press Ctrl/⌘ + K to jump to any prompt, workflow or action."],
    ["done", "Ratings and results log", "Rate each run, note the model and settings, and sort by your best prompts."],
    ["done", "Improve with Claude", "Rewrites a filled prompt inside the page in the published version; elsewhere it copies a ready request."],
    ["done", "Your own prompts", "Write, duplicate, edit and delete templates with the {{Name|default}} syntax."],
    ["done", "Prompt builder", "Assemble image and video prompts from standard film vocabulary."],
    ["done", "Backup and deep links", "Export and import as JSON; every prompt has its own link like #vid-02."]
  ]},
  { stage: "Next", note: "Small additions with a big payoff.", items: [
    ["next", "Result gallery per prompt", "Attach the image or video a prompt produced, so you can see which wording worked."],
    ["next", "Version history", "Keep every edit of a prompt with a note on what changed and why."],
    ["next", "Model variants", "One template, tuned versions per model, since each responds to different wording."],
    ["next", "Brand presets", "Save brand suffixes and character locks once and insert them into any prompt with one click."],
    ["next", "Custom workflows", "Build your own pipelines from any prompts, including ones you wrote."]
  ]},
  { stage: "Later", note: "Bigger features for a team or a business.", items: [
    ["later", "Shared team library", "One library your collaborators can read and add to, with comments on each prompt."],
    ["later", "Client mode", "Share a read-only collection with a client so they can pick a direction."],
    ["later", "Cost tracker", "Log credits per generation and see spend per client or project."],
    ["later", "Multilingual prompts", "Translate templates while keeping camera and lighting terms in English, which models follow best."],
    ["later", "Install as an app", "Offline use and a home-screen icon on phone and desktop."],
    ["later", "Template marketplace", "Sell or give away curated prompt packs built from your best-performing templates."]
  ]},
  { stage: "Prompt packs to add", note: "Areas worth writing new templates for.", items: [
    ["later", "Music video and lyric visuals", "Beat-synced shot lists and performance shots."],
    ["later", "Real estate and architecture", "Walkthroughs, twilight exteriors, virtual staging."],
    ["later", "Food and beverage", "Pours, steam, macro textures and menu shots."],
    ["later", "Fashion lookbooks", "Consistent model across outfits, editorial poses, runway motion."],
    ["later", "Explainers and tutorials", "Screen-recording scripts, diagrams and talking-head structures."],
    ["later", "3D assets", "Image-to-3D, product turntables, game-ready props."]
  ]}
];
