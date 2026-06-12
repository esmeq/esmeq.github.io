// ═══════════════════════════════════════════════════════════════
// script.js  —  logica interattiva del portfolio
//
// Questo file viene caricato dall'HTML con:
//   <script src="script.js"></script>
//
// Il browser esegue questo codice DOPO aver costruito la pagina
// (grazie a defer nell'HTML), quindi possiamo accedere a tutti
// gli elementi del DOM senza problemi.
// ═══════════════════════════════════════════════════════════════


// ─── 1. FLIP CARD ────────────────────────────────────────────
// Aggiunge/rimuove la classe CSS "flipped" sulla card cliccata.
// Il CSS fa tutto il resto: rotateY(180deg) sul .card-inner.
function flipCard(card) {
  card.classList.toggle('flipped');
}


// ─── 2. ANIMAZIONE BARRE SKILL ───────────────────────────────
// IntersectionObserver avvisa il browser quando un elemento
// entra nel viewport. Così animiamo le barre solo quando
// l'utente scorre fino alla sezione skill.
const skillObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      // Aggiorniamo la larghezza di ogni barra con il valore
      // memorizzato nell'attributo data-pct="80"
      document.querySelectorAll('.skill-fill').forEach(bar => {
        const pct = bar.getAttribute('data-pct');
        bar.style.width = pct + '%';
      });
      // Disconnettiamo: l'animazione si fa una volta sola
      skillObserver.disconnect();
    }
  });
}, { threshold: 0.2 }); // scatta quando il 20% della sezione è visibile

const skillsSection = document.querySelector('#skills');
if (skillsSection) skillObserver.observe(skillsSection);


// ─── 3. REVEAL ON SCROLL ─────────────────────────────────────
// Gli elementi con classe .reveal partono con opacity:0 (vedi CSS).
// Quando entrano nel viewport, aggiungiamo .visible e il CSS
// li fa apparire con una transizione.
const revealObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('visible');
    }
  });
}, {
  threshold: 0.1,
  rootMargin: '0px 0px -40px 0px'
});

document.querySelectorAll('.reveal').forEach(el => {
  revealObserver.observe(el);
});


// ─── 4. FORM SUBMIT ──────────────────────────────────────────
// Un form vero richiederebbe un server (Flask, Node...).
// Per ora mostriamo un alert e svuotiamo i campi.
function handleSubmit() {
  const name  = document.getElementById('name').value.trim();
  const email = document.getElementById('email').value.trim();
  const msg   = document.getElementById('message').value.trim();

  if (!name || !email || !msg) {
    alert('Compila tutti i campi prima di inviare.');
    return;
  }

  alert(`Grazie, ${name}! Il messaggio è stato inviato. ✓`);

  document.getElementById('name').value    = '';
  document.getElementById('email').value   = '';
  document.getElementById('message').value = '';
}


// ─── 5. TOGGLE LINGUA ────────────────────────────────────────
// Ogni elemento traducibile nell'HTML ha due attributi:
//   data-it="Testo italiano"
//   data-en="English text"
//
// toggleLang() legge questi attributi e aggiorna il contenuto
// di tutti gli elementi in una sola passata.

let currentLang = 'it';

function toggleLang() {
  currentLang = currentLang === 'it' ? 'en' : 'it';

  // Aggiorniamo l'etichetta del bottone
  document.getElementById('langBtn').textContent =
    currentLang === 'it' ? 'EN' : 'IT';

  // Aggiorniamo l'attributo lang (buona pratica per accessibilità
  // e per i motori di ricerca)
  document.documentElement.lang = currentLang;

  // Aggiorniamo innerHTML di tutti gli elementi con data-it
  document.querySelectorAll('[data-it]').forEach(el => {
    const text = el.getAttribute('data-' + currentLang);
    if (text) el.innerHTML = text;
  });

  // Input e textarea usano "placeholder", non innerHTML:
  // gestiamo separatamente con data-it-placeholder / data-en-placeholder
  document.querySelectorAll('[data-it-placeholder]').forEach(el => {
    const ph = el.getAttribute('data-' + currentLang + '-placeholder');
    if (ph) el.placeholder = ph;
  });

  // Avvisiamo il typewriter della nuova lingua
  updateTypewriterLang(currentLang);
}


// ─── 6. TYPEWRITER NELLA HERO ────────────────────────────────
// Funzione autoeseguita (IIFE = Immediately Invoked Function
// Expression): viene chiamata subito senza bisogno di invocarla.
// Le variabili interne (lang, textIndex...) sono "private":
// non inquinano lo scope globale, come una funzione static in C.
(function () {
  const subtitle = document.querySelector('.hero-subtitle');

  const textsByLang = {
    it: [
      'Ingegneria Informatica — Robotica.',
      'Appassionata di sistemi embedded.',
      'Esploro autonomia e controllo.',
      'Sempre in beta. Mai finished.'
    ],
    en: [
      'Computer Engineering — Robotics.',
      'Passionate about embedded systems.',
      'Exploring autonomy and control.',
      'Always in beta. Never finished.'
    ]
  };

  let lang       = 'it';
  let textIndex  = 0;
  let charIndex  = 0;
  let isDeleting = false;
  let timer      = null;
  const cursor   = '<span class="cursor"></span>';

  // Esponiamo questa funzione a window (scope globale) così
  // toggleLang() può chiamarla dall'esterno della IIFE
  window.updateTypewriterLang = function (newLang) {
    lang = newLang;
    clearTimeout(timer);   // interrompiamo il ciclo in corso
    isDeleting = true;     // iniziamo a cancellare il testo attuale
    tick();
  };

  function tick() {
    const texts   = textsByLang[lang];
    const current = texts[textIndex % texts.length];

    if (!isDeleting) {
      charIndex++;
      subtitle.innerHTML = current.slice(0, charIndex) + cursor;
      if (charIndex === current.length) {
        isDeleting = true;
        timer = setTimeout(tick, 2000); // pausa prima di cancellare
        return;
      }
    } else {
      charIndex--;
      subtitle.innerHTML = current.slice(0, charIndex) + cursor;
      if (charIndex === 0) {
        isDeleting = false;
        textIndex = (textIndex + 1) % texts.length;
      }
    }

    const speed = isDeleting ? 40 : 70; // cancella più veloce di quanto scrive
    timer = setTimeout(tick, speed);
  }

  setTimeout(tick, 1500); // inizia dopo 1.5s per non sovrapporsi alle animazioni CSS
})();