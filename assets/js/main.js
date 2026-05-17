/* ===== MAIN.JS — plain HTML compatible (no build step) ===== */

// ----- Dark mode -----
const darkBtn = document.getElementById('dark-toggle');
const root = document.documentElement;
if(localStorage.getItem('light')==='1') root.classList.add('light');
if(darkBtn){
  darkBtn.addEventListener('click',()=>{
    root.classList.toggle('light');
    localStorage.setItem('light', root.classList.contains('light')?'1':'0');
    darkBtn.textContent = root.classList.contains('light')? '🌙' : '☀️';
  });
  darkBtn.textContent = root.classList.contains('light')? '🌙' : '☀️';
}

// ----- Language toggle (persisted) -----
const langBtn = document.getElementById('lang-toggle');
function applyLang(lang){
  if(lang==='np'){ document.body.classList.add('np'); if(langBtn) langBtn.textContent='EN'; }
  else { document.body.classList.remove('np'); if(langBtn) langBtn.textContent='नेपाली'; }
  localStorage.setItem('lang', lang);
}
applyLang(localStorage.getItem('lang')||'en');
if(langBtn) langBtn.addEventListener('click',()=>{
  applyLang(document.body.classList.contains('np')?'en':'np');
});

// ----- Hamburger -----
const ham = document.getElementById('hamburger');
const mob = document.getElementById('mobile-menu');
if(ham) ham.addEventListener('click',()=> mob.classList.toggle('open'));

// ----- Cursor glow -----
const glow = document.querySelector('.cursor-glow');
if(glow) document.addEventListener('mousemove',e=>{
  glow.style.left = e.clientX+'px';
  glow.style.top = e.clientY+'px';
});

// ----- Active nav link -----
document.querySelectorAll('.nav-links a').forEach(l=>{
  if(location.pathname.endsWith(l.getAttribute('href'))) l.classList.add('active');
});

// ----- Magnetic buttons (vanilla, no GSAP needed) -----
document.querySelectorAll('.magnetic').forEach(btn=>{
  btn.addEventListener('mousemove',e=>{
    const r=btn.getBoundingClientRect();
    const x=(e.clientX-r.left-r.width/2)*.25;
    const y=(e.clientY-r.top-r.height/2)*.25;
    btn.style.transform=`translate(${x}px,${y}px)`;
  });
  btn.addEventListener('mouseleave',()=>{ btn.style.transform=''; });
});

// ----- Scroll pop-up animations (replaces Lenis lag) -----
const popObs = new IntersectionObserver(entries=>{
  entries.forEach(e=>{
    if(e.isIntersecting){
      e.target.classList.add('in');
      popObs.unobserve(e.target);
    }
  });
},{threshold:.12, rootMargin:'0px 0px -60px 0px'});
function registerPopups(){
  document.querySelectorAll('.pop, .pop-zoom, .pop-left, .pop-right').forEach(el=>{
    if(!el.classList.contains('in')) popObs.observe(el);
  });
}
registerPopups();

// Auto-tag common scroll items if not tagged (so AOS markup keeps working)
document.querySelectorAll('[data-aos]').forEach(el=>{
  const t = el.getAttribute('data-aos');
  el.classList.add(
    t==='zoom-in' ? 'pop-zoom'
    : t==='fade-left' ? 'pop-left'
    : t==='fade-right' ? 'pop-right'
    : 'pop'
  );
  const delay = parseInt(el.getAttribute('data-aos-delay')||'0',10);
  if(delay) el.style.transitionDelay = (delay/1000)+'s';
  popObs.observe(el);
});

// ----- Counter animation -----
function animateCounters(scope){
  (scope||document).querySelectorAll('.stat-num,.ab-stat-num').forEach(el=>{
    if(el.dataset.done==='1') return;
    const target=parseFloat(el.dataset.target||el.textContent)||0;
    const suffix=el.dataset.suffix||el.textContent.replace(/[\d.]/g,'')||'';
    let start=0;const dur=1600;const step=16;
    const inc=target/(dur/step);
    const t=setInterval(()=>{
      start+=inc;
      if(start>=target){start=target;clearInterval(t);}
      el.textContent=Math.floor(start)+suffix;
    },step);
    el.dataset.done='1';
  });
}
const counterObs=new IntersectionObserver(entries=>{
  entries.forEach(e=>{ if(e.isIntersecting){ animateCounters(e.target); counterObs.unobserve(e.target); } });
},{threshold:.3});
document.querySelectorAll('.hero-stats,.about-stats').forEach(s=>counterObs.observe(s));

