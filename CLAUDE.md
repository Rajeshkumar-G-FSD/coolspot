# Cool Cottages — Claude Code Rules

## UI Rules

### Apple Button Theme
All buttons across all pages must use the Apple button theme. Do NOT change functionality or logic — only update visual style.

**Apple button characteristics:**
- `rounded-full` pill shape (never `rounded-lg` or `rounded-xl` for buttons)
- `active:scale-95` press feedback on every button
- `font-semibold` weight (never `font-black` or `font-extrabold` for buttons)
- `transition-all duration-200` smooth transitions
- `cursor-pointer select-none` on all interactive buttons

**Utility classes defined in `src/index.css` (`@layer components`):**
- `.btn-apple` — base pill: `rounded-full font-semibold transition-all duration-200 active:scale-95 cursor-pointer select-none`
- `.btn-apple-primary` — navy primary: extends `.btn-apple`, `bg-[#001a52] hover:bg-[#0e2f76] text-white shadow-md`
- `.btn-apple-amber` — amber CTA: extends `.btn-apple`, `bg-amber-400 hover:bg-amber-300 text-[#001a52] shadow-lg`
- `.btn-apple-outline` — outline: extends `.btn-apple`, `border border-current hover:opacity-70`
- `.btn-apple-ghost` — ghost: extends `.btn-apple`, `border border-slate-300 text-slate-500 hover:border-slate-400`
- `.btn-apple-danger` — destructive: extends `.btn-apple`, red border/text/hover
- `.btn-apple-green` — success: extends `.btn-apple`, `bg-emerald-600 hover:bg-emerald-700 text-white`

**Rule:** When adding any new button to any page, always use `.btn-apple` (or a variant) as the base class. Never use `rounded-xl`/`rounded-lg` for buttons.

## Content Preservation Rule

**Rule:** Always keep existing content intact. Do NOT remove, replace, or alter any existing text, data, images, or UI sections unless explicitly instructed to do so. Only add to or adjust what is specifically requested.
