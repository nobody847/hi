# Project-Ops Dashboard Design Guidelines

## Design Approach
**Utility-First Dashboard Design** - This is a productivity tool for developers requiring clarity, efficiency, and information density. The design prioritizes functionality and data accessibility over decorative elements.

## Core Visual Identity

### Dark Mode Theme (Required)
- Primary Background: `bg-gray-900` or dark navy (`bg-slate-900`)
- Card Backgrounds: `bg-gray-800` or `bg-slate-800`
- Soft, Professional Accent Colors:
  - Soft Teal: For primary actions and active states
  - Soft Lavender/Purple: For secondary highlights and charts
  - Soft Amber/Yellow: For warnings and important metrics
  - Muted accent colors throughout - avoid harsh, vibrant tones

### Typography Hierarchy
- **Dashboard Titles**: Large, bold headings (text-3xl to text-4xl, font-bold)
- **Section Headers**: Medium weight (text-xl to text-2xl, font-semibold)
- **Card Titles**: text-lg, font-medium
- **Body Text**: text-sm to text-base with text-gray-300 or text-slate-300
- **Metadata/Labels**: text-xs to text-sm, text-gray-400 or text-slate-400
- Font Stack: System fonts or professional sans-serif from Google Fonts

## Layout System

### Spacing Primitives
Use Tailwind units: **2, 4, 6, 8, 12, 16** for consistent spacing
- Component padding: `p-4` to `p-6`
- Card gaps: `gap-4` to `gap-6`
- Section margins: `mb-8` to `mb-12`
- Page containers: `p-6` to `p-8`

### Main Layout Structure
- **Sidebar Navigation** (fixed, left-aligned):
  - Width: `w-64` on desktop, collapsible on mobile
  - Links with icons from Lucide-React
  - Active state highlighting with soft accent color
  
- **Main Content Area**:
  - Max width container: `max-w-7xl mx-auto`
  - Responsive padding: `px-4 md:px-6 lg:px-8`

### Card-Based Design System
All content containers use card patterns:
- Rounded corners: `rounded-lg` or `rounded-xl`
- Subtle borders: `border border-gray-700` or use shadow instead
- Cards should have: `bg-gray-800 p-6 rounded-lg shadow-lg`
- Hover states: `hover:bg-gray-750 transition-colors`

## Component Library

### Dashboard Components
1. **Project Status Donut Chart**:
   - Recharts DonutChart with soft accent colors
   - Legend positioned to the right or bottom
   - Minimum size: 300px diameter

2. **Technology Bar Chart**:
   - Horizontal or vertical bars showing tech usage
   - Use gradient fills with soft accent colors
   - Clear axis labels and tooltips

3. **Recent Activity Feed**:
   - List items with timestamps
   - Icons indicating activity type (Lucide-React)
   - Truncated text with hover for full details

4. **Project Cards Grid**:
   - Responsive grid: `grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6`
   - Each card shows: name, status badge, tech stack tags, quick actions
   - Status badges with color coding (Planning: amber, Development: blue, Live: green, etc.)

### Forms & Inputs
- Input fields: `bg-gray-700 border border-gray-600 text-white rounded-md px-4 py-2`
- Focus states: `focus:ring-2 focus:ring-[accent-color] focus:border-transparent`
- Labels: `text-sm font-medium text-gray-300 mb-2`
- Dropdowns/Selects: Styled consistently with inputs
- Textareas for notes: Same styling, min-height appropriate for content

### Tabbed Interface (Project Detail View)
- Horizontal tabs at top of content area
- Active tab: Bottom border or background highlight with accent color
- Tab content: Wrapped in card container
- Tabs: Details, Dev Notes, Issue Tracker, Credentials, Team, Future Goals

### Buttons
- **Primary CTA**: Soft accent background with white text, `px-6 py-2 rounded-md font-medium`
- **Secondary**: Border style with accent color, transparent background
- **Icon Buttons**: Lucide-React icons, minimal padding, hover states
- **Copy to Clipboard**: Icon button next to credential values

### Data Display Elements
- **Tech Stack Tags**: Small pills/badges `bg-gray-700 px-3 py-1 rounded-full text-xs`
- **Status Badges**: Color-coded pills with icon
- **Issue Priority Indicators**: Color dots or badges (Red: High, Yellow: Medium, Green: Low)
- **Team Member Cards**: Avatar placeholder, name, role in compact card

### Navigation & Actions
- **Sidebar Menu Items**: Icon + label, hover background, active indicator
- **Breadcrumbs**: For project detail navigation
- **Action Buttons**: Top-right of sections (Add, Edit, Delete, Backup)

## Responsive Behavior
- **Mobile (<768px)**: 
  - Sidebar collapses to hamburger menu
  - Single column layouts
  - Stacked forms
  - Charts scale to container width

- **Tablet (768px-1024px)**:
  - 2-column project grids
  - Sidebar visible or toggleable
  
- **Desktop (>1024px)**:
  - 3-column project grids
  - Persistent sidebar
  - Multi-column forms where appropriate

## Special Features

### Credentials Section (Security Focus)
- Warning banner: Amber background with icon, prominent text
- Key-value pairs in monospace font for readability
- Copy buttons with click feedback (icon change or tooltip)
- Masked values by default with show/hide toggle

### Google Drive Backup Button
- Prominent placement in project detail header
- Success/error feedback with toast notifications
- Loading state during upload

## Images
**No hero images required** - This is a functional dashboard application, not a marketing site. Visual interest comes from:
- Data visualizations (charts and graphs)
- Color-coded status indicators
- Icon usage throughout
- Well-structured information hierarchy

## Accessibility & Polish
- Maintain consistent focus states across all interactive elements
- Ensure sufficient color contrast (WCAG AA minimum)
- Loading states for async operations (spinners, skeleton screens)
- Empty states with helpful messaging and CTAs
- Toast/notification system for user feedback

## Key Principles
1. **Information Density**: Maximize useful data on screen without clutter
2. **Scanability**: Clear hierarchy and grouping for quick information retrieval
3. **Consistency**: Reuse components and patterns throughout
4. **Dark-First**: All elements optimized for dark theme readability
5. **Developer-Friendly**: Monospace fonts for code/credentials, clear tech indicators