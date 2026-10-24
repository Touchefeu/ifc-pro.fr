/* LE MENU AU DOIGT — 24/10/2026. Sous 600 px, le bandeau n'a pas la place
   des six onglets : un bouton ☰ les déplie sous le bandeau, un second appui
   ou le choix d'un onglet les replie. Au-dessus de 600 px, rien ne change. */
(function(){
  const tete = document.querySelector('header .page'), nav = tete && tete.querySelector('nav');
  if (!nav) return;
  const b = document.createElement('button');
  b.className = 'menu-bouton'; b.type = 'button';
  b.setAttribute('aria-label', 'Ouvrir le menu'); b.setAttribute('aria-expanded', 'false');
  b.innerHTML = '<span></span><span></span><span></span>';
  tete.appendChild(b);
  const header = tete.closest('header');
  function basculer(ouvrir){
    header.classList.toggle('menu-ouvert', ouvrir);
    b.setAttribute('aria-expanded', ouvrir ? 'true' : 'false');
    b.setAttribute('aria-label', ouvrir ? 'Fermer le menu' : 'Ouvrir le menu');
  }
  b.addEventListener('click', () => basculer(!header.classList.contains('menu-ouvert')));
  nav.addEventListener('click', e => { if (e.target.closest('a')) basculer(false); });
  addEventListener('keydown', e => { if (e.key === 'Escape') basculer(false); });
})();
