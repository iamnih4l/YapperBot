# YapperBot / DebateBot - Project Documentation for LLMs

This document serves as high-level context and technical documentation about the "YapperBot" (or "DebateBot") application. You can provide this file to ChatGPT or any other AI assistant to give them a comprehensive understanding of the project's features, architecture, and current state. 

## 📝 High-Level Overview Concept

**YapperBot** is an interactive, retro-themed web application that turns intellectual debates into a Pokemon-style arcade game. Users can either watch two AI bots debate a topic (`Watch Mode`) or step into the arena themselves to argue against an AI opponent (`Battle Mode`). The game evaluates the logical strength of arguments (using Google's Gemini AI) and deals "damage" to a player's or bot's "Credibility" (HP bar) accordingly.

The aesthetic leans heavily into 8-bit nostalgia, featuring chunky pixel fonts, CRT monitor scanline effects, dynamic 3D CSS avatars, and custom sound effects (SFX) that trigger upon taking damage or winning/losing a match.

## 🛠 Tech Stack

- **Frontend Runtime & Framework:** React 18, Vite, TypeScript
- **Styling:** Tailwind CSS (utility-first styling), custom CSS for CRT and pixel text effects (`src/index.css`)
- **Animation & 3D Interactive Elements:** `framer-motion` (used for standard UI transitions and a custom 3D CSS pixel robot avatar)
- **UI Components & Icons:** `lucide-react`, `shadcn/ui` concepts (custom button/input designs)
- **Backend Proxy Server:** Node.js backend using `express` and `cors`
- **Security / Safety:** `dotenv` for environment variables, `express-rate-limit` for blocking spam calls to the API 
- **AI Core:** `@google/generative-ai` SDK initialized on the Node proxy to evaluate arguments securely.

## 🎮 Core Features

1. **Watch Mode (Bot vs. Bot):**
   - Users provide a topic or select from a pre-made list (e.g., "AI will replace human doctors").
   - Two pre-configured AI Personas ("LOGIC-BOT" [PRO] vs "REASON-BOT" [AGAINST]) take turns generating counter-arguments against the very last thing the opponent said.
   - If an argument is classified as "strong" by the system, the opposing bot loses a chunk of their 100-point Credibility Bar. First bot to reach 0 HP loses.

2. **Battle Mode (User vs. Bot):**
   - The User inputs their own custom arguments in an attempt to logically defeat the AI.
   - Users can choose from actions like `ARGUE` or `REBUT`.
   - The AI evaluates user inputs in real-time. If the User's argument is strong, the AI takes damage. If the AI retaliates with a strong argument, the User takes damage.

3. **Global Audio System:**
   - Controlled via a `useAudio` React Hook in `src/App.tsx`.
   - Handled via native `<audio>` HTML refs.
   - **`theme-song.mp3`**: Plays quietly in the background on loop (default muted until interacted with).
   - **`start-sound.mp3`**: Triggers when a debate officially enters the arena.
   - **`damage-sound.mp3`**: Plays when a Bot takes damage.
   - **`easter-egg.mp3`**: Plays when the User takes damage (acts as a user-specific damage sound).
   - **`secret-67.mp3`**: An easter egg sound that only plays if any Credibility Bar lands on exactly `67` HP after an attack.
   - **`win-sound.mp3`**: Plays loudly on the `EndScreen` if the human user wins.
   - **`lose-sound.mp3`**: Plays on the `EndScreen` if the AI opponent defeats the human user.

4. **Dynamic 3D Robot Avatar:**
   - Found on the Landing Page.
   - Uses `framer-motion` 3D transforms (`rotateX`, `rotateY`, `translateZ`, `perspective`) to create a floating, R2D2-esque interactive robot avatar entirely out of nested CSS `<div>` blocks.
   - Its head tracks the user's mouse cursor dynamically.

5. **Review System:**
   - An interactive 5-star review carousel on the Landing Page.
   - Users can submit reviews on the `EndScreen`. These are posted securely to a local `reviews.json` file handled by the Node API.

## 🏗 Architecture & File Structure

### 1. The Frontend (`src/App.tsx`)
The `App.tsx` file is the God Component of the application. It holds almost everything for rapid prototyping:
- The `useAudio` hook for managing all 7 audio refs.
- The `PixelRobot3D` component (Framer Motion 3D character).
- The `LandingPage` and `MenuScreen` routers.
- The `BotVsBotMode` and `UserVsBotMode` debate loops.
- The `CredibilityBar` (HP) and `TypewriterText` (dialogue) micro-components.
- The `EndScreen` handling the win/loss logic and trigger effects.
- The state router inside `PokemonDebateApp` switching between `gameMode` string constants (`landing` | `topic-input` | `bot-vs-bot` | `user-vs-bot` | `end`).

### 2. The API Bridge (`src/lib/gemini.ts`)
Instead of initializing `GoogleGenerativeAI` natively in the frontend (which historically leaked API keys to public repositories or client builds), this bridge file overrides the `geminiModel.generateContent(prompt)` signature to blindly forward a `POST /api/debate` fetch request to local port `3001`. The structure of the response is mocked to trick the UI into thinking it's still talking to the official SDK.

### 3. The Backend Node Proxy (`server.js`)
An extremely lightweight `express` server that runs concurrently with UI development. Contains three endpoints:
- `POST /api/debate`: Actually calls the Google Gemini API securely using the `.env` secret key. Implements a rate limiter of 10 requests per minute to prevent accidental spam.
- `GET /api/reviews`: Reads `reviews.json`.
- `POST /api/reviews`: Writes appended data to `reviews.json`.

### 4. Safety & Config (`.gitignore` & `.env.example`)
To ensure safety on GitHub, `.env` and `.env.*` are heavily ignored in the `.gitignore`. A `.env.example` file is provided specifying the required variable: `VITE_GEMINI_API_KEY`.

## 🚀 Running The Project
The project uses `concurrently` in the `package.json` to spin up both the Frontend API and the Backend Proxy.
Command: `npm run dev:all`
This fires up `http://localhost:3001` (Proxy Server) and `http://localhost:5173` (Vite UI).
