# transform-landing-safe.ps1 — FINAL v4
# Fixes: preserves button styling using safe text node replacement, single About nav item, Inter typography for Kite feel

$landingHtml = "c:\Users\priya\OneDrive\Desktop\vritti\public\landing.html"
$jsDir = "c:\Users\priya\OneDrive\Desktop\vritti\public\landing\assets\framerusercontent.com\sites\62HtFBsvbMzbo3FQLbfKxo"

# ── 1. Restore originals ──
Copy-Item -Path "C:\Users\priya\Downloads\25165040-450e-4482-8db0-88aaca809d17\assets\*" `
           -Destination "c:\Users\priya\OneDrive\Desktop\vritti\public\landing\assets\" -Recurse -Force
Copy-Item -Path "C:\Users\priya\Downloads\25165040-450e-4482-8db0-88aaca809d17\index.html" `
           -Destination $landingHtml -Force
Write-Host "Restored clean originals."

# ── 2. Safe JS replacements (only children:"..." text nodes) ──
$jsFiles = Get-ChildItem -Path $jsDir -Filter "*.mjs" | Select-Object -ExpandProperty FullName

$jsReplacements = @(
    # Brand
    @{ Old = 'children:"Aset"';  New = 'children:"Vritti"' }

    # NAV MENU: 
    # Original order: Home(1), Feature(2), Benefit(3), Pricing(4), Testimonials(5), FAQ(6)
    # Target:  Home(1), Analyse(2), Dashboard(3), About(4), [hidden](5), [hidden](6)
    @{ Old = 'children:"Feature"';       New = 'children:"Analyse"' }
    @{ Old = 'children:"Benefit"';       New = 'children:"Dashboard"' }
    @{ Old = 'children:"Pricing "';      New = 'children:"About"' }
    @{ Old = 'children:"Pricing"';       New = 'children:"About"' }
    @{ Old = 'children:"Get Started"';   New = 'children:"Analyse"' }
    @{ Old = 'children:"Learn More"';    New = 'children:"Dashboard"' }
    # Testimonials and FAQ are hidden via CSS — no need to rename

    # Hero
    @{ Old = 'children:"Empowering Your Investments with AI Technology"'; New = 'children:"Understand Your Trading Psychology. Trade Smarter."' }
    @{ Old = 'children:"investment potential"'; New = 'children:"trading psychology"' }

    # Intro
    @{ Old = 'children:"Trusted already by 1.2k+"';       New = 'children:"Built for serious retail traders in India"' }
    @{ Old = 'children:"Trusted by top innovative teams"'; New = 'children:"Built as a Zerodha internship project"' }
    @{ Old = 'children:"Easier & Smarter"';                New = 'children:"Analyze & Improve"' }

    # Bento
    @{ Old = 'children:"Invest with Confidence. Backed by Intelligence."'; New = 'children:"Your Trading Journal, Decoded."' }
    @{ Old = 'children:"Precision-Driven Portfolio Growth"'; New = 'children:"Pattern Recognition"' }
    @{ Old = 'children:"Every move guided by data and insights for smarter portfolio growth."'; New = 'children:"Detect recurring behavioral patterns like revenge trading, overtrading, and position sizing mistakes."' }
    @{ Old = 'children:"Diversified Assets "'; New = 'children:"Emotion Detection"' }
    @{ Old = 'children:"Tailor your portfolio to achieve optimal performance."'; New = 'children:"Identify emotional biases like FOMO entries, panic exits, and confirmation bias."' }
    @{ Old = 'children:"Your Portfolio, Optimized in Real-Time"'; New = 'children:"Behavior Scoring"' }
    @{ Old = 'children:"Adjusted instantly with market changes to enhance investment efficiency."'; New = 'children:"Get a quantified discipline score based on rule adherence, risk management, and consistency."' }
    @{ Old = 'children:"Maximize Returns, Minimize Effort"'; New = 'children:"Actionable Reports"' }
    @{ Old = 'children:"A fully automated investment system that saves you time and worry."'; New = 'children:"Export detailed PDF reports with specific improvement suggestions for your next trading session."' }

    # Feature section
    @{ Old = 'children:"Smarter Investing Starts Here"'; New = 'children:"Built for Behavioral Edge"' }
    @{ Old = 'children:"Transparent Performance Tracking"'; New = 'children:"Visual Trade Analysis"' }
    @{ Old = 'children:"Monitor portfolio growth with real-time, easy-to-read analytics."'; New = 'children:"See your P&L patterns, win rates, and holding periods visualized at a glance."' }
    @{ Old = 'children:"Seamless Asset Allocation"'; New = 'children:"Psychology-First Approach"' }
    @{ Old = 'children:"Balance investments across asset classes for better returns."'; New = 'children:"Most tools track numbers. Vritti tracks the trader behind them."' }
    @{ Old = 'children:"Smart Risk Management"'; New = 'children:"Local-First Privacy"' }
    @{ Old = 'children:"AI analyzes volatility and trends to minimize risk exposure."'; New = 'children:"Your trade data never leaves your browser. All analysis happens entirely client-side."' }

    # Metrics
    @{ Old = 'children:"Performance You Can Measure"'; New = 'children:"Privacy You Can Trust"' }
    @{ Old = 'children:"$250M+"';    New = 'children:"0 bytes"' }
    @{ Old = 'children:"Assets Managed"'; New = 'children:"Data Uploaded to Servers"' }

    # Testimonials
    @{ Old = 'children:"Trusted by Forward-Thinking Investors"'; New = 'children:"Why I Built Vritti"' }

    # Pricing
    @{ Old = 'children:"Pricing Options"'; New = 'children:"How Vritti Works"' }

    # Company logos
    @{ Old = 'children:"Aegra"';    New = 'children:"Zerodha"' }
    @{ Old = 'children:"Altoris"';  New = 'children:"Groww"' }
    @{ Old = 'children:"Finyon"';   New = 'children:"Angel One"' }
    @{ Old = 'children:"Fundara"';  New = 'children:"Upstox"' }
    @{ Old = 'children:"Portivio"'; New = 'children:"5Paisa"' }
    @{ Old = 'children:"Quantora"'; New = 'children:"Dhan"' }
    @{ Old = 'children:"Vaultic"';  New = 'children:"HDFC Sky"' }
    @{ Old = 'children:"Wealthro"'; New = 'children:"Motilal"' }
    @{ Old = 'children:"Future-Forward Solutions"'; New = 'children:"Works with all major Indian brokers"' }
    @{ Old = 'children:"Our Web3 fintech simplifies complex finance for all to access."'; New = 'children:"Export your trades as CSV from any of these brokers and upload to Vritti."' }
)

