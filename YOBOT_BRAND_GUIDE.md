# YoBot® Brand Color Implementation Guide

## 🎨 Official Brand Colors

| Use Case | Color Code | Description |
|----------|------------|-------------|
| **Primary Accent** | `#0d82da` | Electric YoBot Blue |
| **Background/Surface** | `#000000` | Deep Black (main) |
| **Text/Highlight** | `#ffffff` | White (clean content) |
| **Secondary Neutral** | `#c3c3c3` | Soft Gray (dividers, labels) |

## 🔧 Enhanced Visual Stack Components

### Main Card System
```css
.yobot-card             /* Main panel - black bg, electric blue border */
.yobot-stat-box         /* Inner stat boxes - silver chrome style */
.yobot-stat-card        /* Standard stat card structure */
```

### Button Gradients
```css
.yobot-button-primary   /* Electric blue gradient */
.yobot-button-danger    /* Red gradient for destructive actions */
.yobot-button-tool      /* Purple gradient for tools/features */
```

### Silver Chrome Accents
```css
.yobot-silver-text      /* Silver gradient text for headers */
.yobot-silver-strip     /* Thin silver accent bar */
.yobot-divider          /* Section divider line */
```

### Status Indicators
```css
.yobot-stat-active      /* Active metrics with pulse glow */
.yobot-stat-inactive    /* Inactive/gray metrics */
.yobot-module-container /* Module wrapper with glow */
```

### Tailwind Utility Classes
```css
/* YoBot Brand Colors */
bg-yobot-blue           /* #0d82da */
bg-yobot-black          /* #000000 */
bg-yobot-white          /* #ffffff */
bg-yobot-gray           /* #c3c3c3 */
text-yobot-blue         /* #0d82da */
border-yobot-blue       /* #0d82da */
```

## 📱 Enhanced Visual Stack Examples

### Complete Stat Card Structure
```jsx
<div className="yobot-stat-card">
  <div className="yobot-silver-strip mb-2"></div>
  <h4 className="text-sm text-[#c3c3c3] uppercase tracking-wide">Conversion Rate</h4>
  <div className="text-2xl font-bold text-white">24%</div>
  <div className="text-sm text-green-400">+5.2%</div>
</div>
```

### Main Panel with Inner Stat Boxes
```jsx
<Card className="yobot-card p-6">
  <h3 className="yobot-silver-text text-lg font-bold mb-4">Analytics Dashboard</h3>
  <div className="yobot-divider mb-6"></div>
  
  <div className="grid grid-cols-3 gap-4">
    <div className="yobot-stat-box p-4">
      <div className="text-sm text-[#c3c3c3]">Budget Efficiency</div>
      <div className="text-xl font-bold">87%</div>
    </div>
    <div className="yobot-stat-box p-4 yobot-stat-active">
      <div className="text-sm text-[#c3c3c3]">Active Calls</div>
      <div className="text-xl font-bold">12</div>
    </div>
    <div className="yobot-stat-box p-4 yobot-stat-inactive">
      <div className="text-sm text-[#c3c3c3]">Pending</div>
      <div className="text-xl font-bold">0</div>
    </div>
  </div>
</Card>
```

### Button Variants
```jsx
{/* Primary Action */}
<Button className="yobot-button-primary px-6 py-2">
  Start Pipeline
</Button>

{/* Tool/Feature Button */}
<Button className="yobot-button-tool px-4 py-2">
  Voice Studio
</Button>

{/* Danger Button */}
<Button className="yobot-button-danger px-4 py-2">
  Emergency Stop
</Button>
```

### Module Container with Header
```jsx
<div className="yobot-module-container">
  <h3 className="yobot-silver-text text-xl font-bold mb-2">Command Center</h3>
  <div className="yobot-silver-strip mb-4"></div>
  
  <div className="space-y-4">
    {/* Module content */}
  </div>
</div>
```

### Section Headers with Dividers
```jsx
<div className="space-y-6">
  <section>
    <h2 className="yobot-silver-text text-lg font-semibold mb-2">Bot Performance</h2>
    <div className="yobot-divider mb-4"></div>
    {/* Bot performance content */}
  </section>
  
  <section>
    <h2 className="yobot-silver-text text-lg font-semibold mb-2">ROI / Spend</h2>
    <div className="yobot-divider mb-4"></div>
    {/* ROI content */}
  </section>
</div>
```

## ⚡ Special Effects

### Pulse Glow Animation
- Active elements automatically get `pulse-glow-blue` animation
- Use `animation-pulse-glow-blue` class for custom implementations

### Hover Effects
- Cards automatically transform and glow on hover
- Buttons scale and enhance glow on hover

## 🎯 Brand Consistency Rules

1. **Background**: Always use `#000000` (deep black)
2. **Primary Actions**: Use `#0d82da` (YoBot blue)
3. **Text**: Use `#ffffff` (white) for primary text
4. **Labels/Secondary**: Use `#c3c3c3` (soft gray)
5. **Borders**: Use `#0d82da` for active elements
6. **Active States**: Include pulse glow animation
7. **Inactive States**: Reduce opacity and use gray

## 📋 Implementation Checklist

- [x] CSS variables updated with brand colors
- [x] Tailwind config includes YoBot color tokens
- [x] Component utility classes created
- [x] Button styling standardized
- [x] Card system implements brand colors
- [x] Pulse animations for active states
- [x] Hover effects with brand colors
- [x] Module container styling

## 🚀 Quick Start

Replace existing classes with YoBot brand equivalents:

```diff
- className="bg-blue-500 text-white"
+ className="bg-yobot-blue text-white"

- className="border-blue-400"
+ className="border-yobot-blue"

- className="bg-gray-800"
+ className="bg-yobot-black"
```