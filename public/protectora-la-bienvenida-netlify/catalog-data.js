(async function loadCatalog() {
  const grid = document.querySelector('.animal-grid');
  const count = document.querySelector('.animal-count');
  if (!grid) return;

  const escapeHtml = (value) =>
    String(value ?? '').replace(/[&<>"']/g, (character) => ({
      '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#039;',
    })[character]);

  const renderAnimal = (animal) => {
      const photos = Array.isArray(animal.photos) && animal.photos.length ? animal.photos : [''];
      const focusX = clampFocus(animal.photoFocusX);
      const focusY = clampFocus(animal.photoFocusY);
      const age = currentAge(animal.age, animal.arrivalDate, animal.ageUnit);
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
          <p class="animal-tags"><span>${age}</span><span>${escapeHtml(animal.sex)}</span><span>${escapeHtml(animal.size)}</span></p></div>
          <button class="circle-button" type="button" aria-label="Ver a ${escapeHtml(animal.name)}">↗</button>
        </div>
      </article>`;

  };
  let offset = 0;
  let species = document.querySelector('.filter.active')?.dataset.filter || 'all';
  let hasMore = true;
  let loading = false;
  let generation = 0;
  let controller;
  const more = document.createElement('button');
  more.type = 'button';
  more.className = 'catalog-load-more';
  more.textContent = 'Cargar más animales';
  grid.after(more);
  const status = document.createElement('p');
  status.setAttribute('role', 'status');
  more.after(status);
  let observer;
  const loadMore = async () => {
    if (loading || !hasMore) return;
    const currentGeneration = generation;
    controller = new AbortController();
    loading = true;
    more.disabled = true;
    status.textContent = 'Cargando animales…';
    try {
      const pageSize = window.matchMedia('(min-width: 851px)').matches ? 25 : 10;
      const params = new URLSearchParams({ view: 'catalog', limit: String(pageSize), offset: String(offset), species });
      const response = await fetch('/.netlify/functions/animals?' + params, {
        headers: { Accept: 'application/json' }, signal: controller.signal,
      });
      if (!response.ok) throw new Error();
      const { animals, total, hasMore: nextPage } = await response.json();
      if (currentGeneration !== generation) return;
      const fragment = document.createElement('template');
      fragment.innerHTML = animals.map(renderAnimal).join('');
      const cards = [...fragment.content.querySelectorAll('.animal-card')];
      cards.forEach((card) => {
        const open = () => { location.href = `/animal?id=${card.dataset.animalId}`; };
        card.addEventListener('click', open);
        card.addEventListener('keydown', (event) => { if (event.key === 'Enter' && event.target === card) open(); });
        card.querySelectorAll('.catalog-photo').forEach(setupQuickGallery);
      });
      grid.append(fragment.content);
      offset += animals.length;
      hasMore = Boolean(nextPage) && animals.length > 0;
      count.textContent = `${total} ${total === 1 ? 'animal' : 'animales'}`;
      status.textContent = total === 0 ? 'No hay animales con este filtro.' : '';
      more.hidden = !hasMore;
      if (hasMore && observer) {
        observer.unobserve(more);
        observer.observe(more);
      }
    } catch (error) {
      if (currentGeneration !== generation || error.name === 'AbortError') return;
      status.textContent = 'No hemos podido cargar los animales. Pulsa para reintentar.';
      more.textContent = 'Reintentar';
    } finally {
      if (currentGeneration === generation) {
        loading = false;
        more.disabled = false;
      }
    }
  };
  more.addEventListener('click', loadMore);
  if ('IntersectionObserver' in window) {
    observer = new IntersectionObserver((entries) => {
      if (entries.some((entry) => entry.isIntersecting)) loadMore();
    }, { rootMargin: '300px' });
  }
  const reset = () => {
    generation++;
    controller?.abort();
    observer?.unobserve(more);
    loading = false;
    offset = 0;
    hasMore = true;
    grid.innerHTML = '';
    count.textContent = 'Cargando…';
    more.hidden = false;
    more.textContent = 'Cargar más animales';
    loadMore();
  };
  document.querySelectorAll('.filter').forEach((button) => {
    button.onclick = () => {
      document.querySelectorAll('.filter').forEach((item) => item.classList.remove('active'));
      button.classList.add('active');
      species = button.dataset.filter;
      reset();
    };
  });
  reset();

  function statusLabel(status) {
    return { reserved: 'Reservado', adopted: 'Adoptado', medical: 'En cuidados médicos' }[status] || 'Disponible';
  }

  function clampFocus(value) {
    const number = Number(value);
    return Number.isFinite(number) ? Math.min(100, Math.max(0, number)) : 50;
  }

  function currentAge(ageAtArrival, arrivalDate, ageUnit = 'years') {
    const arrival = new Date(`${arrivalDate}T00:00:00`);
    const today = new Date();
    let elapsedMonths = 0;
    if (arrivalDate && !Number.isNaN(arrival.getTime())) {
      elapsedMonths = (today.getFullYear() - arrival.getFullYear()) * 12 + today.getMonth() - arrival.getMonth();
      if (today.getDate() < arrival.getDate()) elapsedMonths--;
    }
    const months = Math.round(ageAtArrival * (ageUnit === 'months' ? 1 : 12)) + Math.max(0, elapsedMonths);
    const years = Math.floor(months / 12);
    const remainingMonths = months % 12;
    const yearLabel = `${years} ${years === 1 ? 'año' : 'años'}`;
    const monthLabel = `${remainingMonths} ${remainingMonths === 1 ? 'mes' : 'meses'}`;
    return years === 0 ? monthLabel : remainingMonths === 0 ? yearLabel : `${yearLabel} y ${monthLabel}`;
  }

  function setupQuickGallery(gallery) {
    const photos = JSON.parse(gallery.dataset.photos || '[]');
    if (photos.length < 2) return;
    const image = gallery.querySelector('img');
    const dots = [...gallery.querySelectorAll('.catalog-gallery-dots button')];
    let startX = null;
    let requestedIndex = 0;
    let requestId = 0;
    const loadedPhotos = new Map();
    const normalize = (index) => (index + photos.length) % photos.length;
    const loadPhoto = (index) => {
      index = normalize(index);
      if (!loadedPhotos.has(index)) {
        const pending = new Promise((resolve, reject) => {
          const preload = new Image();
          preload.decoding = 'async';
          preload.onload = async () => {
            try { await preload.decode(); } catch { /* The loaded image can still be displayed. */ }
            resolve(preload);
          };
          preload.onerror = () => reject(new Error('Photo unavailable'));
          preload.src = photos[index];
        }).catch((error) => { loadedPhotos.delete(index); throw error; });
        loadedPhotos.set(index, pending);
      }
      return loadedPhotos.get(index);
    };
    const preloadAdjacent = (index) => {
      loadPhoto(index + 1).catch(() => {});
      loadPhoto(index - 1).catch(() => {});
    };
    if ('IntersectionObserver' in window) {
      const observer = new IntersectionObserver((entries) => {
        if (entries.some((entry) => entry.isIntersecting)) {
          preloadAdjacent(Number(gallery.dataset.currentPhoto || 0));
          observer.disconnect();
        }
      }, { rootMargin: '200px' });
      observer.observe(gallery);
    } else {
      preloadAdjacent(0);
    }
    gallery.addEventListener('pointerenter', () => preloadAdjacent(requestedIndex));
    gallery.addEventListener('focusin', () => preloadAdjacent(requestedIndex));

    gallery.addEventListener('click', (event) => event.stopPropagation());

    const show = async (nextIndex) => {
      const index = normalize(nextIndex);
      requestedIndex = index;
      const currentRequest = ++requestId;
      gallery.setAttribute('aria-busy', 'true');
      try {
        await loadPhoto(index);
      } catch {
        if (currentRequest === requestId) {
          requestedIndex = Number(gallery.dataset.currentPhoto || 0);
          gallery.setAttribute('aria-busy', 'false');
        }
        return;
      }
      if (currentRequest !== requestId) return;
      gallery.setAttribute('aria-busy', 'false');
      gallery.dataset.currentPhoto = String(index);
      image.loading = 'eager';
      image.src = photos[index];
      image.style.objectPosition = index === 0 ? `${gallery.dataset.focusX}% ${gallery.dataset.focusY}%` : '50% 50%';
      image.alt = `${image.alt.split(' — ')[0]} — foto ${index + 1} de ${photos.length}`;
      dots.forEach((dot, dotIndex) => {
        const active = dotIndex === index;
        dot.classList.toggle('active', active);
        dot.setAttribute('aria-current', String(active));
      });
      preloadAdjacent(index);
    };
    const move = (amount) => show(requestedIndex + amount);
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
