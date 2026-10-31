// ── Shared daily thoughts pool ──
const DAILY_THOUGHTS = [
  { quote: "The more that you read, the more things you will know.", author: "Dr. Seuss", hindi: "आप जितना अधिक पढ़ेंगे, उतनी ही अधिक बातें आप जानेंगे।" },
  { quote: "Education is the most powerful weapon which you can use to change the world.", author: "Nelson Mandela", hindi: "शिक्षा सबसे शक्तिशाली हथियार है जिसका उपयोग आप दुनिया को बदलने के लिए कर सकते हैं।" },
  { quote: "The beautiful thing about learning is that no one can take it away from you.", author: "B.B. King", hindi: "सीखने की सबसे खूबसूरत बात यह है कि इसे आपसे कोई छीन नहीं सकता।" },
  { quote: "In the middle of difficulty lies opportunity.", author: "Albert Einstein", hindi: "कठिनाइयों के बीच ही अवसर छिपे होते हैं।" },
  { quote: "It does not matter how slowly you go as long as you do not stop.", author: "Confucius", hindi: "इससे कोई फर्क नहीं पड़ता कि आप कितनी धीमी गति से चलते हैं, जब तक कि आप रुकते नहीं।" },
  { quote: "Success is not final, failure is not fatal: It is the courage to continue that counts.", author: "Winston Churchill", hindi: "सफलता अंतिम नहीं है, असफलता घातक नहीं है: जारी रखने का साहस ही मायने रखता है।" },
  { quote: "Believe you can and you're halfway there.", author: "Theodore Roosevelt", hindi: "विश्वास रखें कि आप कर सकते हैं, और आपने आधा रास्ता तय कर लिया है।" },
  { quote: "The only way to do great work is to love what you do.", author: "Steve Jobs", hindi: "महान कार्य करने का एकमात्र तरीका यह है कि आप अपने काम से प्यार करें।" },
  { quote: "Strive not to be a success, but rather to be of value.", author: "Albert Einstein", hindi: "सफल व्यक्ति बनने का प्रयास न करें, बल्कि मूल्यवान व्यक्ति बनें।" },
  { quote: "The mind is everything. What you think you become.", author: "Buddha", hindi: "मन ही सब कुछ है। आप जैसा सोचते हैं, वैसा ही बन जाते हैं।" },
  { quote: "An investment in knowledge pays the best interest.", author: "Benjamin Franklin", hindi: "ज्ञान में किया गया निवेश सबसे अच्छा फल देता है।" },
  { quote: "Live as if you were to die tomorrow. Learn as if you were to live forever.", author: "Mahatma Gandhi", hindi: "ऐसे जिएं जैसे कि आपको कल मरना है। ऐसे सीखें जैसे कि आपको हमेशा जीना है।" },
  { quote: "The secret of getting ahead is getting started.", author: "Mark Twain", hindi: "आगे बढ़ने का रहस्य शुरुआत करना है।" },
  { quote: "Don't watch the clock; do what it does. Keep going.", author: "Sam Levenson", hindi: "घड़ी को मत देखो; वही करो जो वह करती है। निरंतर चलते रहो।" },
  { quote: "You are never too old to set another goal or to dream a new dream.", author: "C.S. Lewis", hindi: "आप कभी भी दूसरा लक्ष्य निर्धारित करने या नया सपना देखने के लिए बहुत बूढ़े नहीं होते।" },
  { quote: "It always seems impossible until it's done.", author: "Nelson Mandela", hindi: "जब तक कोई काम पूरा न हो जाए, वह हमेशा असंभव ही लगता है।" },
  { quote: "Knowledge is power.", author: "Francis Bacon", hindi: "ज्ञान ही शक्ति है।" },
  { quote: "Change your thoughts and you change your world.", author: "Norman Vincent Peale", hindi: "अपने विचारों को बदलिए और आप अपनी दुनिया बदल देंगे।" },
  { quote: "What you get by achieving your goals is not as important as what you become.", author: "Zig Ziglar", hindi: "लक्ष्य हासिल करके आपको क्या मिलता है, यह उतना महत्वपूर्ण नहीं जितना कि आप क्या बन जाते हैं।" },
  { quote: "The future belongs to those who believe in the beauty of their dreams.", author: "Eleanor Roosevelt", hindi: "भविष्य उनका है जो अपने सपनों की सुंदरता में विश्वास रखते हैं।" },
  { quote: "Try not to become a man of success, but rather become a man of value.", author: "Albert Einstein", hindi: "सफल बनने की कोशिश न करें, बल्कि मूल्यों वाले इंसान बनें।" },
  { quote: "A person who never made a mistake never tried anything new.", author: "Albert Einstein", hindi: "जिस व्यक्ति ने कभी कोई गलती नहीं की, उसने कभी कुछ नया करने की कोशिश नहीं की।" },
  { quote: "The only limit to our realization of tomorrow will be our doubts of today.", author: "Franklin D. Roosevelt", hindi: "कल की हमारी उपलब्धियों की एकमात्र सीमा आज के हमारे संदेह होंगे।" },
  { quote: "Do what you can, with what you have, where you are.", author: "Theodore Roosevelt", hindi: "आप जहाँ हैं, जो आपके पास है, उसी से वह करें जो आप कर सकते हैं।" },
  { quote: "Start where you are. Use what you have. Do what you can.", author: "Arthur Ashe", hindi: "जहाँ हैं वहीं से शुरू करें। जो है उसका इस्तेमाल करें। जो कर सकते हैं वो करें।" },
  { quote: "You miss 100% of the shots you don't take.", author: "Wayne Gretzky", hindi: "जिन मौकों पर आप प्रयास नहीं करते, उनमें आप शत-प्रतिशत चूक जाते हैं।" },
  { quote: "It is during our darkest moments that we must focus to see the light.", author: "Aristotle", hindi: "हमारे सबसे कठिन समय में ही हमें रोशनी देखने पर ध्यान केंद्रित करना चाहिए।" },
  { quote: "Spread love everywhere you go. Let no one ever come to you without leaving happier.", author: "Mother Teresa", hindi: "जहाँ भी जाएँ प्यार फैलाएँ। कोई भी आपके पास से बिना खुश हुए न लौटे।" },
  { quote: "When you reach the end of your rope, tie a knot in it and hang on.", author: "Franklin D. Roosevelt", hindi: "जब आप अपनी रस्सी के छोर पर पहुँच जाएँ, तो उसमें एक गाँठ बाँध लें और डटे रहें।" },
  { quote: "Always remember that you are absolutely unique. Just like everyone else.", author: "Margaret Mead", hindi: "हमेशा याद रखें कि आप बिल्कुल अनोखे हैं। ठीक बाकी सभी की तरह।" },
  { quote: "Learning never exhausts the mind.", author: "Leonardo da Vinci", hindi: "सीखने से दिमाग कभी थकता नहीं है।" },
  { quote: "The expert in anything was once a beginner.", author: "Helen Hayes", hindi: "किसी भी क्षेत्र का विशेषज्ञ कभी शुरुआती ही था।" },
  { quote: "Dream big and dare to fail.", author: "Norman Vaughan", hindi: "बड़ा सपना देखें और असफल होने का साहस रखें।" },
  { quote: "Act as if what you do makes a difference. It does.", author: "William James", hindi: "ऐसे कार्य करें जैसे कि आपके काम से फर्क पड़ता है। और सच में पड़ता है।" },
  { quote: "What we think, we become.", author: "Buddha", hindi: "हम जैसा सोचते हैं, वैसे ही बन जाते हैं।" },
];

function getDayOfYear() {
  return Math.floor((new Date() - new Date(new Date().getFullYear(), 0, 0)) / 86400000);
}

function injectDailySpecialNav() {
  const navLinks = document.getElementById('nav-links');
  if (!navLinks || navLinks.querySelector('[data-nav-daily-special]')) return;

  const li = document.createElement('li');
  li.innerHTML = '<a href="daily-special.html" class="nav-link nav-daily-special" data-nav-daily-special>Daily Special</a>';
  const firstItem = navLinks.querySelector('li');
  if (firstItem) {
    navLinks.insertBefore(li, firstItem.nextSibling);
  } else {
    navLinks.appendChild(li);
  }

  if (window.location.pathname.endsWith('daily-special.html')) {
    navLinks.querySelectorAll('.nav-link.active').forEach(link => link.classList.remove('active'));
    li.querySelector('.nav-link').classList.add('active');
  }
}