foreach ($file in $jsFiles) {
    $content = [System.IO.File]::ReadAllText($file)
    $orig = $content
    foreach ($r in $jsReplacements) {
        $content = $content.Replace($r.Old, $r.New)
    }
    if ($content -ne $orig) {
        [System.IO.File]::WriteAllText($file, $content)
        Write-Host "Updated: $file"
    }
}

# ── 3. Fix landing.html ──
$html = [System.IO.File]::ReadAllText($landingHtml)

# Fix asset paths
$html = $html -replace '"/assets/', '"/landing/assets/'
$html = $html -replace "'/assets/", "'/landing/assets/"
$html = $html -replace "url\('/assets/", "url('/landing/assets/"
$html = $html -replace 'url\("/assets/', 'url("/landing/assets/'
$html = $html -replace 'src="/assets/', 'src="/landing/assets/'
$html = $html -replace '"/landing/landing/', '"/landing/'

# Fix meta
$html = $html -replace 'content="Aset[^"]*"', 'content="Vritti — Trading Psychology Analysis Tool"'

# Brand name in HTML (case-sensitive)
$html = $html.Replace('>Aset<', '>Vritti<')

# Inject CSS + post-hydration script
$injection = @'
<style>
/* Prevent flash of original content */
body { opacity: 0; transition: opacity 0.4s ease; }
body.vritti-ready { opacity: 1; }

