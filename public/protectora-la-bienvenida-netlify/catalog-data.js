(async function loadCatalog() {
  const grid = document.querySelector('.animal-grid');
  const count = document.querySelector('.animal-count');
  if (!grid) return;

  const escapeHtml = (value) =>
    String(value ?? '').replace(/[&<>"']/g, (character) => ({
      '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#039;',
    })[character]);

  try {
    const response = await fetch('/.netlify/functions/animals?view=catalog', {
      headers: { Accept: 'application/json' },
    });
    if (!response.ok) throw new Error();
    const { animals } = await response.json();
    const orderedAnimals = [...animals].sort((left, right) => Number(Boolean(right.urgent)) - Number(Boolean(left.urgent)));
    grid.innerHTML = orderedAnimals.map((animal) => {
      const photos = Array.isArray(animal.photos) && animal.photos.length ? animal.photos : [''];
      const focusX = clampFocus(animal.photoFocusX);
      const focusY = clampFocus(animal.photoFocusY);
      const age = currentAge(animal.age, animal.arrivalDate);
      const photoButtons = photos.length > 1 ? `
            <button class="catalog-gallery-arrow catalog-gallery-prev" type="button" aria-label="Ver foto anterior de ${escapeHtml(animal.name)}">‹</button>
            <button class="catalog-gallery-arrow catalog-gallery-next" type="button" aria-label="Ver foto siguiente de ${escapeHtml(animal.name)}">›</button>
            <div class="catalog-gallery-dots" aria-label="Fotos de ${escapeHtml(animal.name)}">
              ${photos.map((_, index) => `<button type="button" class="${index === 0 ? 'active' : ''}" aria-label="Ver foto ${index + 1} de ${escapeHtml(animal.name)}" aria-current="${index === 0}"></button>`).join('')}
            </div>` : '';
      return `
      <article class="animal-card visible" data-type="${escapeHtml(animal.species.toLowerCase())}"
        tabindex="0" role="link" data-animal-id="${encodeURIComponent(animal.id)}">
        <div class="photo catalog-photo" data-photos="${escapeHtml(JSON.stringify(photos))}" data-current-photo="0" data-focus-x="${focusX}" data-focus-y="${focusY}">
          <img src="${escapeHtml(photos[0])}" alt="${escapeHtml(animal.name)} — foto 1 de ${photos.length}" loading="lazy" decoding="async" style="object-position:${focusX}% ${focusY}%">
          ${animal.urgent ? '<span class="urgent">Urgente</span>' : animal.status !== 'available' ? `<span>${escapeHtml(statusLabel(animal.status))}</span>` : ''}
          ${photoButtons}
        </div>
        <div class="animal-info">
          <div><h3>${escapeHtml(animal.name)}</h3>
          <p class="animal-tags"><span>${age} ${age === 1 ? 'año' : 'años'}</span><span>${escapeHtml(animal.sex)}</span><span>${escapeHtml(animal.size)}</span></p></div>
          <button class="circle-button" type="button" aria-label="Ver a ${escapeHtml(animal.name)}">↗</button>
        </div>
      </article>`;
    }).join('');

    const cards = [...grid.querySelectorAll('.animal-card')];
    const open = (card) => { location.href = `/animal?id=${card.dataset.animalId}`; };
    cards.forEach((card) => {
      card.addEventListener('click', () => open(card));
      card.addEventListener('keydown', (event) => { if (event.key === 'Enter') open(card); });
    });
    grid.querySelectorAll('.catalog-photo').forEach((gallery) => setupQuickGallery(gallery));
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
    count.textContent = `${orderedAnimals.length} ${orderedAnimals.length === 1 ? 'animal' : 'animales'}`;
  } catch {
    grid.innerHTML = '<p class="catalog-error">No hemos podido cargar los animales. Inténtalo de nuevo en unos minutos.</p>';
    count.textContent = 'Datos no disponibles';
  }

  function statusLabel(status) {
    return { reserved: 'Reservado', adopted: 'Adoptado', medical: 'En cuidados médicos' }[status] || 'Disponible';
  }

  function clampFocus(value) {
    const number = Number(value);
    return Number.isFinite(number) ? Math.min(100, Math.max(0, number)) : 50;
  }

  function currentAge(ageAtArrival, arrivalDate) {
    const arrival = new Date(`${arrivalDate}T00:00:00`);
    if (!arrivalDate || Number.isNaN(arrival.getTime())) return ageAtArrival;
    const today = new Date();
    let years = today.getFullYear() - arrival.getFullYear();
    if (today.getMonth() < arrival.getMonth() || (today.getMonth() === arrival.getMonth() && today.getDate() < arrival.getDate())) years--;
    return ageAtArrival + Math.max(0, years);
  }

  function setupQuickGallery(gallery) {
    const photos = JSON.parse(gallery.dataset.photos || '[]');
    if (photos.length < 2) return;
    const image = gallery.querySelector('img');
    const dots = [...gallery.querySelectorAll('.catalog-gallery-dots button')];
    let startX = null;

    gallery.addEventListener('click', (event) => event.stopPropagation());

    const show = (nextIndex) => {
      const index = (nextIndex + photos.length) % photos.length;
      gallery.dataset.currentPhoto = String(index);
      image.src = photos[index];
      image.style.objectPosition = index === 0 ? `${gallery.dataset.focusX}% ${gallery.dataset.focusY}%` : '50% 50%';
      image.alt = `${image.alt.split(' — ')[0]} — foto ${index + 1} de ${photos.length}`;
      dots.forEach((dot, dotIndex) => {
        const active = dotIndex === index;
        dot.classList.toggle('active', active);
        dot.setAttribute('aria-current', String(active));
      });
    };
    const move = (amount) => show(Number(gallery.dataset.currentPhoto || 0) + amount);
    gallery.querySelector('.catalog-gallery-prev').addEventListener('click', (event) => { event.stopPropagation(); move(-1); });
    gallery.querySelector('.catalog-gallery-next').addEventListener('click', (event) => { event.stopPropagation(); move(1); });
    dots.forEach((dot, index) => dot.addEventListener('click', (event) => { event.stopPropagation(); show(index); }));
    gallery.addEventListener('touchstart', (event) => { startX = event.changedTouches[0].clientX; }, { passive: true });
    gallery.addEventListener('touchend', (event) => {
      if (startX === null) return;
      const distance = event.changedTouches[0].clientX - startX;
      startX = null;
      if (Math.abs(distance) > 35) move(distance < 0 ? 1 : -1);
    }, { passive: true });
  }
})();
