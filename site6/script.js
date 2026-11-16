// Плавное появление карточек при прокрутке
(function () {
  var cards = document.querySelectorAll('.card');
  if (!('IntersectionObserver' in window)) return;

  cards.forEach(function (card, i) {
    card.style.opacity = '0';
    card.style.transform = 'translateY(16px)';
    card.style.transition = 'opacity .6s ease ' + i * 0.08 + 's, transform .6s ease ' + i * 0.08 + 's';
  });

  var io = new IntersectionObserver(function (entries) {
    entries.forEach(function (e) {
      if (e.isIntersecting) {
        e.target.style.opacity = '1';
        e.target.style.transform = 'none';
        io.unobserve(e.target);
      }
    });
  }, { threshold: 0.15 });

  cards.forEach(function (c) { io.observe(c); });
})();
