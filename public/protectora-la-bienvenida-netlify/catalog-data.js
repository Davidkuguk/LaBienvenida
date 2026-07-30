(async function loadCatalog() {
  const grid = document.querySelector('.animal-grid');
  const count = document.querySelector('.animal-count');
  if (!grid) return;

  const escapeHtml = (value) =>
    String(value ?? '').replace(/[&<>"']/g, (character) => ({
      '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#039;',
    })[character]);

  try {
    const response = await fetch('/.netlify/functions/animals', {
      headers: { Accept: 'application/json' },
      cache: 'no-store',
    });
    if (!response.ok) throw new Error();
    const { animals } = await response.json();
    grid.innerHTML = animals.map((animal) => `
      <article class="animal-card visible" data-type="${escapeHtml(animal.species.toLowerCase())}"
        tabindex="0" role="link" data-animal-id="${encodeURIComponent(animal.id)}">
        <div class="photo">
          <img src="${escapeHtml(animal.photos[0] || '')}" alt="${escapeHtml(animal.name)}">
          ${animal.status !== 'available' ? `<span>${escapeHtml(statusLabel(animal.status))}</span>` : ''}
        </div>
        <div class="animal-info">
          <div><h3>${escapeHtml(animal.name)}</h3>
          <p class="animal-tags"><span>${animal.age} ${animal.age === 1 ? 'año' : 'años'}</span><span>${escapeHtml(animal.sex)}</span><span>${escapeHtml(animal.size)}</span></p></div>
          <button class="circle-button" type="button" aria-label="Ver a ${escapeHtml(animal.name)}">↗</button>
        </div>
      </article>`).join('');

    const cards = [...grid.querySelectorAll('.animal-card')];
    const open = (card) => { location.href = `/animal?id=${card.dataset.animalId}`; };
    cards.forEach((card) => {
      card.addEventListener('click', () => open(card));
      card.addEventListener('keydown', (event) => { if (event.key === 'Enter') open(card); });
    });
    document.querySelectorAll('.filter').forEach((button) => {
      button.onclick = () => {
        document.querySelectorAll('.filter').forEach((item) => item.classList.remove('active'));
        button.classList.add('active');
        let visible = 0;
        cards.forEach((card) => {
          const hidden = button.dataset.filter !== 'all' && card.dataset.type !== button.dataset.filter;
          card.classList.toggle('hidden', hidden);
          if (!hidden) visible++;
        });
        count.textContent = `${visible} ${visible === 1 ? 'animal' : 'animales'}`;
      };
    });
    count.textContent = `${animals.length} ${animals.length === 1 ? 'animal' : 'animales'}`;
  } catch {
    grid.innerHTML = '<p class="catalog-error">No hemos podido cargar los animales. Inténtalo de nuevo en unos minutos.</p>';
    count.textContent = 'Datos no disponibles';
  }

  function statusLabel(status) {
    return { reserved: 'Reservado', adopted: 'Adoptado', medical: 'En cuidados' }[status] || 'Disponible';
  }
})();