function initDailySpecialTabs() {
  const subNav = document.getElementById('ds-sub-nav');
  if (!subNav) return;

  const buttons = subNav.querySelectorAll('.ds-sub-btn');
  const panels = document.querySelectorAll('.ds-tab-panel');

  function activateTab(tabId) {
    buttons.forEach(btn => {
      btn.classList.toggle('active', btn.getAttribute('data-ds-tab') === tabId);
    });
    panels.forEach(panel => {
      panel.classList.toggle('active', panel.getAttribute('data-ds-panel') === tabId);
    });
    if (history.replaceState) {
      history.replaceState(null, '', `#${tabId}`);
    }
  }

  buttons.forEach(btn => {
    btn.addEventListener('click', () => {
      activateTab(btn.getAttribute('data-ds-tab'));
    });
  });

  const hash = window.location.hash.replace('#', '');
  if (hash === 'news' || hash === 'thoughts' || hash === 'calendar' || hash === 'information') {
    activateTab(hash);
  }
}

function renderDailyThoughtsGrid(count) {
  const grid = document.getElementById('thoughts-grid');
  if (!grid) return;

  const dayOfYear = getDayOfYear();
  const total = Math.min(Math.max(count, 10), 15);
  let html = '';

  for (let i = 0; i < total; i++) {
    const t = DAILY_THOUGHTS[(dayOfYear + i) % DAILY_THOUGHTS.length];
    html += `
      <article class="thought-card">
        <div class="thought-card-num">Thought ${i + 1}</div>
        <p class="thought-text">"${t.quote}"</p>
        ${t.hindi ? `<p class="thought-hindi"><span class="thought-hi-badge">हिंदी अर्थ</span> "${t.hindi}"</p>` : ''}
        <footer class="thought-author">— ${t.author}</footer>
      </article>`;
  }

  grid.innerHTML = html;
}

