# Boutikio Color Palette

Extracted from `tailwind.config.js` and custom CSS components.

---

## Primary Colors (Orange)

| Shade | Hex | Usage |
|-------|-----|-------|
| 50 | `#fff7ed` | Lightest background |
| 100 | `#ffedd5` | Light background |
| 200 | `#fed7aa` | Subtle highlights |
| 300 | `#fdba74` | Borders, light accents |
| 400 | `#fb923c` | Interactive elements |
| 500 | `#f97316` | Standard primary |
| 600 | `#C2420D` | **Brand Primary** |
| 700 | `#9a3412` | Buttons, active states |
| 800 | `#7c2d12` | Hover states |
| 900 | `#431407` | Darkest, text |

### Primary Usage
- **Buttons**: `bg-primary-700`, `hover:bg-primary-800`
- **Links**: `text-primary-600`
- **Focus rings**: `focus:ring-primary-300`, `focus:ring-primary-500`
- **Active tabs**: `bg-primary-600`, `text-white`
- **Invalid form fields**: `border-primary-500`, `text-primary-700`

---

## Secondary Colors (Blue)

| Shade | Hex | Usage |
|-------|-----|-------|
| 50 | `#eff6ff` | Lightest background |
| 100 | `#dbeafe` | Light background |
| 200 | `#bfdbfe` | Subtle highlights |
| 300 | `#93c5fd` | Borders, light accents |
| 400 | `#60a5fa` | Interactive elements |
| 500 | `#3b82f6` | Standard secondary |
| 600 | `#2563eb` | Buttons, links |
| 700 | `#1d4ed8` | **Secondary buttons** |
| 800 | `#1e40af` | Hover states |
| 900 | `#1e3a8a` | Darkest, text |

### Secondary Usage
- **Secondary buttons**: `bg-secondary-700`, `hover:bg-secondary-800`
- **Focus rings**: `focus:ring-secondary-300`

---

## Semantic Colors

### Success (Green)
| Shade | Hex |
|-------|-----|
| 100 | `#dcfce7` |
| 200 | `#bbf7d0` |
| 700 | `#15803d` |
| 800 | `#166534` |

**Usage**: Alert success messages, positive states

### Warning (Yellow)
| Shade | Hex |
|-------|-----|
| 300 | `#fcd34d` |
| 400 | `#facc15` |
| 500 | `#eab308` |
| 900 | `#a16207` |

**Usage**: Warning alerts, caution states

### Danger (Red)
| Shade | Hex |
|-------|-----|
| 50 | `#fef2f2` |
| 300 | `#fca5a5` |
| 500 | `#ef4444` |
| 600 | `#dc2626` |
| 800 | `#991b1b` |

**Usage**: Error messages, destructive actions, danger buttons

### Info (Blue)
| Shade | Hex |
|-------|-----|
| 100 | `#dbeafe` |
| 200 | `#bfdbfe` |
| 500 | `#3b82f6` |
| 700 | `#1d4ed8` |
| 800 | `#1e40af` |

**Usage**: Informational alerts

---

## Neutral Colors (Gray)

| Shade | Hex | Usage |
|-------|-----|-------|
| 50 | `#f9fafb` | Backgrounds, cards |
| 100 | `#f3f4f6` | Input backgrounds |
| 200 | `#e5e7eb` | Borders, dividers |
| 300 | `#d1d5db` | Input borders |
| 400 | `#9ca3af` | Placeholder text |
| 500 | `#6b7280` | Secondary text |
| 600 | `#4b5563` | Body text |
| 700 | `#374151` | Dark backgrounds |
| 800 | `#1f2937` | Dark mode elements |
| 900 | `#111827` | Primary text |

---

## Special Colors

| Name | Hex | Usage |
|------|-----|-------|
| White | `#ffffff` | Text on dark, button text |
| Accent | `#FF6B35` | Special highlights (receipt template) |
| Dark hover | `#434c59` | Dark mode hover states |

---

## Dark Mode Color Mappings

| Light Mode | Dark Mode |
|------------|-----------|
| `bg-white` | `dark:bg-gray-700` / `dark:bg-gray-800` |
| `bg-gray-50` | `dark:bg-gray-700` |
| `text-gray-900` | `dark:text-white` |
| `text-gray-500` | `dark:text-gray-400` |
| `border-gray-200` | `dark:border-gray-600` |
| `primary-600` active tab | `text-orange-400 border-orange-500` |

---

## CSS Variables for OpenWebUI

```css
:root {
  /* Primary (Orange) */
  --primary-50: #fff7ed;
  --primary-100: #ffedd5;
  --primary-200: #fed7aa;
  --primary-300: #fdba74;
  --primary-400: #fb923c;
  --primary-500: #f97316;
  --primary-600: #C2420D;
  --primary-700: #9a3412;
  --primary-800: #7c2d12;
  --primary-900: #431407;

  /* Secondary (Blue) */
  --secondary-50: #eff6ff;
  --secondary-100: #dbeafe;
  --secondary-200: #bfdbfe;
  --secondary-300: #93c5fd;
  --secondary-400: #60a5fa;
  --secondary-500: #3b82f6;
  --secondary-600: #2563eb;
  --secondary-700: #1d4ed8;
  --secondary-800: #1e40af;
  --secondary-900: #1e3a8a;

  /* Semantic */
  --success: #16a34a;
  --warning: #eab308;
  --danger: #dc2626;
  --info: #3b82f6;

  /* Neutrals */
  --gray-50: #f9fafb;
  --gray-100: #f3f4f6;
  --gray-200: #e5e7eb;
  --gray-300: #d1d5db;
  --gray-400: #9ca3af;
  --gray-500: #6b7280;
  --gray-600: #4b5563;
  --gray-700: #374151;
  --gray-800: #1f2937;
  --gray-900: #111827;
}
```

---

## JSON Format

```json
{
  "primary": {
    "50": "#fff7ed",
    "100": "#ffedd5",
    "200": "#fed7aa",
    "300": "#fdba74",
    "400": "#fb923c",
    "500": "#f97316",
    "600": "#C2420D",
    "700": "#9a3412",
    "800": "#7c2d12",
    "900": "#431407"
  },
  "secondary": {
    "50": "#eff6ff",
    "100": "#dbeafe",
    "200": "#bfdbfe",
    "300": "#93c5fd",
    "400": "#60a5fa",
    "500": "#3b82f6",
    "600": "#2563eb",
    "700": "#1d4ed8",
    "800": "#1e40af",
    "900": "#1e3a8a"
  },
  "gray": {
    "50": "#f9fafb",
    "100": "#f3f4f6",
    "200": "#e5e7eb",
    "300": "#d1d5db",
    "400": "#9ca3af",
    "500": "#6b7280",
    "600": "#4b5563",
    "700": "#374151",
    "800": "#1f2937",
    "900": "#111827"
  },
  "semantic": {
    "success": "#16a34a",
    "warning": "#eab308",
    "danger": "#dc2626",
    "info": "#3b82f6"
  }
}
```

---

## Typography

| Font | Usage |
|------|-------|
| **Geist** | Primary body font |
| **Inter** | Fallback body font |
| **JetBrains Mono** | Monospace/code |

---

## Notes

- Primary color is based on **Tailwind's orange palette** with a custom 600 shade (`#C2420D`)
- Secondary color is based on **Tailwind's blue palette**
- Dark mode uses class-based switching (`dark:` prefix)
- Focus states use `ring-primary-300` (light) and `ring-primary-800` (dark)