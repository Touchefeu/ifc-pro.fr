/* L'ARMOIRE DES VIDÉOS — la série « Le moteur au travail », rangée par thème.
   L'armoire Monolithe des contacts de METACUBE (maquette d'Aurélien du
   10/10/2026, METACUBE/contacts_armoire.py), reprise telle quelle : un tiroir
   par thème (A à L), une fiche debout par vidéo. Clic gauche :
   on descend (armoire → tiroir → vidéo) ; clic droit : on remonte ; clic
   gauche maintenu : on tourne l'armoire. Un glisser n'est pas un clic.
   Une vidéo entre ici le jour où elle est postée sur LinkedIn. */
(function(){
  const racine = document.getElementById('armoire');
  if (!racine) return;

  /* ── LES DONNÉES : les cycles, puis les vidéos publiées ── */
  const CYCLES = [
    ['A', 'Banques — trésorerie'], ['B', 'RFE — facture électronique'], ['C', 'Achats — fournisseurs'],
    ['D', 'Ventes — clients'], ['E', 'Stocks et en-cours'], ['F', 'Paie — personnel'],
    ['G', 'Impôts — taxes'], ['H', 'Capitaux propres'], ['I', 'Provisions et régularisations'],
    ['J', 'Engagements hors bilan'], ['K', 'Relations intragroupe'], ['L', 'Clôture — transversal']];
  const VIDEOS = [
    {n: 1, cycle: 'F', titre: 'Une ligne de banque', duree: '2 min',
     fichier: 'videos/une-ligne-de-banque.mp4', image: 'videos/une-ligne-de-banque.jpg',
     texte: "« SALAIRE JANVIER CLAIRE · 4 200 € », passée au compte des salaires. Sans SIREN ni consigne, le moteur lit le dossier, écarte les formes juridiques une à une, chacune par un texte, et conclut : Claire est gérante majoritaire, sa rémunération ne relève pas du 641."},
    {n: 2, cycle: 'B', titre: 'La RFE en 2 minutes', duree: '2 min',
     fichier: 'videos/la-rfe-en-2-minutes.mp4', image: 'videos/la-rfe-en-2-minutes.jpg',
     texte: "Les trois flux de la réforme : la facture, ses statuts, l'e-reporting. Puis le piège du lettrage, qui fait disparaître un paiement ou le déclare au mauvais mois, et la réponse du moteur : partir de la banque, et confronter la comptabilité à ce que la plateforme a transmis."},
    {n: 3, cycle: 'C', titre: 'Un loyer, douze mois', duree: '2 min',
     fichier: 'videos/un-loyer.mp4', image: 'videos/un-loyer.jpg',
     texte: "Douze mois de loyer doivent être en charge, factures ou OD. Il en manque un : août, payé mais jamais saisi. L'assistant propose l'écriture et la pièce au référent. Puis le bail : le rappel d'indexation a été passé sur le mauvais indice ; elle propose le complément, au format Sage 100 de l'entité."}];
  const TIROIRS = CYCLES.map(([l, nom]) => ({code: l, nom, videos: VIDEOS.filter(v => v.cycle === l)}));

  /* ── LA GÉOMÉTRIE DOM 3D, celle de la maquette ── */
  const scene = racine.querySelector('.ar-scene'), monde = racine.querySelector('.ar-monde');
  const hudFil = racine.querySelector('.ar-fil'), hudCorps = racine.querySelector('.ar-corps');
  function el(tag, cls, parent){ const d = document.createElement(tag); if (cls) d.className = cls; if (parent) parent.appendChild(d); return d; }
  function ancre(parent, x, y, z, cls){ const a = el('div', 'ancre' + (cls ? ' ' + cls : ''), parent); a.style.transform = `translate3d(${x}px,${y}px,${z}px)`; return a; }
  function face(parent, w, h, tf, cls){ const f = el('div', 'face' + (cls ? ' ' + cls : ''), parent); f.style.width = w + 'px'; f.style.height = h + 'px'; f.style.left = (-w / 2) + 'px'; f.style.top = (-h / 2) + 'px'; if (tf) f.style.transform = tf; return f; }
  function boite(parent, w, h, d, cls, sans){ sans = sans || []; const def = {av: [w, h, `translateZ(${d / 2}px)`], ar: [w, h, `translateZ(${-d / 2}px) rotateY(180deg)`], g: [d, h, `translateX(${-w / 2}px) rotateY(-90deg)`], d: [d, h, `translateX(${w / 2}px) rotateY(90deg)`], h: [w, d, `translateY(${-h / 2}px) rotateX(90deg)`], b: [w, d, `translateY(${h / 2}px) rotateX(-90deg)`]}; for (const k in def) if (!sans.includes(k)) face(parent, def[k][0], def[k][1], def[k][2], cls + ' ' + k); }
  function caisson(g, dw, dh, dd, hs){ face(g, dw, dd, `translateY(${dh / 2}px) rotateX(-90deg)`, 'tfond'); face(g, dd, hs, `translate3d(${-dw / 2}px,${dh / 2 - hs / 2}px,0px) rotateY(-90deg)`, 'tcote'); face(g, dd, hs, `translate3d(${dw / 2}px,${dh / 2 - hs / 2}px,0px) rotateY(90deg)`, 'tcote'); face(g, dw, hs, `translate3d(0px,${dh / 2 - hs / 2}px,${-dd / 2}px)`, 'tdos'); }
  const pts = n => '<span class="pts">' + '<i></i>'.repeat(n) + '</span>';
  const pluriel = (n, s, p) => n + ' ' + (n > 1 ? p : s);

  const COLS = 3, ROWS = 4, CW = 190, CH = 70, G = 8, D = 340, SORTIE = 280, BASE_W = 720, BASE_H = 620;
  const LW = COLS * CW + (COLS + 1) * G, HT = ROWS * CH + (ROWS + 1) * G;
  const arm = ancre(monde, 0, 0, 0);
  boite(arm, LW, HT, D, 'coque', ['av', 'b']);
  for (let r = 0; r <= ROWS; r++) face(arm, LW, G, `translate3d(0px,${-HT / 2 + G / 2 + r * (CH + G)}px,${D / 2}px)`, 'traverse');
  for (let c = 0; c <= COLS; c++) face(arm, G, HT, `translate3d(${-LW / 2 + G / 2 + c * (CW + G)}px,0px,${D / 2 + .5}px)`, 'montant');
  boite(ancre(arm, 0, HT / 2 + 14, 0), LW - 12, 28, D - 20, 'socle');
  face(arm, 2000, 2000, `translateY(${HT / 2 + 28}px) rotateX(90deg)`, 'sol');

  let vue = 1, tOuvert = -1, fSel = -1, fSurvol = -1, minuteur = 0, k3 = 1, rotX = 0, rotY = 0;
  const tiroirs = TIROIRS.map((t, j) => {
    const row = Math.floor(j / COLS), col = j % COLS;
    const x = -LW / 2 + G + CW / 2 + col * (CW + G), y = -HT / 2 + G + CH / 2 + row * (CH + G);
    const a = ancre(arm, x, y, 0, 'tiroir' + (t.videos.length ? '' : ' vide')), g = el('div', 'glissiere', a);
    const dw = CW - 2, dd = D - 12, cw = dw - 20, ch = CH + 46;
    caisson(g, dw, CH, dd, Math.round(CH * .6));
    const av = face(g, dw, CH, `translateZ(${dd / 2}px)`, 'tav');
    av.innerHTML = '<div class="lettre">' + t.code + '</div><div class="nomt">' + t.nom + '</div>' + pts(t.videos.length) + '<div class="poignee"></div>';
    av.addEventListener('click', e => { if (e.button === 0) ouvrir(j); });
    av.addEventListener('mouseenter', () => { if (j !== tOuvert) a.classList.add('tente'); });
    av.addEventListener('mouseleave', () => a.classList.remove('tente'));
    const fiches = t.videos.map((v, k) => {
      const f = face(ancre(g, 0, CH / 2 - 3 - ch / 2, dd / 2 - 30 - k * 46), cw, ch, '', 'fiche');
      f.innerHTML = '<div class="onglet" style="left:' + (6 + k * 40) + 'px">N° ' + v.n + '</div><div class="f-nom">' + v.titre + '</div><div class="f-meta">' + v.duree + ' · thème ' + t.code + '</div><div class="f-trait"></div><div class="f-prin">' + t.nom + '</div>';
      f.addEventListener('mouseenter', () => { retenir(); survoler(k); });
      f.addEventListener('click', ev => { ev.stopPropagation(); if (ev.button === 0 && tOuvert === j) selectionner(k); });
      return f;
    });
    return {a, x, y, fiches};
  });

  /* ── LA NAVIGATION : clic gauche descend, clic droit remonte ── */
  function ouvrir(j){ if (j === tOuvert) return; tOuvert = j; fSel = -1; fSurvol = -1; vue = 2; etats(); }
  function selectionner(k){ if (tOuvert < 0) return; fSel = k; fSurvol = -1; vue = 3; etats(); }
  function survoler(k){ if (vue < 2 || k === fSurvol) return; fSurvol = k; marquer(); }
  function remonter(){ if (vue === 3){ vue = 2; fSel = -1; } else if (vue === 2){ vue = 1; tOuvert = -1; fSurvol = -1; } else return; etats(); }
  function etats(){ tiroirs.forEach((t, j) => { t.a.classList.remove('tente'); t.a.classList.toggle('ouvert', j === tOuvert); }); camera(); hud(); marquer(); }
  function marquer(){
    tiroirs.forEach((t, j) => t.fiches.forEach((f, k) => { f.classList.toggle('survol', j === tOuvert && k === fSurvol && k !== fSel); f.classList.toggle('armee', j === tOuvert && k === fSel); }));
    hudCorps.querySelectorAll('.ligne[data-k]').forEach(l => l.classList.toggle('on', +l.dataset.k === fSurvol || +l.dataset.k === fSel));
  }
  function retenir(){ clearTimeout(minuteur); minuteur = 0; }
  function relacher(){ if (minuteur || fSurvol < 0) return; minuteur = setTimeout(() => { minuteur = 0; fSurvol = -1; marquer(); }, 340); }
  scene.addEventListener('mousemove', e => { if (e.target.closest('.fiche')) retenir(); else relacher(); });
  racine.addEventListener('contextmenu', e => { e.preventDefault(); remonter(); });

  function hud(){
    const t = TIROIRS[tOuvert];
    hudFil.innerHTML = vue === 1 ? '<b>Armoire</b>' : vue === 2 ? 'Armoire › <b>' + t.code + ' · ' + t.nom + '</b>' : 'Armoire › ' + t.code + ' › <b>N° ' + t.videos[fSel].n + '</b>';
    if (vue === 1){
      hudCorps.innerHTML = '<div class="resume">' + pluriel(TIROIRS.length, 'thème', 'thèmes') + ' · ' + pluriel(VIDEOS.length, 'vidéo', 'vidéos') + '</div>'
        + TIROIRS.map((e, j) => '<div class="puce' + (e.videos.length ? '' : ' vide') + '" data-j="' + j + '"><span><b>' + e.code + '</b> ' + e.nom + '</span>' + pts(e.videos.length) + '</div>').join('');
      hudCorps.querySelectorAll('.puce').forEach(l => { const j = +l.dataset.j; l.onclick = () => ouvrir(j); l.onmouseenter = () => tiroirs[j].a.classList.add('tente'); l.onmouseleave = () => tiroirs[j].a.classList.remove('tente'); });
    } else if (vue === 2){
      hudCorps.innerHTML = '<div class="resume">Thème ' + t.code + ' · ' + pluriel(t.videos.length, 'vidéo', 'vidéos') + '</div>'
        + (t.videos.length ? t.videos.map((v, k) => '<div class="ligne" data-k="' + k + '"><span class="n">N° ' + v.n + ' · ' + v.titre + '</span><span class="c">' + v.duree + '</span></div>').join('')
                           : '<p class="vide">Pas encore de vidéo dans ce thème. Elle viendra.</p>');
      hudCorps.querySelectorAll('.ligne').forEach(l => { const k = +l.dataset.k; l.onclick = () => selectionner(k); l.onmouseenter = () => { retenir(); survoler(k); }; });
    } else {
      const v = t.videos[fSel];
      hudCorps.innerHTML = '<video controls playsinline preload="metadata" poster="' + v.image + '"><source src="' + v.fichier + '" type="video/mp4"></video>'
        + '<div class="titre-fiche">' + v.titre + '</div><div class="meta">N° ' + v.n + ' · ' + v.duree + ' · thème <b>' + t.code + '</b></div><p class="texte">' + v.texte + '</p>';
    }
  }

  /* ── LA CAMÉRA, et la rotation au clic gauche maintenu ── */
  function echelle(){ const r = scene.getBoundingClientRect(); k3 = Math.min(r.width / BASE_W, r.height / BASE_H, 1.05); }
  function camera(){
    let z = 0, a = -12, b = -26, tx = 0, ty = 0, tz = 0;
    if (vue > 1){ const t = tiroirs[tOuvert]; z = vue === 2 ? 760 : 800; a = vue === 2 ? -36 : -22; b = -14; tx = -t.x; ty = -t.y + (vue === 3 ? 34 : 0); tz = -SORTIE; }
    monde.style.transform = `scale3d(${k3},${k3},${k3}) translateZ(${z}px) rotateX(${a + rotX}deg) rotateY(${b + rotY}deg) translate3d(${tx}px,${ty}px,${tz}px)`;
  }
  let prise = null, glisse = false;
  scene.addEventListener('mousedown', e => { if (e.button !== 0) return; prise = {x: e.clientX, y: e.clientY, rx: rotX, ry: rotY}; glisse = false; });
  addEventListener('mousemove', e => {
    if (!prise || !(e.buttons & 1)) return;
    const dx = e.clientX - prise.x, dy = e.clientY - prise.y;
    if (!glisse && Math.hypot(dx, dy) > 4){ glisse = true; monde.style.transition = 'none'; scene.classList.add('glisse'); }
    if (glisse){ rotY = prise.ry + dx * .3; rotX = Math.max(-60, Math.min(60, prise.rx - dy * .3)); camera(); }
  });
  addEventListener('mouseup', () => { if (!prise) return; prise = null; if (glisse){ monde.style.transition = ''; scene.classList.remove('glisse'); setTimeout(() => { glisse = false; }, 0); } });
  scene.addEventListener('click', e => { if (glisse){ e.stopPropagation(); e.preventDefault(); } }, true);

  echelle(); etats();
  addEventListener('resize', () => { echelle(); camera(); });
})();
