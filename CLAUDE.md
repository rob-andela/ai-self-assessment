# AI Archetype Assessment

A stateless web application where engineers can answer a 12-question quiz to discover their AI engineering archetype: Prototyper, Builder, or Scaler.

## Project Structure

```
├── app/
│   ├── layout.tsx              # Root layout
│   ├── page.tsx                # Quiz interface
│   ├── globals.css             # Global styles
│   └── result/
│       └── page.tsx            # Results page with QR code
├── lib/
│   ├── types.ts                # TypeScript type definitions
│   └── scoring.ts              # Scoring logic and URL encoding
├── public/
│   └── questions.json          # Configurable quiz questions
├── package.json
├── tsconfig.json
├── next.config.ts
├── tailwind.config.ts
└── vercel.json                 # Vercel deployment config
```

## Key Features

- **Stateless Design**: All answers encoded in URL query parameters (e.g., `?q1=a&q2=c...`)
- **Keyboard Navigation**: 
  - Press `A`, `B`, `C` to answer questions
  - Use arrow keys to navigate between questions
- **TypeForm-like UI**: Clean, minimal interface with single-choice selection
- **QR Code Generation**: Share results as QR codes without a database
- **Configurable Questions**: Questions stored in `public/questions.json`
- **Scoring Logic**: 
  - Counts answers for Prototyper [P], Builder [B], Scaler [S]
  - Senior/Lead detection based on complex tradeoff answers (Q4, Q7, Q12)

## Quiz Questions

The quiz contains 12 questions about technical taste and AI engineering philosophy. Each question has three answer choices mapping to archetypes:
- **A (Prototyper)**: Rapid experimentation, sensing value
- **B (Builder)**: Production systems, architecture
- **C (Scaler)**: Reliability, cost, governance

## Scoring

- **Primary Archetype**: Determined by majority of answers (≥6 for clear archetype)
- **Senior/Lead Marker**: If 2+ of the complex tradeoff questions (4, 7, 12) are answered with [S]
- **Result Display**: Shows archetype, description, answer breakdown, and shareable QR code

## Deployment

Hosted on Vercel at `https://ai-self-assessment.aipoc.site/`

- Uses Next.js 16.2+ with TypeScript
- Requires Node.js ≥20.9.0 (specified in `.nvmrc`)
- All styling via Tailwind CSS
- No database required (fully stateless)

## Styling

The UI follows the Andela assessment design with:
- Clean, minimal interface
- CSS variables for theming (light/dark mode support)
- Tailwind CSS utility classes
- Accessible button states with visual feedback

## How to Run Locally

```bash
npm install
npm run dev
```

Then visit `http://localhost:3000`

## Notes

- All state is encoded in the URL, making it stateless and database-free
- Questions are loaded from `public/questions.json` for easy configuration
- Results page generates QR codes client-side using `qrcode.react`
- Full keyboard support for fast completion (perfect for terminal/developer use)
