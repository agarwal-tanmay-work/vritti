# transform-landing-final.ps1

$filesToProcess = @(
    "c:\Users\priya\OneDrive\Desktop\vritti\public\landing.html"
)
$filesToProcess += Get-ChildItem -Path "c:\Users\priya\OneDrive\Desktop\vritti\public\landing\assets" -Recurse -Filter "*.mjs" | Select-Object -ExpandProperty FullName

$replacements = @(
    @{ Old = 'Aset'; New = 'Vritti'; CaseSensitive = $true }
    
    # ── HERO SECTION ──
    @{ Old = 'Investment Potential'; New = 'Trading Psychology' }
    @{ Old = 'Empowering Your Investments with AI Technology'; New = 'Understand Your Trading Psychology. Trade Smarter.' }
    
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
    
    @{ Old = '"Our"'; New = '"Vritti"' }
    @{ Old = '"innovative"'; New = '"analyzes"' }
    @{ Old = '"AI"'; New = '"your"' }
    @{ Old = '"technology"'; New = '"trading"' }
    @{ Old = '"transforms"'; New = '"journal"' }
    @{ Old = '"asset"'; New = '"to"' }
    @{ Old = '"management"'; New = '"reveal"' }
    @{ Old = '"by"'; New = '"behavioral"' }
    @{ Old = '"analyzing"'; New = '"patterns"' }
    @{ Old = '"vast"'; New = '"and"' }
    @{ Old = '"data"'; New = '"emotional"' }
    @{ Old = '"sets"'; New = '"biases."' }
    @{ Old = '"in"'; New = '"Built"' }
    @{ Old = '"real-time."'; New = '"for Zerodha."' }

    @{ Old = '>Trusted<'; New = '>Built<' }
    @{ Old = '>already<'; New = '>with<' }
    @{ Old = '>1\.2k\+<'; New = '>passion<' }
    @{ Old = '"Trusted"'; New = '"Built"' }
    @{ Old = '"already"'; New = '"with"' }
    @{ Old = '"1.2k+"'; New = '"passion"' }

    # ── INTRO SECTION ──
    @{ Old = 'Trusted by top innovative teams'; New = 'Inspired by Zerodha''s product philosophy' }
    @{ Old = 'Easier &amp; Smarter'; New = 'Analyze &amp; Improve' }
    @{ Old = 'Easier & Smarter'; New = 'Analyze & Improve' }
    @{ Old = 'This allows us to identify investment opportunities that maximize returns for our clients\.'; New = 'Upload your trading journal and get instant behavioral insights that help you become a more disciplined trader.' }

    # ── BENTO SECTION ──
    @{ Old = 'Invest with Confidence\. Backed by Intelligence\.'; New = 'Your Trading Journal, Decoded.' }
    @{ Old = 'Precision-Driven Portfolio Growth'; New = 'Pattern Recognition' }
    @{ Old = 'Every move guided by data and insights for smarter portfolio growth\.'; New = 'Detect recurring behavioral patterns — revenge trading, overtrading, and position sizing mistakes.' }
    @{ Old = 'Diversified Assets'; New = 'Emotion Detection' }
    @{ Old = 'Tailor your portfolio to achieve optimal performance\.'; New = 'Identify emotional biases like FOMO entries, panic exits, and confirmation bias in your trades.' }
    @{ Old = 'Your Portfolio, Optimized in Real-Time'; New = 'Behavior Scoring' }
    @{ Old = 'Adjusted instantly with market changes to enhance investment efficiency\.'; New = 'Get a quantified discipline score based on rule adherence, risk management, and consistency.' }
    @{ Old = 'Maximize Returns, Minimize Effort'; New = 'Actionable Reports' }
    @{ Old = 'A fully automated investment system that saves you time and worry\.'; New = 'Export detailed PDF reports with specific improvement suggestions for your next trading session.' }

    # ── FEATURE SECTION ──
    @{ Old = 'Smarter Investing Starts Here'; New = 'Built Different' }
    @{ Old = 'Transparent Performance Tracking'; New = 'Visual Trade Analysis' }
    @{ Old = 'Monitor portfolio growth with real-time, easy-to-read analytics\.'; New = 'See your P&amp;L patterns, win rates, and holding periods visualized at a glance.' }
    @{ Old = 'Monitor portfolio growth with real-time, easy-to-read analytics.'; New = 'See your P&L patterns, win rates, and holding periods visualized at a glance.' }
    @{ Old = 'Seamless Asset Allocation'; New = 'Psychology-First Approach' }
    @{ Old = 'Balance investments across asset classes for better returns\.'; New = 'Most tools track numbers. Vritti tracks the trader behind them.' }
    @{ Old = 'Smart Risk Management'; New = 'Local-First Privacy' }
    @{ Old = 'AI analyzes volatility and trends to minimize risk exposure\.'; New = 'Your trade data never leaves your browser. All analysis happens entirely client-side.' }

    # ── BENEFIT SECTION ──
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

    # ── PRICING SECTION ──
    @{ Old = 'Find Your Perfect Plan'; New = 'How It Works' }
    @{ Old = 'Choose the plan that fits your investment goals and risk appetite\.'; New = 'Three simple steps to better trading psychology.' }

    @{ Old = '>Core Plan<'; New = '>Step 1: Upload<' }
    @{ Old = '"Core Plan"'; New = '"Step 1: Upload"' }
    @{ Old = '>\$99<'; New = '><' }
    @{ Old = '"$99"'; New = '""' }
    @{ Old = '>/Month<'; New = '><' }
    @{ Old = '"/Month"'; New = '""' }
    @{ Old = 'Basic AI portfolio management'; New = 'Export trades from your broker (Zerodha, Groww, etc.)' }
    @{ Old = 'Monthly portfolio rebalancing'; New = 'Upload the CSV file to Vritti' }
    @{ Old = 'Access to market insights'; New = 'Works with any standard trade format' }
    @{ Old = '0\.4% management fee'; New = '100% free, no signup required' }

    @{ Old = '>Vision Plan<'; New = '>Step 2: Analyze<' }
    @{ Old = '"Vision Plan"'; New = '"Step 2: Analyze"' }
    @{ Old = '>Best Value<'; New = '>Core Feature<' }
    @{ Old = '"Best Value"'; New = '"Core Feature"' }
    @{ Old = '>\$2,099<'; New = '><' }
    @{ Old = '"$2,099"'; New = '""' }
    @{ Old = 'Everything in Core, plus:'; New = 'Vritti processes your data locally:' }
    @{ Old = 'Weekly AI rebalancing'; New = 'Behavioral pattern detection' }
    @{ Old = 'Dedicated investment advisor'; New = 'Emotion and bias identification' }
    @{ Old = 'Custom risk strategies'; New = 'Win rate and P&amp;L analysis' }
    @{ Old = 'Custom risk strategies'; New = 'Win rate and P&L analysis' }
    @{ Old = 'Priority customer support'; New = 'Discipline scoring and recommendations' }

    # ── TESTIMONIALS ──
    @{ Old = 'Trusted by Forward-Thinking Investors'; New = 'Why I Built This' }

    @{ Old = 'Using AI for trading was a game changer\. Vritti helped me grow 32% in 6 months\.'; New = 'I built Vritti because I believe the best trading tool is the one that makes you a better trader, not just a faster one.' }
    @{ Old = 'Using AI for trading was a game changer\. Aset helped me grow 32% in 6 months\.'; New = 'I built Vritti because I believe the best trading tool is the one that makes you a better trader, not just a faster one.' }
    @{ Old = "Their AI-driven asset management is the best I've used\. Consistent and reliable\."; New = 'Zerodha showed me that great products respect their users. Vritti is my attempt to embody that philosophy.' }
    @{ Old = 'Their AI-driven asset management is the best I’ve used\. Consistent and reliable\.'; New = 'Zerodha showed me that great products respect their users. Vritti is my attempt to embody that philosophy.' }
    @{ Old = 'Risk management features saved me during market volatility\. Highly recommend\.'; New = 'Most trading tools focus on execution speed. I wanted to build something that focuses on the human behind the trades.' }
    @{ Old = "Vritti's insights helped me make smarter investments\. Returns have exceeded expectations\."; New = 'Every trader has patterns they cannot see. Vritti makes those invisible patterns visible and actionable.' }
    @{ Old = "Aset's insights helped me make smarter investments\. Returns have exceeded expectations\."; New = 'Every trader has patterns they cannot see. Vritti makes those invisible patterns visible and actionable.' }
    @{ Old = 'Vritti’s insights helped me make smarter investments\. Returns have exceeded expectations\.'; New = 'Every trader has patterns they cannot see. Vritti makes those invisible patterns visible and actionable.' }
    @{ Old = 'Aset’s insights helped me make smarter investments\. Returns have exceeded expectations\.'; New = 'Every trader has patterns they cannot see. Vritti makes those invisible patterns visible and actionable.' }
    @{ Old = 'The seamless experience from portfolio setup to tracking is unmatched in the market\.'; New = 'This project is my application to join the team at Zerodha that I admire most - building tools that empower individual investors.' }
    @{ Old = "AI analysis of market trends has given me a real edge\. Couldn't be happier\."; New = 'Trading psychology is the last frontier. The data is already in your journal - you just need the right lens to see it.' }
    @{ Old = 'AI analysis of market trends has given me a real edge\. Couldn’t be happier\.'; New = 'Trading psychology is the last frontier. The data is already in your journal - you just need the right lens to see it.' }

    @{ Old = '>Mark T\.<'; New = '>Priya<' }
    @{ Old = '"Mark T."'; New = '"Priya"' }
    @{ Old = '>Sarah L\.<'; New = '>The Builder<' }
    @{ Old = '"Sarah L."'; New = '"The Builder"' }
    @{ Old = '>James K\.<'; New = '>On Discipline<' }
    @{ Old = '"James K."'; New = '"On Discipline"' }
    @{ Old = '>Anna P\.<'; New = '>On Patterns<' }
    @{ Old = '"Anna P."'; New = '"On Patterns"' }
    @{ Old = '>David R\.<'; New = '>On Zerodha<' }
    @{ Old = '"David R."'; New = '"On Zerodha"' }
    @{ Old = '>Linda W\.<'; New = '>On Psychology<' }
    @{ Old = '"Linda W."'; New = '"On Psychology"' }
    
    @{ Old = 'Product Manager'; New = 'Creator of Vritti' }
    @{ Old = 'Wealth Advisor'; New = 'Product Philosophy' }
    @{ Old = 'AI Engineer'; New = 'Trading Insight' }
    @{ Old = 'Financial Analyst'; New = 'Pattern Analysis' }
    @{ Old = 'Operations Director'; New = 'Zerodha Intern Application' }
    @{ Old = 'Investment Strategist'; New = 'The Mission' }

    # ── CTA SECTION ──
    @{ Old = 'Start Investing Smarter Today'; New = 'Start Analyzing Your Trades' }
    @{ Old = 'Take control of your financial future with cutting-edge AI solutions\.'; New = 'Upload your trading journal and discover the behavioral patterns shaping your results.' }

    # ── FAQ SECTION ──
    @{ Old = 'Frequently Asked Questions'; New = 'Questions About Vritti' }
    @{ Old = 'Find answers to common questions about our AI-powered asset management platform\.'; New = 'Everything you need to know about how Vritti analyzes your trading journal.' }

    @{ Old = 'How does AI improve my investments\?'; New = 'How does Vritti analyze my trades?' }
    @{ Old = 'Our AI continuously analyzes market trends, risk factors, and portfolio performance to optimize your investments\. It identifies patterns and opportunities that would be difficult to spot manually, helping you make more informed decisions\.'; New = 'You upload a CSV export from your broker (Zerodha, Groww, Angel One, etc.). Vritti parses each trade and runs behavioral pattern analysis entirely in your browser — identifying biases, streaks, timing patterns, and discipline metrics.' }

    @{ Old = 'What is the minimum investment amount\?'; New = 'Is my data safe?' }
    @{ Old = 'You can start with any amount that suits your budget\. Our Core Plan has no minimum investment requirement, while the Vision Plan is designed for investors looking for more comprehensive management with a minimum of \$10,000\.'; New = 'Yes. Vritti is 100% local-first. Your trade data never leaves your browser. There are no servers storing your information, no accounts to create, and no tracking. Everything runs client-side in JavaScript.' }

    @{ Old = 'How often is my portfolio rebalanced\?'; New = 'What brokers are supported?' }
    @{ Old = 'Rebalancing frequency depends on your plan\. Core Plan users receive monthly rebalancing, while Vision Plan users benefit from weekly AI-driven rebalancing to keep your portfolio aligned with market conditions\.'; New = 'Vritti works with any broker that exports trades as CSV. It has been tested with Zerodha (Console), Groww, Angel One, and Upstox. If your CSV has columns for date, instrument, quantity, price, and type — it will work.' }

    @{ Old = 'Can I withdraw my funds at any time\?'; New = 'Is Vritti free?' }
    @{ Old = 'Yes, you have full control over your investments\. You can withdraw your funds at any time without any lock-in period or penalties\. We believe in giving you complete flexibility with your finances\.'; New = 'Yes, completely free. Vritti is an open-source project built as part of a Zerodha AI internship application. There are no paid tiers, no premium features, and no ads.' }

    @{ Old = 'What security measures are in place\?'; New = 'Who built this and why?' }
    @{ Old = 'We employ bank-level encryption, multi-factor authentication, and continuous monitoring to protect your data and investments\. Our platform undergoes regular security audits to ensure the highest level of protection for our users\.'; New = 'Vritti was built by a developer passionate about Zerodha''s product philosophy — the belief that technology should empower individual investors, not extract from them. This project is a demonstration of that principle applied to trading psychology.' }

    # ── MENU ITEMS & LINKS ──
    @{ Old = '>Feature<'; New = '>Home<' }
    @{ Old = '"Feature"'; New = '"Home"' }
    
    @{ Old = '>Benefit<'; New = '>Analyse<' }
    @{ Old = '"Benefit"'; New = '"Analyse"' }
    
    @{ Old = '>Pricing <'; New = '>Dashboard<' }
    @{ Old = '"Pricing "'; New = '"Dashboard"' }
    @{ Old = '>Pricing<'; New = '>Dashboard<' }
    @{ Old = '"Pricing"'; New = '"Dashboard"' }
    
    @{ Old = '>Testimonials<'; New = '>About<' }
    @{ Old = '"Testimonials"'; New = '"About"' }
    
    @{ Old = 'href="\.\/#feature"'; New = 'href="/"' }
    @{ Old = 'href="\.\/#benefit"'; New = 'href="/analyse"' }
    @{ Old = 'href="\.\/#pricing"'; New = 'href="/dashboard"' }
    @{ Old = 'href="\.\/#testimonials"'; New = 'href="/about"' }
    
    # ── EXTERNAL LINKS (Get Started / Learn More buttons) ──
    # Regex to catch framer links and x links
    @{ Old = 'https://www\.framer\.com[^"]*'; New = '/analyse' }
    @{ Old = 'https://easyframe\.framer\.website/[^"]*'; New = '/analyse' }
    @{ Old = 'https://x\.com/[^"]*'; New = '#' }
    @{ Old = 'https://www\.instagram\.com/[^"]*'; New = '#' }
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

# 1. Restore from original
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
            
            # 3. CSS Injection to hide elements and update logo
            $style = @"
<style>
/* Hide unwanted sections */
#pricing, #testimonials, #metrics, 
[data-framer-name='Social Trust'], 
[data-framer-name='Company logos'], 
[data-framer-name='Metrics Section'], 
[data-framer-name='Pricing Section'], 
[data-framer-name='Testimonials Section'],
[data-framer-name='Footer'],
[data-framer-name='Social'] { 
    display: none !important; 
}

/* Hide the 5th menu item (FAQ) from the desktop/tablet navbar */
[data-framer-name='Menu Item']:nth-child(5) {
    display: none !important;
}

/* Update the Logo */
[data-framer-name='Logo'] img, 
[data-framer-name='Logo'] svg { 
    display: none !important; 
}
[data-framer-name='Logo']::after { 
    content: 'VRITTI'; 
    font-family: 'Space Grotesk', monospace; 
    font-size: 18px; 
    font-weight: 700; 
    color: #ffffff; 
    letter-spacing: 2px; 
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
Write-Host "Final fixes applied."
