/* ============================================================================
   L'ASSISTANT DE METACUBE, SUR LE SITE D'IFC — 28/09/2026
   ============================================================================
   « Fais naviguer l'assistant en respectant son visuel d'origine, idem dans
     l'encadré IA agentique. »                                     — Aurélien

   LE DESSIN EST CELUI DU PRODUIT, RECOPIÉ ET NON RÉINVENTÉ : la sphère de
   Fibonacci (130 points, 3 arêtes par point), la projection, la déformation,
   le halo et la table des états viennent de METACUBE/DOC/gabarit/presence.js
   (`fibonacci`, `aretes`, `_sphere`, `ETATS`, la dérive de `_image`). Si le
   produit change son dessin, c'est là qu'il faut revenir.

   LE COMPOSANT N'EST PAS CHARGÉ TEL QUEL, ET C'EST VOULU : il démarre seul,
   prend le clavier de la page, ouvre ses menus et interroge le serveur de
   présence du poste (127.0.0.1:8765). Sur un site public, tout cela serait
   faux. On ne garde que le corps.

   Deux usages :
     · le COMPAGNON, fixe par-dessus la page : il dérive, et quand on choisit
       une rubrique du menu il y emmène — il part (réflexion), traverse,
       arrive (réponse), puis retourne à sa dérive (repos) ;
     · la VIGNETTE de l'encadré « IA agentique » : les quatre états de la
       conversation, l'un après l'autre, mélangés comme dans le produit.
   ========================================================================= */
