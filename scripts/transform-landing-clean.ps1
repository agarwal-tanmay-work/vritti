# transform-landing-clean.ps1

$filesToProcess = @(
    "c:\Users\priya\OneDrive\Desktop\vritti\public\landing.html"
)
$filesToProcess += Get-ChildItem -Path "c:\Users\priya\OneDrive\Desktop\vritti\public\landing\assets" -Recurse -Filter "*.mjs" | Select-Object -ExpandProperty FullName

# Generate Vritti Logo SVG
$svgLogo = @"
<svg xmlns="http://www.w3.org/2000/svg" width="120" height="32" viewBox="0 0 120 32">
  <path d="M4 16 C4 9.373 9.373 4 16 4 C22.627 4 28 9.373 28 16 C28 22.627 22.627 28 16 28 C9.373 28 4 22.627 4 16 Z" fill="none" stroke="#387ED1" stroke-width="2"/>
  <path d="M12 12 Q16 6 20 12 T16 20 Q12 14 12 12 Z" fill="#387ED1"/>
  <text x="36" y="22" font-family="system-ui, sans-serif" font-size="18" font-weight="800" fill="#ffffff" letter-spacing="2">VRITTI</text>
</svg>
"@
[System.IO.File]::WriteAllText("c:\Users\priya\OneDrive\Desktop\vritti\public\landing\assets\vritti-logo.svg", $svgLogo)

