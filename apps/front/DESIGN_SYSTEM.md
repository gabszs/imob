# Design System - Front

Design system inspirado em ferramentas CLI modernas com estética minimalista e brutalist.

## Filosofia de Design

**Keywords:** Minimal, Brutalist, Functional, Monospace, High-Contrast, Developer-First

### Princípios

1. **Function over Form** - Priorizar funcionalidade e clareza
2. **Zero Decoration** - Sem ornamentos desnecessários
3. **Monospace Everything** - Fonte monoespaçada em toda interface
4. **Sharp Edges** - Sem border-radius (ou minimal)
5. **High Contrast** - Contraste forte para legibilidade
6. **Dense Information** - Máxima densidade de informação

## Color Palette

### Light Mode
```css
--background: #ffffff
--foreground: #000000
--muted: #f5f5f5
--muted-foreground: #737373
--border: #e5e5e5
--accent: #000000
--accent-foreground: #ffffff
--destructive: #dc2626
--success: #16a34a
--warning: #ea580c
```

### Dark Mode
```css
--background: #000000
--foreground: #ffffff
--muted: #1a1a1a
--muted-foreground: #a3a3a3
--border: #2a2a2a
--accent: #ffffff
--accent-foreground: #000000
--destructive: #ef4444
--success: #22c55e
--warning: #f97316
```

### Semantic Colors
- **Primary**: Pure black/white (theme dependent)
- **Success**: Green shades
- **Error**: Red shades
- **Warning**: Orange shades
- **Info**: Blue shades (optional)

## Typography

### Font Family
```css
font-family: 'JetBrains Mono', 'Fira Code', 'Monaco', 'Consolas', monospace
```

### Font Sizes
```css
--text-xs: 0.75rem    /* 12px */
--text-sm: 0.875rem   /* 14px */
--text-base: 1rem     /* 16px */
--text-lg: 1.125rem   /* 18px */
--text-xl: 1.25rem    /* 20px */
--text-2xl: 1.5rem    /* 24px */
--text-3xl: 1.875rem  /* 30px */
```

### Font Weights
```css
--font-normal: 400
--font-medium: 500
--font-semibold: 600
--font-bold: 700
```

## Spacing System

Usando escala 4px base (0.25rem)

```css
--space-1: 0.25rem   /* 4px */
--space-2: 0.5rem    /* 8px */
--space-3: 0.75rem   /* 12px */
--space-4: 1rem      /* 16px */
--space-5: 1.25rem   /* 20px */
--space-6: 1.5rem    /* 24px */
--space-8: 2rem      /* 32px */
--space-10: 2.5rem   /* 40px */
--space-12: 3rem     /* 48px */
--space-16: 4rem     /* 64px */
```

## Border & Radius

### Border Width
```css
--border-width: 1px
--border-width-thick: 2px
```

### Border Radius
```css
--radius-none: 0
--radius-sm: 0.125rem   /* 2px - minimal */
--radius-md: 0.25rem    /* 4px - minimal */
--radius-lg: 0.375rem   /* 6px - minimal */
```

**Default:** Zero border-radius (brutalist style)

## Components

### Button

**Variants:**
- `default`: Black background, white text
- `outline`: Border only, transparent background
- `ghost`: No border, transparent background
- `destructive`: Red background

**Sizes:**
- `sm`: 32px height
- `md`: 40px height (default)
- `lg`: 48px height

**Style:**
```css
border-radius: 0
font-family: monospace
font-weight: 500
text-transform: uppercase
letter-spacing: 0.05em
transition: none /* instant feedback */
```

### Input

```css
border: 1px solid var(--border)
border-radius: 0
background: transparent
padding: 0.5rem 0.75rem
font-family: monospace
font-size: 0.875rem
```

**States:**
- Focus: Thick border (2px)
- Error: Red border
- Disabled: Muted colors

### Card

```css
border: 1px solid var(--border)
border-radius: 0
background: var(--background)
padding: 1.5rem
```

**Variants:**
- `default`: Standard card
- `elevated`: Stronger border (2px)
- `ghost`: No border

### Table

```css
border-collapse: collapse
width: 100%
font-size: 0.875rem
```

**Rows:**
- Header: Bold, border-bottom
- Body: Border-bottom on hover
- Zebra striping: Subtle muted background

### Dialog/Modal

```css
border: 2px solid var(--border)
border-radius: 0
box-shadow: none
background: var(--background)
padding: 2rem
max-width: 600px
```

## Layout

### Grid System

12-column grid com gaps:
```css
--grid-gap: 1rem
--grid-gap-lg: 2rem
```

### Container

```css
max-width: 1400px
padding: 0 2rem
margin: 0 auto
```

### Sidebar

```css
width: 240px
border-right: 1px solid var(--border)
background: var(--muted)
```

## Animations

**Philosophy:** Minimal to zero animations

```css
/* Preferred: instant */
transition: none

/* If needed: fast and subtle */
transition: all 0.1s ease
```

**Exceptions:**
- Loading spinners
- Progress bars
- Toast notifications

## Icons

**Preferred:** Lucide React (monoline, consistent)

**Style:**
- Size: 16px, 20px, 24px
- Stroke width: 2px
- Color: currentColor

## States

### Hover
```css
background: var(--muted)
border-color: var(--foreground)
```

### Focus
```css
outline: 2px solid var(--foreground)
outline-offset: 2px
```

### Active
```css
transform: translateY(1px)
```

### Disabled
```css
opacity: 0.5
cursor: not-allowed
```

## Accessibility

- **Contrast Ratio:** Minimum 7:1 (AAA)
- **Focus Visible:** Always show focus states
- **Keyboard Navigation:** Full keyboard support
- **Screen Readers:** Proper ARIA labels
- **Font Size:** Minimum 14px

## Examples

### Button Examples
```html
<!-- Primary -->
<button class="bg-foreground text-background px-4 py-2 font-mono font-medium uppercase tracking-wide">
  Submit
</button>

<!-- Outline -->
<button class="border border-foreground text-foreground px-4 py-2 font-mono font-medium uppercase tracking-wide hover:bg-foreground hover:text-background">
  Cancel
</button>
```

### Card Example
```html
<div class="border border-border p-6">
  <h2 class="font-mono font-bold text-lg mb-4">Card Title</h2>
  <p class="font-mono text-sm text-muted-foreground">Card content...</p>
</div>
```

## Implementation Notes

### Tailwind Config

```js
{
  theme: {
    fontFamily: {
      mono: ['JetBrains Mono', 'Fira Code', 'Monaco', 'Consolas', 'monospace'],
    },
    borderRadius: {
      none: '0',
      sm: '2px',
      md: '4px',
      lg: '6px',
    },
    extend: {
      transitionDuration: {
        '0': '0ms',
      },
    },
  },
}
```

### Global Styles

```css
* {
  font-family: 'JetBrains Mono', monospace;
  border-radius: 0 !important;
  transition: none !important;
}

body {
  -webkit-font-smoothing: antialiased;
  text-rendering: optimizeLegibility;
}
```

## References

- Linear: Clean, minimal interface
- Arc Browser: Bold, brutalist design
- Vercel: Monospace, high contrast
- GitHub CLI: Terminal-inspired UI
- Cursor IDE: Developer-focused design
