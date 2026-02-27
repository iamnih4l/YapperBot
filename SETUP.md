# Setup Instructions

## Quick Start

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Start development server:**
   ```bash
   npm run dev
   ```

3. **Open in browser:**
   Navigate to `http://localhost:5173`

## Important Notes

### Tailwind CSS v4

This project uses Tailwind CSS v4, which uses CSS-first configuration. The theme variables are defined directly in `src/index.css` using `@theme` directives.

If you encounter issues with Tailwind v4 (it's still in beta), you can downgrade to v3:

1. Install Tailwind CSS v3:
   ```bash
   npm install -D tailwindcss@^3 postcss autoprefixer
   ```

2. Create `tailwind.config.js`:
   ```js
   export default {
     content: [
       "./index.html",
       "./src/**/*.{js,ts,jsx,tsx}",
     ],
     theme: {
       extend: {},
     },
     plugins: [],
   }
   ```

3. Update `src/index.css` to use standard Tailwind directives:
   ```css
   @tailwind base;
   @tailwind components;
   @tailwind utilities;
   ```

### Path Aliases

The project uses `@/` path aliases configured in:
- `tsconfig.json` - TypeScript path resolution
- `vite.config.ts` - Vite path resolution

All imports using `@/` will resolve to the `src/` directory.

### Dependencies

All required dependencies are listed in `package.json`:
- React & React DOM
- TypeScript
- Vite
- Tailwind CSS v4
- Framer Motion (animations)
- Lucide React (icons)
- Radix UI (accessible components)
- Utility libraries (clsx, tailwind-merge, class-variance-authority)

## Troubleshooting

### Port Already in Use

If port 5173 is already in use, Vite will automatically try the next available port. Check the terminal output for the actual port number.

### TypeScript Errors

Run `npm run build` to check for TypeScript errors. Make sure all dependencies are installed correctly.

### Styling Issues

If styles aren't loading:
1. Check that `src/index.css` is imported in `src/main.tsx`
2. Verify PostCSS is configured correctly in `postcss.config.js`
3. Ensure Tailwind CSS is installed

## Project Structure

```
DebateBot/
├── src/
│   ├── components/ui/    # Reusable UI components
│   ├── lib/              # Utility functions
│   ├── App.tsx           # Main app component
│   ├── main.tsx          # Entry point
│   └── index.css         # Global styles
├── index.html            # HTML template
└── [config files]        # Build & type configs
```

## Next Steps

After installation:
1. Review `src/App.tsx` to understand the component structure
2. Customize game logic in the mode components
3. Modify styles in `src/index.css` for theme customization
4. Add new features or components as needed