(function () {
  'use strict';

  var ETATS = {
    repos:     { h: 212, s: 48, l: 58, a: .20, desordre: .04, souffle: .020, vitesse: .10, halo: .08 },
    ecoute:    { h: 194, s: 95, l: 74, a: .62, desordre: .09, souffle: .085, vitesse: .20, halo: .38 },
    reflexion: { h: 220, s: 60, l: 52, a: .34, desordre: .40, souffle: .010, vitesse: .95, halo: .12 },
    reponse:   { h: 142, s: 74, l: 60, a: .62, desordre: .06, souffle: .120, vitesse: .28, halo: .40 }
  };
  var N = 130, VOISINS = 3;
  var calme = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;

  function fibonacci(n) {
    var pts = [], phi = Math.PI * (3 - Math.sqrt(5));
    for (var i = 0; i < n; i++) {
      var y = 1 - (i / (n - 1)) * 2, r = Math.sqrt(Math.max(0, 1 - y * y)), t = phi * i;
      pts.push([Math.cos(t) * r, y, Math.sin(t) * r]);
    }
    return pts;
  }
  function aretes(pts, k) {
    var out = [];
    for (var i = 0; i < pts.length; i++) {
      var d = [];
      for (var j = 0; j < pts.length; j++) {
        if (i === j) continue;
        var dx = pts[i][0] - pts[j][0], dy = pts[i][1] - pts[j][1], dz = pts[i][2] - pts[j][2];
        d.push([dx * dx + dy * dy + dz * dz, j]);
      }
      d.sort(function (a, b) { return a[0] - b[0]; });
      for (var q = 0; q < k; q++) if (d[q][1] > i) out.push([i, d[q][1]]);
    }
    return out;
  }
  function melanger(a, b, t) { return a + (b - a) * t; }
  function douceur(t) { return t < .5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2; }

  var PTS = fibonacci(N), ARCS = aretes(PTS, VOISINS);

  // `_sphere` de presence.js, à l'identique.
  function sphere(cx, cxp, cyp, R, m, t, rot) {
    if (rot === undefined) rot = t * m.vitesse;
    var g = cx.createRadialGradient(cxp, cyp, R * 0.2, cxp, cyp, R * 3.1);
    g.addColorStop(0, 'hsla(' + m.h + ',' + m.s + '%,' + m.l + '%,' + (m.halo * 0.55) + ')');
    g.addColorStop(1, 'hsla(' + m.h + ',' + m.s + '%,' + m.l + '%,0)');
    cx.fillStyle = g;
    cx.beginPath(); cx.arc(cxp, cyp, R * 3.1, 0, 6.2832); cx.fill();
    var a = rot, b = rot * 0.63;
    var ca = Math.cos(a), sa = Math.sin(a), cb = Math.cos(b), sb = Math.sin(b);
    var proj = new Array(PTS.length);
    for (var i = 0; i < PTS.length; i++) {
      var P = PTS[i], x = P[0], y = P[1], z = P[2];
      var x1 = x * ca - z * sa, z1 = x * sa + z * ca;
      var y1 = y * cb - z1 * sb, z2 = y * sb + z1 * cb;
      var n = Math.sin(x1 * 3.1 + t * 1.7) * Math.cos(y1 * 2.7 - t * 1.3) * Math.sin(z2 * 2.2 + t * 0.9);
      var r = 1 + n * m.desordre;
      proj[i] = [cxp + x1 * R * r, cyp + y1 * R * r, z2];
    }
    cx.lineWidth = 1;
    for (var e = 0; e < ARCS.length; e++) {
      var A = proj[ARCS[e][0]], B = proj[ARCS[e][1]];
      var prof = (A[2] + B[2]) * 0.5;
      var op = m.a * (0.30 + 0.70 * (prof + 1) / 2);
      cx.strokeStyle = 'hsla(' + m.h + ',' + m.s + '%,' + m.l + '%,' + op + ')';
      cx.beginPath(); cx.moveTo(A[0], A[1]); cx.lineTo(B[0], B[1]); cx.stroke();
    }
    for (var s = 0; s < proj.length; s++) {
      if (proj[s][2] < 0.05) continue;
      var av = (proj[s][2] + 1) / 2;
      cx.fillStyle = 'hsla(' + m.h + ',' + Math.min(100, m.s + 6) + '%,' +
        Math.min(88, m.l + 8) + '%,' + (m.a * av * 1.5) + ')';
      cx.beginPath(); cx.arc(proj[s][0], proj[s][1], 0.9 + av * 0.9, 0, 6.2832);
      cx.fill();
    }
  }

  // Le mélange progressif d'un état vers l'autre — `_image` de presence.js.
  function Corps(etat) {
    this.vise = etat; this.m = {}; this.rot = 0;
    for (var p in ETATS[etat]) this.m[p] = ETATS[etat][p];
  }
  Corps.prototype.avancer = function (dt) {
    var c = ETATS[this.vise], k = Math.min(1, dt * 3.2);
    for (var p in c) this.m[p] = melanger(this.m[p], c[p], k);
    this.rot += dt * this.m.vitesse;
  };

  function ajuster(cv, L, H) {
    var dpr = Math.min(2, window.devicePixelRatio || 1);
    if (cv.width !== Math.floor(L * dpr) || cv.height !== Math.floor(H * dpr)) {
      cv.width = Math.floor(L * dpr); cv.height = Math.floor(H * dpr);
    }
    var cx = cv.getContext('2d');
    cx.setTransform(dpr, 0, 0, dpr, 0, 0);
    cx.clearRect(0, 0, L, H);
    return cx;
  }

  /* ── LA VIGNETTE DE L'ENCADRÉ ─────────────────────────────────────────── */
  function vignette(cv) {
    var corps = new Corps('ecoute'), t = 0, dernier = 0, i = 0;
    var suite = ['ecoute', 'reflexion', 'reponse', 'repos'];
    if (!calme) setInterval(function () { corps.vise = suite[++i % suite.length]; }, 2600);
    function image(ms) {
      var dt = Math.min(0.05, (ms - (dernier || ms)) / 1000); dernier = ms; t += dt;
      corps.avancer(dt);
      var L = cv.clientWidth || 150, H = cv.clientHeight || 150;
      var cx = ajuster(cv, L, H), R = Math.min(L, H) * 0.26;
      sphere(cx, L / 2, H / 2, R * (1 + Math.sin(t * 2.1) * corps.m.souffle), corps.m, t, corps.rot);
      if (!calme) requestAnimationFrame(image);
    }
    requestAnimationFrame(image);
  }

  /* ── LE COMPAGNON QUI NAVIGUE ─────────────────────────────────────────── */
  function compagnon() {
    var cv = document.createElement('canvas');
    cv.setAttribute('aria-hidden', 'true');
    cv.style.cssText = 'position:fixed;inset:0;width:100%;height:100%;pointer-events:none;' +
      'z-index:20;background:transparent';
    document.body.appendChild(cv);

    var corps = new Corps('repos'), t = 0, dernier = 0, R = 30;
    var pos = { x: innerWidth - 110, y: innerHeight - 110, vx: 0, vy: 0 };
    var vol = null;                    // le trajet vers une rubrique, s'il y en a un

    function borner() {
      var marge = 70;
      pos.x = Math.max(marge, Math.min(innerWidth - marge, pos.x));
      pos.y = Math.max(marge + 60, Math.min(innerHeight - marge, pos.y));
    }

    /* IL EMMÈNE. Au clic sur une rubrique, il part du lien choisi et va se
       poser à côté du titre de la section, qui arrive en même temps que lui
       par le défilement. Il s'allume en partant, répond en arrivant, puis
       retourne à sa dérive. */
    function emmener(lien, cible) {
      if (calme) return;
      var r = lien.getBoundingClientRect();
      pos.x = r.left + r.width / 2; pos.y = r.bottom + 34;
      vol = { t: 0, T: 1.25, x0: pos.x, y0: pos.y, cible: cible };
      corps.vise = 'reflexion';
    }
    document.querySelectorAll('header nav a[href^="#"], .boutons a[href^="#"]').forEach(function (a) {
      a.addEventListener('click', function () {
        var c = document.querySelector(a.getAttribute('href'));
        if (c) emmener(a, c);
      });
    });

    function image(ms) {
      var dt = Math.min(0.05, (ms - (dernier || ms)) / 1000); dernier = ms; t += dt;
      corps.avancer(dt);

      if (vol) {
        vol.t += dt;
        var u = Math.min(1, vol.t / vol.T), ue = douceur(u);
        var titre = vol.cible.querySelector('h2') || vol.cible;
        var rc = titre.getBoundingClientRect();
        // Le point d'arrivée suit le titre pendant que la page défile.
        var ax = Math.min(innerWidth - 80, rc.right + 60), ay = Math.max(130, rc.top + rc.height / 2);
        // Une courbe, pas une ligne : l'arc monte avant de plonger.
        var bx = (vol.x0 + ax) / 2 + 120, by = Math.min(vol.y0, ay) - 40;
        var w = 1 - ue;
        pos.x = w * w * vol.x0 + 2 * w * ue * bx + ue * ue * ax;
        pos.y = w * w * vol.y0 + 2 * w * ue * by + ue * ue * ay;
        if (u > 0.55 && corps.vise === 'reflexion') corps.vise = 'ecoute';
        if (u >= 1) {
          vol = null; corps.vise = 'reponse';
          setTimeout(function () { if (!vol) corps.vise = 'repos'; }, 1800);
        }
      } else if (!calme) {
        // La dérive de presence.js : elle ne va nulle part, elle dit que c'est vivant.
        var cx0 = Math.sin(t * 0.21) * 8, cy0 = Math.cos(t * 0.17) * 6;
        pos.vx += (cx0 - pos.vx) * dt; pos.vy += (cy0 - pos.vy) * dt;
        pos.x += pos.vx * dt * 6; pos.y += pos.vy * dt * 6;
        borner();
      }

      var cx = ajuster(cv, innerWidth, innerHeight);
      sphere(cx, pos.x, pos.y, R * (1 + Math.sin(t * 2.1) * corps.m.souffle), corps.m, t, corps.rot);
      requestAnimationFrame(image);
    }
    addEventListener('resize', borner);
    requestAnimationFrame(image);
  }

  function demarrer() {
    document.querySelectorAll('canvas.presence').forEach(vignette);
    // Pas de compagnon sur un écran de téléphone : il couvrirait le texte.
    if (innerWidth > 760) compagnon();
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', demarrer);
  else demarrer();
})();
