const cleanRoutes = {
  'index.html': '/',
  'adopta.html': '/adopta',
  'nosotros.html': '/nosotros',
  'ayuda.html': '/como-ayudar',
  'contacto.html': '/contacto',
  'animal.html': '/animal',
};

document.querySelectorAll('a[href]').forEach((link) => {
  const href = link.getAttribute('href');
  const [page, hash = ''] = href.split('#');
  const cleanRoute = cleanRoutes[page];

  if (cleanRoute) {
    link.setAttribute('href', `${cleanRoute}${hash ? `#${hash}` : ''}`);
  }
});

const menuButton = document.querySelector('.menu-toggle');
const nav = document.querySelector('.nav');
if (nav && !nav.querySelector('.access-link')) {
  const accessLink = document.createElement('a');
  const donateLink = nav.querySelector('.button');
  accessLink.className = 'access-link';
  accessLink.href = '/admin';
  accessLink.textContent = 'Acceder';
  nav.insertBefore(accessLink, donateLink);
}
menuButton.addEventListener('click', () => {
  const open = nav.classList.toggle('open');
  menuButton.setAttribute('aria-expanded', open);
  menuButton.textContent = open ? '×' : '☰';
});
document.querySelectorAll('.nav a').forEach((a) =>
  a.addEventListener('click', () => {
    nav.classList.remove('open');
    menuButton.setAttribute('aria-expanded', 'false');
    menuButton.textContent = '☰';
  }),
);
const filters = document.querySelectorAll('.filter');
const cards = document.querySelectorAll('.animal-card');
const animalCount = document.querySelector('.animal-count');
filters.forEach((button) =>
  button.addEventListener('click', () => {
    filters.forEach((b) => b.classList.remove('active'));
    button.classList.add('active');
    let visible = 0;
    cards.forEach((card) => {
      const hidden = button.dataset.filter !== 'all' && card.dataset.type !== button.dataset.filter;
      card.classList.toggle('hidden', hidden);
      if (!hidden) visible++;
    });
    animalCount.textContent = `${visible} ${visible === 1 ? 'animal' : 'animales'}`;
  }),
);
const amounts = document.querySelectorAll('.amounts button');
const donateButton = document.querySelector('#donate-button');
amounts.forEach((button) =>
  button.addEventListener('click', () => {
    amounts.forEach((b) => b.classList.remove('selected'));
    button.classList.add('selected');
    const amount = button.textContent.trim();
    donateButton.textContent =
      amount === 'Otra' ? 'Quiero hacer una donación' : `Quiero ayudar con ${amount}`;
    donateButton.href = `mailto:petercanespejos@gmail.com?subject=${encodeURIComponent(amount === 'Otra' ? 'Quiero hacer una donación' : `Quiero donar ${amount}`)}`;
  }),
);
const observer = new IntersectionObserver(
  (entries) =>
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        observer.unobserve(entry.target);
      }
    }),
  { threshold: 0.12 },
);
document.querySelectorAll('.reveal').forEach((el) => observer.observe(el));
document.querySelectorAll('.animal-info p').forEach((summary) => {
  const tags = summary.textContent
    .split('·')
    .map((tag) => tag.trim())
    .filter(Boolean);
  summary.classList.add('animal-tags');
  summary.innerHTML = tags.map((tag) => `<span>${tag}</span>`).join('');
});
document.querySelectorAll('.circle-button').forEach((button) =>
  button.addEventListener('click', () => {
    const name = button.closest('.animal-card').querySelector('h3').textContent.toLowerCase();
      location.href = `/animal?id=${encodeURIComponent(name)}`;
  }),
);
document.querySelectorAll('.animal-card').forEach((card) => {
  card.tabIndex = 0;
  card.setAttribute('role', 'link');
  const open = (event) => {
    if (event.target.closest('button')) return;
    const name = card.querySelector('h3').textContent.toLowerCase();
      location.href = `/animal?id=${encodeURIComponent(name)}`;
  };
  card.addEventListener('click', open);
  card.addEventListener('keydown', (event) => {
    if (event.key === 'Enter') open(event);
  });
});