$replacements = @(
    @{ Old = 'Aset'; New = 'Vritti'; CaseSensitive = $true }
    
    # Hero Sentences
    @{ Old = 'Investment Potential'; New = 'Trading Psychology' }
    @{ Old = 'Empowering Your Investments with AI Technology'; New = 'Understand Your Trading Psychology. Trade Smarter.' }
    
    # JS Safe Text nodes (using children:)
    @{ Old = 'children:"Our"'; New = 'children:"Vritti"' }
    @{ Old = 'children:"innovative"'; New = 'children:"analyzes"' }
    @{ Old = 'children:"AI"'; New = 'children:"your"' }
    @{ Old = 'children:"technology"'; New = 'children:"trading"' }
    @{ Old = 'children:"transforms"'; New = 'children:"journal"' }
    @{ Old = 'children:"asset"'; New = 'children:"to"' }
    @{ Old = 'children:"management"'; New = 'children:"reveal"' }
    @{ Old = 'children:"by"'; New = 'children:"behavioral"' }
    @{ Old = 'children:"analyzing"'; New = 'children:"patterns"' }
    @{ Old = 'children:"vast"'; New = 'children:"and"' }
    @{ Old = 'children:"data"'; New = 'children:"emotional"' }
    @{ Old = 'children:"sets"'; New = 'children:"biases."' }
    @{ Old = 'children:"in"'; New = 'children:"Built"' }
    @{ Old = 'children:"real-time."'; New = 'children:"for Zerodha."' }
    
    @{ Old = 'children:"Trusted"'; New = 'children:"Built"' }
    @{ Old = 'children:"already"'; New = 'children:"with"' }
    @{ Old = 'children:"1.2k+"'; New = 'children:"passion"' }

    # HTML Safe Text nodes (using > <)
    @{ Old = '>Our<'; New = '>Vritti<' }
    @{ Old = '>innovative<'; New = '>analyzes<' }
    @{ Old = '>AI<'; New = '>your<' }
    @{ Old = '>technology<'; New = '>trading<' }
    @{ Old = '>transforms<'; New = '>journal<' }
    @{ Old = '>asset<'; New = '>to<' }
    @{ Old = '>management<'; New = '>reveal<' }
    @{ Old = '>by<'; New = '>behavioral<' }
    @{ Old = '>analyzing<'; New = '>patterns<' }
    @{ Old = '>vast<'; New = '>and<' }
    @{ Old = '>data<'; New = '>emotional<' }
    @{ Old = '>sets<'; New = '>biases.<' }
    @{ Old = '>in<'; New = '>Built<' }
    @{ Old = '>real-time.<'; New = '>for Zerodha.<' }
    @{ Old = '>Trusted<'; New = '>Built<' }
    @{ Old = '>already<'; New = '>with<' }
    @{ Old = '>1\.2k\+<'; New = '>passion<' }

    # Long sentences
    @{ Old = 'Trusted by top innovative teams'; New = 'Inspired by Zerodha''s product philosophy' }
    @{ Old = 'Easier &amp; Smarter'; New = 'Analyze &amp; Improve' }
    @{ Old = 'Easier & Smarter'; New = 'Analyze & Improve' }
    @{ Old = 'This allows us to identify investment opportunities that maximize returns for our clients\.'; New = 'Upload your trading journal and get instant behavioral insights that help you become a more disciplined trader.' }

    @{ Old = 'Invest with Confidence\. Backed by Intelligence\.'; New = 'Your Trading Journal, Decoded.' }
    @{ Old = 'Precision-Driven Portfolio Growth'; New = 'Pattern Recognition' }
    @{ Old = 'Every move guided by data and insights for smarter portfolio growth\.'; New = 'Detect recurring behavioral patterns — revenge trading, overtrading, and position sizing mistakes.' }
    @{ Old = 'Diversified Assets'; New = 'Emotion Detection' }
    @{ Old = 'Tailor your portfolio to achieve optimal performance\.'; New = 'Identify emotional biases like FOMO entries, panic exits, and confirmation bias in your trades.' }
    @{ Old = 'Your Portfolio, Optimized in Real-Time'; New = 'Behavior Scoring' }
    @{ Old = 'Adjusted instantly with market changes to enhance investment efficiency\.'; New = 'Get a quantified discipline score based on rule adherence, risk management, and consistency.' }
    @{ Old = 'Maximize Returns, Minimize Effort'; New = 'Actionable Reports' }
    @{ Old = 'A fully automated investment system that saves you time and worry\.'; New = 'Export detailed PDF reports with specific improvement suggestions for your next trading session.' }

    @{ Old = 'Smarter Investing Starts Here'; New = 'Built Different' }
    @{ Old = 'Transparent Performance Tracking'; New = 'Visual Trade Analysis' }
    @{ Old = 'Monitor portfolio growth with real-time, easy-to-read analytics\.'; New = 'See your P&amp;L patterns, win rates, and holding periods visualized at a glance.' }
    @{ Old = 'Monitor portfolio growth with real-time, easy-to-read analytics.'; New = 'See your P&L patterns, win rates, and holding periods visualized at a glance.' }
    @{ Old = 'Seamless Asset Allocation'; New = 'Psychology-First Approach' }
    @{ Old = 'Balance investments across asset classes for better returns\.'; New = 'Most tools track numbers. Vritti tracks the trader behind them.' }
    @{ Old = 'Smart Risk Management'; New = 'Local-First Privacy' }
    @{ Old = 'AI analyzes volatility and trends to minimize risk exposure\.'; New = 'Your trade data never leaves your browser. All analysis happens entirely client-side.' }

    @{ Old = 'Smarter Investing\. '; New = 'Why Traders Choose ' }
    @{ Old = 'Stronger Outcomes'; New = 'Vritti' }

    @{ Old = 'AI-Powered Strategies'; New = 'One-Click Upload' }
    @{ Old = 'Adaptive strategies driven by real-time machine learning\.'; New = 'Drop your broker CSV and get a complete trading psychology report in seconds.' }

    @{ Old = 'Real-Time Insights'; New = 'Live Market Feed' }
    @{ Old = 'Access blockchain data in real-time to make timely and informed decisions\.'; New = 'Real-time Nifty and Sensex data via Yahoo Finance keeps you connected to the market.' }

    @{ Old = 'Portfolio Optimization'; New = 'Win Rate Breakdown' }
    @{ Old = 'Advanced algorithms fine-tune your portfolio for maximum efficiency\.'; New = 'See exactly which setups, timeframes, and instruments work best for your style.' }

    @{ Old = 'Automated Execution'; New = 'Session Analysis' }
    @{ Old = 'Set up automated strategies that execute trades instantly\.'; New = 'Morning vs afternoon, Monday vs Friday — find your optimal trading windows.' }

    @{ Old = 'Adaptive Risk Management'; New = 'Streak Detection' }
    @{ Old = 'Intelligent risk assessment adjusts portfolios as markets evolve\.'; New = 'Identify winning and losing streaks to understand momentum in your trading behavior.' }

    @{ Old = 'Performance Tracking'; New = 'Export &amp; Share' }
    @{ Old = 'Performance Tracking'; New = 'Export & Share' }
    @{ Old = 'Monitor and track returns with clear, real-time performance dashboards\.'; New = 'Generate beautiful PDF reports to track your progress or share with a mentor.' }

    @{ Old = 'Start Investing Smarter Today'; New = 'Start Analyzing Your Trades' }
    @{ Old = 'Take control of your financial future with cutting-edge AI solutions\.'; New = 'Upload your trading journal and discover the behavioral patterns shaping your results.' }

    # MENU ITEMS (SAFE)
    @{ Old = 'children:"Feature"'; New = 'children:"Home"' }
    @{ Old = 'children:"Benefit"'; New = 'children:"Analyse"' }
    @{ Old = 'children:"Pricing "'; New = 'children:"Dashboard"' }
    @{ Old = 'children:"Pricing"'; New = 'children:"Dashboard"' }
    @{ Old = 'children:"Testimonials"'; New = 'children:"About"' }
    
    @{ Old = '>Feature<'; New = '>Home<' }
    @{ Old = '>Benefit<'; New = '>Analyse<' }
    @{ Old = '>Pricing <'; New = '>Dashboard<' }
    @{ Old = '>Pricing<'; New = '>Dashboard<' }
    @{ Old = '>Testimonials<'; New = '>About<' }

    @{ Old = 'href="\.\/#feature"'; New = 'href="/"' }
    @{ Old = 'href="\.\/#benefit"'; New = 'href="/analyse"' }
    @{ Old = 'href="\.\/#pricing"'; New = 'href="/dashboard"' }
    @{ Old = 'href="\.\/#testimonials"'; New = 'href="/about"' }

    # BUTTON LINKS (Global)
    @{ Old = 'https://www\.framer\.com[^"]*'; New = '/analyse' }
    @{ Old = 'https://easyframe\.framer\.website/[^"]*'; New = '/analyse' }
    @{ Old = 'https://x\.com/[^"]*'; New = '#' }
    @{ Old = 'https://www\.instagram\.com/[^"]*'; New = '#' }

    # LOGO REPLACEMENT
    @{ Old = 'https://framerusercontent\.com/images/gOsJcUiwgECyEWLiy4l2QKLtA\.png'; New = '/landing/assets/vritti-logo.svg' }
    @{ Old = 'https://framerusercontent\.com/images/bHaLKWrT8eZhZ9zH17HNsVkPexM\.png'; New = '/landing/assets/vritti-logo.svg' }
    @{ Old = 'https://framerusercontent\.com/images/cMSxpaeXFJBvmYAzlldwCL2f25E\.png'; New = '/landing/assets/vritti-logo.svg' }
)

