---
name: Island Studio
description: The DynamicIsland development record, set as a mid-century magazine program.
colors:
  paper: "#fbfaf6"
  paper-2: "#f3f1ea"
  paper-3: "#e9e6dc"
  ink: "#111110"
  ink-2: "#3a3833"
  ink-3: "#66635b"
  hairline: "#d9d5c9"
  on-ink: "#fbfaf6"
  focus: "#2747b5"
  ochre: "#a8740f"
  teal: "#1e7470"
  vermilion: "#cf4328"
  olive: "#66731a"
  cobalt: "#2747b5"
typography:
  display:
    fontFamily: "-apple-system, BlinkMacSystemFont, \"SF Pro Display\", system-ui, \"Helvetica Neue\", Arial, sans-serif"
    fontSize: "clamp(3rem, 8.4vw, 7rem)"
    fontWeight: 700
    lineHeight: 0.95
    letterSpacing: "-0.035em"
  headline:
    fontFamily: "-apple-system, BlinkMacSystemFont, \"SF Pro Display\", system-ui, \"Helvetica Neue\", Arial, sans-serif"
    fontSize: "clamp(2.25rem, 4.6vw, 3.75rem)"
    fontWeight: 700
    lineHeight: 1.04
    letterSpacing: "-0.03em"
  headline-section:
    fontFamily: "-apple-system, BlinkMacSystemFont, \"SF Pro Display\", system-ui, \"Helvetica Neue\", Arial, sans-serif"
    fontSize: "clamp(1.625rem, 2.7vw, 2.375rem)"
    fontWeight: 700
    lineHeight: 1.1
    letterSpacing: "-0.022em"
  title:
    fontFamily: "-apple-system, BlinkMacSystemFont, \"SF Pro Display\", system-ui, \"Helvetica Neue\", Arial, sans-serif"
    fontSize: "1.375rem"
    fontWeight: 650
    lineHeight: 1.2
    letterSpacing: "-0.012em"
  title-row:
    fontFamily: "-apple-system, BlinkMacSystemFont, \"SF Pro Display\", system-ui, \"Helvetica Neue\", Arial, sans-serif"
    fontSize: "1.125rem"
    fontWeight: 650
    lineHeight: 1.3
    letterSpacing: "-0.01em"
  pull-quote:
    fontFamily: "-apple-system, BlinkMacSystemFont, \"SF Pro Display\", system-ui, \"Helvetica Neue\", Arial, sans-serif"
    fontSize: "clamp(1.375rem, 2.2vw, 1.75rem)"
    fontWeight: 650
    lineHeight: 1.22
    letterSpacing: "-0.018em"
  lede:
    fontFamily: "-apple-system, BlinkMacSystemFont, \"SF Pro Text\", system-ui, \"Helvetica Neue\", Arial, sans-serif"
    fontSize: "1.1875rem"
    fontWeight: 400
    lineHeight: 1.65
  body:
    fontFamily: "-apple-system, BlinkMacSystemFont, \"SF Pro Text\", system-ui, \"Helvetica Neue\", Arial, sans-serif"
    fontSize: "1.0625rem"
    fontWeight: 400
    lineHeight: 1.6
  body-row:
    fontFamily: "-apple-system, BlinkMacSystemFont, \"SF Pro Text\", system-ui, \"Helvetica Neue\", Arial, sans-serif"
    fontSize: "0.9375rem"
    fontWeight: 400
    lineHeight: 1.6
  label:
    fontFamily: "-apple-system, BlinkMacSystemFont, \"SF Pro Text\", system-ui, \"Helvetica Neue\", Arial, sans-serif"
    fontSize: "0.8125rem"
    fontWeight: 600
    lineHeight: 1.4
  data:
    fontFamily: "ui-monospace, \"SF Mono\", SFMono-Regular, Menlo, Consolas, monospace"
    fontSize: "0.8125rem"
    fontWeight: 400
    letterSpacing: "0"
    fontFeature: "\"tnum\" 1"
rounded:
  tag: "6px"
  sm: "8px"
  control: "10px"
  sheet: "18px"
  pill: "999px"
