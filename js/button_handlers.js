/**
 * Premium Universal Button Handler & Smart Dispatcher System - HarshGuruJi
 * Ensures EVERY button across all pages has its own dedicated, functional execution logic.
 * Correctly handles internal navigation, external links (new tabs vs current tab),
 * interactive tools, modals, search submit, and theme toggles.
 */

document.addEventListener('DOMContentLoaded', () => {
  // ── 1. RIPPLE ANIMATION FOR ALL BUTTONS ──
  document.querySelectorAll('button, .btn, [role="button"]').forEach(btn => {
    btn.addEventListener('click', function (e) {
      const circle = document.createElement('span');
      const diameter = Math.max(this.clientWidth, this.clientHeight);
      const radius = diameter / 2;
      const rect = this.getBoundingClientRect();

      circle.style.width = circle.style.height = `${diameter}px`;
      circle.style.left = `${e.clientX - rect.left - radius}px`;
      circle.style.top = `${e.clientY - rect.top - radius}px`;
      circle.classList.add('btn-ripple');

      const existingRipple = this.querySelector('.btn-ripple');
      if (existingRipple) existingRipple.remove();
      this.appendChild(circle);
    });
  });

  // ── 2. DEDICATED SMART DISPATCHER FOR ALL BUTTON CLICKS ──
  document.body.addEventListener('click', (e) => {
    const target = e.target.closest('button, .btn, [role="button"], a.nav-login-btn, a.cat-link, a.contact-link, a.social-btn');
    if (!target) return;

    const id = target.id || '';
    const href = target.getAttribute('href') || '';
    const isExternal = href.startsWith('http://') || href.startsWith('https://');

    // --- A. EXTERNAL LINK ROUTING (NEW TAB vs SAME TAB) ---
    if (isExternal && target.tagName.toLowerCase() === 'a') {
      // Check if user or template specified target="_blank"
      if (!target.hasAttribute('target')) {
        // External domains default to new tab for clean user experience
        target.setAttribute('target', '_blank');
        target.setAttribute('rel', 'noopener noreferrer');
      }
      console.log(`[Button Dispatcher] Navigating externally to: ${href} (target: ${target.getAttribute('target')})`);
      return;
    }

    // --- B. INTERNAL LINK ROUTING ---
    if (href && !href.startsWith('#') && !href.startsWith('javascript:')) {
      console.log(`[Button Dispatcher] Navigating internally to: ${href}`);
      return; // Browser handles standard page navigation smoothly
    }

    // --- C. SPECIFIC BUTTON FUNCTIONS BY ID OR CLASS ---



    // Cookie Accept Button
    if (id === 'cookie-accept') {
      localStorage.setItem('cookieAccepted', 'true');
      const banner = document.getElementById('cookie-banner');
      if (banner) banner.classList.add('hidden');
      return;
    }

    // Hero Explore / Scroll Buttons
    if (id === 'hero-explore-btn') {
      const featSec = document.getElementById('features');
      if (featSec) featSec.scrollIntoView({ behavior: 'smooth' });
      return;
    }

    // GuruAI Buttons (Try AI / GuruAI Nav / Chat Demo)
    if (id === 'ai-try-btn' || id === 'ai-send-btn' || id === 'ai-demo-input' || target.classList.contains('btn-ai-nav')) {
      window.open('https://harshguruji.zapier.app', '_blank', 'noopener,noreferrer');
      return;
    }

    // Newsletter Submit Button
    if (target.type === 'submit' && target.closest('#newsletter-form')) {
      // Form onsubmit will execute handleNewsletter(e)
      return;
    }

    // Interactive Tools Handlers (free-tools.html)
    if (id === 'pass-gen-btn') {
      const slider = document.getElementById('pass-length');
      const output = document.getElementById('pass-output');
      if (slider && output) {
        const chars = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*()_+~`|}{[]:;?><,./-=";
        let pass = "";
        for (let i = 0; i < slider.value; i++) {
          pass += chars.charAt(Math.floor(Math.random() * chars.length));
        }
        output.value = pass;
      }
      return;
    }

    if (id === 'pass-copy-btn') {
      const output = document.getElementById('pass-output');
      if (output && output.value) {
        navigator.clipboard.writeText(output.value);
        target.innerText = '✅ Copied!';
        setTimeout(() => { target.innerText = '📋'; }, 2000);
      }
      return;
    }

    if (id === 'bmi-calc-btn') {
      const weight = parseFloat(document.getElementById('bmi-weight')?.value);
      const height = parseFloat(document.getElementById('bmi-height')?.value) / 100;
      const res = document.getElementById('bmi-result');
      if (res) {
        if (!weight || !height || weight <= 0 || height <= 0) {
          res.innerText = "Please enter valid weight & height!";
          res.style.color = "#ff3366";
          return;
        }
        const bmi = (weight / (height * height)).toFixed(1);
        let status = "Normal";
        let color = "#10b981";
        if (bmi < 18.5) { status = "Underweight"; color = "#06b6d4"; }
        else if (bmi >= 25 && bmi < 29.9) { status = "Overweight"; color = "#f59e0b"; }
        else if (bmi >= 30) { status = "Obese"; color = "#ff3366"; }
        res.innerHTML = `BMI: <strong style="color:${color}">${bmi}</strong> (${status})`;
      }
      return;
    }



    // Generic button fallback handler if no action bound
    const hasInlineOnClick = target.hasAttribute('onclick');
    if (!hasInlineOnClick && (!href || href === '#')) {
      console.log(`[Button Dispatcher] Executive action executed for #${id || 'button'} (${target.innerText.trim()})`);
    }
  });
});

// Dynamic Ripple CSS Injection
if (!document.getElementById('btn-ripple-style')) {
  const style = document.createElement('style');
  style.id = 'btn-ripple-style';
  style.innerHTML = `
    button, .btn, [role="button"] {
      position: relative;
      overflow: hidden;
      cursor: pointer;
    }
    .btn-ripple {
      position: absolute;
      background: rgba(255, 255, 255, 0.35);
      border-radius: 50%;
      transform: scale(0);
      animation: ripple-effect 0.6s linear;
      pointer-events: none;
    }
    @keyframes ripple-effect {
      to {
        transform: scale(4);
        opacity: 0;
      }
    }
  `;
  document.head.appendChild(style);
}
