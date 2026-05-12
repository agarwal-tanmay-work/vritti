$src  = "C:\Users\priya\Downloads\25165040-450e-4482-8db0-88aaca809d17"
$dest = "c:\Users\priya\OneDrive\Desktop\vritti\public"

Write-Host "Step 1 - Restoring clean originals..."
Copy-Item "$src\index.html" "$dest\landing.html" -Force
Copy-Item "$src\assets\*" "$dest\landing\assets\" -Recurse -Force
Write-Host "  Done."

Write-Host "Step 2 - Reading HTML..."
$html = [System.IO.File]::ReadAllText("$dest\landing.html")

Write-Host "Step 3 - Title and meta..."
$html = $html -creplace '<title>[^<]+</title>', '<title>Vritti - Trading Psychology Analyser</title>'
$html = $html.Replace('<head>', '<head><meta name="vritti-version" content="aggressive-v3">')
$html = $html.Replace('content="Aset', 'content="Vritti - Trading Psychology Analyser')

Write-Host "Step 4 - Asset paths and Branding..."
$html = $html.Replace('href="/assets/', 'href="/landing/assets/')
$html = $html.Replace('src="/assets/', 'src="/landing/assets/')
$html = $html.Replace('href="./assets/', 'href="/landing/assets/')
$html = $html.Replace('src="./assets/', 'src="/landing/assets/')
$html = $html.Replace('url(/assets/', 'url(/landing/assets/')
$html = $html.Replace('"/assets/', '"/landing/assets/')
$html = $html.Replace("'/assets/", "'/landing/assets/")

# Static Branding Replacements
$html = $html.Replace('Aset', 'Vritti')
$html = $html.Replace('Asset Management', 'Trading Psychology')
$html = $html.Replace('Investment Platform', 'Behavioural Analysis')
$html = $html.Replace('financial', 'psychological')

Write-Host "Step 5 - CSS injection..."
$css = @'
<style id="vritti-css">
/* Removed opacity: 0 to prevent white-screen hangs */
[data-framer-name="Social Trust"],
[data-framer-name="Pricing Section"],
[data-framer-name="Testimonials Section"],
[data-framer-name="Footer Social"],
#__framer-badge-container { display: none !important; }

/* Background & Animation visibility fixes */
[data-framer-name="Hero"] { background: transparent !important; }
canvas { z-index: 0 !important; opacity: 1 !important; visibility: visible !important; }
.framer-video { opacity: 1 !important; }