spacing:
  s1: "4px"
  s2: "8px"
  s3: "12px"
  s4: "16px"
  s5: "24px"
  s6: "32px"
  s7: "48px"
  s8: "72px"
  s9: "104px"
  gutter: "clamp(16px, 5.5vw, 80px)"
  measure: "68ch"
components:
  button-primary:
    backgroundColor: "{colors.ink}"
    textColor: "{colors.paper}"
    rounded: "{rounded.pill}"
    padding: "0 18px"
    height: "42px"
    typography: "{typography.label}"
  button-outline:
    backgroundColor: "transparent"
    textColor: "{colors.ink}"
    rounded: "{rounded.pill}"
    padding: "0 18px"
    height: "42px"
  button-outline-hover:
    backgroundColor: "{colors.paper-2}"
    textColor: "{colors.ink}"
  button-on-ink:
    backgroundColor: "{colors.paper}"
    textColor: "{colors.ink}"
    rounded: "{rounded.pill}"
    height: "42px"
  menu-button:
    backgroundColor: "{colors.ink}"
    textColor: "{colors.on-ink}"
    rounded: "{rounded.pill}"
    width: "56px"
    height: "36px"
  chip:
    backgroundColor: "transparent"
    textColor: "{colors.ink}"
    rounded: "{rounded.pill}"
    padding: "0 10px 0 8px"
    height: "26px"
  chip-merged:
    backgroundColor: "{colors.ink}"
    textColor: "{colors.paper}"
    rounded: "{rounded.pill}"
    height: "26px"
  tag:
    backgroundColor: "{colors.paper-2}"
    textColor: "{colors.ink-2}"
    rounded: "{rounded.tag}"
    padding: "2px 7px"
    typography: "{typography.data}"
  input:
    backgroundColor: "{colors.paper}"
    textColor: "{colors.ink}"
    rounded: "{rounded.control}"
    padding: "0 14px"
    height: "42px"
  segment-active:
    backgroundColor: "{colors.ink}"
    textColor: "{colors.paper}"
    rounded: "{rounded.pill}"
    padding: "0 12px"
    height: "32px"
  tree-link-active:
    backgroundColor: "{colors.ink}"
    textColor: "{colors.paper}"
    rounded: "{rounded.control}"
    padding: "8px 10px"
  sidebar:
    backgroundColor: "{colors.paper}"
    textColor: "{colors.ink}"
    rounded: "{rounded.sheet}"
    width: "304px"
  cta-black:
    backgroundColor: "{colors.ink}"
    textColor: "{colors.paper}"
    padding: "clamp(22px, 3vw, 32px)"
  phase-item:
    backgroundColor: "transparent"
    textColor: "{colors.ink}"
    padding: "18px 0 18px 20px"
  phase-item-hover:
    backgroundColor: "{colors.paper-2}"
    padding: "18px 0 18px 26px"
---

# Design System: Island Studio

## Overview

**Creative North Star: "The Edited Issue"**

Island Studio presents a long engineering history the way a mid-century magazine program presents a season: a masthead, a contents list, features with a pull quote, and ruled listings set in black ink on warm paper. The reader is a supervisor who is not a Swift specialist, so the system's job is editorial: rank, sequence and frame the record so the hard problems and the open work are legible in one visit. Hierarchy comes from rules and type scale, not from boxes; nearly everything is a ruled list or a two-column spread.

The world is printed, not rendered. Heavy black rules open sections, hairlines separate rows, and five phase spot colours appear only as printed bands, dots and active marks. A small black pill (the island mark) is the one pictorial device, echoing the product's notch. Interactive chrome is Apple-native in feel: the system SF stack throughout, pill buttons, a sticky nav that docks into a black pill menu button with a running-head folio, and a documentation-style sidebar that grows out of that button. Dark mode is the same program printed on near-black stock, not a different design. It refuses the SaaS dashboard of stat cards and the generic docs portal.

Descriptive language here was derived from the direction contract and the shipped build; no interview was held.

**Key Characteristics:**
- Warm paper ground, black ink, and a strict ladder of rule weights (6px, 4px, 3px, 1px ink, 1px hairline).
- SF system type with a very large, tightly tracked masthead and a four-line drop initial on the deck.
- Monospace only for dates, counts, PR and issue numbers, and chart labels.
- Five phase spot colours used only as bands, dots and active states.
- Status shown by line form as well as colour on every chip.
- Depth only where something floats over the page (menu button, sidebar, toast).

