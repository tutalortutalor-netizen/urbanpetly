# Brand direction

Owner: UI/UX Designer.

> ## Decision: **Option B — "Indigo Care"**
>
> Chosen by the founder on **2026-10-18** (Paperclip issue SAM-7), with the wordmark
> **capitalised: `UrbanPetly`**. Shipped in `packages/ui/src/theme.css`; the Option A
> preview block has been removed. Option A is kept below as the record of what was considered
> and why — do not reintroduce its values without a new decision on an issue.
>
> **Still open:** the home hero tagline (placeholder stands — see [home.md](home.md)) and whether
> any logo or colour from the domain purchase must be preserved. Neither blocks development.

Both options satisfied `05-ux-spec` ("warm, trustworthy, friendly; not childish") and WCAG 2.1 AA, and both were specified as tokens, so the choice was a values-only swap — no component, class name, layout or screen-spec change.

---

## Option A — "Marigold" (not chosen)

**Idea.** Delhi warmth without the clichés. A deep, calm teal does the trustworthy work; marigold — the flower on every doorway and garland in NCR — does the warmth. Photography-led, generous whitespace, soft corners.

**Palette.** Primary Teal `#0E7C66` · Accent Marigold `#F59E0B` · Warm sand neutrals (`#FAF9F7` → `#1C1917`).
Marigold is a highlight only (ratings, Verified badge, featured ribbon); teal carries every action.

```
 PRIMARY        ACCENT         SURFACE       TEXT
 #0E7C66        #F59E0B        #FFFFFF       #1C1917
 ██████████     ██████████     ░░░░░░░░░░    ██████████
 teal-600       marigold-500   white         sand-900
```

**Type.** Headings *Plus Jakarta Sans* 600/700 — humanist, slightly rounded, friendly but adult.
Body *Inter* 400/500 — the most legible UI face on low-end Android at 14–16px.
Pairs cleanly with *Noto Sans Devanagari* for the Hindi release.

**Tone.** The helpful neighbour. Short sentences, concrete nouns, no hype.
> "Groomers near you in Sector 56." · "Send a request — no payment needed." · "Usually replies within 2 hours."

**Logo concept.** Lowercase wordmark `urbanpetly` in Plus Jakarta Sans 700, tight tracking, `urban` in sand-900 and `petly` in teal-600. The mark is a rounded-square tile holding a **location pin whose head is a paw pad** — the product in one glyph: a pet service, pinned to a place. Marigold is used only for the pin's inner dot, which gives us a strong 24×24 favicon.

```
  +--------+
  |   ,-.  |     tile: teal-600, radius 10
  |  ( o )|     pin outline: white, dot: marigold-500
  |   `V'  |     wordmark sits to the right at >=120px wide
  +--------+  urbanpetly
```

**Feels like.** Warm, local, approachable, a bit crafted. **Risk:** marigold reads "festival/food delivery" if overused — the token rules keep it to ~5% of any screen.

---

## Option B — "Indigo Care" (CHOSEN, shipped)

**Idea.** Clinical calm. Closer to a health product than a marketplace: cool indigo, crisp slate neutrals, tighter grid, a single warm accent used sparingly for urgency and ratings.

**Palette.** Primary Indigo `#4F46E5` · Accent Rose `#E11D48` · Cool slate neutrals (`#F8FAFC` → `#0F172A`).

```
 PRIMARY        ACCENT         SURFACE       TEXT
 #4F46E5        #E11D48        #FFFFFF       #0F172A
 ██████████     ██████████     ░░░░░░░░░░    ██████████
 indigo-600     rose-600       white         slate-900
```

Verified contrast: white on indigo 6.29:1, white on rose 4.70:1, text 17.85:1, muted 7.58:1 — all AA. Interactive borders use slate-500 `#64748B` (4.76:1).

**Type.** Headings *Outfit* 600 — geometric, modern, confident. Body *Inter* 400/500.
Slightly larger radii (`lg` 16, `xl` 24) and cooler, tighter shadows.

**Tone.** Calm and precise; reassurance through specifics rather than warmth.
> "Verified vets and groomers across Delhi NCR." · "Request sent. The provider has 24 hours to respond." · "Licence verified on 12 Sep 2026."

**Logo concept.** `UrbanPetly` set in Outfit 600 with a capital U and P, plus a geometric monogram: a circle in which the counter of the **U** is cut by a **dog-ear curve** — abstract enough to work at 16px, animated as a gentle "ear flick" on first load (reduced-motion safe).

**Feels like.** Professional, safe, slightly corporate. **Risk:** indigo + slate is the default SaaS look; we'd be fighting for distinctiveness with photography and copy alone.

---

## Side by side

| | A — Marigold | B — Indigo Care |
|---|---|---|
| Primary / accent | Teal `#0E7C66` / Marigold `#F59E0B` | Indigo `#4F46E5` / Rose `#E11D48` |
| Neutrals | Warm sand | Cool slate |
| Headings / body | Plus Jakarta Sans / Inter | Outfit / Inter |
| Radii, shadows | 10–20px, soft warm | 12–24px, crisp cool |
| Voice | Friendly neighbour | Careful professional |
| Strength | Memorable, local, human | Credible, clean, "medical-grade" |
| Risk | Can read as food delivery if accent is overused | Generic SaaS; weaker emotional pull |
| Hindi/Devanagari | Noto Sans Devanagari pairs well | Pairs acceptably; Outfit has no Devanagari sibling |
| AA contrast | Verified when proposed | Verified and guarded in CI (design-system.md §2.3) |

## Follow-through on the decision

| Step | State |
|---|---|
| Swap the primitive values in `packages/ui/src/theme.css`, delete the preview block, rerun `check-contrast.mjs` | **Done** — all 49 pairs pass, see design-system.md §2.3 |
| Update design-system.md, the screen specs and the prototype to the new palette, type and radii | **Done** |
| Logo as SVG (`packages/ui/src/assets/`) in three lockups — full, compact, mark-only + favicon set | **To do** — follow-up issue; needs the scaffold (E12-S1) for a place to import from |
| Self-host *Outfit* and *Inter* woff2 subsets per the `06-nfr` performance budget | **To do** — with the first components |

Spacing, the type scale, every component contract and every screen spec were unaffected by the choice, as designed.

## Still open with the founder

1. **Tagline for the home hero.** Placeholder stands: *"Every pet service in Delhi NCR, in one place."* Approve or replace — it is one string and can change any time before launch.
2. **Existing assets.** Is there a logo, colour or asset from the domain purchase that must be preserved? If yes, it changes the logo work above, not the token layer.