/* Premium feel adjustments */
body { background: #060606 !important; }
</style>
'@
$html = $html.Replace('</head>', $css + '</head>')

Write-Host "Step 6 - Post-hydration patch..."

$patchScript = @'
<script id="vritti-patch">
(function(){
  /* helpers */
  function clkP(el){var c=el;while(c&&c!==document.body){if(c.tagName==="A"||c.getAttribute("data-framer-cursor")==="pointer")return c;c=c.parentElement;}return el.parentElement;}
  function nav(el,href){if(!el)return;el.style.cursor="pointer";el.setAttribute("href",href);el.onclick=function(e){e.preventDefault();e.stopImmediatePropagation();window.location.href=href;return false;};el.addEventListener("click",function(e){e.preventDefault();e.stopImmediatePropagation();window.location.href=href;},true);}

  /* Recursive Text Replacement */
  function walk(node){
    if(!node) return;
    if(node.nodeType === 3){
      var t = node.nodeValue;
      var n = t.replace(/aset/gi, "Vritti")
               .replace(/asset management/gi, "Trading Psychology")
               .replace(/investment/gi, "Behavioural Analysis")
               .replace(/investor/gi, "Trader")
               .replace(/financial/gi, "Psychological")
               .replace(/portfolio/gi, "Tradebook")
               .replace(/manage your assets/gi, "Audit your behaviour")
               .replace(/platform for all/gi, "Mirror for traders");
      if(n !== t) node.nodeValue = n;
    } else if(node.nodeType === 1 && node.tagName !== "SCRIPT" && node.tagName !== "STYLE") {
      for(var i=0; i<node.childNodes.length; i++) walk(node.childNodes[i]);
    }
  }

  var _to;
  function enforceVritti(){
    if(_to) clearTimeout(_to);
    _to = setTimeout(function(){
      walk(document.body);
      document.querySelectorAll("*").forEach(function(el){
        if(el.childElementCount !== 0) return;
        var t = el.textContent.trim().toLowerCase();
        if(t==="feature"){el.textContent="Analyse";nav(clkP(el),"/analyse");}
        else if(t==="benefit"){el.textContent="Dashboard";nav(clkP(el),"/dashboard");}
        else if(t==="pricing" || t==="pricing "){el.textContent="About";nav(clkP(el),"/about");}
        else if(["get started","start free","join now","try free"].indexOf(t)>-1){el.textContent="Analyse Trades";nav(clkP(el),"/analyse");}
        else if(["learn more","view demo","explore","explore more"].indexOf(t)>-1){el.textContent="View Dashboard";nav(clkP(el),"/dashboard");}
      });
      var h1=document.querySelector("h1");
      if(h1 && (h1.textContent.indexOf("Aset")>-1 || h1.textContent.indexOf("Vritti")===-1)){
        h1.innerHTML="See The Trading Mistakes<br><span>You Keep Repeating</span>";
      }
    }, 50);
  }

  var brandingObs = new MutationObserver(function(m){ enforceVritti(); });
  brandingObs.observe(document.documentElement, {childList:true, subtree:true, characterData:true});

  function applyPatches(){
    document.title = "Vritti - Trading Psychology Analyser";
    enforceVritti();
    /* FAQ patch omitted for brevity in observer loop, run once */
    var FAQS=[
      {q:"What is Vritti?",a:"Vritti is a behavioural trading analysis tool for Indian retail traders using Zerodha Kite. It analyses 13 behavioural biases in your own trade history."},
      {q:"How does it work?",a:"Upload your Zerodha trade book. Everything runs inside your browser — no data leaves your device. The engine detects panic selling, FOMO entries, revenge trading, and more."},
      {q:"Is my data safe?",a:"Yes. Vritti is local-first. Your data never leaves your device. No backend, no account, no telemetry."},
      {q:"Which file formats are supported?",a:"Vritti accepts the Trade Book and P&L Statement exports from Zerodha Kite in CSV, XLS, or XLSX."},
      {q:"What is the Behaviour Score?",a:"A number from 0 to 100 summarising how much your identified biases are likely costing you. Above 70 is healthy."},
      {q:"Does Vritti give advice?",a:"No. Vritti is purely diagnostic. It analyses decisions you have already made. Think of it as a mirror, not a compass."}
    ];
    var allTxt=document.querySelectorAll("[data-framer-component-type=Text]");
    var qs=[],as=[];
    allTxt.forEach(function(el){var t=el.textContent.trim();if(t.endsWith("?")&&t.length>10&&t.length<200)qs.push(el);else if(t.length>80&&t.length<700)as.push(el);});
    qs.forEach(function(el,i){if(i<FAQS.length){var sp=el.querySelector("span,p");if(sp)sp.textContent=FAQS[i].q;else el.textContent=FAQS[i].q;}});
    as.forEach(function(el,i){if(i<FAQS.length){var sp=el.querySelector("span,p");if(sp)sp.textContent=FAQS[i].a;else el.textContent=FAQS[i].a;}});
  }

  var ticks=0;
  function wait(){
    ticks++;
    if(document.querySelectorAll("[data-framer-component-type]").length>10||ticks>100){ applyPatches(); }
    else { setTimeout(wait, 100); }
  }
  wait();
})();
</script>
'@

$html = $html.Replace('</body>', $patchScript + '</body>')

Write-Host "Step 7 - Writing..."
[System.IO.File]::WriteAllText("$dest\landing.html", $html)
Write-Host "Done."
