# Aethel — AI Event Planning Atelier

> An editorial, Kinfolk-inspired event architecture studio platform for orchestrating weddings, milestone celebrations, and civic community drives with real-time budget rebalancing, automated chronological timelines, vetted vendor inquiries, and intelligent AI co-pilot assistance.

---

## Highlights & Key Capabilities

- **Zero Generic AI Gradients**: Pure Kinfolk / architectural studio design system.
  - **Palette**: Cream (`#FBF9F5`, `#F3EFEA`), Deep Charcoal (`#1A1918`, `#575553`), Deep Forest (`#1B3B36`), Warm Gold/Ochre (`#C89047`), and Soft Pearl cards (`#FFFFFF`).
  - **Typography**: Editorial Google Fonts pairing with *Playfair Display* serif headings and *Plus Jakarta Sans* tracking labels.
- **Dynamic Budget Allocation & Real-Time Rebalancing**:
  - Live interactive sliders across 5 foundational categories (*Venue & Catering*, *Decor & Ambience*, *Media & Sound*, *Logistics/Permits*, *Contingency*).
  - Category Lock toggles (`Lock`/`Unlock`) to freeze fixed expenses while redistributing remaining funds proportionally.
  - Line-item expense breakdown with estimated vs. actual accounting, deposit statuses, and live over/under warnings.
- **Reverse-Engineered Master Timeline**:
  - Structured reverse cadence: `T-6 Months` (Vision & Contracts), `T-1 Month` (Tactical Alignment), `T-1 Week` (Headcount & Load-in), and `Day-Of Schedule` (Minute-by-minute run of show).
  - Priority tiers, category filtering, interactive completion checkboxes, and celebratory confetti.
- **Artisan Vendor Directory & Smart Inquiry Generator**:
  - Directory categorized by discipline with status tags (`Booked`, `Quoted`, `Contacted`, `To Source`).
  - Pre-drafted contextual AI email inquiry drawer with tone adjustments (*Curatorial & Warm*, *Budget Ceiling Negotiation*, *Contract Hold*), single-click clipboard copy, and native `mailto:` dispatch.
- **AI Atelier Co-Pilot Drawer**:
  - Slide-over intelligence panel powered by simulated/live Gemini prompt engines.
  - Context-aware responses that analyze current event constraints, curfews, and budget limits.
  - Interactive actionable cards that directly mutate event state (e.g., *Apply 5% Shift to Eco Decor*, *Insert Weather Contingency Milestone*).
- **Curated Multi-Archetype Presets**:
  1. **Wedding**: *Sunset Hillside Ceremonial* ($25,000 budget, 120 guests, Ojai Valley, CA).
  2. **Birthday**: *Minimalist 30th Rooftop Soirée* ($3,500 budget, 45 guests, Tribeca, NYC).
  3. **Community Event**: *Neighborhood Green & Urban Planting Drive* ($1,200 budget, 150 volunteers).
- **Export & Print Dossier**:
  - Export full event state as a clean `.json` manifest.
  - Native print preview (`window.print()`) with print stylesheet formatting for an editorial dossier.
- **Client Persistence**:
  - Full automatic sync with `localStorage` across page reloads.

---

## Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Styling**: Tailwind CSS + Custom Design System
- **Icons**: Lucide React
- **Typography**: `next/font/google` (*Playfair Display* & *Plus Jakarta Sans*)
- **Animations & Effects**: Tailwind Animate + Canvas Confetti
- **Language**: TypeScript (Strict Mode)

---

## Running Locally

```bash
# Install dependencies
npm install

# Start local dev server (default: http://localhost:3000)
npm run dev

# Compile production build
npm run build
```
