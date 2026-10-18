# Brand direction — two options for the founder

Owner: UI/UX Designer. Status: **awaiting founder decision** (Paperclip issue SAM-7).
Both options satisfy `05-ux-spec` ("warm, trustworthy, friendly; not childish") and WCAG 2.1 AA.
Both are fully specified as tokens, so **choosing is a values-only swap in `packages/ui/src/styles/tokens.css`** — no component, class name, layout or screen-spec change. Option A ships as the provisional default so development is not blocked.

## How to decide

Pick the one that sounds more like UrbanPetly to a pet parent in Gurgaon who has never heard of us:

- **Option A** says *"the friendly local place that knows your neighbourhood."*
- **Option B** says *"the careful, professional service you'd trust with a vet appointment."*

Reply on issue SAM-7 with **"Brand A"** or **"Brand B"** (plus anything you want changed). If you want a blend — e.g. A's palette with B's wordmark — say so; that is cheap now and expensive after Phase 1.

---

## Option A — "Marigold" (provisional default)

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

## Option B — "Indigo Care"

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
| AA contrast | Verified (design-system.md §2.3) | Verified (above) |

## What happens after the decision

1. Designer swaps the primitive values in `packages/ui/src/styles/tokens.css` (one commit, ~20 lines) and reruns `check-contrast.mjs`.
2. Logo is produced as SVG (`packages/ui/src/assets/`) in three lockups: full, compact, mark-only + favicon set.
3. The rest of the system — spacing, type scale, components, every screen spec — is unaffected.

## Open questions for the founder

1. **A or B** (or a blend)?
2. Is `urbanpetly` lowercase acceptable in the wordmark, or do you want `UrbanPetly`?
3. Do we have an existing logo, colour or asset from the domain purchase that we must keep?
4. Tagline for the home hero — current placeholder is **"Every pet service in Delhi NCR, in one place."** Approve or replace.
