# Vritti - Know Your Trading Mind

Vritti is a behavioural analysis tool for retail stock market investors. Upload your Zerodha trade book and Vritti analyses every trade for 13 psychological biases including panic selling, FOMO buying, loss aversion, revenge trading, overconfidence, and more. It then gives you a Behaviour Score and a plain English report showing exactly what you keep doing wrong and when.

## Features

- **13 Psychological Biases Detected**: Panic Selling, FOMO Buying, Loss Aversion, Overtrading, Herd Behavior, Revenge Trading, Recency Bias, Overconfidence, Sector Concentration, Sunk Cost Fallacy, Calendar Effect, Information Overload, Disposition Effect
- **Behaviour Score**: A single number from 0 to 100 that tells you how rationally you've been trading and what to fix first
- **Zerodha Integration**: Built specifically for Zerodha Kite users with support for Trade Book and Tax P&L exports
- **Privacy First**: Everything runs entirely in your browser. Your CSV file is never uploaded to any server
- **Visual Reports**: Beautiful charts and visualizations including radar charts, timelines, and quadrant analysis
- **Counterfactual Analysis**: See what your portfolio would look like if you traded without your biases
- **Export Reports**: Generate professional PDF reports of your analysis

## Tech Stack

- **Frontend**: React 19, React Router 7
- **Styling**: Tailwind CSS 4
- **Animations**: Framer Motion 12
- **Charts**: Recharts 3
- **Icons**: Lucide React
- **File Processing**: PapaParse (CSV), XLSX (Excel)
- **Build Tool**: Vite 8
- **Deployment**: Vercel

## Architecture

### Component Structure

```
src/
├── components/          # Reusable UI components
│   ├── Navbar.jsx      # Navigation bar
│   ├── Footer.jsx      # Footer component
│   ├── ScrollProgress.jsx  # Scroll progress indicator
│   ├── BehaviourScore.jsx  # Score display component
│   ├── BehaviourPhilosophy.jsx  # Philosophy explanation
│   ├── BiasCard.jsx    # Individual bias card
│   ├── NudgeFeed.jsx   # Nudge notifications
│   ├── TradeTimeline.jsx  # Trade timeline visualization
│   ├── HoldingTable.jsx  # Holdings table
│   └── VrittiLogo.jsx  # Logo component
├── pages/              # Page components
│   ├── Home.jsx        # Landing page
│   ├── Analyse.jsx     # File upload and analysis page
│   ├── Dashboard.jsx   # Results dashboard
│   ├── ReportPrint.jsx # Print/export report page
│   ├── About.jsx       # About builder page
│   └── NotFound.jsx    # 404 page
├── utils/              # Utility functions
│   ├── analyseTrader.js  # Core analysis logic
│   ├── parseCSV.js     # CSV/XLSX parsing
│   ├── counterfactual.js  # Counterfactual analysis
│   └── storage.js      # Local storage management
├── workers/            # Web workers
│   └── analyser.worker.js  # Background analysis worker
├── data/               # Sample data
│   └── sampleTrades.js  # Demo trade data
└── App.jsx            # Main app component with routing
```

### Data Flow

```
User Uploads File
    ↓
parseCSV.js (Parses CSV/XLSX)
    ↓
analyseTrader.js (Analyzes trades for biases)
    ↓
Dashboard.jsx (Displays results)
    ↓
ReportPrint.jsx (Exports report)
```

### Analysis Pipeline

1. **File Parsing**: parseCSV.js handles CSV and XLSX files with automatic format detection
2. **Trade Matching**: Matches BUY-SELL pairs to determine completed trades
3. **Bias Detection**: analyseTrader.js runs 13 different bias detection algorithms
4. **Scoring**: Calculates weighted bias scores to determine Behaviour Score
5. **Visualization**: Recharts renders charts and graphs
6. **Export**: ReportPrint.jsx generates professional PDF reports

## Animations & Motions

Vritti uses Framer Motion for smooth, professional animations:

- **Page Transitions**: Smooth fade-in animations when navigating between pages
- **Scroll Reveals**: Elements animate into view as you scroll
- **Hover Effects**: Cards and buttons have subtle hover animations
- **Loading States**: Professional loading animations during analysis
- **Chart Animations**: Charts animate smoothly when data loads

### Animation Examples

```jsx
// Page fade transition
<motion.div
  initial={{ opacity: 0, y: 20 }}
  animate={{ opacity: 1, y: 0 }}
  transition={{ duration: 0.5 }}
>
  <Home />
</motion.div>

// Scroll reveal
useEffect(() => {
  const observer = new IntersectionObserver(
    (entries) => entries.forEach((e) => {
      if (e.isIntersecting) e.target.classList.add('visible');
    }),
    { threshold: 0.1 }
  );
  document.querySelectorAll('.reveal').forEach((el) => observer.observe(el));
  return () => observer.disconnect();
}, []);
```

## Getting Started

### Prerequisites

- Node.js 18 or higher
- npm or yarn

### Installation

```bash
# Clone the repository
git clone https://github.com/agarwal-tanmay-work/vritti.git
cd vritti

# Install dependencies
npm install

# Run development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

## Deployment

### Deploy to Vercel

1. **Push to GitHub**:
```bash
git add .
git commit -m "Your commit message"
git push origin main
```

2. **Deploy on Vercel**:
   - Go to [vercel.com](https://vercel.com)
   - Click "Add New Project"
   - Import your GitHub repository
   - Vercel will automatically detect it as a Vite project
   - Click "Deploy"

3. **Configuration**:
   - Build Command: `npm run build`
   - Output Directory: `dist`
   - Install Command: `npm install`

### Manual Deployment Steps

1. Create a Vercel account at [vercel.com](https://vercel.com)
2. Install Vercel CLI: `npm install -g vercel`
3. Login: `vercel login`
4. Deploy: `vercel` from project root
5. Follow the prompts to configure your project

## Supported File Formats

Vritti accepts Zerodha Trade Book and Tax P&L files in CSV/XLS/XLSX format.

### Trade Book Format
Required columns:
- symbol
- trade_type (BUY/SELL)
- quantity
- price
- date (any date column)

### Tax P&L Format
For Tax P&L, use the Tradewise Exits sheet with columns:
- Symbol
- Entry Date
- Exit Date
- Quantity
- Buy Value
- Sell Value
- Profit

## Privacy & Security

- **Client-Side Only**: All analysis runs in your browser
- **No Server Upload**: Your data never leaves your device
- **No Tracking**: No analytics or tracking
- **Local Storage**: Analysis results stored in browser local storage only
- **Zero Backend**: Vritti is a pure frontend application

## Performance

- **Web Workers**: Analysis runs in background worker to keep UI responsive
- **Lazy Loading**: Components loaded on demand
- **Code Splitting**: Optimized bundle sizes
- **Large File Support**: Handles tradebooks up to 32 MB

## Browser Support

- Chrome (recommended)
- Firefox
- Safari
- Edge

## Contributing

This is a personal project by Tanmay Agarwal. For inquiries, reach out via LinkedIn or GitHub.

## License

MIT License - feel free to use this as inspiration for your own projects.

## Credits

- Built by Tanmay Agarwal
- Inspired by Nithin Kamath's vision for AI in retail investing
- Powered by Zerodha Varsity educational content
