/* What each prompt does, when to use it, and an example of the result.
   The example input is the prompt's own default values. */
VAULT.examples = {
/* ---------------- AI VIDEO ---------------- */
"vid-01": {
  does: "Writes one continuous, film-quality shot where every part of the frame is decided: who, what they do, where, how the camera moves and what it sounds like.",
  when: ["Hero shots for ads or short films", "A model keeps adding random cuts", "Turning a storyboard frame into motion"],
  output: "A 5-second shot. Medium framing on the fisherman as he drags the net over the rail. The moment the wave slams the hull, the camera starts a slow push-in toward his face while spray catches the backlight.\n\nMuted teal-and-amber grade, fine grain, shallow focus. Audio is wind, creaking rope and distant gulls. No cuts, no text, and his yellow raincoat stays the same.",
  tip: "Tie the camera move to an event (\"starts when the wave hits\"). Models follow a motivated move far more reliably than a random one." },
"vid-02": {
  does: "Plans a 10-second mini-sequence of three timed shots in one generation, with the character described identically so they don't change between cuts.",
  when: ["Trailers and teasers", "Story ads with a beginning, middle and end", "Testing a scene before shooting it shot by shot"],
  output: "0–3s  Wide: rain-soaked neon alley. Maya walks toward the lens as the camera dollies back.\n3–6s  Hard cut to a medium close-up. She stops; the flickering sign lights her face as the camera arcs left.\n6–10s Insert of her hand pulling out a glowing keycard; focus racks to the sign behind.\n\nSame bob, olive bomber and hoops in all three shots. Rain and synth drone carry across the cuts.",
  tip: "Keep each beat to 2–3 sentences, and paste the character lock unchanged every time you reuse the character." },
"vid-03": {
  does: "Brings a still image to life without changing it. You say exactly what moves and how much; everything else stays locked to the reference.",
  when: ["Animating AI images or photos", "Living-photo posts", "Start frames a client already approved"],
  output: "The reference portrait gains gentle life: hair and scarf lift in the breeze, she blinks once and turns slightly toward the lens. Clouds drift left, grass sways.\n\nThe camera creeps forward a few percent over 5 seconds. Face, colours and composition match the original frame exactly.",
  tip: "Lower motion intensity means fewer warped hands and faces. Start subtle, then push." },
"vid-04": {
  does: "Connects two images you already have with one continuous camera move, so the model travels between them instead of cutting.",
  when: ["Scene-to-scene transitions", "Before/after reveals", "Fly-through-the-window openers"],
  output: "Opens on the house exterior (image 1). The camera pushes toward the open window, accelerating, slips through the frame and eases out inside the sunlit kitchen (image 2).\n\nSame golden morning light and palette throughout; the cat on the sill stays visible as the camera passes it.",
  tip: "Describe what the camera passes through on the way. An empty middle is where morphing happens." },
"vid-05": {
  does: "Creates a premium commercial shot of a product with controlled studio light and a clean camera move that lands on a hero angle.",
  when: ["Launch videos", "Paid social product shots", "Website hero loops"],
  output: "Black studio, wet marble catching reflections. The case lid snaps open and both earbuds lift slightly with a soft glow.\n\nThe camera orbits 90° in macro and finishes on a three-quarter hero view, rim light tracing the edges. 6 seconds, vertical 9:16, logo sharp and undistorted.",
  tip: "Always add \"no hands\" and \"no extra products\". Models love to add both." },
"vid-06": {
  does: "Breaks a video you like down shot by shot and turns it into a reusable prompt recipe for your own subject.",
  when: ["Recreating a viral style", "Working from a client reference", "Learning why a shot works"],
  output: "Shot 1 · 0–2s · extreme close-up · top-down · slow push-in triggered by the milk pour · warm tungsten · very shallow focus\nShot 2 · 2–4s · medium close-up · eye level · locked-off · …\n\nSeedance prompt: \"Top-down extreme close-up of a barista pouring steamed milk into espresso, slow push-in as the pour begins…\"\n\nLikely problem: the latte art melts → add \"pattern stays crisp, no morphing\".",
  tip: "Give timestamps from the reference if you can; the breakdown becomes far more precise." },
"vid-07": {
  does: "Diagnoses what went wrong in a generation and rewrites the prompt to fix it, plus a safer version and a split-shot version.",
  when: ["Faces morphing or hands melting", "Jittery or random camera", "Logos warping"],
  output: "Changes:\n• Camera jitters → replaced \"dynamic camera\" with \"locked-off tripod shot\".\n• Face morphs → added one locked face description and \"same face throughout\".\n• Hands melt → moved the hands out of the main action.\n\nConstraints line: \"stable anatomy, consistent face, no morphing, logo undistorted.\"\nSafer version: less motion, 5s. Split version: Shot A the reach, Shot B a close-up of the logo.",
  tip: "Fix one problem per round so you know which change actually worked." },
"vid-08": {
  does: "Writes a short two-person dialogue scene with lines, delivery notes and ambience, for models that generate voices and lip-sync.",
  when: ["Story ads with talking characters", "Skits and sketches", "Two-person testimonials"],
  output: "0–4s  Over-the-shoulder on Ana behind the counter. Leo, surprised and soft: \"You kept the last loaf for me?\"\n4–8s  Close-up on Leo; Ana, teasing: \"Same as every Friday.\" He breaks into a smile.\n\nWarm practical lights, oven hum, a quiet street outside. Lips match the words; outfits identical in both shots.",
  tip: "Keep each line under about 10 words per 4 seconds so lip-sync has room." },

/* ---------------- AI IMAGE ---------------- */
"img-01": {
  does: "Builds a photoreal image prompt from six parts so nothing is left to chance: subject, setting, composition, light, lens, colour and style.",
  when: ["Portraits and editorial shots", "Stock-style images for decks", "Any photoreal image"],
  output: "A close-up editorial portrait. The tailor sits left of frame, eyes sharp, brass scissors catching the window light. Indigo fabric blurs behind him at f/1.4.\n\nWarm ochre highlights, deep indigo shadows, dust floating in the beam. Natural skin texture, 4:5 crop ready for Instagram.",
  tip: "Lighting carries the mood. If a result looks flat, change the light before anything else." },
"img-02": {
  does: "Generates a consistent set of four e-commerce product photos with the label kept exactly as it is.",
  when: ["Shopify and Amazon listings", "Product launch kits", "Replacing a studio shoot"],
  output: "Four 1:1 images:\n1. Serum bottle on seamless white with a soft shadow.\n2. Lifestyle: on a marble bathroom shelf in morning light.\n3. Top-down flat lay with rosemary and water droplets.\n4. Dark and moody, a single rim light on the gold dropper.\n\nThe label is identical and readable in all four.",
  tip: "Attach a real product photo as a reference when the label has to be exact." },
"img-03": {
  does: "Creates a cinematic film frame you can use on its own or as the first frame of a video.",
  when: ["Moodboards and pitch frames", "Start frames for image-to-video", "Poster concepts"],
  output: "Ultra-wide 2.39:1 frame: a woman in a red coat alone on a subway platform, shot low and dead centre. The train streaks away on the right.\n\nSodium-orange overheads fight green fluorescent spill; deep shadows, anamorphic flares, heavy grain. She stands clear in the mid-ground, ready to animate.",
  tip: "Keep the subject unobstructed if you'll animate the frame later." },
"img-04": {
  does: "Keeps the layout and poses of an image and repaints it in a new style.",
  when: ["Turning photos into illustration", "Matching a client's art style", "Anime, painting and clay looks"],
  output: "Same composition and poses as your photo, repainted as a 1970s anime cel: ink outlines with varying weight, flat faded pastels, a hand-painted background on cream paper.\n\nFaces, clothing colours and the dog are still recognisable; logos and phone screens are gone.",
  tip: "List what must stay recognisable, or the new style will overwrite it." },
"img-05": {
  does: "Makes precise, numbered edits to an image and protects everything else from changing.",
  when: ["Client revision rounds", "Fixing details in a good generation", "Clean-up and retouching"],
  output: "The grey sky is now golden hour with soft pink clouds, the man's jacket is forest green, and the bin on the right is gone.\n\nFaces, poses, framing, buildings and light direction are unchanged, and the grain matches the original.",
  tip: "One edit per numbered line. Models skip edits buried inside long sentences." },
"img-06": {
  does: "Turns a rough one-line idea into three fully art-directed prompts in clearly different directions, and picks a favourite.",
  when: ["Blank-page moments", "Showing a client options", "Exploring styles quickly"],
  output: "1. Retro-futurist diner: chrome booths, red Martian dust on the windows, warm tungsten, 35mm…\n2. Minimal Scandinavian dome café, soft light through hexagonal panels…\n3. Gritty miners' canteen, steam, harsh practical lights…\n\nPick: #1. It has the strongest silhouette and colour contrast for a carousel cover.",
  tip: "Ask for \"clearly different directions\", or you'll get three versions of the same idea." },
"img-07": {
  does: "Sets up an upscale that adds real detail while staying faithful to the original.",
  when: ["Large prints", "4K delivery", "Rescuing low-resolution generations"],
  output: "Settings: 4x, creativity low.\nPrompt hint: \"natural skin pores, crisp detail, photographic, no over-sharpening\".\n\nResult: hair strands, eyelashes and the fabric weave sharpen up; the face and expression stay exactly the same, with no plastic skin.",
  tip: "High creativity invents details. Keep it low for faces and products." },
"img-08": {
  does: "Designs a typography-led social graphic where the exact words have to render correctly.",
  when: ["Announcement posts", "Offers and sales", "Thumbnails with text"],
  output: "Square post: a glowing glass clapperboard on a dark charcoal gradient. Bold condensed headline \"AI ads in 48 hours\" left-aligned in warm white, with a smaller amber line \"Book a free test shoot\". Clean margins, no extra words.",
  tip: "Put the exact text in quotes and add \"spell every word exactly as written\"." },

/* ---------------- BLENDER PREVIZ ---------------- */
"prv-01": {
  does: "Starts a guided Blender previz: grey stand-ins with camera and timing locked first, then exported as a reference video for an AI model.",
  when: ["Camera moves AI won't do from text alone", "Stunts and action", "Matching exact timing to music"],
  output: "Step 1 · Brief confirmed: 5s, 24 fps, 16:9, Seedance 2.0.\nStep 2 · Two rooftop blocks 4 m apart, water tanks, a 1.8 m proxy runner. Viewport screenshot.\nStep 3 · Run-up frames 0–48, jump 48–72, roll 72–120; side tracking camera at 3 m with a whip-pan on frame 50.\nStep 4 · Material Preview look, MP4 exported.\nStep 5 · Handoff prompt ready.",
  tip: "Approve each step before moving on. Fixing a blockout late is slow." },
"prv-02": {
  does: "Builds several camera options for the same shot in Blender so you can compare framing side by side.",
  when: ["Choosing a hero angle", "Client reviews", "Planning a sequence"],
  output: "Four cameras with timeline markers:\nCAM_dolly (6 → 2 m, 50 mm)\nCAM_crane (0.5 → 4 m, skyline reveal)\nCAM_orbit (180° at 3 m)\nCAM_handheld (noise on rotation)\n\nEach gets a 5-second viewport playblast: hero_reveal_cam1.mp4 … cam4.mp4.",
  tip: "Name cameras by their move, not a number, so feedback is clear." },
"prv-03": {
  does: "Writes the prompt that tells a video model to copy your previz camera and timing exactly, changing only the look.",
  when: ["Right after exporting a previz", "Locking choreography", "Consistent multi-shot sequences"],
  output: "\"Use the reference video for camera path, framing and timing exactly. Replace the grey figure with a young athletic woman with a ponytail in a black tracksuit. Photoreal golden-hour city rooftops, warm backlight, long shadows. Audio: footsteps, wind, city hum. Do not change camera movement or timing.\"\n\nFallback: a short version with only the subject, look and \"follow the reference motion exactly\".",
  tip: "If the model drifts, shorten the prompt. Long prompts compete with the reference." },
"prv-04": {
  does: "Has Claude build a 3D environment in Blender step by step, checking each step visually and keeping the scene light enough to stay smooth.",
  when: ["Sets for previz", "Stylised scenes", "Backgrounds for renders"],
  output: "Built in six steps: terrain → 26 scattered trees with random scale and rotation → rocks and a log seat → campfire with glowing embers → moonlight rim and fog → 24 mm orbit camera.\n\n140k polygons; the viewport stays real-time. A screenshot after every step.",
  tip: "Ask for a screenshot after each step; it catches problems early." },
"prv-05": {
  does: "Creates a perfectly looping logo animation where the last frame matches the first.",
  when: ["Logo stings", "Website loaders", "Social profile videos"],
  output: "A 120-frame loop at 30 fps: the glass cube rotates 90° with a small bounce, eased in and out, on a soft gradient with slight dispersion in the glass. Frame 1 equals frame 120. Exported as a 1080 × 1080 MP4.",
  tip: "A 90° turn on a cube loops perfectly because the shape repeats." },

/* ---------------- ADS & UGC ---------------- */
"ads-01": {
  does: "Writes a complete 30-second UGC ad as a timed table, plus five alternative hooks to test.",
  when: ["TikTok and Reels ads", "Creator briefs", "Hook testing"],
  output: "0–3s   \"I stopped carrying a tripod.\" | slaps the phone onto a lamp post | STEADY IN 3 SEC\n3–8s   \"Every travel video I made was shaky…\" | wobbly B-roll | THE PROBLEM\n8–20s  demo on a railing, a car door, a fridge | PROOF\n20–30s \"Link's below. 20% off this week.\" | product in hand | 20% OFF\n\nHooks: \"Why is no one talking about this?\" · \"My shaky videos, fixed\" · …",
  tip: "Test hooks that differ in angle, not just wording." },
"ads-02": {
  does: "Generates a batch of ad concepts across formats, each testing one variable, ranked by how likely they are to stop the scroll.",
  when: ["Planning a test round", "Creative strategy sessions", "Feeding a production sprint"],
  output: "1. Gym-bag ASMR: unwrap and bite sounds, no voice (rank 1)\n2. Bar vs. three eggs: side-by-side protein comparison\n3. Founder's 5 am routine: founder story\n… eight concepts in total.\n\nWhy the top three: a strong first frame, a clear offer and a native-looking format.",
  tip: "Run the top three first and keep the rest for the next round." },
"ads-03": {
  does: "Designs a static ad or poster with your headline rendered exactly and safe margins for the placement.",
  when: ["Meta feed ads", "Posters and out-of-home", "Promo graphics"],
  output: "4:5 image: the citrus can centred, water and orange slices bursting around it, bright high-contrast light. Headline \"Zero sugar. All zest.\" across the top in white, logo bottom right, brand orange and deep green accents. Text clear of the product and inside the safe margins.",
  tip: "Give hex codes for brand colours; colour names vary a lot between models." },
"ads-04": {
  does: "Creates a realistic phone-camera frame of a creator holding your product, the classic UGC look.",
  when: ["UGC-style ad visuals", "Thumbnails", "Start frames for talking-head videos"],
  output: "Vertical selfie frame: a curly-haired woman in an oversized hoodie in a sunny kitchen, holding the pink bottle toward the lens mid-sentence, clearly excited. Slight motion blur, window light, real skin, label matching the reference.",
  tip: "Attach the product photo and say the label \"must match the reference exactly\"." },
"ads-05": {
  does: "Reads your ad results, explains why the winner won, and plans the next round of one-variable tests.",
  when: ["Weekly ad reviews", "Deciding what to scale", "Reporting to a client"],
  output: "Winner: Ad B (CTR 1.9%, hook rate 41%). Opening on the problem matches what viewers already feel.\n\nNext tests: new hook with the same body · different first frame · different creator · \"Shop now\" vs \"Try it\" · a 15-second cut.\n\nCaution: Ad C has under 1,000 impressions, too few to judge.",
  tip: "Include impressions so small samples get flagged." },
"ads-06": {
  does: "Plans a before/after ad where the transformation is the hero, with the same room and camera for both states.",
  when: ["Cleaning, beauty, fitness and home products", "Short punchy demos", "Problem-solution ads"],
  output: "0–3s  Messy living room, pet hair everywhere; the owner sighs.\n3–4s  Whip-pan to the vacuum leaving its dock.\n4–8s  Same angle: spotless room, dog asleep on a clean rug.\n8–10s End card: \"Clean floors. Zero effort.\"",
  tip: "Keeping the camera in the same place before and after makes the change feel real." },

/* ---------------- CHARACTERS ---------------- */
"chr-01": {
  does: "Builds a character bible: one locked description you paste into every prompt, plus outfits, expressions and rules against drift.",
  when: ["Series with a recurring character", "AI influencers", "Brand mascots"],
  output: "Locked description: \"Kai, 24, Thai, oval face, warm brown eyes, short platinum-blonde undercut with dark roots, light tan skin, slim athletic build, black chef jacket with orange piping, silver ring on the left hand.\"\n\nNever changes: hair colour, piping colour, the ring.\nDrift fix: blonde hair turning brown → keep \"platinum-blonde undercut, dark roots\" word for word.",
  tip: "Never paraphrase the locked paragraph. Copy it exactly every time." },
"chr-02": {
  does: "Generates a turnaround sheet with front, side and back views and expressions: the reference you'll reuse everywhere.",
  when: ["Starting a new character", "Briefing animators", "Reference for image-to-video"],
  output: "One sheet on light grey: four full-body views (front, three-quarter, side, back) and four head close-ups: happy, surprised, focused, laughing. Same outfit, proportions and lighting in every view.",
  tip: "Use this sheet as the reference image for every later generation." },
"chr-03": {
  does: "Plans two weeks of content for an AI influencer, with captions, hooks and ready prompts that reuse the locked character.",
  when: ["Launching an AI persona", "Keeping a posting rhythm", "Batch-producing content"],
  output: "Day 1 · Reel · Film camera haul in Seoul · Hook: \"I found a $12 camera that shoots like a $2,000 one\" · Prompt: \"Lumi, 26, …\" · 7 pm\nDay 2 · Carousel · …\n\nWeekly series: Film Friday, Outfit of the Alley, Studio Sunday.\nDisclosure: \"Lumi is an AI character.\"",
  tip: "Recurring series make planning easier and build audience habits." },
"chr-04": {
  does: "Puts your existing character into a new scene without changing their face, hair or outfit.",
  when: ["Story continuity", "New content for an existing persona", "Product placement with a mascot"],
  output: "Kai at a night-market stall, flames leaping from the wok as he tosses noodles and laughs toward the lens. Medium shot, warm tungsten stall lights, neon bokeh behind. Same face, hair and chef jacket as the reference.",
  tip: "Change the scene, action and light, never the character description." },

/* ---------------- SOCIAL ---------------- */
"soc-01": {
  does: "Writes a full short-form video: hook, beats with B-roll, pattern interrupts, a looping ending and a caption.",
  when: ["Reels, Shorts and TikTok", "Talking-head videos", "Educational content"],
  output: "Hook (0–2s): \"These 3 AI tools gave me back 10 hours a week.\" On screen: 10 HRS/WEEK\nBeat 1 (2–12s): tool #1 with a screen recording…\nInterrupt at 7s: punch-in zoom with a sound hit.\nEnding: \"…and that's how I got my Fridays back. Here's the first tool again.\" (loops)\nCaption + #freelancedesigner #aitools #designtips",
  tip: "End on a line that leads back into the first frame; it lifts rewatches." },
"soc-02": {
  does: "Turns one long video into a week of posts across platforms, in your own voice.",
  when: ["After a podcast or YouTube video", "Webinars", "Long client interviews"],
  output: "Clips: 02:14–02:52 \"The brief nobody reads\" … five in total\nCarousel: seven slides\nX thread: eight posts\nLinkedIn: a 180-word story-led post\nNewsletter: a three-paragraph intro",
  tip: "Paste the transcript with timestamps so the clip cuts are accurate." },
"soc-03": {
  does: "Writes a carousel with one idea per slide, short text and a visual direction for each slide.",
  when: ["Instagram and LinkedIn carousels", "Teaching a process", "Lead magnets"],
  output: "1. \"Your AI videos look random. Here's why.\"\n2. Name the shot size: wide, medium, close-up.\n3. Tie the camera move to an event.\n…\n8. \"Save this. Follow for more prompts.\"\n\nVisuals: dark background, one bold line per slide, an amber highlight on the key word.",
  tip: "Slide 2 decides whether people swipe. Make it the most useful one." },
"soc-04": {
  does: "Scores a video before you post it and tells you the three fixes that matter most.",
  when: ["Before posting something important", "When views have dropped", "Comparing two edits"],
  output: "Hook 6/10 · Promise 7 · Pacing 5 · Payoff 8 · Loop 4 · CTA 6\nRetention risks: 0:08 long setup, 0:21 static shot.\n\nTop fixes: cut the first 2 seconds · add on-screen text at 0:08 · end on the opening visual.\nNew hooks: \"Stop doing this in your ads\" · …",
  tip: "Describe the first 3 seconds visually; they decide most of the views." },
"soc-05": {
  does: "Plans a full month of content with dates, formats, hooks and the asset each post needs.",
  when: ["Monthly planning", "Managing client accounts", "Staying consistent"],
  output: "Nov 3 · Instagram · Reel · How I made this ad in 48 h · CTA: book a call · Asset: screen recording\nNov 4 · LinkedIn · Post · …\n\n16 posts mixing education, behind-the-scenes, portfolio and offers, with Black Friday tie-ins.",
  tip: "Ask for the table as CSV and paste it straight into a spreadsheet." },

/* ---------------- AUDIO ---------------- */
"aud-01": {
  does: "Writes a voiceover that fits the time exactly, marked with pauses, emphasis and delivery notes.",
  when: ["Ads and launch films", "Narrated explainers", "Text-to-speech scripts"],
  output: "(low, unhurried) Some things are measured in seconds. [pause]\nOthers… in *generations*. [pause]\n(warmer) The Meridian. Built to be handed down.\n\n68 words, about 30 seconds.",
  tip: "Read it aloud against a timer before generating. Scripts always run longer than you think." },
"aud-02": {
  does: "Describes music in the terms music models understand: genre, tempo, instruments and how the mood changes over time.",
  when: ["Ad and reveal music", "Background beds", "Matching an edit's timing"],
  output: "30 seconds of cinematic electronic at 110 BPM.\n0:00 airy pads and a ticking pulse\n0:08 bass enters, tension rises\n0:18 full drop with wide synths and drums\n0:30 hard stop on the downbeat. No vocals.",
  tip: "Give a timestamp for the drop so you can cut your edit to it." },
"aud-03": {
  does: "Builds a sound-effects list for your edit, with layers and a generation prompt for every sound.",
  when: ["Sound design for AI video", "Silent clips that feel flat", "Foley planning"],
  output: "0:00 Door opens · close: wooden creak · room: soft reverb · \"old wooden door creaks open slowly\"\n0:02 Footsteps on gravel · …\n0:04 Engine starts · …\n\nAmbience bed: \"rural morning, distant birds, light wind\".",
  tip: "Layer a close sound with a room sound; it instantly feels real." },

/* ---------------- BRAND ---------------- */
"brd-01": {
  does: "Builds a brand foundation in one pass: positioning, taglines, tone, colours, fonts and imagery rules.",
  when: ["A new business or side project", "Rebrands", "Pitching a client's identity"],
  output: "Positioning: \"Sage Studio makes scroll-stopping AI ads for D2C brands in days, not months.\"\nTaglines: \"Cinema at the speed of social\" · …\nPalette: Ink #0B0B0F, Ember #FF6A3D, Bone #F2EEE6…\nType: a bold display face with a clean sans for body.\nImagery: dramatic light, real textures, no stock smiles.",
  tip: "Pick one tagline and live with it for a week before deciding." },
"brd-02": {
  does: "Turns brand colours and fonts into a full design system: tokens, component states and contrast checks.",
  when: ["Websites and apps", "Handing off to a developer", "Keeping designs consistent"],
  output: "Colour tokens (light / dark): --bg #F5F5F4 / #111827 …\nContrast: orange on white is 2.9:1, which fails. Use #C2410C for text (4.8:1, passes).\nType scale: 12 / 14 / 16 / 20 / 28 / 40\nButton: default, hover, pressed, focus and disabled specs…",
  tip: "Fix the contrast warnings first; they're the most common launch bug." },
"brd-03": {
  does: "Writes a short brand line you add to the end of any image or video prompt so every output looks on-brand.",
  when: ["Teams sharing prompts", "Long campaigns", "Keeping AI output consistent"],
  output: "Brand suffix: \"Warm cinematic light, deep shadows, ember-orange accents on ink black, tactile textures, 35mm feel, calm and confident. Avoid pastels, stock smiles, clutter and neon.\"\n\nPlus three example prompts that use it.",
  tip: "Save the suffix as your own prompt here so it's always one click away." },
"brd-04": {
  does: "Creates twelve image prompts that together form one coherent moodboard for a campaign.",
  when: ["Campaign kick-offs", "Aligning with a client", "Pitches"],
  output: "Setting: \"sun-bleached beach wall, harsh noon shadows, film grain\"…\nCasting: \"freckled teen laughing, squinting into the sun\"…\nProduct: \"sunscreen tube half-buried in sand\"…\nTexture: \"cracked white paint, salt crust\"…\nType: \"hand-painted beach-hut lettering\".",
  tip: "Generate all twelve, then drop the three that feel off; the board gets sharper." },

/* ---------------- DESIGN REVIEW ---------------- */
"dsn-01": {
  does: "Gets a structured design review ranked by severity, with a specific fix for every issue.",
  when: ["Before showing a client", "Reviewing your own website", "Comparing two versions"],
  output: "Critical: the \"Book a call\" button sits below the fold and looks like a link. Make it a filled button in the hero.\nMajor: three different heading sizes are used for the same level.\nMinor: card padding varies between 16 and 24 px.",
  tip: "Say what the page's main goal is; the critique gets much sharper." },
"dsn-02": {
  does: "Audits a page for accessibility against WCAG 2.1 AA and returns a table of issues with fixes.",
  when: ["Before launch", "Client compliance requests", "After a redesign"],
  output: "Grey footer text at 3.1:1 · 1.4.3 · High · darken to #595959\nNo focus ring on nav links · 2.4.7 · High · add a visible focus outline\nMenu icon button has no label · 4.1.2 · Medium · add aria-label \"Open menu\"",
  tip: "Fix the High items first; they block real people from using the page." },
"dsn-03": {
  does: "Writes interface text such as buttons, errors and empty states, with three options each and a recommendation.",
  when: ["Forms and checkout", "Error messages", "Onboarding screens"],
  output: "Primary button: \"Pay $49\" (recommended) · \"Complete purchase\" · \"Checkout\"\nEmpty cart: \"Your cart is empty. Browse templates\" (recommended) …\nPayment error: \"Your card was declined. Try another card or contact your bank.\"",
  tip: "Buttons should say exactly what happens when you click them." },
"dsn-04": {
  does: "Produces a developer-ready spec for a component or page: layout, tokens, states, breakpoints and edge cases.",
  when: ["Handing designs to a developer", "Briefing Claude Code", "Documenting components"],
  output: "Layout: 3 columns at ≥1280 px, 2 at ≥768 px, 1 below.\nTokens: card background --surface, radius 16 px…\nStates: plan card default, hover, selected…\nEdge cases: long plan names wrap to two lines; price shows \"Custom\" when empty.\nMotion: hover lift 4 px, 150 ms ease-out.",
  tip: "Pair this with the Portfolio website prompt to build straight from the spec." },
"dsn-05": {
  does: "Plans a landing page section by section with real copy you can use as it is.",
  when: ["Service or product pages", "Before designing in Figma", "Improving conversion"],
  output: "Hero: \"Ads that look like a film shoot. Delivered in 72 hours.\" CTA: \"Book a 15-minute call\"\nProof: six brand logos and your best result\nProblem: …\nPricing: three tiers…\nFAQ: \"Do I own the ads?\" …",
  tip: "Replace any placeholder numbers with your real results before publishing." },

/* ---------------- RESEARCH ---------------- */
"rsc-01": {
  does: "Runs a cited deep-research report and ends with a recommendation for your exact situation.",
  when: ["Choosing tools or vendors", "Market questions", "Before big decisions"],
  output: "Summary: for 20 ads a month, use one model for product shots and another for people…\nComparison table: max length · control · price per clip · audio…\nFindings with numbered sources.\nFlagged as marketing: \"cinema quality\" claims with no independent tests.",
  tip: "Narrow the scope (time range, region) for faster, sharper answers." },
"rsc-02": {
  does: "Compares your competitors on offer, price, positioning and content, and finds gaps you could own.",
  when: ["Pricing your services", "Positioning", "Pitch preparation"],
  output: "Studio A · UGC packs · from $800 · D2C beauty · fast · generic look\nStudio B · …\n\nGaps: a cinematic look for small brands · monthly retainers with built-in testing · …",
  tip: "Add their website links; the analysis becomes far more specific." },
"rsc-03": {
  does: "Prepares a user interview: who to recruit, what to ask and how to take notes, without leading questions.",
  when: ["Validating an idea", "Understanding client objections", "Product research"],
  output: "Screener: five questions on role, company size and ad spend.\nGuide: warm-up (5 min) → current process (10) → \"Tell me about the last time you tried AI for ads\" (10) → wrap-up (5).\nProbes: \"What happened next?\" \"Why was that?\"\nNotes: quote | pain | workaround | emotion",
  tip: "Ask about the last time something happened, not what people usually do." },
"rsc-04": {
  does: "Turns messy feedback into themes with counts, quotes, segments and prioritised actions.",
  when: ["After interviews or surveys", "Client feedback", "Reviews and comments"],
  output: "Theme 1: worried AI looks fake. 9 mentions. \"Our customers can smell AI.\"\nTheme 2: need speed for launches. 7 mentions…\nSegments: cautious enterprise teams vs. fast D2C brands.\nTop action: show real before/after results (high impact, low effort).",
  tip: "Paste the raw notes; don't summarise them first." },
"rsc-05": {
  does: "Scans current trends with evidence and one concrete action for each, and calls out the hype.",
  when: ["Monthly strategy", "Content ideas", "Staying ahead of clients"],
  output: "1. Video models with native audio · maturing · action: offer dialogue ads this month.\n2. AI UGC creators · growing · action: …\n\nHype: fully automated ad agencies, with no evidence of quality at scale.",
  tip: "Run it monthly and compare with last month's scan." },

/* ---------------- DOCS ---------------- */
"doc-01": {
  does: "Creates a shareable creative brief so you and the client agree on everything before production starts.",
  when: ["Every new project", "Onboarding a client", "Briefing collaborators"],
  output: "Bloom Skincare · Spring Launch Brief\nObjective: drive launch-week sales of the new serum.\nDeliverables: 3 × 15s in 9:16 and 1:1, captions burned in.\nMandatories: logo end card, \"Dermatologist tested\" line.\nTimeline: 2 weeks. Concepts day 2, first cut day 7…",
  tip: "Get the brief approved in writing before you generate anything." },
"doc-02": {
  does: "Writes a client proposal with your approach, deliverables, three pricing tiers and usage terms.",
  when: ["After a discovery call", "Retainer pitches", "Upselling existing clients"],
  output: "Starter · $1,500/mo · 4 ads + 10 images\nGrowth · $3,500/mo · 10 ads + 30 images + testing (recommended)\nScale · $6,000/mo · 20 ads + 60 images + weekly reports\n\nRevisions: two rounds per asset. Usage: perpetual paid-social licence…",
  tip: "Mark one tier as recommended; most clients pick it." },
"doc-03": {
  does: "Builds a 10-slide pitch deck with one message per slide and a visual idea for each.",
  when: ["New business pitches", "Partner meetings", "Agency credentials"],
  output: "1. Cinema-grade ads at social speed\n2. Brands need 10x more creative; budgets didn't grow\n3. An AI production studio…\n…\n10. Start with a free test ad\n\nVisuals: full-bleed stills from your best work.",
  tip: "One message per slide. If you need two, make two slides." },
"doc-04": {
  does: "Builds a spreadsheet that tracks every deliverable, tool, prompt, cost and revision, with a summary sheet.",
  when: ["Running several clients", "Tracking credits spent", "Delivery deadlines"],
  output: "Tracker: Project | Client | Deliverable | Tool | Prompt link | Status | Due | Cost | Revisions | Notes\nSummary: count by status, cost per client, overdue items highlighted.",
  tip: "Keep the prompt link column; you'll thank yourself on the next project." },
"doc-05": {
  does: "Turns campaign data into a clean dashboard with one insight per chart.",
  when: ["Client reports", "Weekly ad reviews", "Deciding what to scale"],
  output: "Charts: spend over time, CTR by ad, CPA trend, weekly conversions, a top-5 ads table.\nInsights: \"CPA fell 22% after switching to problem-first hooks.\" \"Ad 7 takes 30% of budget at the worst CPA.\"",
  tip: "Include dates in your CSV so trends show up." },
"doc-06": {
  does: "Cleans up meeting notes into decisions, owners, deadlines and a follow-up email.",
  when: ["After client calls", "Team syncs", "Recording decisions"],
  output: "Summary: client approved concept B, wants a 6-second cut, launch moved to May 2.\nActions: Sage · 6s cut · Apr 24 / Client · logo files · Apr 22\nEmail: \"Hi Maya, thanks for today. Quick recap…\"",
  tip: "Send the follow-up the same day; it prevents scope disputes later." },

/* ---------------- BUILD ---------------- */
"dev-01": {
  does: "Has Claude Code build your portfolio website from scratch, ready to publish on GitHub Pages.",
  when: ["Launching your portfolio", "Showcasing client work", "A quick landing page"],
  output: "Files: index.html, styles.css, main.js and video thumbnails.\nSections: showreel hero, filterable work grid (Ads / Films / Images), services, process, testimonials, contact.\nCommitted to git, with the steps to turn on GitHub Pages.",
  tip: "Have your showreel and 6–9 best pieces ready before you start." },
"dev-02": {
  does: "Packages a process you repeat into a Claude skill, so Claude follows it the same way every time.",
  when: ["Repeated client workflows", "Training assistants", "Standardising quality"],
  output: "Skill: ad-video-pipeline\nTrigger: \"make video ads from a brief\"\nSteps: read brief → 5 concepts → prompts → generate → review checklist → deliver\nChecklist: logo clear, text spelled right, 9:16 safe zones…\nEvals: three test briefs with expected outputs.",
  tip: "Start with a workflow you've already done at least three times." },
"dev-03": {
  does: "Designs an automation that handles a weekly chore for you, with a dry run before it touches anything.",
  when: ["Renaming and sorting files", "Weekly reports", "Tracking credits"],
  output: "Inputs: downloads folder, client list.\nScript: renames files to client_project_date_##.mp4, sorts them into folders, totals credits.\nSchedule: Mondays 9:00.\nReport: a summary message plus a CSV.\nDry run: 47 planned renames shown, nothing changed.",
  tip: "Always approve the dry run before it runs for real." },
"dev-04": {
  does: "Plans running a GPU workflow like ComfyUI on RunPod, with the price stated before anything is created.",
  when: ["Heavy upscaling or interpolation", "Custom models", "Batch generation"],
  output: "Recommendation: an on-demand pod for interactive ComfyUI on a high-VRAM GPU, the ComfyUI template and a network volume for models. Hourly price quoted before creation.\nSteps: create volume → deploy pod → load workflow → run → stop the pod.\nReminder: stopped pods still bill for storage.",
  tip: "Set a reminder to stop pods; idle GPUs burn credits fast." },
"dev-05": {
  does: "Reviews your code before you ship, fixes the confirmed problems and summarises the changes.",
  when: ["Before launching a site", "After big changes", "Security checks on forms"],
  output: "Found 3 issues:\n1. Contact form had no spam protection → added a honeypot field.\n2. Grid overflowed at 375 px → fixed.\n3. Six images had no alt text → added.\nAll fixed, with a summary of changed files.",
  tip: "Name what matters most (mobile, security) so the review stays focused." },
"dev-06": {
  does: "Rewrites any prompt to be clear and specific, with a role, inputs, steps, output format and a quality bar.",
  when: ["Prompts that give vague results", "Before saving a template", "Teaching others to prompt"],
  output: "Role: you are a short-form scriptwriter for a D2C skincare brand.\nInput: product, audience, offer.\nTask: 1) write a 2-second hook 2) …\nFormat: table of time | line | visual | text.\nQuality bar: under 30 seconds, no medical claims.\n\nChanges: added a role, defined the output format, set a length…",
  tip: "Run your favourite prompts through this once; most get noticeably better." }
};
