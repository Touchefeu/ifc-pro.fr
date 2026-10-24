/* Le ciel et l'apparition au défilement, communs à toutes les pages. */
/* Le ciel : quelques étoiles qui dérivent, sans rien suivre. Discret, et
   arrêté si l'utilisateur préfère moins de mouvement. */
(function(){
  const io = new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting){ e.target.classList.add('vu'); io.unobserve(e.target); } }), {threshold:.12});
  document.querySelectorAll('.monte').forEach(el => io.observe(el));
  const c = document.getElementById('ciel');
  if (!c || getComputedStyle(c).display === 'none') return;
  const x = c.getContext('2d');
  const calme = matchMedia('(prefers-reduced-motion: reduce)').matches;
  let W, H, E = [];
  function taille(){
    W = c.width = innerWidth * devicePixelRatio; H = c.height = innerHeight * devicePixelRatio;
    c.style.width = innerWidth + 'px'; c.style.height = innerHeight + 'px';
    E = Array.from({length: Math.round(innerWidth * innerHeight / 9000)}, () => ({
      x: Math.random() * W, y: Math.random() * H, r: (Math.random() * 1.2 + .3) * devicePixelRatio,
      v: (Math.random() * .08 + .02) * devicePixelRatio, a: Math.random() * .6 + .15,
      t: Math.random() < .08 ? '181,125,240' : '159,196,255'}));
  }
  function dessin(){
    x.clearRect(0, 0, W, H);
    for (const e of E){
      if (!calme){ e.y -= e.v; if (e.y < -5) { e.y = H + 5; e.x = Math.random() * W; } }
      x.globalAlpha = e.a; x.fillStyle = 'rgb(' + e.t + ')';
      x.beginPath(); x.arc(e.x, e.y, e.r, 0, 7); x.fill();
    }
    if (!calme) requestAnimationFrame(dessin);
  }
  addEventListener('resize', () => { taille(); if (calme) dessin(); });
  taille(); dessin();
})();

/* La volte des cartes : l'inclinaison d'abord, le retournement après un temps
   court. Au doigt (pas de survol), un appui retourne la carte. */
(function(){
  const TEMPS_PLAQUE = 350, DUREE_VOLTE = 450;
  document.querySelectorAll('.volte').forEach(v => {
    const int = v.querySelector('.volte-int'), recto = v.querySelector('.recto');
    let minuterie = null, finVolte = null;
    const retourner = () => { v.classList.add('retournee'); finVolte = setTimeout(() => v.classList.add('pose'), DUREE_VOLTE); };
    const remettre = () => {
      clearTimeout(minuterie); clearTimeout(finVolte); v.classList.remove('retournee', 'pose');
      ['--rx', '--ry'].forEach(p => int.style.removeProperty(p)); recto.style.removeProperty('--brille');
    };
    v.addEventListener('pointerenter', e => { if (e.pointerType === 'mouse') minuterie = setTimeout(retourner, TEMPS_PLAQUE); });
    v.addEventListener('pointermove', e => {
      if (e.pointerType !== 'mouse') return;
      const r = v.getBoundingClientRect(), x = (e.clientX - r.left) / r.width, y = (e.clientY - r.top) / r.height;
      const k = v.classList.contains('retournee') ? .35 : 1;
      int.style.setProperty('--rx', ((0.5 - y) * 12 * k).toFixed(1) + 'deg');
      int.style.setProperty('--ry', ((x - 0.5) * 14 * k).toFixed(1) + 'deg');
      recto.style.setProperty('--angle', (90 + x * 90) + 'deg'); recto.style.setProperty('--brille', '.55');
    });
    v.addEventListener('pointerleave', e => { if (e.pointerType === 'mouse') remettre(); });
    v.addEventListener('click', e => { if (e.pointerType && e.pointerType === 'mouse') return; v.classList.contains('retournee') ? remettre() : retourner(); });
    v.addEventListener('keydown', e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); v.classList.contains('retournee') ? remettre() : retourner(); } });
    v.addEventListener('blur', remettre);
  });
})();