## Colors

Black ink on warm off-white paper, with five muted printer's spot colours held in reserve for phase identity.

### Primary
- **Press Black** (ink): all text, every structural rule, the island mark, primary buttons, merged chips, the active nav underline, the active sidebar row and the black feedback block. The system is monochrome first; ink carries hierarchy.

### Secondary (phase spot colours)
Each spot belongs to one development phase and is set through a per-element phase variable, never applied by hand.
- **Ochre** (ochre): phase 1, Foundations.
- **Deep Teal** (teal): phase 2, Reliability.
- **Vermilion** (vermilion): phase 3, Interaction.
- **Olive** (olive): phase 4, Widgets.
- **Cobalt** (cobalt): phase 5, Polish; also the current-phase "Latest" badge, since the latest phase is Polish.

### Tertiary
- **Focus Cobalt** (focus): the 2px focus ring and the focused field border. It shares cobalt's value in both schemes.

### Neutral
- **Paper** (paper): page ground, the sidebar sheet, input fields, and the ink colour inverted onto black surfaces.
- **Paper Two** (paper-2): hover wash on rows, tree links and outline buttons; the composer ground; tag ground.
- **Paper Three** (paper-3): scrollbar thumb; the deepest paper step.
- **Ink Two** (ink-2): body copy inside rows, nav links at rest, secondary chip text.
- **Ink Three** (ink-3): datelines, labels, counts and captions; superseded chips. Raised to ink-2 under increased contrast.
- **Hairline** (hairline): row separators, sidebar borders and docked-nav bottom edge. Raised to ink-3 under increased contrast.
- **On Ink** (on-ink): the icon colour on the black menu button.

Dark stock reprints every role on near-black paper with lifted ink and brighter spot colours; the exact values live in the sidecar's dark-mode map.

### Named Rules
**The Spot Colour Rule.** Phase colours appear only as printed marks: the 6px band on contents rows and phase sections, the 9px phase dot, the timeline strip segments, the short dash before phase-grid items, and the "Latest" badge. Text and surfaces stay ink and paper.

**The Ink Inversion Rule.** A black surface (primary button, merged chip, active tree row, segmented pressed state, feedback block, toast) always carries paper text; nothing sits on black in a spot colour.

## Typography

**Display Font:** SF Pro Display via the system stack (-apple-system, with Helvetica Neue and Arial fallbacks)
**Body Font:** SF Pro Text via the system stack
**Label/Mono Font:** SF Mono via ui-monospace (Menlo, Consolas fallbacks)

**Character:** One family doing a magazine's whole job by weight, size and tracking: the owner's brief chose the Apple system face, and the masthead earns its editorial voice from scale and negative tracking rather than from a display serif. Mono is a data voice, never a decorative one.

### Hierarchy
- **Display** (700, clamp 3–7rem, 0.95): the "Island Studio" wordmark in the masthead only, followed by the island mark.
- **Headline** (700, clamp 2.25–3.75rem, 1.04): one page title per view, capped at 18ch (24ch for wide titles).
- **Headline Section** (700, clamp 1.625–2.375rem, 1.1): section heads under a 6px rule.
- **Title** (650, 1.375rem, 1.2): contents heads, month heads, sidebar block heads, the issue line (at 500).
- **Title Row** (650, 1.125rem, 1.3): row titles in contents, challenge, feature and decision lists.
- **Pull Quote** (650, clamp 1.375–1.75rem, 1.22): the root-cause quote between a 3px and a 1px rule.
- **Lede** (400, 1.1875rem, 1.65): the deck under a page title, max 68ch.
- **Body** (400, 1.0625rem, 1.6): running prose, max 68ch; row copy steps down to 0.9375rem.
- **Label** (600, 0.8125rem, 1.4, sentence case): metadata beside or below a heading, legends, field labels.
- **Data** (mono, 0.8125rem, tabular figures): datelines, counts, PR/issue numbers, bar labels, phase numerals.

