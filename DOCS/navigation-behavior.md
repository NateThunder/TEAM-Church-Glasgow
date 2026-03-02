# Navigation Bar Scroll Behavior

This document provides a technical explanation of the navigation bar's dynamic behavior, including the frosted glass transition and the mobile menu scroll lock.

## 1. Frosted Glass Transition

The navigation bar implements a dynamic "frosted glass" effect that intensifies as the user scrolls down from the top of the page.

### Implementation Logic
The logic is located in `src/components/Layout.tsx` within a `useEffect` hook that listens to the `scroll` event.

- **Threshold (`fadeRange`):** The transition occurs over the first **120 pixels** of scrolling.
- **Scroll Tracking:** The `updateFrost` function calculates a `progress` value between 0 and 1:
  ```typescript
  const progress = Math.min(Math.max(scrollTop / fadeRange, 0), 1);
  ```
- **Performance:** Updates are throttled using `requestAnimationFrame` to ensure smooth performance at 60fps.

### Dynamic CSS Variables
The script dynamically updates three CSS custom properties on the `<header>` element (`.site-header`):

| Variable | Calculation | Max Value | Purpose |
| :--- | :--- | :--- | :--- |
| `--frost-alpha` | `0.15 * progress` | 0.15 | Background opacity |
| `--frost-blur` | `14 * progress` | 14px | Backdrop blur intensity |
| `--frost-shadow` | `0.2 * progress` | 0.2 | Bottom shadow opacity |

Additionally, `--header-height` is set on the root element (`document.documentElement`) to allow other components to respect the header's current size.

### CSS Integration
In `src/styles/globals.css`, these variables are applied to the `.site-header`:
```css
.site-header {
  background: rgba(4, 20, 28, var(--frost-alpha));
  backdrop-filter: blur(var(--frost-blur));
  box-shadow: 0 4px 30px rgba(0, 0, 0, calc(var(--frost-shadow) * 0.3));
  /* ... transitions ... */
}
```

---

## 2. Mobile Menu Scroll Lock

When the mobile navigation drawer is open, the background page scroll is locked to prevent "scroll leak" while maintaining the user's current scroll position.

### Implementation Logic
The lock is managed by a `useEffect` in `src/components/Layout.tsx` that triggers when `isMenuOpen` changes.

#### Enabling the Lock:
1. The current scroll position is captured: `window.scrollY`.
2. The `<body>` element is set to `position: fixed`.
3. The `top` property of the body is set to the negative value of the scroll position (`-${scrollY}px`). This "pins" the page in place visually.
4. `overflow: hidden` is applied to prevent further scrolling.

#### Disabling the Lock (Cleanup):
1. The fixed positioning and styles are removed from the `<body>` and `<html>` elements.
2. The window is manually scrolled back to the original position using `window.scrollTo(0, y)`.

```typescript
// Example of the restoration logic in Layout.tsx
const top = body.style.top;
// ... reset styles ...
const y = top ? -parseInt(top, 10) : 0;
window.scrollTo(0, y);
```

This approach is more robust than simply setting `overflow: hidden`, as it prevents the page from jumping back to the top on mobile browsers when the drawer opens.