document.addEventListener('DOMContentLoaded', () => {
  injectDailySpecialNav();
  initDailySpecialTabs();
  renderDailyThoughtsGrid(12);

  // Mobile Menu Toggle
  const hamburger = document.getElementById('hamburger');
  const navLinks = document.getElementById('nav-links');

  if (hamburger && navLinks) {
    hamburger.addEventListener('click', () => {
      navLinks.classList.toggle('active');
    });
  }

  // Navbar Scroll Effect & Scroll Spy
  const navbar = document.getElementById('navbar');
  const sections = document.querySelectorAll('section[id]');
  const navItems = document.querySelectorAll('.nav-link');

  function scrollSpy() {
    const scrollY = window.pageYOffset;
    sections.forEach(current => {
      const sectionHeight = current.offsetHeight;
      const sectionTop = current.offsetTop - 150;
      const sectionId = current.getAttribute('id');
      
      if (scrollY > sectionTop && scrollY <= sectionTop + sectionHeight) {
        navItems.forEach(item => {
          const href = item.getAttribute('href');
          if (href && (href.endsWith('#' + sectionId) || href === '#' + sectionId)) {
            item.classList.add('active');
          } else {
            if (href && (href.includes('#home') || href.includes('#features') || href.includes('#categories') || href.includes('#ai') || href.includes('#about') || href.includes('#contact'))) {
              item.classList.remove('active');
            }
          }
        });
      }
    });
  }

  window.addEventListener('scroll', () => {
    if (sections.length > 0) scrollSpy();
  }, { passive: true });
  if (sections.length > 0) scrollSpy();

  // Number Counter Animation
  const statNumbers = document.querySelectorAll('.stat-number');
  
  const animateStats = (entries, observer) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const target = parseInt(entry.target.getAttribute('data-target'));
        let count = 0;
        const duration = 2000; // 2 seconds
        const increment = target / (duration / 16); // 60fps
        
        const updateCount = () => {
          count += increment;
          if (count < target) {
            entry.target.innerText = Math.ceil(count);
            requestAnimationFrame(updateCount);
          } else {
            entry.target.innerText = target;
          }
        };
        
        updateCount();
        observer.unobserve(entry.target);
      }
    });
  };

  const statsObserver = new IntersectionObserver(animateStats, { threshold: 0.5 });
  statNumbers.forEach(stat => statsObserver.observe(stat));



  // Smooth scroll for anchor links
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
      e.preventDefault();
      const targetId = this.getAttribute('href');
      if(targetId === '#') return;
      const targetElement = document.querySelector(targetId);
      if(targetElement) {
        targetElement.scrollIntoView({
          behavior: 'smooth'
        });
        if(navLinks && navLinks.classList.contains('active')){
          navLinks.classList.remove('active');
        }
      }
    });
  });

  // AI Chat Demo Interaction - Opens HarshGuruJi Zapier Chatbot
  const aiInput = document.getElementById('ai-demo-input');
  const aiSendBtn = document.getElementById('ai-send-btn');

  if(aiInput) {
    aiInput.addEventListener('click', () => {
      window.open('https://harshguruji.zapier.app', '_blank', 'noopener,noreferrer');
    });
  }
  if(aiSendBtn) {
    aiSendBtn.addEventListener('click', (e) => {
      e.preventDefault();
      window.open('https://harshguruji.zapier.app', '_blank', 'noopener,noreferrer');
    });
  }

  // --- WIKIPEDIA CONTENT FETCHING LOGIC ---
  
  // Helper to fetch and display Wikipedia Extract
  async function fetchWikiContent(topics, containerId) {
    const container = document.getElementById(containerId);
    if (!container) return;
    
    // Convert single string to array for search
    const topicsArray = Array.isArray(topics) ? topics : [topics];
    let loadedContent = false;
    let finalHtml = '';

    for (const topic of topicsArray) {
      try {
        const response = await fetch(`https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(topic)}`);
        if (!response.ok) continue;
        const data = await response.json();
        
        let html = `<div style="background: rgba(255,255,255,0.02); padding: 2rem; border-radius: 15px; border: 1px solid var(--card-border); margin-bottom: 2rem; overflow: hidden;">`;
        html += `<h2 style="color:var(--text-primary); margin-bottom:0.5rem; font-size:2rem;">${data.title}</h2>`;
        if (data.description) html += `<p style="color:var(--accent-tertiary); margin-bottom:1.5rem; font-style:italic;">${data.description}</p>`;
        
        if (data.thumbnail && data.thumbnail.source) {
          html += `<img src="${data.thumbnail.source}" alt="${data.title}" style="max-width: 250px; border-radius: 10px; float: right; margin-left: 2rem; margin-bottom: 1rem; box-shadow: 0 10px 20px rgba(0,0,0,0.5);">`;
        }
        
        html += `<div style="color:var(--text-secondary); line-height: 1.8; font-size: 1.05rem;">${data.extract_html || data.extract}</div>`;
        html += `<div style="clear:both;"></div>`;
        
        if (data.content_urls && data.content_urls.desktop) {
           html += `<a href="${data.content_urls.desktop.page}" target="_blank" class="btn btn-secondary" style="margin-top:2rem; display:inline-flex;">Read full article →</a>`;
        }
        html += `</div>`;
        finalHtml += html;
        loadedContent = true;
      } catch (err) {
        console.error("Failed fetching: ", topic);
      }
    }

    if (loadedContent) {
      container.innerHTML = finalHtml;
    } else {
      container.innerHTML = `<p>Sorry, we couldn't load content. Try searching for something else!</p>`;
    }
  }

  // Special function for Ask Anything page - Opens articles in article-viewer.html
  async function fetchWikiContentWithViewer(topics, containerId) {
    const container = document.getElementById(containerId);
    if (!container) return;
    
    const topicsArray = Array.isArray(topics) ? topics : [topics];
    let loadedContent = false;
    let finalHtml = '';

    for (const topic of topicsArray) {
      try {
        const response = await fetch(`https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(topic)}`);
        if (!response.ok) continue;
        const data = await response.json();
        
        let html = `<div style="background: rgba(255,255,255,0.02); padding: 2rem; border-radius: 15px; border: 1px solid var(--card-border); margin-bottom: 2rem; overflow: hidden;">`;
        html += `<h2 style="color:var(--text-primary); margin-bottom:0.5rem; font-size:2rem;">${data.title}</h2>`;
        if (data.description) html += `<p style="color:var(--accent-tertiary); margin-bottom:1.5rem; font-style:italic;">${data.description}</p>`;
        
        if (data.thumbnail && data.thumbnail.source) {
          html += `<img src="${data.thumbnail.source}" alt="${data.title}" style="max-width: 250px; border-radius: 10px; float: right; margin-left: 2rem; margin-bottom: 1rem; box-shadow: 0 10px 20px rgba(0,0,0,0.5);">`;
        }
        
        html += `<div style="color:var(--text-secondary); line-height: 1.8; font-size: 1.05rem;">${data.extract_html || data.extract}</div>`;
        html += `<div style="clear:both;"></div>`;
        
        // Store article data and open in viewer page
        const articleTitle = data.title;
        html += `<button class="btn btn-secondary" style="margin-top:2rem; display:inline-flex; cursor:pointer; border:none; padding: 0.8rem 1.5rem; border-radius:50px;" onclick="openArticleViewer('${articleTitle}');">Read full article →</button>`;
        
        html += `</div>`;
        finalHtml += html;
        loadedContent = true;
      } catch (err) {
        console.error("Failed fetching: ", topic);
      }
    }

    if (loadedContent) {
      container.innerHTML = finalHtml;
    } else {
      container.innerHTML = `<p>Sorry, we couldn't load content. Try searching for something else!</p>`;
    }
  }

  // Function to open article viewer
  function openArticleViewer(articleTitle) {
    // Store article in localStorage
    localStorage.setItem('articleToView', articleTitle);
    // Open article-viewer.html with the title as a URL parameter
    window.open(`article-viewer.html?title=${encodeURIComponent(articleTitle)}`, '_blank');
  }

  // Function to search for custom articles (called from ask-anything.html)
  window.searchCustomArticle = function() {
    const searchInput = document.getElementById('article-search-input');
    if (searchInput && searchInput.value.trim()) {
      const searchQuery = searchInput.value.trim();
      openArticleViewer(searchQuery);
    } else {
      alert('Please enter a topic to search!');
    }
  };

  // Execute fetch based on page elements
  // -- Topics --
  if (document.getElementById('wiki-container-education')) {
    fetchWikiContent(['Education', 'E-learning', 'Higher_education', 'Learning_theory_(education)'], 'wiki-container-education');
  }
  if (document.getElementById('wiki-container-technology')) {
    fetchWikiContent(['Technology', 'Artificial_intelligence', 'Information_technology', 'Emerging_technologies'], 'wiki-container-technology');
  }
  if (document.getElementById('wiki-container-dailylife')) {
    fetchWikiContent(['Everyday_life', 'Habit', 'Time_management', 'Well-being'], 'wiki-container-dailylife');
  }
  if (document.getElementById('wiki-container-special-knowledge')) {
    fetchWikiContent(['Science', 'Universe', 'Invention'], 'wiki-container-special-knowledge');
  }

  // --- INTERACTIVE TOOLS LOGIC (free-tools.html) ---
  // Tool 1: Text Analyzer
  const textInput = document.getElementById('text-tool-input');
  if (textInput) {
    const wordCount = document.getElementById('tool-words');
    const charCount = document.getElementById('tool-chars');
    textInput.addEventListener('input', () => {
      const text = textInput.value;
      charCount.innerText = text.length;
      wordCount.innerText = text.trim() === '' ? 0 : text.trim().split(/\s+/).length;
    });
  }

  // Tool 2: Password Generator
  const passGenBtn = document.getElementById('pass-gen-btn');
  if (passGenBtn) {
    const passOutput = document.getElementById('pass-output');
    const passLenSlider = document.getElementById('pass-length');
    const passLenDisplay = document.getElementById('pass-len-display');
    const passCopyBtn = document.getElementById('pass-copy-btn');
    
    passLenSlider.addEventListener('input', () => {
      passLenDisplay.innerText = passLenSlider.value;
    });
    
    passGenBtn.addEventListener('click', () => {
      const chars = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*()_+~`|}{[]:;?><,./-=";
      let password = "";
      for (let i = 0; i < passLenSlider.value; i++) {
        password += chars.charAt(Math.floor(Math.random() * chars.length));
      }
      passOutput.value = password;
    });
    
    passCopyBtn.addEventListener('click', () => {
      if(passOutput.value) {
        navigator.clipboard.writeText(passOutput.value);
        passCopyBtn.innerText = '✅';
        setTimeout(() => passCopyBtn.innerText = '📋', 2000);
      }
    });
  }

  // Tool 3: BMI Calculator
  const bmiBtn = document.getElementById('bmi-calc-btn');
  if (bmiBtn) {
    bmiBtn.addEventListener('click', () => {
      const weight = parseFloat(document.getElementById('bmi-weight').value);
      const height = parseFloat(document.getElementById('bmi-height').value) / 100;
      const resultDiv = document.getElementById('bmi-result');
      
      if (!weight || !height || weight <= 0 || height <= 0) {
        resultDiv.innerText = "Please enter valid numbers!";
        resultDiv.style.color = "#ff3366";
        return;
      }
      
      const bmi = (weight / (height * height)).toFixed(1);
      let status = "";
      let color = "";
      
      if (bmi < 18.5) { status = "Underweight"; color = "#06b6d4"; }
      else if (bmi >= 18.5 && bmi < 24.9) { status = "Normal weight"; color = "#10b981"; }
      else if (bmi >= 25 && bmi < 29.9) { status = "Overweight"; color = "#ffbd2e"; }
      else { status = "Obese"; color = "#ff3366"; }
      
      resultDiv.innerHTML = `BMI: <span>${bmi}</span> <span style="font-size:0.9rem; font-weight:normal; color:${color}; display:block; margin-top:0.5rem;">(${status})</span>`;
    });
  }

  // -- Features --
  if (document.getElementById('wiki-container-insights')) {
    fetchWikiContent(['Wisdom', 'Insight', 'Knowledge', 'Self-awareness'], 'wiki-container-insights');
  }
  if (document.getElementById('wiki-container-ask')) {
    fetchWikiContentWithViewer(['Question', 'Information', 'Curiosity', 'Critical_thinking'], 'wiki-container-ask');
  }
  if (document.getElementById('wiki-container-explore')) {
    fetchWikiContent(['Learning', 'Exploration', 'Discovery_(observation)', 'Self-directed_learning'], 'wiki-container-explore');
  }

  // --- DAILY SPECIAL CALENDAR & "ON THIS DAY" with REAL-TIME UPDATES ---
  const calendarWidget = document.getElementById('calendar-widget');
  const onThisDayContainer = document.getElementById('wiki-container-onthisday');
  const importantEventsContainer = document.getElementById('important-events');
  
  if (calendarWidget && onThisDayContainer) {
    // Important Events & Holidays Database
    const importantDates = {
      '0101': ['🎆 New Year Day', '🎉 International New Year Celebration'],
      '0214': ['💝 Valentine\'s Day', '💕 Day of Love and Affection'],
      '0308': ['👩 International Women\'s Day', '🌸 Celebration of Women'],
      '0501': ['🎯 International Labour Day', '👷 Worker\'s Day Celebration'],
      '0815': ['🇮🇳 Indian Independence Movement Day', '🏴 Freedom Fighter\'s Day'],
      '1025': ['🔬 World Polio Day', '💉 Health Awareness Day'],
      '1026': ['🌍 United Nations Day', '🕊️ International Peace Day'],
      '1031': ['🎃 Halloween', '👻 Festival of Costumes'],
      '1225': ['🎄 Christmas Day', '🎅 Festival of Lights (Christian)'],
      '1231': ['🎊 New Year\'s Eve', '🥂 Celebration of New Beginnings'],
    };

    // Function to update calendar in real-time
    function updateCalendar() {
      const today = new Date();
      const months = ["JAN", "FEB", "MAR", "APR", "MAY", "JUN", "JUL", "AUG", "SEP", "OCT", "NOV", "DEC"];
      const days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
      
      // Update calendar display
      document.getElementById('cal-month').innerText = months[today.getMonth()];
      document.getElementById('cal-date').innerText = today.getDate();
      document.getElementById('cal-day').innerText = days[today.getDay()];
      
      // Update real-time clock
      const timeElement = document.getElementById('cal-time');
      if (timeElement) {
        const hours = String(today.getHours()).padStart(2, '0');
        const minutes = String(today.getMinutes()).padStart(2, '0');
        const seconds = String(today.getSeconds()).padStart(2, '0');
        timeElement.innerText = `${hours}:${minutes}:${seconds}`;
      }
      
      // Show important events/holidays for today
      if (importantEventsContainer) {
        const dateKey = String(today.getMonth() + 1).padStart(2, '0') + String(today.getDate()).padStart(2, '0');
        const todayEvents = importantDates[dateKey];
        
        if (todayEvents) {
          let eventsHtml = '';
          todayEvents.forEach(event => {
            eventsHtml += `<p>✨ ${event}</p>`;
          });
          importantEventsContainer.innerHTML = eventsHtml;
        } else {
          importantEventsContainer.innerHTML = '<p>💡 Today is a regular day - make it special!</p>';
        }
      }
    }

    // Update calendar immediately and then every second
    updateCalendar();
    setInterval(updateCalendar, 1000);

    const mm = String(new Date().getMonth() + 1).padStart(2, '0');
    const dd = String(new Date().getDate()).padStart(2, '0');

    // Fetch "On This Day" data from Wikipedia
    fetch(`https://en.wikipedia.org/api/rest_v1/feed/onthisday/all/${mm}/${dd}`)
      .then(res => res.json())
      .then(data => {
        let finalHtml = '';
        
        // Events
        if(data.events && data.events.length > 0) {
          finalHtml += '<div style="margin-bottom: 3rem;">';
          finalHtml += '<h2 style="color:var(--accent-tertiary); margin-bottom: 1rem;"><span style="font-size:1.5rem">📜</span> Historical Events</h2>';
          finalHtml += '<ul style="padding-left:1.5rem; color:var(--text-secondary); line-height:1.8;">';
          data.events.slice(0, 7).forEach(ev => {
            finalHtml += `<li style="margin-bottom:1rem;"><strong style="color:var(--text-primary)">${ev.year}:</strong> ${ev.text}</li>`;
          });
          finalHtml += '</ul></div>';
        }

        // Births
        if(data.births && data.births.length > 0) {
          finalHtml += '<div style="margin-bottom: 3rem;">';
          finalHtml += '<h2 style="color:var(--accent-primary); margin-bottom: 1rem;"><span style="font-size:1.5rem">🎂</span> Famous Births</h2>';
          finalHtml += '<ul style="padding-left:1.5rem; color:var(--text-secondary); line-height:1.8;">';
          data.births.slice(0, 5).forEach(ev => {
            finalHtml += `<li style="margin-bottom:1rem;"><strong style="color:var(--text-primary)">${ev.year}:</strong> ${ev.text}</li>`;
          });
          finalHtml += '</ul></div>';
        }

        // Deaths
        if(data.deaths && data.deaths.length > 0) {
          finalHtml += '<div>';
          finalHtml += '<h2 style="color:var(--accent-secondary); margin-bottom: 1rem;"><span style="font-size:1.5rem">🕊️</span> Notable Deaths</h2>';
          finalHtml += '<ul style="padding-left:1.5rem; color:var(--text-secondary); line-height:1.8;">';
          data.deaths.slice(0, 5).forEach(ev => {
            finalHtml += `<li style="margin-bottom:1rem;"><strong style="color:var(--text-primary)">${ev.year}:</strong> ${ev.text}</li>`;
          });
          finalHtml += '</ul></div>';
        }

        if(finalHtml === '') finalHtml = '<p style="color:var(--text-secondary);">No historical events found for today.</p>';
        onThisDayContainer.innerHTML = finalHtml;
      }).catch(err => {
        onThisDayContainer.innerHTML = '<p style="color:var(--text-secondary);">Failed to load historical events. Wikipedia may be unreachable.</p>';
      });
  }

  // ─── THOUGHT OF THE DAY (single, legacy widget) ───────────────────────
  const thoughtContainer = document.getElementById('thought-of-day');
  if (thoughtContainer) {
    const t = DAILY_THOUGHTS[getDayOfYear() % DAILY_THOUGHTS.length];
    thoughtContainer.innerHTML = `
      <blockquote class="thought-quote">
        <p class="thought-text">"${t.quote}"</p>
        ${t.hindi ? `<p class="thought-hindi"><span class="thought-hi-badge">हिंदी अर्थ</span> "${t.hindi}"</p>` : ''}
        <footer class="thought-author">— ${t.author}</footer>
      </blockquote>`;
  }

  // ─── TRANSLATION HELPER FOR NEWS HEADLINES ───────────────────────────
  const newsTranslationCache = {};

  async function translateNewsToHindi(text, targetElId) {
    if (!text || text.trim() === '') return;
    const cleanText = text.replace(/<[^>]*>?/gm, '').trim();

    if (newsTranslationCache[cleanText]) {
      const el = document.getElementById(targetElId);
      if (el) el.innerHTML = `<span class="news-hi-badge">हिंदी</span> ${newsTranslationCache[cleanText]}`;
      return;
    }

    try {
      const url = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=en&tl=hi&dt=t&q=${encodeURIComponent(cleanText)}`;
      const res = await fetch(url);
      const data = await res.json();
      if (data && data[0] && data[0].length) {
        const translated = data[0].map(segment => segment[0]).join(' ').trim();
        if (translated) {
          newsTranslationCache[cleanText] = translated;
          const el = document.getElementById(targetElId);
          if (el) {
            el.innerHTML = `<span class="news-hi-badge">हिंदी</span> ${translated}`;
          }
        }
      }
    } catch {
      const el = document.getElementById(targetElId);
      if (el) el.style.display = 'none';
    }
  }

  // ─── NEWS FETCHER (RSS via rss2json proxy, auto-refresh) ──────────────
  function renderNews(containerId, items, fallbackMsg, limit) {
    const el = document.getElementById(containerId);
    if (!el) return;
    if (!items || items.length === 0) {
      el.innerHTML = `<p class="news-loading">${fallbackMsg}</p>`;
      return;
    }
    const maxItems = limit || 8;
    let html = '';
    const pendingTranslations = [];

    items.slice(0, maxItems).forEach((item, index) => {
      const title  = item.title  || 'No Title';
      const link   = item.link   || item.url || '#';
      const source = item.author || item.source?.name || 'News Source';
      const pubDate = item.pubDate ? new Date(item.pubDate).toLocaleString('en-IN', { day:'numeric', month:'short', hour:'2-digit', minute:'2-digit' }) : '';
      const hiId = `news-hi-${containerId}-${index}`;

      pendingTranslations.push({ text: title, id: hiId });

      html += `
        <a class="news-card" href="${link}" target="_blank" rel="noopener noreferrer">
          <span class="news-title">${title}</span>
          <span class="news-title-hi" id="${hiId}"><span class="news-hi-badge">हिंदी</span> अनुवाद लोड हो रहा है...</span>
          <span class="news-meta">${source}${pubDate ? ' · ' + pubDate : ''}</span>
        </a>`;
    });
    el.innerHTML = html;

    // Fetch Hindi translations asynchronously
    pendingTranslations.forEach(item => {
      translateNewsToHindi(item.text, item.id);
    });
  }

  function updateNewsTimestamp() {
    const stamp = document.getElementById('news-last-updated');
    if (stamp) {
      const now = new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
      stamp.innerHTML = `<span class="pulse-dot"></span> Last updated: ${now} · auto-refresh every 5 min`;
    }
  }

  async function fetchNationalNews() {
    const indiaRSS = 'https://timesofindia.indiatimes.com/rssfeeds/296589292.cms';
    const indiaAPI = `https://api.rss2json.com/v1/api.json?rss_url=${encodeURIComponent(indiaRSS)}&count=10`;
    try {
      const r = await fetch(indiaAPI);
      const d = await r.json();
      if (d.items && d.items.length) {
        renderNews('national-news', d.items, 'Could not load national news right now.', 8);
        return;
      }
      throw new Error('empty');
    } catch {
      try {
        const fallbackRSS = 'https://feeds.feedburner.com/ndtvnews-india-news';
        const r = await fetch(`https://api.rss2json.com/v1/api.json?rss_url=${encodeURIComponent(fallbackRSS)}&count=10`);
        const d = await r.json();
        renderNews('national-news', d.items, 'Could not load national news.', 8);
      } catch {
        const el = document.getElementById('national-news');
        if (el) el.innerHTML = '<p class="news-loading">National news unavailable right now.</p>';
      }
    }
  }

  async function fetchInternationalNews() {
    const bbcRSS = 'https://feeds.bbci.co.uk/news/world/rss.xml';
    const bbcAPI = `https://api.rss2json.com/v1/api.json?rss_url=${encodeURIComponent(bbcRSS)}&count=10`;
    try {
      const r = await fetch(bbcAPI);
      const d = await r.json();
      if (d.items && d.items.length) {
        renderNews('intl-news', d.items, 'Could not load international news right now.', 8);
        return;
      }
      throw new Error('empty');
    } catch {
      try {
        const fallbackRSS = 'https://feeds.reuters.com/reuters/worldNews';
        const r = await fetch(`https://api.rss2json.com/v1/api.json?rss_url=${encodeURIComponent(fallbackRSS)}&count=10`);
        const d = await r.json();
        renderNews('intl-news', d.items, 'Could not load international news.', 8);
      } catch {
        const el = document.getElementById('intl-news');
        if (el) el.innerHTML = '<p class="news-loading">International news unavailable right now.</p>';
      }
    }
  }

  async function fetchAllNews() {
    await Promise.all([fetchNationalNews(), fetchInternationalNews()]);
    updateNewsTimestamp();
  }

  const nationalEl = document.getElementById('national-news');
  if (nationalEl) {
    fetchAllNews();
    setInterval(fetchAllNews, 5 * 60 * 1000);
  }

  const intlEl = document.getElementById('intl-news');
  if (intlEl && !nationalEl) {
    fetchAllNews();
    setInterval(fetchAllNews, 5 * 60 * 1000);
  }

  // --- HOMEPAGE DAILY IMPORTANCE AUTO-UPDATE ---
  const dailyFactCardText = document.getElementById('daily-fact-text');
  const dailyFactTitle = document.getElementById('daily-fact-title');
  const dailyFactFooter = document.getElementById('daily-fact-footer');

  if (dailyFactCardText && dailyFactTitle) {
    const today = new Date();
    const mm = String(today.getMonth() + 1).padStart(2, '0');
    const dd = String(today.getDate()).padStart(2, '0');
    const monthsStr = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
    const currentDateString = `${monthsStr[today.getMonth()]} ${today.getDate()}`;
    
    fetch(`https://en.wikipedia.org/api/rest_v1/feed/onthisday/all/${mm}/${dd}`)
      .then(res => res.json())
      .then(data => {
        // First check for Holidays/Observances (Importance of the day)
        if(data.holidays && data.holidays.length > 0) {
          const holiday = data.holidays[0];
          dailyFactTitle.innerText = `Today is ${currentDateString}`;
          dailyFactCardText.innerText = `Importance: ${holiday.text}.`;
          if (dailyFactFooter) dailyFactFooter.innerText = "🌟 Daily Observance";
        } 
        // Fallback to top historical event if no holidays
        else if (data.events && data.events.length > 0) {
          const ev = data.events[0];
          dailyFactTitle.innerText = `On this day in ${ev.year}`;
          dailyFactCardText.innerText = ev.text;
          if (dailyFactFooter) dailyFactFooter.innerText = "📜 Historical Event";
        } else {
          dailyFactTitle.innerText = `Today is ${currentDateString}`;
          dailyFactCardText.innerText = "Enjoy your day and keep learning new things!";
        }
      })
      .catch(err => {
        dailyFactTitle.innerText = `Today's Special`;
        dailyFactCardText.innerText = "Failed to load today's importance. Please check your internet connection.";
      });
  }
  
  // --- DYNAMIC DAILY UPDATES FROM GOOGLE SHEETS ---
  async function fetchDailyUpdatesFromSheet() {
    const quoteEl = document.getElementById('daily-quote-text');
    const tipTitleEl = document.getElementById('daily-tip-title');
    const tipTextEl = document.getElementById('daily-tip-text');
    
    // Only attempt if elements exist (primarily index.html)
    if (!quoteEl && !tipTitleEl && !tipTextEl) return;
    
    // Check if the Apps Script URL has been configured
    if (!GS_ENDPOINT || GS_ENDPOINT.includes('YOUR_GAS_WEBAPP_URL')) {
      console.log('Google Apps Script URL not configured. Using static fallback content.');
      return;
    }
    
    try {
      const response = await fetch(`${GS_ENDPOINT}?action=getDailyContent`);
      if (!response.ok) throw new Error('Network response was not ok');
      const data = await response.json();
      
      if (data && data.success) {
        if (data.quoteText && quoteEl) {
          quoteEl.innerHTML = `"${data.quoteText}"` + (data.quoteAuthor ? ` — ${data.quoteAuthor}` : '');
        }
        if (data.tipTitle && tipTitleEl) {
          tipTitleEl.innerText = data.tipTitle;
        }
        if (data.tipText && tipTextEl) {
          tipTextEl.innerText = data.tipText;
        }
        console.log('Daily updates fetched successfully from Google Sheet');
      } else {
        console.warn('Google Sheet empty or returned unsuccessful response:', data.message);
      }
    } catch (error) {
      console.error('Error fetching daily content from Google Sheet:', error);
    }
  }

  fetchDailyUpdatesFromSheet();

  // --- SEARCH LOGIC ---
  const searchInputs = document.querySelectorAll('#site-search');
  const searchBtns = document.querySelectorAll('#search-btn');

  const doSearch = (query) => {
    if(!query.trim()) return;
    window.location.href = `search.html?q=${encodeURIComponent(query.trim())}`;
  };

  searchInputs.forEach((input, index) => {
    input.addEventListener('keypress', (e) => {
      if(e.key === 'Enter') doSearch(input.value);
    });
    if(searchBtns[index]) {
      searchBtns[index].addEventListener('click', () => doSearch(input.value));
    }
  });

  // Handle Search Results Page
  const searchContainer = document.getElementById('wiki-container-search');
  const queryDisplay = document.getElementById('search-query-display');
  
  if (searchContainer && queryDisplay) {
    const urlParams = new URLSearchParams(window.location.search);
    const query = urlParams.get('q');
    
    if(query) {
      queryDisplay.innerText = query;
      // First render local Q&A matches, then load Wikipedia content
      renderLocalQA(query, 'qa-container').finally(() => {
        fetchWikiContent(query, 'wiki-container-search');
      });
    } else {
      queryDisplay.innerText = 'Nothing';
      searchContainer.innerHTML = '<p>Please enter a search term in the search bar above.</p>';
    }
  }

  // Render local Q&A results from qa.json
  async function renderLocalQA(query, containerId) {
    const container = document.getElementById(containerId);
    if(!container) return;
    container.innerHTML = '<div class="wiki-loading">Searching site Q&A...</div>';
    try {
      const res = await fetch('qa.json');
      if(!res.ok) throw new Error('Failed to load QA dataset');
      const qa = await res.json();
      const qLower = query.toLowerCase();
      // Simple matching: question or tags include query terms
      const results = qa.filter(item => {
        if(!item) return false;
        const inQuestion = item.question && item.question.toLowerCase().includes(qLower);
        const inAnswer = item.answer && item.answer.toLowerCase().includes(qLower);
        const inTags = item.tags && item.tags.join(' ').toLowerCase().includes(qLower);
        return inQuestion || inAnswer || inTags;
      });

      let html = '';
      if(results.length === 0) {
        html = '<div style="padding:1.2rem; color:var(--text-secondary);">No direct answers found on the site. Showing Wikipedia results below.</div>';
      } else {
        html = '<div style="display:flex; gap:1rem; flex-direction:column;">';
        for(const r of results) {
          html += `<div style="background: rgba(255,255,255,0.02); padding: 1rem; border-radius:12px; border:1px solid var(--card-border);">`;
          html += `<div style="font-weight:700; color:var(--text-primary); margin-bottom:0.4rem;">${r.question}</div>`;
          html += `<div style="color:var(--text-secondary); margin-bottom:0.6rem;">${r.answer}</div>`;
          if(r.tags && r.tags.length) html += `<div style="font-size:0.85rem; color:var(--accent-tertiary);">Tags: ${r.tags.join(', ')}</div>`;
          html += `</div>`;
        }
        html += '</div>';
      }
      container.innerHTML = html;
    } catch (err) {
      container.innerHTML = '<div style="color:var(--text-secondary);">Failed to load site Q&A.</div>';
      console.error(err);
    }
  }

  // (Floating AI chat widget removed - chatbot accessible directly via harshguruji.zapier.app)

  // --- AUTH / SSO HELPERS ---
  // Configure your deployed Google Apps Script Web App URL here.
  // Deploy the script as a web app (see google-apps-script.md) and paste the URL.
  const GS_ENDPOINT = window.GS_ENDPOINT || 'https://YOUR_GAS_WEBAPP_URL';

  // --- Firebase Phone Auth (optional) ---
  // Firebase config provided by user
  const firebaseConfig = {
    apiKey: "YOUR_FIREBASE_API_KEY",
    authDomain: "harsh-guru-ji-93963.firebaseapp.com",
    projectId: "harsh-guru-ji-93963",
    storageBucket: "harsh-guru-ji-93963.firebasestorage.app",
    messagingSenderId: "608363765469",
    appId: "1:608363765469:web:6eba382f98e13690358534"
  };

  let firebaseAvailable = false;
  if (window.firebase && !firebase.apps.length) {
    try {
      firebase.initializeApp(firebaseConfig);
      firebaseAvailable = true;
    } catch (e) {
      console.warn('Firebase init failed', e);
    }
  } else if (window.firebaseModular && window.firebaseModular.app) {
    // modular SDK initialized via firebase-init.js
    firebaseAvailable = true;
  }

  async function sendOtpViaFirebase(mobile) {
    if (!firebaseAvailable) throw new Error('Firebase not available');
    // ensure recaptcha container exists
    const container = document.getElementById('recaptcha-container');
    if (!container) throw new Error('recaptcha-container missing');
    // create recaptcha verifier (invisible)
    window.recaptchaVerifier = window.recaptchaVerifier || new firebase.auth.RecaptchaVerifier('recaptcha-container', { size: 'invisible' });
    const appVerifier = window.recaptchaVerifier;
    try {
      const confirmationResult = await firebase.auth().signInWithPhoneNumber(mobile, appVerifier);
      // ask user for code via modal
      const code = await showOtpModal('Enter the SMS code sent to ' + mobile);
      if (!code) throw new Error('Code required');
      const result = await confirmationResult.confirm(code);
      return { success: true, result };
    } catch (err) {
      // reset recaptcha on error
      try { appVerifier.clear(); } catch (e) {}
      throw err;
    }
  }

  // Show OTP modal and resolve entered code or null if cancelled
  function showOtpModal(title) {
    return new Promise((resolve) => {
      const modal = document.getElementById('otp-modal');
      const input = document.getElementById('otp-modal-input');
      const submit = document.getElementById('otp-modal-submit');
      const cancel = document.getElementById('otp-modal-cancel');
      const titleEl = document.getElementById('otp-modal-title');
      const desc = document.getElementById('otp-modal-desc');
      titleEl.textContent = title || 'Enter code';
      desc.style.display = title ? 'block' : 'none';
      input.value = '';
      modal.style.display = 'flex';
      input.focus();
      function cleanup() { modal.style.display = 'none'; submit.removeEventListener('click', onSubmit); cancel.removeEventListener('click', onCancel); }
      function onSubmit(e) { e.preventDefault(); const v = input.value.trim(); cleanup(); resolve(v || null); }
      function onCancel(e) { e.preventDefault(); cleanup(); resolve(null); }
      submit.addEventListener('click', onSubmit);
      cancel.addEventListener('click', onCancel);
      input.addEventListener('keydown', function onKey(e) { if (e.key === 'Enter') { onSubmit(e); input.removeEventListener('keydown', onKey); } });
    });
  }

  // Show modal to collect new password (with confirm)
  function showNewPasswordModal() {
    return new Promise((resolve) => {
      const modal = document.getElementById('newpass-modal');
      const input = document.getElementById('newpass-modal-input');
      const input2 = document.getElementById('newpass-modal-input-2');
      const submit = document.getElementById('newpass-modal-submit');
      const cancel = document.getElementById('newpass-modal-cancel');
      input.value = '';
      input2.value = '';
      modal.style.display = 'flex';
      input.focus();
      function cleanup() { modal.style.display = 'none'; submit.removeEventListener('click', onSubmit); cancel.removeEventListener('click', onCancel); }
      function onSubmit(e) {
        e.preventDefault();
        const a = input.value.trim();
        const b = input2.value.trim();
        if (!a) return alert('Password required');
        if (a !== b) return alert('Passwords do not match');
        cleanup();
        resolve(a);
      }
      function onCancel(e) { e.preventDefault(); cleanup(); resolve(null); }
      submit.addEventListener('click', onSubmit);
      cancel.addEventListener('click', onCancel);
      input.addEventListener('keydown', function onKey(e) { if (e.key === 'Enter') { onSubmit(e); input.removeEventListener('keydown', onKey); } });
    });
  }

  // Show signup prompt for first-time visitors
  // Show signup prompt for first-time visitors (attempt autologin first)
  try {
    (async () => {
      try { await tryAutoLogin(); } catch (e) { console.warn('autologin failed', e); }
      if (!localStorage.getItem('loggedIn') && !localStorage.getItem('seenSignupPrompt')) {
        setTimeout(() => {
          showSignupModal();
          localStorage.setItem('seenSignupPrompt', '1');
        }, 1500);
      }
    })();
  } catch (e) {}

  function showSignupModal() {
    const m = document.createElement('div');
    m.id = 'signup-prompt';
    m.style.cssText = 'position:fixed;inset:0;display:flex;align-items:center;justify-content:center;background:rgba(0,0,0,0.6);z-index:10000;';
    m.innerHTML = `<div style="background:var(--bg-secondary);padding:1.6rem;border-radius:12px;max-width:420px;width:100%;text-align:center;border:1px solid var(--glass-border);">
      <h3 style="margin-bottom:0.4rem;">Welcome to HarshGuruJi 👋</h3>
      <p style="color:var(--text-secondary);margin-bottom:1rem;">Create a free account to save preferences and ask questions.</p>
      <div style="display:flex;gap:0.6rem;justify-content:center;">
        <a href="join-us.html#signup" class="btn btn-primary">Sign Up</a>
        <a href="join-us.html#login" class="btn btn-secondary">Log In</a>
      </div>
      <button id="signup-close" style="margin-top:1rem;background:none;border:none;color:var(--text-secondary);cursor:pointer;">Continue without account</button>
    </div>`;
    document.body.appendChild(m);
    document.getElementById('signup-close').onclick = () => m.remove();
  }

  // Signup form submit handler (legacy signup.html only)
  const signupForm = document.querySelector('.auth-form');
  if (signupForm && document.getElementById('email') && !document.getElementById('join-us-page')) {
    signupForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const name = document.getElementById('name').value.trim();
      const email = document.getElementById('email').value.trim();
      const password = document.getElementById('password').value;

      if(!name || !email || !password) return alert('Please fill all fields');

      try {
        const res = await fetch(`${GS_ENDPOINT}?action=register`, {
          method: 'POST', headers: {'Content-Type':'application/json'},
          body: JSON.stringify({ name, email, password })
        });
        const j = await res.json();
        if (j.success) {
          alert('Account created. Please log in.');
          window.location.href = 'login.html';
        } else {
          alert(j.message || 'Failed to create account');
        }
      } catch (err) {
        console.error(err);
        alert('Failed to reach auth server. Check GS_ENDPOINT in script.js and deploy Apps Script.');
      }
    });
  }

  // Login handling (legacy login.html only — join-us uses auth.js)
  const loginForm = document.getElementById('login-form');
  if (loginForm && !document.getElementById('join-us-page')) {
    loginForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const username = document.getElementById('login-username').value.trim();
      const password = document.getElementById('login-password').value;
      const rememberMe = document.getElementById('remember-me') ? document.getElementById('remember-me').checked : false;
      if(!username || !password) return alert('Enter credentials');
      try {
        const res = await fetch(`${GS_ENDPOINT}?action=login`, {
          method:'POST', headers:{'Content-Type':'application/json'},
          body: JSON.stringify({ username, password })
        });
        const j = await res.json();
        if (j.success) {
          // mark logged in locally
          localStorage.setItem('loggedIn', JSON.stringify({ name: j.name, email: j.email }));
          // If user chose remember me, request server to create an autologin token
          if (rememberMe) {
            try {
              const tokenRes = await fetch(`${GS_ENDPOINT}?action=saveAutoLogin`, {
                method: 'POST', headers: {'Content-Type':'application/json'},
                body: JSON.stringify({ identifier: username, days: 30 })
              });
              const t = await tokenRes.json();
              if (t && t.success && t.token) {
                localStorage.setItem('autologinToken', t.token);
              }
            } catch (err) { console.warn('saveAutoLogin failed', err); }
          }
          alert('Logged in successfully');
          window.location.href = 'index.html';
        } else {
          if (j.reason === 'password_mismatch') {
            if (confirm('Password incorrect. Would you like to request a password reset OTP?')) {
              await sendResetOtp(username);
            }
          } else {
            alert(j.message || 'Login failed');
          }
        }
      } catch (err) {
        console.error(err);
        alert('Login failed: cannot reach auth server.');
      }
    });

    // forgot link
    const forgot = document.getElementById('forgot-link');
    if (forgot) forgot.addEventListener('click', async (e) => {
      e.preventDefault();
      const identifier = prompt('Enter your registered email or mobile to receive OTP');
      if (identifier) await sendResetOtp(identifier.trim());
    });

    // OTP login button
    const otpBtn = document.getElementById('login-otp-btn');
    if (otpBtn) otpBtn.addEventListener('click', async (e) => {
      e.preventDefault();
      const usernameField = document.getElementById('login-username');
      let identifier = usernameField && usernameField.value.trim();
        if (!identifier) {
        identifier = prompt('Enter your registered email or mobile to receive OTP');
        if (!identifier) return;
      }
      try {
        // request OTP from server (or Twilio/email)
        const sendRes = await fetch(`${GS_ENDPOINT}?action=sendOtp`, {
          method:'POST', headers:{'Content-Type':'application/json'},
          body: JSON.stringify({ identifier })
        });
        const s = await sendRes.json();
        if (!s.success) return alert(s.message || 'Failed to send OTP');
        const otp = await showOtpModal('Enter the OTP sent to your email/mobile');
        if (!otp) return alert('OTP required');
        const verifyRes = await fetch(`${GS_ENDPOINT}?action=verifyOtp`, {
          method:'POST', headers:{'Content-Type':'application/json'},
          body: JSON.stringify({ identifier, otp })
        });
        const v = await verifyRes.json();
        if (v && v.success) {
          // mark logged in locally
          localStorage.setItem('loggedIn', JSON.stringify({ name: v.name, email: v.email }));
          // remember me -> request autologin token
          const rememberMe = document.getElementById('remember-me') ? document.getElementById('remember-me').checked : false;
          if (rememberMe) {
            try {
              const tokenRes = await fetch(`${GS_ENDPOINT}?action=saveAutoLogin`, {
                method: 'POST', headers: {'Content-Type':'application/json'},
                body: JSON.stringify({ identifier, days: 30 })
              });
              const t = await tokenRes.json();
              if (t && t.success && t.token) localStorage.setItem('autologinToken', t.token);
            } catch (e) { console.warn('saveAutoLogin failed', e); }
          }
          alert('Logged in successfully');
          window.location.href = 'index.html';
        } else {
          alert(v.message || 'OTP verification failed');
        }
      } catch (err) {
        console.error(err);
        alert('OTP login failed.');
      }
    });
  }

  // Attempt autologin using stored token
  async function tryAutoLogin() {
    try {
      const token = localStorage.getItem('autologinToken');
      if (!token) return;
      const res = await fetch(`${GS_ENDPOINT}?action=verifyAutoLogin`, {
        method: 'POST', headers: {'Content-Type':'application/json'},
        body: JSON.stringify({ token })
      });
      const j = await res.json();
      if (j && j.success) {
        localStorage.setItem('loggedIn', JSON.stringify({ name: j.name, email: j.email }));
      } else {
        // clear invalid token
        localStorage.removeItem('autologinToken');
      }
    } catch (e) {
      console.error('tryAutoLogin error', e);
    }
  }

  async function sendResetOtp(identifier) {
    try {
      // If identifier looks like a phone number and Firebase is available, use Firebase Phone Auth
      const isPhone = /^\+?\d{10,15}$/.test(identifier.replace(/\s+/g, ''));
      if (isPhone && firebaseAvailable) {
        const mobile = identifier;
        try {
          await sendOtpViaFirebase(mobile);
          const newPass = await showNewPasswordModal();
          if (!newPass) return alert('Password required');
          const reset = await fetch(`${GS_ENDPOINT}?action=resetPassword`, {
            method:'POST', headers:{'Content-Type':'application/json'},
            body: JSON.stringify({ identifier, newPassword: newPass })
          });
          const r = await reset.json();
          if (r.success) alert('Password reset. Please log in.'); else alert(r.message || 'Reset failed');
          return;
        } catch (err) {
          console.error('Firebase phone auth failed', err);
          alert('Phone verification failed, falling back to email/SMS via server.');
        }
      }

      // Fallback: server-driven OTP (Twilio or email)
      const res = await fetch(`${GS_ENDPOINT}?action=sendOtp`, {
        method:'POST', headers:{'Content-Type':'application/json'},
        body: JSON.stringify({ identifier })
      });
      const j = await res.json();
      if (j.success) {
        const otp = await showOtpModal('Enter the OTP sent to your email/mobile');
        if (!otp) return alert('OTP required');
        const verify = await fetch(`${GS_ENDPOINT}?action=verifyOtp`, {
          method:'POST', headers:{'Content-Type':'application/json'},
          body: JSON.stringify({ identifier, otp })
        });
        const v = await verify.json();
        if (v.success) {
          const newPass = await showNewPasswordModal();
          if (!newPass) return alert('Password required');
          const reset = await fetch(`${GS_ENDPOINT}?action=resetPassword`, {
            method:'POST', headers:{'Content-Type':'application/json'},
            body: JSON.stringify({ identifier, newPassword: newPass })
          });
          const r = await reset.json();
          if (r.success) alert('Password reset. Please log in.'); else alert(r.message || 'Reset failed');
        } else {
          alert(v.message || 'OTP verification failed');
        }
      } else {
        alert(j.message || 'Failed to send OTP');
      }
    } catch (err) {
      console.error(err);
      alert('Failed to send OTP.');
    }
  }

  // ── SCROLL PROGRESS BAR ──
  // scroll-progress animation disabled to prevent navbar scroll effects



  // ── COOKIE CONSENT ──
  const cookieBanner = document.getElementById('cookie-banner');
  const cookieAccept = document.getElementById('cookie-accept');
  if (cookieBanner && cookieAccept) {
    if (localStorage.getItem('cookieAccepted')) {
      cookieBanner.classList.add('hidden');
    }
    cookieAccept.addEventListener('click', () => {
      localStorage.setItem('cookieAccepted', 'true');
      cookieBanner.classList.add('hidden');
    });
  }

  // ── SCROLL REVEAL ANIMATION ──
  // Add .reveal class to key sections
  document.querySelectorAll('.section-header, .feature-card, .category-card, .daily-card, .faq-item, .about-stat').forEach(el => {
    el.classList.add('reveal');
  });
  const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        revealObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.1 });
  document.querySelectorAll('.reveal').forEach(el => revealObserver.observe(el));

  // Schedule daily newsletter simulation check
  scheduleDailyNewsletter();
});