/* Hide unwanted sections */
[data-framer-name='Social Trust'],
[data-framer-name='Company logos'],
[data-framer-name='Metrics Section'],
[data-framer-name='Pricing Section'],
[data-framer-name='Testimonials Section'],
[data-framer-name='Footer'],
[data-framer-name='Designer Info'] {
    display: none !important;
}

/* Hide 5th (Testimonials) and 6th (FAQ) nav items */
/* Nav order: Home(1), Analyse(2), Dashboard(3), About(4), [Testimonials](5), [FAQ](6) */
[data-framer-name='Menu Item']:nth-child(n+5) {
    display: none !important;
}
</style>
<script>
function replaceTextSafely(element, oldText, newText) {
    element.childNodes.forEach(function(node) {
        if (node.nodeType === 3 && node.nodeValue && node.nodeValue.includes(oldText)) {
            node.nodeValue = node.nodeValue.replace(oldText, newText);
        } else if (node.nodeType === 1) {
            replaceTextSafely(node, oldText, newText);
        }
    });
}

// Post-hydration DOM fixes
function vrittiFix() {
    // Keep visual styles intact; only normalize links, labels and routes.
    document.querySelectorAll('a').forEach(function(a) {
        var href = a.getAttribute('href') || '';
        var text = (a.textContent || '').trim();

        // Fix external framer links -> internal routes
        if (href.includes('framer.com') || href.includes('easyframe')) {
            if (text === 'Get Started' || text === 'Analyse Trades' || text === 'Analyse Your Trades') {
                a.setAttribute('href', '/analyse');
            } else if (text === 'Learn More' || text === 'View Dashboard') {
                a.setAttribute('href', '/dashboard');
            } else if (text === 'About') {
                a.setAttribute('href', '/about');
            } else {
                a.setAttribute('href', '/');
            }
            a.removeAttribute('target');
            a.removeAttribute('rel');
        }

        // Social links → remove
        if (href.includes('x.com') || href.includes('twitter.com') || href.includes('instagram.com')) {
            a.setAttribute('href', '#');
            a.removeAttribute('target');
        }

        // Internal anchor → app routes
        if (href === './#feature' || href === '#feature') {
            a.setAttribute('href', '/analyse');
            a.removeAttribute('target');
        }
        if (href === './#benefit' || href === '#benefit') {
            a.setAttribute('href', '/dashboard');
            a.removeAttribute('target');
        }
        if (href === './#pricing' || href === '#pricing') {
            a.setAttribute('href', '/about');
            a.removeAttribute('target');
        }
        if (href === './#testimonials' || href === '#testimonials') {
            a.setAttribute('href', '/about');
            a.removeAttribute('target');
        }
    });

    // Normalize CTA labels while preserving visual styling.
    document.querySelectorAll('a, button, [role="button"]').forEach(function(el) {
        var label = (el.textContent || '').trim();
        if (label === 'Get Started' || label === 'Analyse Your Trades') {
            replaceTextSafely(el, 'Get Started', 'Analyse');
            replaceTextSafely(el, 'Analyse Your Trades', 'Analyse');
        }
        if (label === 'Learn More' || label === 'View Dashboard') {
            replaceTextSafely(el, 'Learn More', 'Dashboard');
            replaceTextSafely(el, 'View Dashboard', 'Dashboard');
        }
    });

    // Rewrite FAQ text/content to Vritti-focused copy.
    var faqRewrites = [
        ['Aset', 'Vritti'],
        ['asset management', 'trading psychology analysis'],
        ['investment', 'trading'],
        ['portfolio', 'tradebook']
    ];
    var faqSection = document.getElementById('faq') || document.querySelector('[data-framer-name="Faq"]');
    if (faqSection) {
        faqRewrites.forEach(function(pair) {
            replaceTextSafely(faqSection, pair[0], pair[1]);
        });

        var faqQuestions = [
          'What is Vritti and why was it built?',
          'How does Vritti analyse trading behavior?',
          'Does my trade data leave my browser?',
          'Which Zerodha exports are supported?',
          'Is Vritti giving investment advice?'
        ];
        var faqAnswers = [
          'Vritti is a trading psychology analyser built for a Zerodha internship application, inspired by Nithin Kamaths view that behavior drives outcomes more than prediction alone.',
          'It parses your tradebook, reconstructs completed buy-sell trades, detects recurring behavior patterns, and generates a visual report with actionable discipline feedback.',
          'No. Analysis is local-first and runs in your browser. Your uploaded files are used only for your session analysis.',
          'Zerodha Trade Book and P&L exports are supported in CSV, XLS, and XLSX formats, including common header variations.',
          'No. Vritti is an educational behavior feedback tool, not a recommendation engine or advisory service.'
        ];

        var questionNodes = faqSection.querySelectorAll('button, h3, h4');
        for (var qi = 0; qi < questionNodes.length && qi < faqQuestions.length; qi++) {
          questionNodes[qi].textContent = faqQuestions[qi];
        }

        var answerNodes = faqSection.querySelectorAll('p');
        var ai = 0;
        answerNodes.forEach(function(node) {
          var text = (node.textContent || '').trim();
          if (!text || text.endsWith('?') || ai >= faqAnswers.length) return;
          if (text.length > 25) {
            node.textContent = faqAnswers[ai];
            ai += 1;
          }
        });
    }

    // One capture-phase interceptor ensures Framer scroll handlers do not override routes.
    if (!window.__vrittiRouteInterceptor) {
        window.__vrittiRouteInterceptor = true;
        document.addEventListener('click', function(e) {
            var targetEl = e.target && e.target.closest ? e.target.closest('a, [data-framer-name="Menu Item"], [role="button"], button') : null;
            if (!targetEl) return;
            var text = (targetEl.textContent || '').trim().toLowerCase();
            var route = null;
            if (text.includes('analyse')) route = '/analyse';
            else if (text.includes('dashboard')) route = '/dashboard';
            else if (text === 'about' || text.includes(' about')) route = '/about';
            else if (text === 'home' || text.includes(' home')) route = '/';
            if (route) {
              e.preventDefault();
              e.stopPropagation();
              window.location.assign(route);
              return;
            }

            var anchor = targetEl.tagName === 'A' ? targetEl : targetEl.closest('a');
            if (anchor) {
              var href = anchor.getAttribute('href') || '';
              if (href.startsWith('/analyse') || href.startsWith('/dashboard') || href.startsWith('/about') || href === '/') {
                  e.preventDefault();
                  e.stopPropagation();
                  window.location.assign(href);
              }
            }
        }, true);
    }

    // Remove duplicate menu items if any appear after hydration.
    var menuContainers = document.querySelectorAll('[data-framer-name="Services"], nav, [role="navigation"]');
    menuContainers.forEach(function(container) {
        var seen = new Set();
        container.querySelectorAll('a').forEach(function(link) {
            var label = (link.textContent || '').trim().toLowerCase();
            if (!label) return;
            if (label === 'testimonials' || label === 'faq') {
                var item = link.closest('[data-framer-name="Menu Item"]');
                if (item) item.style.display = 'none';
                return;
            }
            if (['home', 'analyse', 'dashboard', 'about'].indexOf(label) === -1) return;
            if (seen.has(label)) {
                var menuItem = link.closest('[data-framer-name="Menu Item"]');
                if (menuItem) menuItem.style.display = 'none';
            } else {
                seen.add(label);
            }
        });
    });

    // Reveal page
    document.body.classList.add('vritti-ready');
}

// Run after Framer hydration
if (document.readyState === 'complete') {
    setTimeout(vrittiFix, 50);
} else {
    window.addEventListener('load', function() { setTimeout(vrittiFix, 50); });
}
// Fallback: always reveal after 2.5s
setTimeout(function() { document.body.classList.add('vritti-ready'); }, 2500);
</script>
'@

$html = $html -replace '</head>', "$injection`n</head>"

[System.IO.File]::WriteAllText($landingHtml, $html)
Write-Host "Updated: $landingHtml"
Write-Host "Safe transform complete!"
