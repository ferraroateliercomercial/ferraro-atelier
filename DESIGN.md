---
name: Ferraro Atelier
description: "Mostrador vivo: one living dial seen from above, in fumé lacquer with white dial print, opaline pauses and the seconds-hand red as the only accent."
colors:
  lacquer: "#1d4e8f"
  lacquer-high: "#3d7cc6"
  lacquer-low: "#061530"
  field: "#0a2350"
  field-high: "#133b75"
  night: "#030b19"
  navy: "#142640"
  seconds-red: "#e04a32"
  seconds-red-ink: "#b2321d"
  lume: "#cdf7b8"
  lume-paint: "#eef3df"
  print: "#f2f0e9"
  print-2: "#b5c9e3"
  rule-night: "rgba(242, 240, 233, 0.16)"
  opaline: "#ecebe6"
  opaline-2: "#dfddd6"
  opaline-raised: "#f8f7f3"
  date-disc: "#f4f4f1"
  date-ink: "#16191e"
  ink: "#111418"
  ink-2: "#4b515b"
  rule: "rgba(17, 20, 24, 0.14)"
  line: "#cfccc4"
typography:
  display:
    fontFamily: "Saira, 'Helvetica Neue', Arial, sans-serif"
    fontSize: "clamp(2.6rem, 6vw, 5.2rem)"
    fontWeight: 300
    lineHeight: 1.05
    letterSpacing: "-0.02em"
    fontVariation: "'wdth' 112"
  headline:
    fontFamily: "Saira, 'Helvetica Neue', Arial, sans-serif"
    fontSize: "clamp(2.1rem, 4.2vw, 3.4rem)"
    fontWeight: 300
    lineHeight: 1.05
    letterSpacing: "-0.02em"
    fontVariation: "'wdth' 112"
  title:
    fontFamily: "Saira, 'Helvetica Neue', Arial, sans-serif"
    fontSize: "1.9rem"
    fontWeight: 300
    lineHeight: 1.05
    letterSpacing: "-0.02em"
    fontVariation: "'wdth' 112"
  body:
    fontFamily: "Saira, 'Helvetica Neue', Arial, sans-serif"
    fontSize: "1rem"
    fontWeight: 400
    lineHeight: 1.6
    letterSpacing: "normal"
    fontVariation: "'wdth' 100"
  label:
    fontFamily: "Saira, 'Helvetica Neue', Arial, sans-serif"
    fontSize: "0.75rem"
    fontWeight: 600
    letterSpacing: "0.16em"
    fontVariation: "'wdth' 112"
  print:
    fontFamily: "Saira, 'Helvetica Neue', Arial, sans-serif"
    fontSize: "0.75rem"
    fontWeight: 500
    letterSpacing: "0.2em"
    fontVariation: "'wdth' 125"
  numeral:
    fontFamily: "Saira, 'Helvetica Neue', Arial, sans-serif"
    fontSize: "clamp(2.6rem, 4.6vw, 3.8rem)"
    fontWeight: 200
    lineHeight: 1
    letterSpacing: "-0.02em"
    fontFeature: "'tnum' 1"
    fontVariation: "'wdth' 115"
rounded:
  square: "0px"
  window: "3px"
  tile: "12px"
  pill: "999px"
  round: "50%"
spacing:
  gutter: "clamp(16px, 4vw, 56px)"
  stack: "22px"
  columns: "clamp(32px, 6vw, 96px)"
  head: "clamp(48px, 6vw, 80px)"
  section: "clamp(96px, 12vw, 160px)"
