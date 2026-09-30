---
version: alpha
name: ROAM
description: A social riding community for motorcycle riders, presented as a calm roadbook with precise rider-card forms.
colors:
  paper: "#F1F3F1"
  petrol: "#142C30"
  signal: "#C45F3B"
  sage: "#82968A"
  sage-light: "#B7C4B7"
  ink: "#142C30"
  muted: "#657477"
  line: "#DCE2DE"
  danger: "#A84135"
typography:
  sans:
    fontFamily: "Geist, sans-serif"
  mono:
    fontFamily: "Geist Mono, monospace"
rounded:
  control: "0.75rem"
  panel: "1.25rem"
spacing:
  section-gap: "3rem"
  page-max: "75rem"
components:
  button: { }
  card: { }
  form-field: { }
---

# ROAM Design System

## Overview

### Creative North Star

The visual language borrows from a well-used roadbook and the restrained instrument panel of a touring motorcycle: confident, legible, tactile, and marked with one warm signal color. Route rings and small monospaced labels are the visual signature; avoid stock motorcycle imagery and dashboard clutter.

### Product context and register

- **Audience and primary job:** Motorcycle riders creating a recognizable profile and adding the motorcycle they ride.
- **Target market(s) and evidence:** Not defined in the current product brief. Do not infer a regional market from the developer environment.
- **Locale(s) and language policy:** English UI for the current MVP surface. Additional locale behavior is not defined.
- **Usage scene:** Responsive phone-first profile and account flows that riders may use between rides; favor short forms, readable touch controls, and stable layouts.
- **Register:** Hybrid public welcome page and focused account/profile utility screens.
- **Memorable signature:** Copper signal marker and route-ring motif, echoed by the onboarding progress line.
- **Restraint:** Forms and rider identity remain familiar and direct; decoration stays behind content.
- **Anti-references:** Generic SaaS dashboards, black-on-black racing motifs, faux maps, and hero stock photos.
- **Token ownership/runtime mapping:** This file mirrors the canonical runtime tokens in `app/globals.css`; it does not generate CSS. Keep the frontmatter colors, radii, and font names aligned with CSS variables and Tailwind theme tokens there.

## Colors

Paper (`paper`) carries the page; white is reserved for form and profile surfaces. Petrol (`petrol`, `ink`) is the primary text and action color. Copper (`signal`) marks active steps, focus accents, and small calls to action. Sage (`sage`, `sage-light`) is supportive and low emphasis. Muted text and line borders preserve a clear hierarchy. Danger is reserved for errors. Focus uses a visible petrol ring with a copper-tinted halo. Selection uses a light copper wash. The current product is intentionally light only; dark mode is not implemented.

## Typography

Geist Sans, loaded through Next's local framework font integration, carries interface and prose. Geist Mono marks route-like metadata, steps, and compact labels. Use sentence case for instructions, short labels, and readable body line lengths. Monospaced all-caps is limited to short eyebrow labels. Avoid long all-caps copy and text below 12px except decorative metadata.

## Layout

The public home and auth pages use generous horizontal breathing room and a two-panel composition on wide screens; narrow screens stack content. Profile content is capped at 75rem, and forms are capped near 48rem or narrower. Fields stack in one column, with only related motorcycle fields sharing a row at wider widths. Keep action placement stable while busy and errors appear inline. Use CSS responsive breakpoints already provided by Tailwind rather than a parallel breakpoint system.

## Elevation & Depth

Separate cards using thin cool-gray borders and a soft low shadow. Keep inputs flat. Avoid floating glass panels, heavy blur, and nested shadows. The profile cover is a tonal gradient with restrained route rings rather than a remote image dependency.

## Shapes

Controls use 0.75rem radii (`control`); major panels use 1.25rem (`panel`). Inputs have clear borders and consistent comfortable height. The wordmark marker is the small deliberate rounded exception. Use simple one-pixel dividers and Lucide's outline icon family.

## Components

### Foundational visual states

Interactive controls have visible hover and focus-visible states. Disabled and pending buttons dim without changing size. Validation sits directly below its field; server form errors use an announced alert/status region. Onboarding shows a numbered two-step indicator. No skeleton or global loading indicator is needed for the current short server-rendered flow.

### Buttons and actions

Petrol fill is reserved for the main action in a region; bordered white/paper buttons are secondary. Buttons have at least 44px touch height, concise verb-first labels, and stable width while pending. Sign out is visually quiet and separate from profile editing.

### Navigation and data display

The public header offers sign-in and account creation. Auth flows link between login and signup. Profile pages provide a small wordmark header and direct edit action. A rider card groups identity, location, bio, and motorcycles; no feed or ride-discovery interface is part of this phase.

### Forms and overlays

Use visible labels, native email/password/url semantics, persistent hints, inline field errors, and server-side validation. Password reveal is an explicitly labeled button. Avoid modal overlays for account setup and profile editing. Avatar input currently accepts an external http(s) URL; no image upload is exposed.

### Iconography

Use Lucide outline icons at 15–17px for compact actions and location indicators. Keep text labels on all important actions; decorative icons are hidden from assistive technology.

### Motion

Use short color and border transitions for hover/focus feedback only. Respect reduced motion by avoiding animated decoration; no continuous movement is present.

### Content and data visualization

Use warm, road-oriented language without claiming a route or ride exists before data is available. Keep dates, counts, and charts out of this profile-only phase. Give actionable errors and describe exactly which step needs attention.

## Do's and Don'ts

- **Do:** Keep rider identity the visual anchor of profile screens.
- **Do:** Use the same labeled field component and control geometry throughout account flows.
- **Don't:** Add product areas outside the approved Phase 1 feature scope.
- **Don't:** use decorative map tiles, paid map branding, or remote stock motorcycle photography.
