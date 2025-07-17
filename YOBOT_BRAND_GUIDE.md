# 🎨 YoBot® Brand Styling Guide

This guide defines the official UI and styling system for all components inside the YoBot® Command Center and affiliated applications.

---

## ✅ Global Design Principles

- **Dark Mode First:** Black background (`#000000`) with neon accenting.
- **Vibrant Gradients:** All CTA buttons and cards use brand gradients with glow effects.
- **Rounded Corners:** `rounded-2xl` standard for all major containers and interactive elements.
- **Sharp Hover Effects:** Neon or soft-glow shadows on hover to indicate interactivity.
- **Compact + Powerful:** Minimal padding, high info density, fast load times.
- **Professional but Flashy:** Designed for enterprise feel with a next-gen tech aesthetic.

---

## 🎨 Brand Colors

| Purpose                | Color             | Usage                                    |
|------------------------|------------------|------------------------------------------|
| Primary Accent         | `#0d82da`         | Buttons, borders, hover overlays         |
| Background             | `#000000`         | Universal background                     |
| Secondary Text         | `#c3c3c3`         | Subtext and muted labels                 |
| White Base             | `#ffffff`         | Typography, icons, borders               |
| Alert / Danger         | `#e53935` to `#b71c1c` | Destructive actions / warnings     |
| Success Gradient       | `#43cea2` to `#185a9d` | Confirmation buttons / states         |
| Purple Utility         | `#ab47bc` to `#8e24aa` | AI / smart engine cards and tools     |

---

## 🧱 Typography

| Element          | Font       | Tailwind Class           |
|------------------|------------|---------------------------|
| Body             | `Inter`    | `font-inter`              |
| Headings         | `Inter`    | `text-lg font-semibold`   |
| Subtext / Labels | `Inter`    | `text-sm text-[#c3c3c3]`  |
| CTAs             | `Inter`    | `text-white font-medium`  |

> All font usage should include fallback to `sans-serif`. Use `font-inter` as global base.

---

## 🧩 Component Structure

All components must follow:

```tsx
<div className="rounded-2xl bg-gradient-to-br from-[color1] to-[color2] text-white p-4 hover:shadow-[0_0_12px_color] transition-all">
  {/* Content */}
</div>
```

> Card height is not fixed unless context demands. Use grid for layout, not flex.

---

## 🧠 UI Utility Elements

### CardGrid
```tsx
<div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 w-full">
  {children}
</div>
```

### SectionHeader
```tsx
<h2 className="text-lg font-semibold text-white tracking-wide border-b border-[#0d82da] pb-1 mb-3">
  Title Goes Here
</h2>
```

### QuickNav Button
```tsx
<span className="px-2 py-0.5 bg-[#0d82da]/20 rounded border border-[#0d82da] hover:bg-[#0d82da]/40 cursor-pointer">
  Button Text
</span>
```

---

## 📦 Card Defaults (Command Center)

Use per feature module:

```tsx
<div className="rounded-2xl bg-gradient-to-br from-[#0d82da] to-[#185a9d] text-white p-4 hover:shadow-[0_0_12px_#0d82da]">
  {/* Feature Card */}
</div>
```

---

## 📥 Modal Styling

```tsx
<div className="fixed inset-0 bg-black/80 backdrop-blur z-50 flex items-center justify-center">
  <div className="relative w-full max-w-lg p-6 bg-[#111] rounded-2xl border border-[#0d82da]">
    {/* Modal Content */}
  </div>
</div>
```

---

## 🧪 Buttons

| Type                | Class                                                                 |
|---------------------|------------------------------------------------------------------------|
| Primary CTA         | `bg-[#0d82da] hover:bg-[#0d82da]/80`                                  |
| Gradient Purple     | `bg-gradient-to-br from-purple-600 to-purple-400 hover:shadow-purple` |
| Danger / Destruct   | `bg-gradient-to-br from-[#e53935] to-[#b71c1c]`                       |
| Neon Hover Shadow   | `hover:shadow-[0_0_12px_color]`                                       |

---

## 🪟 Panel Defaults

```tsx
<div className="rounded-2xl border border-[#0d82da] p-4 bg-[#0d0d0d] text-white">
  {/* Panel content */}
</div>
```

---

## 📁 Assets

- YoBot® Logo: `/assets/Engage Smarter Logo Transparent.png`
- Always center and use width `240px` height `80px` for top banner branding.

---

## 🧬 Customizations

- ⚠️ **No inline styles unless dynamic.**
- 🧠 Use `@layer base` in Tailwind if global changes are needed.
- 💾 Global styles can be overridden in `globals.css` or `tailwind.config.ts`.
