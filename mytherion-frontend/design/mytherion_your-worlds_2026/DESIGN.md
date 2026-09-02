---
name: Mytherion Arcane
colors:
  surface: '#16111b'
  surface-dim: '#16111b'
  surface-bright: '#3d3741'
  surface-container-lowest: '#110c15'
  surface-container-low: '#1f1a23'
  surface-container: '#231e27'
  surface-container-high: '#2e2832'
  surface-container-highest: '#39323d'
  on-surface: '#eadfed'
  on-surface-variant: '#cfc2d6'
  inverse-surface: '#eadfed'
  inverse-on-surface: '#342e38'
  outline: '#988d9f'
  outline-variant: '#4d4354'
  surface-tint: '#ddb7ff'
  primary: '#ddb7ff'
  on-primary: '#490080'
  primary-container: '#b76dff'
  on-primary-container: '#400071'
  inverse-primary: '#842bd2'
  secondary: '#ffc640'
  on-secondary: '#402d00'
  secondary-container: '#e3aa00'
  on-secondary-container: '#5a4100'
  tertiary: '#fabc4e'
  on-tertiary: '#432c00'
  tertiary-container: '#bd871a'
  on-tertiary-container: '#3a2600'
  error: '#ffb4ab'
  on-error: '#690005'
  error-container: '#93000a'
  on-error-container: '#ffdad6'
  primary-fixed: '#f0dbff'
  primary-fixed-dim: '#ddb7ff'
  on-primary-fixed: '#2c0051'
  on-primary-fixed-variant: '#6900b3'
  secondary-fixed: '#ffdf9f'
  secondary-fixed-dim: '#f9bd22'
  on-secondary-fixed: '#261a00'
  on-secondary-fixed-variant: '#5c4300'
  tertiary-fixed: '#ffdead'
  tertiary-fixed-dim: '#fabc4e'
  on-tertiary-fixed: '#281900'
  on-tertiary-fixed-variant: '#604100'
  background: '#16111b'
  on-background: '#eadfed'
  surface-variant: '#39323d'
typography:
  display-lg:
    fontFamily: Outfit
    fontSize: 36px
    fontWeight: '800'
    lineHeight: '1.2'
    letterSpacing: -0.02em
  display-md:
    fontFamily: Outfit
    fontSize: 30px
    fontWeight: '700'
    lineHeight: '1.2'
  section-header:
    fontFamily: Outfit
    fontSize: 18px
    fontWeight: '700'
    lineHeight: '1.5'
  body-md:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: '400'
    lineHeight: '1.6'
  body-sm:
    fontFamily: Inter
    fontSize: 13px
    fontWeight: '400'
    lineHeight: '1.5'
  label-caps:
    fontFamily: Inter
    fontSize: 10px
    fontWeight: '700'
    lineHeight: '1'
    letterSpacing: 0.2em
  script-quote:
    fontFamily: Great Vibes
    fontSize: 24px
    fontWeight: '400'
    lineHeight: '1.4'
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  container-padding: 2rem
  gutter: 1.5rem
  stack-sm: 0.75rem
  stack-md: 1.5rem
  stack-lg: 2rem
  sidebar-expanded: 14rem
  sidebar-collapsed: 5rem
---

## Brand & Style
The Mytherion brand identity is a fusion of **Glassmorphism** and **High-Fantasy Digitalism**. It targets creative world-builders and writers, evoking a sense of "digital alchemy"—where modern software utility meets the mystical atmosphere of an ancient library. 

The visual style is characterized by deep, celestial backgrounds layered with translucent "glass" surfaces that utilize heavy backdrop blurs and subtle internal glows. The interface should feel like a high-tech obsidian tablet: mysterious, premium, and immersive. Visual interest is maintained through "starfield" textures, radial gradients that simulate magical energy, and high-contrast primary accents.

## Colors
The palette is rooted in a deep cosmic void (`#0B0B1E`). The **Primary Purple** (`#A855F7`) represents arcane energy and is used for core actions and active states. The **Secondary Gold** (`#FBBF24`) acts as a "legendary" accent, reserved for notifications, progress highlights, and rare items.

Surface colors are rarely solid; they rely on alpha-transparency to allow background gradients and textures to peek through. Semantic accents include Emerald for growth/success and Blue for environmental/location data. Text follows a hierarchy of pure white for headlines, Slate-400 for secondary information, and Slate-500 for metadata.

## Typography
The typography system uses **Outfit** for display and geometric strength, providing a modern "gaming" aesthetic for titles and branding. **Inter** handles all functional data, ensuring high readability against complex backgrounds. 

A special **Script** face (Great Vibes) is used sparingly for decorative story prompts or lore quotes to reinforce the "chronicler" theme. Metadata labels use heavy tracking (letter spacing) and uppercase transforms to create clear boundaries between content sections without requiring heavy lines.

## Layout & Spacing
The system utilizes a dual-sidebar layout. The far-left rail is a high-density icon bar (80px), while the inner sidebar (224px) provides text-based navigation. Main content follows a fluid grid with a standard 32px (2rem) padding for major containers.

Component spacing uses a 4px baseline, with most card gaps set at 24px (1.5rem). Information within cards should be "stacked" using 12px or 16px increments to maintain a breathable, editorial feel.

## Elevation & Depth
Depth is created through **Glassmorphism** rather than traditional shadows. 
- **Level 1 (Base):** The starfield background.
- **Level 2 (Panels):** Translucent sidebars (Black at 20-40% opacity) with a 12px backdrop blur.
- **Level 3 (Cards):** The "Glass" style—White at 3% opacity, 12px blur, and a 1px white border at 10% opacity.
- **Level 4 (Hover/Active):** Surfaces receive an internal glow or a primary-colored border-glow (e.g., `shadow-primary/20`).

Active navigational elements use linear gradients that fade from 20% primary opacity to 0%, paired with a solid 3px left-accent border.

## Shapes
The shape language is generous and modern. Standard cards and large containers use a **16px (rounded-2xl)** corner radius. Smaller interactive elements like buttons and input fields use **12px (rounded-xl)**. 

Search bars and status indicators use **Full/Pill** rounding to differentiate them from structural content. Icons and avatars are housed in either circles or "squircle" containers with a 30% corner radius.

## Components
- **Buttons:** Primary buttons are solid purple (`#A855F7`) with white text and a soft outer glow. Secondary buttons use the "Glass" card style with high-contrast text.
- **Cards:** Must feature `backdrop-filter: blur(12px)` and a subtle `1px border-white/10`. On hover, the border opacity should increase to 50% primary color.
- **Input Fields:** Rounded-full, borderless, with a `white/5` background. Focus states must trigger a 1px primary ring.
- **Chips/Badges:** Small, uppercase labels with a 10% background tint of the text color. Border should be 20% opacity of the same color.
- **Progress Bars:** Use a primary-to-purple gradient for the fill, and include an outer glow (`drop-shadow`) on the leading edge of the progress indicator to simulate "charging" energy.
- **Sidebar Items:** Active items use a ghost-gradient background (`primary/20` to `transparent`) and a thick left-side primary border.