// ----- WhatsApp per-product enquiry -----
// FIX 9: Obfuscated WA number (base64 encoded)
const WA_NUMBER = atob('OTc3OTgwMjA3NzQ5MQ==');
function buildWaMessage(product, np){
  if(np){
    return `नमस्ते आंचल ट्रेडिङ! 👋\n\nम *${product}* को बारेमा जानकारी लिन चाहन्छु।\n\nकृपया निम्न विवरण पठाउनुहोस्:\n• मूल्य (प्रति बोरा / प्रति पीस)\n• हालको स्टक उपलब्धता\n• थोक खरिद छुट\n• डेलिभरी समय र लागत\n\nधन्यवाद!`;
  }
  return `Namaste Aanchal Trading! 👋\n\nI'm interested in *${product}* and would like more information.\n\nPlease share:\n• Price per bag / per piece\n• Current stock availability\n• Bulk / wholesale discount\n• Delivery time & cost to my location\n\nThank you!`;
}
function openWhatsApp(product){
  const np = document.body.classList.contains('np');
  const msg = buildWaMessage(product, np);
  const url = `https://wa.me/${WA_NUMBER}?text=${encodeURIComponent(msg)}`;
  window.open(url,'_blank','noopener');
}
document.querySelectorAll('.wa-btn').forEach(btn=>{
  btn.addEventListener('click',e=>{
    e.preventDefault();
    const product = btn.getAttribute('data-product') || 'your products';
    openWhatsApp(product);
  });
});

// ----- Form (FIX 3: input validation + sanitization) -----
const form = document.getElementById('contact-form');
if(form) form.addEventListener('submit', e => {
  e.preventDefault();

  // Honeypot check — bots fill the hidden #website field; humans don't see it
  const honeypot = form.querySelector('#website');
  if (honeypot && honeypot.value) return; // silently drop bot submissions

  const np = document.body.classList.contains('np');

  function sanitize(str, maxLen) {
    return (str || '').replace(/[<>"'&]/g, '').trim().slice(0, maxLen || 200);
  }
  function isValidPhone(p) {
    return /^(98|97)\d{8}$/.test(p.replace(/[\s\-]/g, ''));
  }

  const inputs = form.querySelectorAll('input, textarea, select');
  const name    = sanitize(inputs[0]?.value, 100);
  const phone   = sanitize(inputs[1]?.value, 15);
  const email   = sanitize(inputs[2]?.value, 150);
  const type    = sanitize(inputs[3]?.value, 100);
  const message = sanitize(inputs[4]?.value, 500);

  if (!name) {
    alert(np ? 'कृपया आफ्नो नाम लेख्नुहोस्।' : 'Please enter your name.');
    return;
  }
  if (!isValidPhone(phone)) {
    alert(np ? 'कृपया सही नेपाल मोबाइल नम्बर लेख्नुहोस् (98/97 बाट सुरु)।' : 'Please enter a valid Nepal mobile number (starting with 98 or 97).');
    return;
  }
  if (!message) {
    alert(np ? 'कृपया सन्देश लेख्नुहोस्।' : 'Please enter a message.');
    return;
  }

  const txt = np
    ? `नमस्ते आंचल ट्रेडिङ!\n\nनाम: ${name}\nफोन: ${phone}\nइमेल: ${email}\nप्रकार: ${type}\n\nसन्देश:\n${message}`
    : `Hello Aanchal Trading!\n\nName: ${name}\nPhone: ${phone}\nEmail: ${email}\nInquiry Type: ${type}\n\nMessage:\n${message}`;

  const url = `https://wa.me/${WA_NUMBER}?text=${encodeURIComponent(txt)}`;
  window.open(url, '_blank', 'noopener');

  const btn = form.querySelector('button[type="submit"]');
  if(btn) {
    const orig = btn.textContent;
    btn.textContent = '✓ Sent via WhatsApp!';
    btn.style.background = '#25d366';
    setTimeout(() => { btn.textContent = orig; btn.style.background = ''; form.reset(); }, 2500);
  }
});

// ----- INTRO OVERLAY (5 simultaneous animations) -----
window.addEventListener('load',()=>{
  const io = document.querySelector('.intro-overlay');
  if(!io) return;
  // build particles
  const pf = io.querySelector('.intro-particles');
  if(pf && !pf.children.length){
    for(let i=0;i<24;i++){
      const p=document.createElement('span');
      p.className='intro-particle';
      p.style.left=(Math.random()*100)+'%';
      p.style.animationDelay=(Math.random()*1.5)+'s';
      p.style.animationDuration=(2+Math.random()*2.5)+'s';
      p.style.width=p.style.height=(3+Math.random()*5)+'px';
      pf.appendChild(p);
    }
  }
  setTimeout(()=>{
    io.classList.add('done');
    setTimeout(()=>{ io.style.display='none'; },900);
  }, 3200);
});
