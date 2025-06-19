# YoBot® Brand Color Implementation Guide

## 🎨 Official Brand Colors

| Use Case | Color Code | Description |
|----------|------------|-------------|
| **Primary Accent** | `#0d82da` | Electric YoBot Blue |
| **Background/Surface** | `#000000` | Deep Black (main) |
| **Text/Highlight** | `#ffffff` | White (clean content) |
| **Secondary Neutral** | `#c3c3c3` | Soft Gray (dividers, labels) |

## 🔧 Implementation Classes

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

### Component Classes
```css
/* Ready-to-use component classes */
.yobot-button           /* Primary button styling */
.yobot-card             /* Card with brand colors */
.yobot-stat-active      /* Active metric styling */
.yobot-stat-inactive    /* Inactive metric styling */
.yobot-module-container /* Module wrapper */
```

## 📱 Usage Examples

### Buttons
```jsx
<Button className="yobot-button">
  Start Pipeline
</Button>

<Button className="bg-yobot-blue text-white hover:bg-yobot-blue-hover">
  Submit Ticket
</Button>
```

### Cards
```jsx
<Card className="yobot-card">
  <CardContent>
    Content with YoBot branding
  </CardContent>
</Card>
```

### Stat Panels
```jsx
{/* Active metric */}
<div className="yobot-stat-active">
  <span className="text-2xl font-bold">156</span>
  <span className="text-sm">Active Leads</span>
</div>

{/* Inactive metric */}
<div className="yobot-stat-inactive">
  <span className="text-2xl font-bold">0</span>
  <span className="text-sm">Pending</span>
</div>
```

### Module Containers
```jsx
<div className="yobot-module-container">
  <h3 className="text-white mb-4">Module Title</h3>
  {/* Module content */}
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