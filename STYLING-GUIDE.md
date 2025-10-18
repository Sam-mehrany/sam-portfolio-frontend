# Global Styling System Guide

This portfolio application uses a centralized CSS variable system that allows you to control all styling from one place. All changes made to the global CSS file will automatically apply throughout the entire application.

## 📁 Main Configuration File

**File Location:** `src/app/globals.css`

This is your central control panel for all styling. Change values here, and they will apply globally across the entire application.

---

## 🎨 Available CSS Variables

### 1. **Border Radius** - Control Roundness
Change these to adjust how rounded corners appear throughout the app:

```css
--radius: 0.625rem;        /* Base radius (10px) - Change this to adjust all roundness */
--radius-sm: ...           /* Small radius (6px) */
--radius-md: ...           /* Medium radius (8px) */
--radius-lg: ...           /* Large radius (10px) */
--radius-xl: ...           /* Extra large radius (14px) */
--radius-2xl: ...          /* 2X large radius (18px) */
--radius-full: 9999px;     /* Fully rounded (pills/circles) */
```

**Example:** To make everything more rounded, change `--radius: 0.625rem;` to `--radius: 1rem;`

---

### 2. **Shadows** - Control Depth & Elevation
Adjust shadow intensity and depth:

```css
--shadow-sm: 0 1px 2px 0 rgb(0 0 0 / 0.05);
--shadow-md: 0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1);
--shadow-lg: 0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1);
--shadow-xl: 0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1);
--shadow-2xl: 0 25px 50px -12px rgb(0 0 0 / 0.25);
--shadow-inner: inset 0 2px 4px 0 rgb(0 0 0 / 0.05);
```

**Example:** For stronger shadows, increase the opacity from `0.1` to `0.2` or `0.3`

---

### 3. **Spacing** - Control Gaps & Padding
Adjust spacing between elements:

```css
--spacing-xs: 0.25rem;   /* 4px */
--spacing-sm: 0.5rem;    /* 8px */
--spacing-md: 1rem;      /* 16px */
--spacing-lg: 1.5rem;    /* 24px */
--spacing-xl: 2rem;      /* 32px */
--spacing-2xl: 3rem;     /* 48px */
--spacing-3xl: 4rem;     /* 64px */
```

**Example:** To increase spacing globally, multiply each value by 1.25 or 1.5

---

### 4. **Font Sizes** - Control Text Sizes
Adjust typography scale:

```css
--font-size-xs: 0.75rem;    /* 12px */
--font-size-sm: 0.875rem;   /* 14px */
--font-size-base: 1rem;     /* 16px */
--font-size-lg: 1.125rem;   /* 18px */
--font-size-xl: 1.25rem;    /* 20px */
--font-size-2xl: 1.5rem;    /* 24px */
--font-size-3xl: 1.875rem;  /* 30px */
--font-size-4xl: 2.25rem;   /* 36px */
--font-size-5xl: 3rem;      /* 48px */
```

**Example:** To make all text 10% larger, multiply each value by 1.1

---

### 5. **Transitions** - Control Animation Speed
Adjust how fast animations and transitions occur:

```css
--transition-fast: 150ms;
--transition-base: 200ms;
--transition-slow: 300ms;
--transition-slower: 500ms;
```

**Example:** For slower, more dramatic transitions, increase to `300ms`, `400ms`, `500ms`, `800ms`

---

### 6. **Opacity Levels** - Control Transparency
Adjust transparency effects:

```css
--opacity-disabled: 0.5;   /* Disabled elements */
--opacity-hover: 0.8;      /* Hover effects */
--opacity-overlay: 0.4;    /* Modal overlays */
```

**Example:** For more visible disabled states, change `--opacity-disabled: 0.5;` to `0.7`

---

### 7. **Z-Index Layers** - Control Element Stacking
Control which elements appear on top:

```css
--z-base: 0;
--z-dropdown: 1000;
--z-sticky: 1020;
--z-fixed: 1030;
--z-modal-backdrop: 1040;
--z-modal: 1050;
--z-popover: 1060;
--z-tooltip: 1070;
```

**Note:** Higher numbers appear on top. Don't change these unless you have layering issues.

---

### 8. **Colors** - Control Color Scheme

#### Light Mode Colors
```css
/* Backgrounds (4-layer system) */
--background: oklch(0.92 0 0);     /* Page background */
--muted: oklch(0.96 0 0);          /* Sections */
--card: oklch(0.98 0 0);           /* Cards */
--input: oklch(0.977 0 0);         /* Inputs */

/* Primary color (Orange accent) */
--primary: oklch(0.65 0.22 45);    /* Vibrant orange */

/* Borders */
--border: oklch(0.85 0 0);         /* Border color */
```

#### Dark Mode Colors
```css
/* In .dark class */
--background: oklch(0.12 0 0);     /* Dark background */
--primary: oklch(0.65 0.22 45);    /* Same orange */
```

**Understanding OKLch Color Format:**
- First value (0-1): Lightness (0 = black, 1 = white)
- Second value (0-0.4): Chroma/saturation (0 = gray, higher = more vibrant)
- Third value (0-360): Hue (0 = red, 45 = orange, 120 = green, 240 = blue)

