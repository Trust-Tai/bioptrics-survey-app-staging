# Admin Home Page

A clean, modern admin home page for the Bioptrics Pulse platform.

## 📁 Structure

```
home/
├── index.tsx                 # Main page component
├── components/
│   ├── HeroSection.tsx      # Hero section with welcome message
│   ├── ToolCard.tsx         # Individual tool card component
│   └── ToolkitGrid.tsx      # Grid layout for tool cards
├── data/
│   └── toolsData.ts         # Tool data and TypeScript interfaces
└── README.md                # This file
```

## 🎨 Components

### HeroSection
- Light blue gradient background
- Welcome badge with home icon
- Main title and description
- Two action buttons (View Dashboard, Take a Tour)

### ToolCard
- Blue card with white text
- Badge indicator (POPULAR, FLEXIBLE, etc.)
- Icon display
- Title and description
- Stats display (Deployments, Success Rate)
- Key features list
- Setup time and time to insights
- Deploy button

### ToolkitGrid
- Section header with title and subtitle
- Responsive 3-column grid (2 columns on tablet, 1 on mobile)
- Displays all tools from toolsData

## 📊 Data Structure

Each tool has:
- `id`: Unique identifier
- `title`: Tool name
- `description`: Brief description
- `badge`: Status badge text
- `icon`: Emoji or icon
- `stats`: Deployments and success rate
- `features`: Array of key features
- `setupTime`: Estimated setup time
- `timeToInsights`: Time to get insights
- `buttonText`: CTA button text
- `color`: Card background color

## 🚀 Usage

The page is accessible at `/admin/home` and requires admin authentication.

## 🎯 Design Features

- Clean, modern design matching reference screenshots
- Responsive layout for all screen sizes
- Smooth hover effects on cards
- Professional color scheme with blue gradient
- Clear visual hierarchy
- Accessible and user-friendly

## 🔧 Customization

To add more tools:
1. Add new tool data to `data/toolsData.ts`
2. Follow the existing ToolData interface structure
3. The grid will automatically adjust

To modify styling:
- Edit styled-components in respective component files
- Colors and spacing are defined inline for easy customization