### Named Rules
**The Mono-Is-Data Rule.** Monospace is reserved for dates, counts, PR and issue numbers, and chart labels (datelines, numerals, tags, bar rows). Never set prose, headings or buttons in mono.

**The Drop Initial Rule.** Only the overview deck carries a drop initial, four lines deep (native initial-letter where supported, a floated 6.6em capital otherwise). One per site, on the opening deck.

**The No-Kicker Rule.** Nothing sits above a heading. Labels, chips and section metadata go on the line after the heading or beside it, never as an eyebrow.

## Layout

A single gutter (clamp 16–80px) frames masthead, nav, main and footer alike. The governing structure is the **spread**: a flexible main column beside a fixed 456px side column (gap clamp 32–80px), used for the opening view (headline, deck and evidence left; contents right), for features beside their aside, and for case studies beside their feedback block. The masthead repeats the same split: wordmark left, issue line right behind a 1px ink rule.

Content is ruled lists, not cards: contents rows, milestones, challenges, features, decisions, roadmap items, evidence and review steps are all full-width rows separated by hairlines, opened by a 4px ink rule. Row interiors use fixed label columns (110px date, 120px decision label, 180px step label, 52px open-row numeral) so data aligns down the page. Multi-column grids appear for parallel material only: phase result grids (3 columns), roadmap columns (3), the six-step pipeline, the architecture layers (3).

Vertical rhythm comes from the 4px-based spacing scale; sections sit 104px apart (72px under 820px), page heads have 48px below them, rows pad 14–20px. Text never exceeds 68ch.

Responsive: at 1080px the spread, masthead and roadmap collapse to one column and the issue line moves under a hairline. At 820px the nav becomes a fixed top bar with the pill menu button and folio always visible, the inline links are removed, the sidebar becomes a full-height left sheet, and every row grid stacks.

## Elevation & Depth

The page itself is flat: hierarchy is drawn with rules and paper steps, never with shadow. Depth is reserved for the three things that float above the page: the docked menu button, the sidebar sheet and the toast. They share one two-layer shadow, a tight contact shadow plus a long soft drop, deepened on dark stock. A dimming scrim (ink at 34%, 60% under reduced transparency) sits behind the open sidebar.

### Shadow Vocabulary
- **Float** (`0 1px 2px rgb(17 17 16 / 6%), 0 12px 32px -8px rgb(17 17 16 / 18%)`; dark: `0 1px 2px rgb(0 0 0 / 40%), 0 16px 40px -10px rgb(0 0 0 / 70%)`): menu button, sidebar, toast.

### Named Rules
**The Printed Page Rule.** Anything that belongs to the page (rows, spreads, the feedback block, the architecture grid) is flat. Only chrome that floats over the page casts the Float shadow.

## Shapes

Two shape languages meet, and each has its place. The editorial layer is square: rules are full-bleed bars with no rounding, bars in the commit chart are 1px-rounded, the black feedback block is all but square (2px), the architecture grid is a set of square cells inside a 2px ink frame. The interactive layer is Apple-round: every button, chip, segmented option, the menu button, the toast and the island mark are full pills; tree links, inputs, icon buttons and screenshot frames use a 10px control radius; tags use 6px; the sidebar sheet uses 18px (0 18px 18px 0 when it becomes a left sheet on phones).

The island mark is the one recurring silhouette: a black pill 0.62em by 0.24em, set after the wordmark, in the sidebar identity, in the favicon, and abstracted in the panel diagram.

**The Rule Ladder Rule.** Rule weight encodes rank: 6px ink opens the page (top rule) and major sections and marks phase bands; 4px ink opens lists, the nav and the footer; 3px ink opens a pull quote and underlines the active nav link; 1px ink closes heads; 1px hairline separates rows. Do not invent intermediate weights.

## Components

### Buttons
Confident pills that feel native rather than webby.
- **Shape:** full pill, 42px tall, 18px side padding, 600 weight at 0.9375rem, 8px icon gap.
- **Primary:** ink fill, paper text; hover mixes 14% paper into the ink.
- **Outline:** 1.5px ink border, transparent; hover washes to paper-2.
- **On ink:** inside the black feedback block the button inverts to paper fill with ink text.
- **Press:** scales to 0.97. Disabled is 50% opacity and inert.
- **Text link:** a 600-weight link on a 2px ink underline that thickens to 3px on hover, with a trailing arrow.