components:
  button-primary:
    backgroundColor: "{colors.ink}"
    textColor: "{colors.print}"
    typography: "{typography.label}"
    rounded: "{rounded.square}"
    padding: "0 28px"
    height: "50px"
  button-primary-hover:
    backgroundColor: "{colors.navy}"
  button-line:
    backgroundColor: "transparent"
    textColor: "{colors.ink}"
    typography: "{typography.label}"
    rounded: "{rounded.square}"
    padding: "0 28px"
    height: "50px"
  button-line-hover:
    backgroundColor: "{colors.ink}"
    textColor: "{colors.print}"
  button-line-small:
    padding: "0 18px"
    height: "40px"
  link-arrow:
    typography: "{typography.label}"
    padding: "0 0 4px"
  crown:
    textColor: "{colors.print}"
    typography: "{typography.print}"
    height: "clamp(56px, 6.2vw, 84px)"
  chip-lacquer:
    backgroundColor: "transparent"
    textColor: "{colors.print-2}"
    rounded: "{rounded.pill}"
    padding: "6px 14px 6px 6px"
    height: "40px"
  chip-lacquer-selected:
    textColor: "{colors.print}"
  date-window:
    backgroundColor: "{colors.date-disc}"
    textColor: "{colors.date-ink}"
    rounded: "{rounded.window}"
    padding: "5px 9px 4px"
  minute-track:
    textColor: "{colors.print}"
    height: "9px"
  choice:
    backgroundColor: "{colors.opaline-raised}"
    textColor: "{colors.ink}"
    rounded: "{rounded.square}"
    padding: "10px 14px"
    height: "48px"
  text-field:
    backgroundColor: "transparent"
    textColor: "{colors.ink}"
    rounded: "{rounded.square}"
    padding: "12px 0"
  masthead:
    backgroundColor: "color-mix(in srgb, #0a2350 92%, transparent)"
    textColor: "{colors.print}"
    height: "72px"
    padding: "0 clamp(16px, 4vw, 56px)"
  masthead-opaline:
    backgroundColor: "color-mix(in srgb, #ecebe6 94%, transparent)"
    textColor: "{colors.ink}"
  toast:
    backgroundColor: "{colors.ink}"
    textColor: "{colors.print}"
    rounded: "{rounded.pill}"
    padding: "12px 22px"
---

# Design System: Ferraro Atelier

## Overview

**Creative North Star: "Mostrador Vivo (The Living Dial)"**

The interface is a watch dial seen from above, and it runs. Dark grounds are fumé lacquer, deep diver blue by default and any hue on demand: lit at the centre, smoked almost to black at the edges, brushed with sunburst rays that catch a sheen following the pointer. Everything that speaks is printed on that lacquer the way a dial is printed, in white Saira opened wide, with a pale tint of the lacquer for secondary print and a single red borrowed from the seconds hand. Opaline silver, the quiet dial, carries the passages that are read rather than felt: specifications, prices, the process.

Ornament is always a watch part. The crown is the primary control, the date window is the counter, minute-track rules divide, round sub-dials hold the movement demos and the step markers, and callouts orbit a part on a leader line that ends in an applied baton. The site refuses the category default of a product-photo hero with a headline and a discover button: the first screen of a persuade surface carries no buttons, only the dial and its crown, and photographs arrive later as evidence of real pieces and the bench. Density follows the surface: one idea per screen and a long section rhythm where the site persuades; practical opaline panels with a lacquer showcase for the live watch in the ateliê virtual and the Oficina.

**The One Clock Rule.** The drawn watches tell the visitor's own time. On the homepage dial the seconds hand sweeps without stopping (the owner asked for fluid motion on 2026-10-19); the movement demos keep their real beats, because there the beat is the lesson. The opening's staggers are cued on a 1/8 s grid. Beyond it, two house curves divide the work (an out-curve for what arrives, an in-out curve for what travels across the screen), scroll scenes are scrubbed rather than fired, and each kind of content has its own reveal; the 1/8 s grid binds the opening's staggers, while reveals and hovers run free on the house curves.

**Key Characteristics:**
- Fumé lacquer grounds: radial light falloff, sunburst rays, a pointer-following sheen, any hue on demand.
- One family, three widths: Saira light and wide for display, normal for reading, 125% capitals for dial print.
- One accent, the seconds-hand red, kept hand-sized; lume green only at night.
- Opaline silver for the quiet passages, read in ink.
- Watch parts as components: crown, date window, minute track, sub-dials, applied batons.
- One clock: a sweeping seconds hand on the visitor's time, openings staggered on a 1/8 s grid, scrubbed scroll scenes, motion that never repaints, and a complete static page under reduced motion.

## Colors

Lacquer is the world, opaline is the pause, white print does the talking, the seconds-hand red is the only accent, and lume green waits for night.