// ── DAILY NEWSLETTER SCHEDULER (global simulation) ──
function scheduleDailyNewsletter() {
  const subscriptions = JSON.parse(localStorage.getItem('newsletter_subscriptions') || '[]');
  if (subscriptions.length === 0) return;

  const now = new Date();
  const lastSend = localStorage.getItem('last_newsletter_send');
  
  // Target time: 6:00 AM today
  const targetTime = new Date();
  targetTime.setHours(6, 0, 0, 0);

  let shouldSend = false;
  if (!lastSend) {
    if (now >= targetTime) {
      shouldSend = true;
    }
  } else {
    const lastSendDate = new Date(lastSend);
    const isNewDay = now.getDate() !== lastSendDate.getDate() || now.getMonth() !== lastSendDate.getMonth() || now.getFullYear() !== lastSendDate.getFullYear();
    if (isNewDay && now >= targetTime) {
      shouldSend = true;
    }
  }

  if (shouldSend) {
    const randomQuote = DAILY_THOUGHTS[Math.floor(Math.random() * DAILY_THOUGHTS.length)];
    const dateStr = now.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
    
    console.log(`%c[SYSTEM MESSAGE SENDER] Sending morning newsletter (6:00 AM) to ${subscriptions.length} subscribers:`, 'color: #10b981; font-weight: bold;');
    subscriptions.forEach(email => {
      console.log(`%cTo: ${email}\nSubject: HarshGuruJi Daily Insights & News - ${dateStr}\n\nGood Morning!\nHere is your daily update for 6:00 AM:\n\nThought of the day:\n"${randomQuote.quote}" — ${randomQuote.author}\n\nWhat's New on HarshGuruJi:\n- Games and Apps page now online!\n- Enhanced unified user profile and 7-day cooldown safety updates.\n\nKeep learning and growing!\nHarshGuruJi Team`, 'color: #3b82f6;');
    });

    // Toast Alert
    const toast = document.createElement('div');
    toast.style.cssText = `
      position: fixed; bottom: 20px; left: 20px; max-width: 350px;
      background: rgba(16, 185, 129, 0.95); color: white; padding: 1.2rem;
      border-radius: 12px; box-shadow: 0 10px 30px rgba(0,0,0,0.5); z-index: 100000;
      font-size: 0.9rem; font-family: 'Inter', sans-serif; line-height: 1.5;
      animation: slideIn 0.5s ease, fadeOut 0.5s ease 7s forwards;
    `;
    toast.innerHTML = `
      <div style="font-weight:bold; margin-bottom:0.4rem; display:flex; align-items:center; gap:0.5rem;">
        <span>✉️</span> System Message Sender (6:00 AM)
      </div>
      <div>Daily updates, news, and thoughts have been automatically sent to <strong>${subscriptions.length}</strong> subscriber email inbox(es)!</div>
    `;
    
    const style = document.createElement('style');
    style.innerHTML = `
      @keyframes slideIn { from { transform: translateX(-100%); opacity: 0; } to { transform: translateX(0); opacity: 1; } }
      @keyframes fadeOut { from { opacity: 1; } to { opacity: 0; } }
    `;
    document.head.appendChild(style);
    document.body.appendChild(toast);

    localStorage.setItem('last_newsletter_send', now.toISOString());
  }
}

