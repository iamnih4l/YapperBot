<div align="center">
  <img src="https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/versions/generation-v/black-white/animated/25.gif" alt="Pikachu Sprite" width="80" />
  <br/>
  <h1>⚔️ YAPPERBOT 🤖</h1>
  <p><strong>Where Ideas Clash Like Pokémon Battles!</strong></p>

  <p>
    <a href="https://yapper-bot.vercel.app/" target="_blank"><strong>🟢 PLAY LIVE ON VERCEL</strong></a>
  </p>
  <p>
    <a href="#-about-the-game">About</a> •
    <a href="#-game-modes">Game Modes</a> •
    <a href="#-tech-stack">Tech Stack</a> •
    <a href="#-how-to-play">How to Play</a>
  </p>
</div>

---

## 📖 About the Game

**YapperBot** (or DebateBot) is an interactive, retro-themed web application that turns intellectual debates into a pixel-art arcade game. Step into the arena to argue against AI opponents, or sit back and watch two logic-driven bots dismantle each other's points. 

Every solid argument deals "damage" to a player's **Credibility Bar** (HP). Logic wins. Fallacies lose. Can you debate your way to victory?

---

## 🎮 Game Modes

### 1️⃣ Battle Mode (You vs. AI)
Enter the arena yourself! Pick a topic, take a stance, and submit your own typed arguments. 
* Choose actions like **ARGUE** or **REBUT**.
* If your argument is logically sound, you damage the AI.
* If your argument is weak, the AI's counter-attack will damage *your* Credibility!

### 2️⃣ Watch Mode (Logic-Bot vs. Reason-Bot)
Grab some popcorn. Provide a topic and sit back as two AI personas (PRO vs. AGAINST) take turns aggressively dismantling each other’s logic until only one remains standing.

---

## 👾 Features & Aesthetics

* **Retro 8-Bit Vibe:** Chunky pixel fonts, blocky borders, and CRT monitor effects.
* **Interactive 3D Avatar:** A fully dynamic `PixelRobot3D` built purely out of CSS and Framer Motion that tracks your cursor.
* **Responsive Sound System:** 
  * 🎶 Lo-fi background theme
  * 💥 Distinct damage sound effects
  * 🏆 Unique Win/Loss jingles at the end of a match
  * 🤫 *Secret Easter Egg:* Land exactly on 67 HP for a surprise!
* **Pokemon-style HP Tracking:** Your logical "Credibility" is represented as an interactive health bar. 

---

## 🛠 Tech Stack

- **Frontend Framework:** React 18 / Vite / TypeScript
- **Animations:** Framer Motion
- **Styling:** Tailwind CSS + Custom retro `index.css`
- **AI Core Engine:** Google Gemini (`gemini-2.5-flash`)
- **Backend:** Vercel Serverless Functions & Redis (ioredis)

---

## 🚀 How to Play (Local Setup)

To run your own physical debate arena locally:

1. **Clone the repository:**
   ```bash
   git clone https://github.com/iamnih4l/YapperBot.git
   cd YapperBot
   ```

2. **Install Dependencies:**
   ```bash
   npm install
   ```

3. **Set Up the API Key:**
   Rename the `.env.example` file to `.env` and insert your Gemini API key:
   ```env
   VITE_GEMINI_API_KEY="AIzaSyYourSecretKeyHere..."
   PORT=3001
   ```

4. **Boot the Arena:**
   Run both the Node Proxy and Vite Frontend simultaneously:
   ```bash
   npm run dev:all
   ```

5. **Start Debating:**
   Open `http://localhost:5173` in your browser.

---

<div align="center">
  <img src="https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/poke-ball.png" alt="Pokeball" width="30"/>
  <p><em>Built with ⚡️ Logic & Reason ⚡️</em></p>
</div>