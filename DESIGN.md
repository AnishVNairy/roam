---
version: alpha
name: ROAM
description: A social riding community for motorcycle riders, presented as a calm roadbook for rider profiles and chronological ride notes.
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

- **Audience and primary job:** Motorcycle riders creating a recognizable profile and sharing short text and image updates from their riding lives.
- **Target market(s) and evidence:** Not defined in the current product brief. Do not infer a regional market from the developer environment.
- **Locale(s) and language policy:** English UI for the current MVP surface. Additional locale behavior is not defined.
- **Usage scene:** Responsive phone-first feed and account flows riders may use between rides; favor readable posts, short forms, comfortable touch controls, and stable layouts.
- **Register:** Hybrid public welcome page and focused social feed, create-post, account, and profile screens.
- **Memorable signature:** A small copper route marker and the road-note metadata rail make each feed entry feel like a rider's log.
- **Restraint:** Post content and rider identity stay prominent; limit engagement UI to the approved like interaction.
- **Anti-references:** Generic SaaS dashboards, black-on-black racing motifs, faux maps, and hero stock photos.
- **Token ownership/runtime mapping:** This file mirrors the canonical runtime tokens in `app/globals.css`; it does not generate CSS. Keep the frontmatter colors, radii, and font names aligned with CSS variables and Tailwind theme tokens there.

## Colors

Paper (`paper`) carries the page; white is reserved for form and profile surfaces. Petrol (`petrol`, `ink`) is the primary text and action color. Copper (`signal`) marks active steps, focus accents, and small calls to action. Sage (`sage`, `sage-light`) is supportive and low emphasis. Muted text and line borders preserve a clear hierarchy. Danger is reserved for errors. Focus uses a visible petrol ring with a copper-tinted halo. Selection uses a light copper wash. The current product is intentionally light only; dark mode is not implemented.

## Typography

Geist Sans, loaded through Next's local framework font integration, carries interface and prose. Geist Mono marks route-like metadata, steps, and compact labels. Use sentence case for instructions, short labels, and readable body line lengths. Monospaced all-caps is limited to short eyebrow labels. Avoid long all-caps copy and text below 12px except decorative metadata.

## Layout

The public welcome and auth pages use generous horizontal breathing room and a two-panel composition on wide screens; narrow screens stack content. The signed-in feed and profile content use a centered reading column around 48rem wide. Feed posts stack vertically, with compact rider identity above a readable caption and optional full-width image. Create-post fields stack in one column. Keep action placement stable while busy and errors appear inline. Use CSS responsive breakpoints already provided by Tailwind rather than a parallel breakpoint system.

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

The public header offers sign-in and account creation. Signed-in navigation links to Home feed, Create post, and Profile; on narrow screens it occupies its own full-width row below the brand and account action. Auth flows link between login and signup. Profile pages provide a small wordmark header and direct edit action. Feed cards group rider identity, timestamp, caption, optional image, and a compact like control with its count; the empty state leads directly to the create form. A rider card groups identity, location, bio, and motorcycles. Ride discovery is not part of this phase.

### Forms and overlays

Use visible labels, native email/password/url semantics, persistent hints, inline field errors, and server-side validation. Password reveal is an explicitly labeled button. Avoid modal overlays for account setup, post creation, and profile editing. Avatar and post media accept external http(s) URLs; no image upload is exposed.

### Iconography

Use Lucide outline icons at 15–17px for compact actions and location indicators. Keep text labels on all important actions; decorative icons are hidden from assistive technology.

### Motion

Use short color and border transitions for hover/focus feedback only. Respect reduced motion by avoiding animated decoration; no continuous movement is present.

### Content and data visualization

Use warm, road-oriented language without claiming a route or ride exists before data is available. Show feed timestamps in the rider's locale, newest first. Keep engagement counts, recommendations, and charts out of this phase. Give actionable errors and describe exactly which step needs attention.

## Do's and Don'ts

- **Do:** Keep rider identity the visual anchor of profile screens.
- **Do:** Use the same labeled field component and control geometry throughout account flows.
- **Don't:** Add product areas outside the approved MVP feature scope.
- **Don't:** use decorative map tiles, paid map branding, or remote stock motorcycle photography.
