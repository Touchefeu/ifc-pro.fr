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