// ── WELCOME EMAIL SIMULATION (global function) ──
window.simulateWelcomeNewsletter = function(email) {
  const now = new Date();
  const dateStr = now.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
  const randomQuote = DAILY_THOUGHTS[Math.floor(Math.random() * DAILY_THOUGHTS.length)];
  
  console.log(`%c[SYSTEM MESSAGE SENDER] Sending Welcome email to: ${email}`, 'color: #10b981; font-weight: bold;');
  console.log(`%cTo: ${email}\nSubject: Welcome to HarshGuruJi Newsletter!\n\nHi there!\nThank you for subscribing to HarshGuruJi. You will receive updates daily at 6:00 AM.\n\nHere is a preview of today's insights:\n\nThought of the day:\n"${randomQuote.quote}" — ${randomQuote.author}\n\nWhat's New on HarshGuruJi:\n- Games and Apps page now online!\n- Enhanced unified user profile and 7-day cooldown safety updates.\n\nHave a great day!\nHarshGuruJi Team`, 'color: #3b82f6;');
  
  const toast = document.createElement('div');
  toast.style.cssText = `
    position: fixed; bottom: 20px; left: 20px; max-width: 350px;
    background: rgba(16, 185, 129, 0.95); color: white; padding: 1.2rem;
    border-radius: 12px; box-shadow: 0 10px 30px rgba(0,0,0,0.5); z-index: 100000;
    font-size: 0.9rem; font-family: 'Inter', sans-serif; line-height: 1.5;
    animation: slideIn 0.5s ease, fadeOut 0.5s ease 7s forwards;
  `;
  toast.innerHTML = `
    <div style="font-weight:bold; margin-bottom:0.4rem; display:flex; align-items:center; gap:0.5rem;">
      <span>✉️</span> System Message Sender (Welcome)
    </div>
    <div>A welcome email has been simulated and sent to <strong>${email}</strong>! You will receive daily updates at 6:00 AM.</div>
  `;
  document.body.appendChild(toast);
};