### Primary
- **Diver-Blue Fumé Lacquer** (#1d4e8f): the default dial colour and the mid-tone of every dial's lacquer; also "Azul mergulho", the first sample lacquer. A default, not an identity: any hue can take its place.
- **Sunburst Highlight** (#3d7cc6): the lit centre of a dial, where the lacquer radial starts. Nothing but light sits there.
- **Smoked Edge** (#061530): where the lacquer smokes out at a dial's rim, and the dark end of the closing ground.
- **Lacquer Field** (#0a2350) and **Field Highlight** (#133b75): the section ground pair, joined to Night Ground in the `--ground` radial (lit at 50% 45%). They are registered as typed custom properties so a colour change can animate.
- **Night Ground** (#030b19): the page background, the outer stop of every lacquer radial and the browser theme colour.
- **Ink Navy** (#142640): the darker state of ink controls (button hover) and the hover and drag-over border of the ateliê's drop zone, carried under the legacy `--navy` name. It is a state tone, never a focus indicator.

### Secondary
- **Seconds-Hand Red** (#e04a32): the seconds hand, the 1px underline under the one action (the crown's label, the closing note, the menu call), focus rings and text selection on lacquer, the power-reserve fill, the scroll hint, a focused callout's leader, availability dots. A stroke on dark grounds: 3.8:1 on Lacquer Field but 2.1:1 on the mid lacquer, so it never carries meaning alone on a dial's face.
- **Seconds Red Ink** (#b2321d): the same red wherever it is text or sits on opaline (5.2:1 on Opaline Silver): the beat-window figure, "Versão suíça", the premium tag, the process progress line, quarter-dial pins, focus rings on opaline.

### Tertiary
- **Night Lume** (#cdf7b8): lume as it reads in the dark. Only between 19h and 6h on the visitor's clock, when the hero's applied indices and hand inserts switch to it, and in the ateliê's night mode.
- **Lume Paint** (#eef3df): lume as it reads by day, the cream insert of every baton, hand and bezel pip in the drawn watches.

### Neutral
- **Dial Print White** (#f2f0e9): all primary text and printing on lacquer (7.3:1 on the mid lacquer, 13.5:1 on the field), ink-button labels, the minute track.
- **Lacquer Print Tint** (#b5c9e3): secondary text on lacquer: sub-lines, body copy, captions, resting tabs and chips. A pale tint of the blue, never a grey: 4.9:1 on the mid lacquer, 9.1:1 on the field, 2.5:1 on a dial's lit centre.
- **Print Hairline** (rgba(242, 240, 233, 0.16)): 1px rules, chip borders, meter tracks and the masthead's bottom line on lacquer.
- **Opaline Silver** (#ecebe6): the quiet ground: the homepage's opaline sections, the ateliê virtual and the Oficina, the lightbox panel.
- **Opaline Shadow** (#dfddd6): the shaded rim of opaline sub-dials and quarter dials, and the ateliê's stone (legacy `--stone`).
- **Raised Opaline** (#f8f7f3): the face of work-surface controls: choice cards, toggles, colour fields, text areas, drop zones, saved projects, notes.
- **Date Disc** (#f4f4f1) and **Date Numeral Ink** (#16191e): the date and beat windows, the only white rectangles set into a dial.
- **Dial Ink** (#111418): text on opaline (15.5:1), ink buttons, selected frames, the toast.
- **Graphite Ink** (#4b515b): secondary text on opaline (6.7:1), spec-row keys and field notes (legacy `--muted`).
- **Ink Hairline** (rgba(17, 20, 24, 0.14)): 1px rules on opaline: spec rows, quarter-dial rings, the dashed process rail.
- **Control Hairline** (#cfccc4): the solid 1px border of ateliê and Oficina controls and bars (legacy `--line`). Homepage opaline passages use Ink Hairline.

### Named Rules
**The Seconds-Hand Rule.** Red is the only accent and it stays hand-sized: a hand, a 1px underline, a focus ring, a pin, a dot, a meter, one word or figure. Never a button, a panel, a tag face or display type; the only red fill is the browser's text selection. On opaline, or whenever red is text, it is Seconds Red Ink.

**The Any-Hue Rule.** The lacquer is a variable. A chosen colour re-tints the ground by mixing it toward near-black (#05070b), 80% for the field and 45% for its highlight, and the typed `--cq`/`--cq-hi` properties carry the change over 1.1s. Blue is the default lacquer, not the brand; the colours of a drawn watch belong to the customer and never count against the palette.

**The Night-Only Lume Rule.** Lume green exists only at night and only on lume-bearing parts. It changes the fill; it never blooms into a glow. By day lume is cream paint.

## Typography

**Display Font:** Saira, variable (width 50–125, weight 100–900), with "Helvetica Neue", Arial, sans-serif
**Body Font:** Saira at normal width (same stack)
**Label/Mono Font:** Saira expanded to width 125 for dial print (same stack); project codes alone use the platform monospace

**Character:** One family doing three jobs by width alone. Opened to width 112–118 and kept light, it is the dial's display lettering; at normal width and weight 400 it is plain reading text; at width 125, weight 500, in widely tracked capitals, it is the print a manufacturer puts on a dial. The build sets width with `font-stretch`, so it composes with weight.

### Hierarchy
- **Display** (300, clamp(2.6rem, 6vw, 5.2rem), 1.05): the one statement a section is built around ("A cor que você quiser."). The closing statement may go lighter and wider (200, width 118, line height 1) up to the 6rem ceiling.
- **Headline** (300, clamp(2.1rem, 4.2vw, 3.4rem), 1.05): section headings, the bench caption, lightbox and Oficina titles; balanced wrapping, -0.02em tracking.
- **Title** (300, 1.9rem, 1.05): names of parts and pieces; process steps step down to 1.5rem and the ateliê's step heading up to 2rem.
- **Body** (400, 1rem, 1.6): reading text at normal width, measured at 34–62ch (most paragraphs 42–54ch), with pretty wrapping.
- **Label** (600, 0.75rem, 0.16em, uppercase, width 112): the control voice: buttons, arrow links, the menu button, the masthead call, tabs, field labels.
- **Print** (500, 0.75–0.8rem, 0.18–0.24em, uppercase, width 125): the dial's voice: the crown's label, the calls beside a crown or dial, the scroll hint, hex readouts, beat windows, the currency mark.
- **Numeral** (200, clamp(2.6rem, 4.6vw, 3.8rem), 1, tabular, width 115): prices and large readout figures.

### Named Rules
**The Two-Voices Rule.** Uppercase has two voices and they never swap. Print is for words that belong to the watch: the crown's label, windows, readouts, currency. Label is for things a hand operates in the page: buttons, links, tabs, menus, field labels. Neither voice is ever a kicker above a heading.

**The Printed-To-Scale Rule.** Type printed on a dial is sized from the dial's diameter, not the viewport: the hero line at 7.5% of the dial, its sub-line at 1.85% with a 0.75rem floor, date numerals at 5.2%. Dial print grows and shrinks with its dial, and still answers to the 6rem display ceiling.

**The 12px Floor Rule.** Functional text never drops below 0.75rem (12px) and text inputs never below 16px, on every surface including the ateliê and the Oficina.

## Layout

One reading width: content sits in a 1280px column inside a fluid gutter (clamp(16px, 4vw, 56px)); the ateliê and the Oficina widen to 1400px. Sections breathe on clamp(96px, 12vw, 160px) of block padding, centred section heads stop at 680px and leave clamp(48px, 6vw, 80px) before their content, and text columns stack on a 22px rhythm.

Two-column compositions are asymmetric (fractions between 0.8 and 1.25) with clamp(32px, 6vw, 96px) between columns, and use named grid areas so the object can move: at 900px and below every composition becomes one column with the object between its copy and its controls, the movement demos become a single 460px column, and the footer grid goes to two columns, then one at 560px.

The first screen is a pinned 100svh scene (520px minimum) scrolled over 3.2 viewport heights (2.6 in portrait) with a 0.6 scrub; the bench photo is a second pin of 1.2 heights. Without motion the pins release and the same content stacks in order. Portrait screens (aspect ratio at or below 1:1, or 759px and narrower) raise the arbor to 40% of the height, enlarge hands and date 1.3× on the full-screen dial and print the headline beneath the dial's reach; short landscape screens drop the sub-line and short portrait screens drop the scroll hint.

The masthead is fixed at 72px (60px at 560px and below) and is absent from the first screen until the visitor scrolls or tabs into it. The work surfaces split into a sticky lacquer showcase for the live watch and a scrolling opaline panel with sticky step tabs above and a sticky step bar below; at 900px and below the showcase becomes a compact sticky strip over the panel.

### Named Rules
**The Ring Law.** Text orbits; the centre stays clear. Labels sit on a dial's ring or around a part, joined to it by a leader line, and copy printed on a dial sits beyond the hour hand's reach. Nothing crosses the arbor.

**The Two-Grounds Rule.** Every section is lacquer or opaline and declares it (`data-ground`). Lacquer carries the story; opaline carries the quiet passages (movements, pieces, process). Chrome reads the ground beneath it: print and Seconds-Hand Red over lacquer, ink and Seconds Red Ink over opaline.

## Elevation & Depth

Hybrid and strictly physical. Page structure is flat: grounds are tonal, divisions are 1px hairlines, and controls never lift. Depth belongs to the watch and its parts, under one light from above. The lacquer gets its depth from light alone: a radial falloff from the lit centre to the smoked edge, fine sunburst rays drawn once on a canvas and fading near the arbor, and a conic sheen that turns toward the pointer (drifting slowly on touch). Parts sit on long, soft, downward shadows; sub-dials and windows are recessed with inset shading; hands and applied indices cast their shadows down the light.

### Shadow Vocabulary
- **Case** (`box-shadow: 0 calc(var(--H) * .04) calc(var(--H) * .09) rgba(0, 0, 0, .6), 0 calc(var(--H) * .015) calc(var(--H) * .03) rgba(0, 0, 0, .45)`): the round case that appears when the dial becomes a watch; scales with the head.
- **Showcase** (`box-shadow: 0 40px 80px rgba(0, 0, 0, .55)`): a dial presented on lacquer (the hand specimen); a drawn watch takes the same fall as `filter: drop-shadow(0 30px 40px rgba(0, 0, 0, .5))`.
- **Crown** (`box-shadow: 0 6px 16px rgba(0, 0, 0, .5)`): the crown beside its label.
- **Recessed well** (`box-shadow: inset 0 2px 6px rgba(0, 0, 0, .12), 0 1px 0 #fff`): opaline sub-dials holding the movement demos.
- **Window** (`box-shadow: inset 0 1px 3px rgba(0, 0, 0, .45), 0 0 0 1px rgba(0, 0, 0, .3), 0 1px 0 #fff`): date and beat windows cut into a dial.
- **Quarter dial** (`box-shadow: 0 0 0 1px var(--rule), 0 6px 14px rgba(0, 0, 0, .1)`): the small opaline step dials.
- **Floating** (`box-shadow: 0 10px 30px rgba(0, 0, 0, .35)`): the toast, the only floating interface with a shadow.

### Named Rules
**The Lit-From-Above Rule.** One light, from above. Shadows fall down, never sideways and never as a halo; the only light that moves is the lacquer's sheen.

**The Flat Paper Rule.** Buttons, fields, choice cards, photos and panels carry no shadow. Selection is an inset 1px ink frame, never lift; hover changes ink, never elevation.

## Shapes

Two geometries, assigned by what a thing is. Watch parts are round: dials, sub-dials, quarter dials, chip dots, colour swatches, toggle and slider knobs (50%). Paper and print are square-cut: buttons, choice cards, fields, photos, panels and the lightbox take no radius. The crown is a cylinder in profile, 5px at the case side and 10px at its outer end, its knurled face drawn as alternating 2px bands. Windows set into a dial are the one rectangle inside a circle, with a barely-there radius (3px; proportional on the hero date). Pills (999px) are reserved for small controls floating over lacquer: lacquer chips, the ateliê's stage buttons, the toast. Soft 12px tiles hold the hand-style picker and the ateliê's advice note.

Lines are 1px everywhere: rules, borders and the underlines under actions. The house divider is the minute-track rule: a 1px line with a minute tick every 10px (1px wide, 5px tall) and a five-minute tick every 50px (2px wide, 9px tall), at 40% opacity, opening the colour readout, the FAQ list and the footer grid.

### Named Rules
**The Part-Or-Paper Rule.** If it is a watch part it is round; if it is paper or print it is square. Only small floating controls are pills.

**The Circle-Opens Rule.** Large state changes open as circles from their pivot: the lacquer spreads from the hands' arbor, the menu opens from the menu button, the bench photo opens through a loupe. Rectangles open only as windows (an inset clip).

## Components

Each component is a part of the watch or a sheet of paper. Motion uses the house out-curve `cubic-bezier(.23, 1, .32, 1)` unless noted.

### Buttons
- **Shape:** square-cut (0 radius) with a 1px border; 50px tall with 28px side padding.
- **Primary:** Dial Ink face, Dial Print White label in the label voice; the committing action on opaline ("Comprar pelo WhatsApp", "Próximo", "Montar relógio").
- **Hover / Focus:** on fine pointers the face deepens to Ink Navy over 0.2s; press scales to 0.97; focus is the house ring, a 1.5px outline at 4px offset in Seconds-Hand Red on lacquer and Seconds Red Ink on opaline. Disabled drops to 35% and stops taking the pointer.
- **Line (secondary):** transparent with a 1px ink frame, filling with ink on hover; on the lacquer showcase it inverts to print. The small size (40px, 18px padding) is the hold-to-wind control, which does not shrink when pressed.
- **Arrow link (tertiary):** the label voice over a 1px currentColor underline with 4px of air, then a stroked SVG arrow that nudges 4px on hover (0.25s); on coarse pointers an invisible margin widens the hit area by 14px above and below. The default secondary action everywhere ("Abrir o ateliê virtual", "Ver em detalhe").

### Chips
- **Style:** lacquer chips are 40px pills with a 1px Print Hairline border, a 26px lacquer dot (lit at upper left, 1px inner ring) and the lacquer's name in Lacquer Print Tint.
- **State:** pressed turns border and name to Dial Print White; hover goes halfway. They choose sample lacquers and nothing else.
- **Status tag:** over a product photo, a square opaline tag in the label voice with a 7px Seconds-Hand Red dot for "Disponível"; the ink version, without a dot, marks portfolio pieces.

### Cards / Containers
- **Corner Style:** none for paper; a full circle for sub-dials.
- **Background:** sub-dials are opaline wells lit from 50% 42% (Raised Opaline to Opaline Shadow); ateliê choice cards are Raised Opaline on Opaline Silver.
- **Shadow Strategy:** the recessed well for sub-dials; none for paper (see Elevation & Depth).
- **Border:** choice cards take a 1px Control Hairline, darkening to Graphite Ink on hover; selected adds an inset 1px ink frame to an ink border; press scales to 0.97.
- **Internal Padding:** choice cards 10px 14px with a 48px minimum (16px 18px for full-width cards; icon tiles 104px wide with 64px drawings). Spec lists inside cards are 1px Ink Hairline rows with 9px of padding, Graphite Ink keys on the left and values on the right.

### Inputs / Fields
- **Style:** single-line fields are an underline: transparent, a 1px ink rule beneath, 12px of vertical padding, entry set light and wide (1.15rem, 300, width 112). Multi-line fields are square Raised Opaline boxes with a Control Hairline and 16px text. The hue rail is a 10px full-spectrum track (5px radius) with a 24px print knob ringed in Night Ground.
- **Focus:** the house ring, as on buttons, on every field.
- **Error / Disabled:** disabled choices drop to 40%; the Oficina's parse status and the ateliê's running dot use functional status tones confined to those work surfaces, never as accents.

### Navigation
- **Masthead:** the horizontal lockup (136px; 112px on phones), a "Monte o seu" call in the label voice led by the crown icon that appears once the dial has pulled back, and a menu button whose two 1.5px bars cross into an X. Transparent at the top, then 92% Lacquer Field with a 1px Print Hairline beneath; over opaline sections it turns to 94% Opaline Silver with ink.
- **Menu:** a full-screen lacquer radial that opens as a circle from the menu button (0.6s, in-out `cubic-bezier(.77, 0, .175, 1)`) and closes back into it (0.35s). Section names are set large and light (300, width 115, clamp(2rem, 4.2vw, 3.5rem)) in Lacquer Print Tint, turning white and sliding 14px on hover; beside them a minute-track dial points its hands at the hovered item's hour, because the items are hours.
- **Tabs (ateliê):** the label voice in Graphite Ink at rest; the selected step takes ink and a 2px ink underline; view tabs on the lacquer showcase use print with a 1px underline. The step row scrolls sideways and sticks under the bar.
- **Mobile:** on phones the menu word drops and leaves a 44px icon button.

### The Crown (signature)
The primary control. A steel cylinder (a polished vertical gradient with a knurled face) beside a label in the print voice underlined by a 1px Seconds-Hand Red hairline, set at the dial's 3 o'clock edge on the arbor's height and repeated at the close beside the closing statement. Hover pushes it 6px into the case and rolls the knurl; press pushes 10px (0.45s). In the opening it arrives last, four beats after the headline.

### Date Window (signature)
The counter. A Date Disc rectangle with the window shadow and Date Numeral Ink tabular figures, set into the dial at 3 o'clock and sized from the dial (11.8% by 9.3% of its diameter). In the opening it rolls from 1 to today. The same window reports beats per second on the movement sub-dials, the figure in Seconds Red Ink.

### Minute-Track Rule (signature)
The divider (geometry under Shapes), in currentColor at 40% so it prints white on lacquer. On a full-screen dial it becomes the railroad track around the viewport edge, with applied batons pointing at the arbor and the ticks printed clockwise from 12 in the opening.

### Callouts (signature)
Labels orbit an exploded watch, alternating sides at the height of their part: a title (400, 1.2rem, width 112) over a Lacquer Print Tint note, joined to the part by a 1px leader at 45% print that draws from the label to the part and lands on a 4 by 13px polished baton. Hovering a callout isolates its part (the others fall to 16%) and turns its leader Seconds-Hand Red. Portrait screens show one caption at a time under the watch; the static page lists them beside the watch (two columns on phones).

### Quarter Dials (signature)
Ordered steps are counted by a dial, never a numeral: a 56px opaline dial with a minute ring, a hand that turns to its quarter hour as the step arrives (1.0s) and a Seconds Red Ink pin. A dashed 1px rail joins the dials and fills with Seconds Red Ink as the visitor scrolls.

### Power Meter
A 3px track (Print Hairline on lacquer, Ink Hairline on opaline) filled from the left in Seconds-Hand Red in proportion to the power reserve.

## Do's and Don'ts

### Do:
- **Do** build every dark ground as lacquer: the `--ground` radial from Field Highlight through Lacquer Field to Night Ground, lit near the centre and smoked at the edge.
- **Do** print on lacquer in Dial Print White and Lacquer Print Tint, and read on opaline in Dial Ink and Graphite Ink.
- **Do** make the crown the primary control of a persuade surface, labelled in the print voice over a 1px Seconds-Hand Red underline.
- **Do** switch red to Seconds Red Ink whenever it is text or sits on opaline.
- **Do** set display type light (200–300) and wide (width 112–118), reading text at weight 400 and normal width with a 1.6 line height, and every functional label at 0.75rem or more.
- **Do** open measured content (readouts, lists, the footer) with the minute-track rule and divide everything else with 1px hairlines.
- **Do** orbit labels around the part they name, on a leader line that ends in a baton, and keep a dial's centre clear.
- **Do** tell sequence with the dial (quarter dials for steps, hours for the menu) and show counts in a date-style window.
- **Do** stagger openings on the 1/8 s grid, use `cubic-bezier(.23, 1, .32, 1)` for what arrives and `cubic-bezier(.77, 0, .175, 1)` for what travels, and scrub scroll scenes (0.6) instead of firing them.
- **Do** give each kind of content its own reveal: headings rise out of a mask, photographs open as a window, lists stagger, step dials point, the closing line rises letter by letter.
- **Do** animate the hero only by moving or fading layers that already exist: the lacquer is painted once into a canvas and opened or closed by scale, the reflection is a small canvas that rotates, and anything that arrives piece by piece (track, batons, numerals, logo, bezel ring) is its own small layer. Nothing in a moving scene is redrawn frame by frame.
- **Do** keep the reduced-motion page complete and calm: pins release, fades and colour changes stay, travel goes, transitions drop to 0.15s, and the seconds hand ticks once a second.
- **Do** draw icons as inline SVG strokes (1.5–1.6 width, round caps): arrow, back, crown, plus.
- **Do** print the stacked mark (wings, FERRARO, ATELIER) under 12 on every drawn dial, and use the horizontal lockup in chrome.

### Don't:
- **Don't** add a second accent hue, or let lume green appear by day or bloom into a glow.
- **Don't** use grey for secondary text on lacquer; Lacquer Print Tint does that job.
- **Don't** make red a button, a panel, a tag face or display type.
- **Don't** round paper (buttons, fields, cards, photos, panels) or square off parts (dials, wells, swatches); only small floating controls are pills.
- **Don't** shadow paper, light anything from the side, or surround anything with a glow.
- **Don't** put an eyebrow or kicker above a heading, number content sections, or type a glyph (+, ×, →) where an icon belongs.
- **Don't** set display type above 6rem.
- **Don't** animate clip-path, blur, filters or the children of a large SVG frame by frame in a scene; each of those repaints the screen on every frame and is what made the first opening stutter.
- **Don't** set Lacquer Print Tint over a dial's lit centre, where it falls to 2.5:1.
