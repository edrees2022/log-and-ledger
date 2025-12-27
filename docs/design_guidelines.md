# Log & Ledger Accounting Application Design Guidelines

## Design Approach
**System-Based Approach**: Using Material Design principles adapted for enterprise accounting software, emphasizing clarity, efficiency, and data accessibility across web and mobile platforms.

## Core Design Principles
- **Data-First Design**: Clean, scannable layouts that prioritize financial information visibility
- **Professional Reliability**: Conservative, trustworthy aesthetic appropriate for financial software
- **Cross-Platform Consistency**: Unified experience across web, Android, and iOS
- **Accessibility**: Full support for RTL languages and screen readers

## Color Palette

### Light Mode
- **Primary**: 210 100% 20% (Deep professional blue)
- **Primary Variant**: 210 80% 35% (Lighter blue for accents)
- **Surface**: 0 0% 98% (Near-white backgrounds)
- **Surface Variant**: 210 10% 95% (Subtle card backgrounds)
- **Text Primary**: 210 15% 15% (Dark blue-gray)
- **Text Secondary**: 210 10% 45% (Medium gray)

### Dark Mode
- **Primary**: 210 80% 65% (Lighter blue for contrast)
- **Primary Variant**: 210 60% 50% (Muted blue accent)
- **Surface**: 210 15% 8% (Dark blue-gray)
- **Surface Variant**: 210 12% 12% (Elevated surfaces)
- **Text Primary**: 210 5% 95% (Near-white)
- **Text Secondary**: 210 8% 75% (Light gray)

### Status Colors
- **Success**: 140 60% 40% (Muted green)
- **Warning**: 35 85% 50% (Professional orange)
- **Error**: 355 70% 45% (Subdued red)

## Typography
- **Primary Font**: Inter (Google Fonts) - Clean, readable for financial data
- **Monospace**: JetBrains Mono - For account codes and numbers
- **Hierarchy**: Use 5 text sizes (xs, sm, base, lg, xl) with consistent weight scaling

## Layout System
**Tailwind Spacing Units**: Consistent use of 2, 4, 6, 8, 12, 16 for spacing
- Tight spacing (2, 4) for form elements and table cells
- Medium spacing (6, 8) for component separation
- Wide spacing (12, 16) for section breaks

## Component Library

### Navigation
- **Desktop**: Persistent sidebar with collapsible sections (Accounting, Sales, Purchase, Reports, Settings)
- **Mobile**: Bottom tab navigation with hamburger menu for secondary items
- **Company Switcher**: Prominent dropdown in header

### Data Tables
- **Sticky Headers**: Always visible column headers during scroll
- **Responsive**: Horizontal scroll on mobile with priority columns visible
- **Filters**: Inline filter chips with clear/reset functionality
- **Sorting**: Clear visual indicators for sort direction

### Forms
- **Floating Labels**: Material Design style with consistent validation states
- **Tax Configuration**: Multi-select dropdowns with visual tax rate indicators
- **Document Numbering**: Pattern preview showing "INV-2024-0001" format examples

### Financial Components
- **Amount Display**: Right-aligned with currency symbols, consistent decimal places
- **Account Selectors**: Hierarchical dropdowns with account codes
- **Status Badges**: Rounded pills for document states (Draft, Approved, Paid)

### Print Templates
- **Headers**: Company logo/info area with clean typography
- **Document Body**: Structured tables with clear line item separation
- **Footers**: Signature areas and declaration text zones
- **Date Ranges**: Prominent From-To date display for reports

## Cross-Platform Considerations
- **Progressive Web App**: Offline-capable with sync indicators
- **Touch Targets**: Minimum 44px for mobile interactions
- **Responsive Breakpoints**: Mobile-first approach with tablet and desktop optimizations
- **Native Feel**: Platform-appropriate navigation patterns while maintaining brand consistency

## Settings & Internationalization
- **Language Toggle**: Prominent setting with country flag indicators
- **RTL Support**: Automatic layout direction changes for Arabic and Hebrew
- **Theme Control**: Light/Dark/Auto with system preference detection
- **Numbering Patterns**: Visual pattern builders with live previews

## Notifications
- **Toast Messages**: Non-intrusive bottom notifications for actions
- **Alert Panels**: Prominent warnings for due invoices and low stock
- **Email Stubs**: Simple preference toggles for notification types

This design system prioritizes financial data clarity while maintaining modern usability standards across all platforms and languages.