$htmlReplacements = @(
    @{ Old = '"/assets/'; New = '"/landing/assets/' }
    @{ Old = "'/assets/"; New = "'/landing/assets/" }
    @{ Old = "url\('/assets/"; New = "url('/landing/assets/" }
    @{ Old = 'url\("/assets/'; New = 'url("/landing/assets/' }
    @{ Old = 'src="/assets/'; New = 'src="/landing/assets/' }
    @{ Old = '"/landing/landing/'; New = '"/landing/' }
    
    @{ Old = '(href="/analyse"[^>]*) target="_blank"'; New = '$1' }
    @{ Old = '(href="/about"[^>]*) target="_blank"'; New = '$1' }
    @{ Old = '(href="/dashboard"[^>]*) target="_blank"'; New = '$1' }
    @{ Old = '(href="/"[^>]*) target="_blank"'; New = '$1' }
    
    @{ Old = '(href="/analyse"[^>]*) rel="noopener"'; New = '$1' }
    @{ Old = '(href="/about"[^>]*) rel="noopener"'; New = '$1' }
    @{ Old = '(href="/dashboard"[^>]*) rel="noopener"'; New = '$1' }
    @{ Old = '(href="/"[^>]*) rel="noopener"'; New = '$1' }

    @{ Old = 'content="Aset[^"]*"'; New = 'content="Vritti — Trading Psychology Analysis Tool"' }
)

# 1. Restore from original (Wipe bad state)
Copy-Item -Path "C:\Users\priya\Downloads\25165040-450e-4482-8db0-88aaca809d17\assets\*" -Destination "c:\Users\priya\OneDrive\Desktop\vritti\public\landing\assets\" -Recurse -Force
Copy-Item -Path "C:\Users\priya\Downloads\25165040-450e-4482-8db0-88aaca809d17\index.html" -Destination "c:\Users\priya\OneDrive\Desktop\vritti\public\landing.html" -Force

# 2. Process all files
foreach ($file in $filesToProcess) {
    if (Test-Path $file) {
        $content = [System.IO.File]::ReadAllText($file)
        $originalContent = $content
        
        foreach ($r in $replacements) {
            if ($r.CaseSensitive) {
                $content = $content -creplace $r.Old, $r.New
            } else {
                $content = $content -replace $r.Old, $r.New
            }
        }
        
        if ($file -match 'landing\.html') {
            foreach ($r in $htmlReplacements) {
                $content = $content -replace $r.Old, $r.New
            }
            
            # 3. CSS Injection to safely hide elements
            $style = @"
<style>
/* Hide unwanted sections safely */
#pricing, #testimonials, #metrics, 
[data-framer-name='Social Trust'], 
[data-framer-name='Company logos'], 
[data-framer-name='Metrics Section'], 
[data-framer-name='Pricing Section'], 
[data-framer-name='Testimonials Section'],
[data-framer-name='Footer'],
[data-framer-name='Social'],
[data-framer-name='FAQ'] { 
    display: none !important; 
}

/* Hide the 5th menu item (FAQ) from the desktop/tablet navbar */
[data-framer-name='Menu Item']:nth-child(5) {
    display: none !important;
}
</style>
"@
            $content = $content -replace "</head>", "$style</head>"
        }
        
        if ($content -cne $originalContent) {
            [System.IO.File]::WriteAllText($file, $content)
            Write-Host "Updated: $file"
        }
    }
}
Write-Host "Clean fix applied!"