**Example Changes:**
- Make primary color blue: `oklch(0.65 0.22 240)`
- Make backgrounds darker: Decrease first value (e.g., `0.92` → `0.88`)
- Make colors more vibrant: Increase second value (e.g., `0.22` → `0.28`)

---

## 🎯 How to Use These Variables in Your Code

### In Tailwind Classes

All variables are available as Tailwind utilities:

```tsx
// Border radius
<div className="rounded-lg">...</div>      {/* Uses --radius-lg */}
<div className="rounded-xl">...</div>      {/* Uses --radius-xl */}

// Shadows
<div className="shadow-md">...</div>       {/* Uses --shadow-md */}
<div className="shadow-xl">...</div>       {/* Uses --shadow-xl */}

// Spacing
<div className="p-md">...</div>            {/* Uses --spacing-md */}
<div className="gap-lg">...</div>          {/* Uses --spacing-lg */}

// Font sizes
<h1 className="text-4xl">...</h1>          {/* Uses --font-size-4xl */}
<p className="text-base">...</p>           {/* Uses --font-size-base */}

// Transitions
<div className="duration-fast">...</div>   {/* Uses --transition-fast */}

// Opacity
<div className="opacity-hover">...</div>   {/* Uses --opacity-hover */}

// Z-index
<div className="z-modal">...</div>         {/* Uses --z-modal */}

// Colors
<div className="bg-primary">...</div>      {/* Uses --primary */}
<div className="text-muted-foreground">...</div>
```

### In Custom CSS

```css
.my-custom-element {
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-md);
  padding: var(--spacing-lg);
  font-size: var(--font-size-xl);
  transition-duration: var(--transition-base);
  background-color: var(--primary);
}
```

---

## 🚀 Quick Customization Examples

### Make Everything More Rounded
```css
--radius: 1.5rem;  /* Changed from 0.625rem */
```

### Stronger Shadows Throughout
```css
--shadow-md: 0 4px 6px -1px rgb(0 0 0 / 0.2), 0 2px 4px -2px rgb(0 0 0 / 0.2);
--shadow-lg: 0 10px 15px -3px rgb(0 0 0 / 0.2), 0 4px 6px -4px rgb(0 0 0 / 0.2);
```

### Larger Text Globally
```css
--font-size-base: 1.125rem;  /* Changed from 1rem (16px to 18px) */
```

### Change Primary Color to Blue
```css
--primary: oklch(0.55 0.25 250);  /* Blue instead of orange */
```

### Slower Animations
```css
--transition-fast: 300ms;  /* Changed from 150ms */
--transition-base: 400ms;  /* Changed from 200ms */
```

### Darker Light Mode
```css
--background: oklch(0.88 0 0);  /* Changed from 0.92 */
--card: oklch(0.94 0 0);        /* Changed from 0.98 */
```

---

## 📋 Color Palette Reference

### Current Light Mode Palette
- **Page Background:** `oklch(0.92 0 0)` - Medium gray
- **Sections:** `oklch(0.96 0 0)` - Light gray
- **Cards:** `oklch(0.98 0 0)` - Very light gray
- **Primary (Orange):** `oklch(0.65 0.22 45)` - Vibrant orange
- **Text:** `oklch(0.2 0 0)` - Near black
- **Border:** `oklch(0.85 0 0)` - Visible border

### Current Dark Mode Palette
- **Page Background:** `oklch(0.12 0 0)` - Deep black
- **Sections:** `oklch(0.17 0 0)` - Dark gray
- **Cards:** `oklch(0.20 0 0)` - Medium dark gray
- **Primary (Orange):** `oklch(0.65 0.22 45)` - Same vibrant orange
- **Text:** `oklch(0.95 0 0)` - Light gray/white
- **Border:** `oklch(0.30 0 0)` - Visible border

---

## ⚠️ Important Notes

1. **Single Source of Truth:** All styling changes should be made in `src/app/globals.css`
2. **Live Updates:** After changing CSS variables, the changes apply immediately (hot reload in development)
3. **Theme Support:** All variables work in both light and dark mode
4. **Tailwind Integration:** Variables are fully integrated with Tailwind in `tailwind.config.ts`
5. **Consistency:** Using these variables ensures consistent design throughout your app

---

## 🔧 Advanced: Creating New Variables

To add new custom variables:

1. **Add to globals.css:**
```css
:root {
  --my-custom-value: 20px;
}
```

2. **Add to tailwind.config.ts (optional, for Tailwind support):**
```typescript
extend: {
  spacing: {
    custom: "var(--my-custom-value)"
  }
}
```

3. **Use in code:**
```tsx
<div className="p-custom">...</div>
// or
<div style={{ padding: 'var(--my-custom-value)' }}>...</div>
```

---

## 📞 Need Help?

If you're unsure about a change, test it in your browser's DevTools first:
1. Open DevTools (F12)
2. Go to Elements tab
3. Find `:root` or `.dark` in the Styles panel
4. Edit the CSS variable values live to preview changes
5. Once happy, apply the changes to your `globals.css` file

---

**Last Updated:** 2025
**File Version:** 2.0
