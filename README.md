# KeyFlow — Online Piano

KeyFlow is a high-performance, browser-based 88-key online piano. It is designed to feel like a real instrument — fast, responsive, and zero-friction. Anyone can open it and start playing immediately without being forced to create an account. It features a "Midnight Studio" aesthetic, dual-keyboard zones, customizable keybindings, and optional cloud sync.

![KeyFlow Piano Preview](public/preview.png) *(Add a screenshot here later)*

## Features

- **Full 88-Key Range**: Play a complete grand piano directly from your browser.
- **Zero Friction**: No login required. Start playing the moment the page loads.
- **Low Latency Audio**: Powered by Tone.js and the Web Audio API with high-quality Salamander Grand Piano samples.
- **Dual Keyboard Zones**: Support for mapping two physical keyboard rows (e.g., QWERTY and ZXCV) independently.
- **Customizable Keybindings**: Fully map out your own shortcuts using the visual binding editor. 
- **Import/Export**: Share your custom layouts as JSON files or back them up.
- **Cloud Sync**: (Optional) Sign in via Clerk to sync your custom keybindings and settings across devices (backed by MongoDB).
- **Midnight Studio Theme**: A professional, dark, sleek UI designed for musicians.
- **Touch Support**: Playable on mobile devices with multi-touch support.

## Tech Stack

- **Framework**: [Next.js 16](https://nextjs.org/) (App Router)
- **Language**: [TypeScript](https://www.typescriptlang.org/) (Strict mode)
- **State Management**: [Zustand](https://zustand-demo.pmnd.rs/)
- **Audio Engine**: [Tone.js](https://tonejs.github.io/)
- **Styling**: [Tailwind CSS v4](https://tailwindcss.com/)
- **Authentication**: [Clerk](https://clerk.com/)
- **Database**: [MongoDB](https://www.mongodb.com/) (via Mongoose)
- **Validation**: [Zod](https://zod.dev/)

## Architecture

1. **Guest-First Design**: All settings and keybindings are immediately stored in `localStorage`. The piano is 100% functional without a backend.
2. **Audio Initialization**: To comply with browser autoplay policies, the audio context is lazily initialized on the first user interaction (click or keypress).
3. **Physical Key Mapping**: Input handling uses `KeyboardEvent.code` to remain agnostic of keyboard layouts (e.g., AZERTY vs. QWERTY) and strictly enforces single-key triggers (modifier combinations are ignored).
4. **Auth Migration**: When a guest signs in for the first time, their local `localStorage` settings and bindings are automatically migrated to MongoDB.

## Getting Started

### Prerequisites

- Node.js 18+
- `pnpm` (recommended)

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/your-username/keyflow-piano.git
   cd keyflow-piano
   ```

2. Install dependencies:
   ```bash
   pnpm install
   ```

3. Configure Environment Variables:
   Copy `.env.example` to `.env.local` and fill in your keys.
   ```bash
   cp .env.example .env.local
   ```
   *Note: The app will run locally without MongoDB or Clerk, but cloud sync and login will be disabled.*

4. Run the development server:
   ```bash
   pnpm run dev
   ```

5. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Cloud Setup (Optional)

To enable cloud sync, you will need:
1. A **Clerk** account. Get your publishable/secret keys and configure the redirect URLs in the Clerk dashboard.
2. A **MongoDB** database (e.g., MongoDB Atlas). Get your connection string.
3. Configure a **Clerk Webhook** pointing to your deployed domain (`https://your-domain.com/api/webhooks/clerk`) and listen for `user.created` and `user.deleted` events. Put the webhook secret in your `.env.local`.

## License

This project is licensed under the MIT License.