### Status chips (signature)
- **Style:** 26px pill, 1px ink outline, 0.8125rem at 550 weight, a 14px line icon before the label.
- **Encoding by line form:** merged is filled ink; verified by tests is the plain solid outline; verified on hardware is a 2px outline; open and experimental are dashed; planned is dotted in ink-2; superseded is struck through in ink-3. Each status also has its own icon, so colour is never the only signal.
- **Feedback chips** follow the same grammar: pending dashed, addressed 2px, resolved filled.

### Tags
Mono, 0.75rem, paper-2 ground, ink-2 text, 6px radius: for milestone kind and PR numbers only.

### Contents list (signature)
The five-phase contents sits under a head between a 4px and a 1px ink rule. Each row carries a 6px phase-colour band on its left edge, a mono numeral, a title-row heading, an optional "Latest" badge, a mono dateline and a one-line summary, with a hairline below. On hover the row washes to paper-2 and its text slides 6px right (no slide under reduced motion).

### Ruled rows
Milestones, challenges, features, decisions and roadmap items are rows, not cards: hairline-separated, fixed label column at left, status chip at right, hover wash to paper-2. Milestones and decisions are disclosures; the chevron rotates 90 degrees on open.

### Inputs / Fields
- **Style:** 42px tall, 1px ink-3 border, 10px radius, paper ground, 14px padding; search fields inset a 18px icon at left.
- **Focus:** the border turns focus cobalt with the ring at zero offset.
- **Segmented filter:** 32px pills on a hairline border; pressed state is filled ink with paper text.

### Navigation
- **Primary nav:** eight text links between a 4px ink rule and a 1px ink rule, 0.9375rem at 500 in ink-2; hover adds a hairline underline; the current page is ink, 650 weight, with a 3px ink underline.
- **Docking:** once the masthead scrolls away, the rules widen to full bleed and soften to a hairline, the links blur and slide out with a 14ms per-item stagger, and a 56 by 36px black pill menu button scales in at left with a running-head folio (section, then sub-page in muted weight).
- **Sidebar:** a 304px paper sheet with 18px corners and the Float shadow grows out of the menu button (scale from 0.86 with a slight blur). Inside: identity with the island mark, a tree with phase dots on sub-items, a full-width primary "Leave feedback" button and the appearance toggle. Active tree row is filled ink. On phones it becomes a full-height left sheet behind a scrim.
- **Mobile:** the menu button and folio are always shown in a fixed 54px bar.

### Feedback block
A near-square black panel (2px radius) with paper text, a title, short copy, a label and an on-ink button. It is the single inverted block per view and always invites feedback.

### Evidence and charts
Mono facts and a horizontal bar chart: 10px ink bars with mono month labels in a 34px column; partial months use a 3-on, 2-off ink stripe. Bars grow from the left with a 70ms per-bar stagger.

## Do's and Don'ts

### Do:
- **Do** open every major section with the 6px ink rule and every list with the 4px ink rule; separate rows with hairlines.
- **Do** carry phase identity through the phase variable on the row or section, so bands, dots and strip segments pick it up together.
- **Do** encode every status by line form and icon as well as colour, using the existing chip grammar.
- **Do** set dates, counts, PR and issue numbers in mono with tabular figures, and everything else in the SF system stack.
- **Do** keep one island mark per view in the page (masthead or sidebar identity) and one inverted feedback block.
- **Do** keep motion on the shared ease-out curve and the three durations, and drop transforms and blur under reduced motion.

### Don't:
- **Don't** fill surfaces or set text in a phase spot colour; spots are bands, dots and active marks only.
- **Don't** put a kicker, eyebrow or overline above any heading.
- **Don't** wrap records in shadowed cards or stat tiles; the record is ruled rows on paper.
- **Don't** add a web font or a display serif; the type is the Apple system stack by the owner's brief.
- **Don't** use mono for prose, headings, buttons or navigation.
- **Don't** add shadow to anything that belongs to the page; Float is for chrome over the page only.