// ── FAQ TOGGLE (global function) ──
function toggleFaq(btn) {
  const answer = btn.nextElementSibling;
  const isOpen = btn.classList.contains('open');
  document.querySelectorAll('.faq-question').forEach(q => {
    q.classList.remove('open');
    q.nextElementSibling.classList.remove('open');
  });
  if (!isOpen) {
    btn.classList.add('open');
    answer.classList.add('open');
  }
}

// ── NEWSLETTER HANDLER (global function) ──
async function handleNewsletter(e) {
  e.preventDefault();
  const email = document.getElementById('newsletter-email').value.trim();
  const msg = document.getElementById('newsletter-msg');
  const btn = document.getElementById('btn-index-pvopr') || e.target.querySelector('button[type="submit"]');
  
  if (!email || !validateEmail(email)) {
    msg.style.color = '#ff3366';
    msg.innerText = '❌ Please enter a valid email address.';
    return;
  }
  
  const subscriptions = JSON.parse(localStorage.getItem('newsletter_subscriptions') || '[]');
  if (subscriptions.includes(email)) {
    msg.style.color = '#f59e0b';
    msg.innerText = '⚠️ This email is already subscribed.';
    return;
  }
  
  try {
    if(btn) { btn.disabled = true; btn.innerText = 'Subscribing...'; }
    msg.style.color = '#3b82f6';
    msg.innerText = 'Subscribing...';

    // Call the backend API that uses Resend
    const response = await fetch('/api/newsletter/subscribe', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email })
    });

    const result = await response.json();

    if (response.ok && result.success) {
      subscriptions.push(email);
      localStorage.setItem('newsletter_subscriptions', JSON.stringify(subscriptions));
      
      msg.style.color = '#10b981';
      msg.innerText = `✅ Thank you! "${email}" has been subscribed. A welcome email has been sent!`;
      document.getElementById('newsletter-email').value = '';
    } else {
      throw new Error(result.message || 'Failed to subscribe');
    }
  } catch (error) {
    console.error('Newsletter error:', error);
    msg.style.color = '#ff3366';
    msg.innerText = '❌ Failed to subscribe. Please try again later.';
  } finally {
    if(btn) { btn.disabled = false; btn.innerText = 'Subscribe →'; }
  }
}

// Email validation helper
function validateEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}
