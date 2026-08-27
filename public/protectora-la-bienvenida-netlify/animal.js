(async function loadAnimalProfile() {
  const id = new URLSearchParams(location.search).get('id') || 'milo';
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
    const animal = animals.find((item) => item.id === id);
    if (!animal) {
      location.replace('/adopta');
      return;
    }

    document.title = `${animal.name} busca hogar · La Bienvenida`;
    const image = document.querySelector('#animal-image');
    image.src = animal.photos[0] || '';
    image.alt = `${animal.name}, animal en adopción`;
    setupGallery(animal.photos, animal.name);
    document.querySelector('#animal-status').textContent = statusLabel(animal.status);
    document.querySelector('#animal-name').textContent = animal.name;
    document.querySelector('#story-title').textContent = `Conoce a ${animal.name}`;
    document.querySelector('#animal-story').textContent = animal.notes || animal.description;
    document.querySelector('#ideal-title').textContent = animal.idealHome;

    const facts = [
      ['Edad', `${animal.age} ${animal.age === 1 ? 'año' : 'años'}`],
      ['Sexo', animal.sex],
      ['Tamaño', `${animal.size} · ${animal.weight}`],
      ['Llegada', formatDate(animal.arrivalDate)],
      ['Ejercicio', exerciseLabel(animal.exercise)],
    ];
    document.querySelector('#quick-facts').innerHTML = facts.map(([label, value]) =>
      `<div class="fact ${label === 'Ejercicio' ? 'exercise-fact' : ''}"><span>${escapeHtml(label)}</span><strong>${escapeHtml(value)}</strong></div>`
    ).join('') + `<div class="fact medical-fact"><div><span>Estado veterinario</span><strong>${escapeHtml(animal.medicalStatus)}</strong><small>${escapeHtml(animal.medicalDetail)}</small></div><b>Información actualizada</b></div>`;

    document.querySelector('#care-grid').innerHTML = [
      ['♡', 'Carácter', animal.description],
      ['✚', 'Salud', animal.medicalDetail],
      ['⌂', 'Actividad', exerciseLabel(animal.exercise)],
      ['●', 'Necesita', animal.idealHome],
    ].map(([icon, title, copy]) =>
      `<div class="care-item"><span class="care-icon">${icon}</span><h3>${title}</h3><p>${escapeHtml(copy)}</p></div>`
    ).join('');

    document.querySelector('#compat-list').innerHTML = [
      ['Con adultos', animal.compatibleAdults],
      ['Con niños', animal.compatibleChildren],
      ['Con perros', animal.compatibleDogs],
      ['Con gatos', animal.compatibleCats],
    ].map(([label, value]) =>
      `<div class="compat-row"><span>${label}</span><b class="${/valorar|adaptación|mayores/i.test(value) ? 'maybe' : ''}">${escapeHtml(value)}</b></div>`
    ).join('');

    setupActions(animal);
  } catch {
    document.querySelector('#animal-profile').innerHTML =
      '<section class="next-animal"><p>No hemos podido cargar esta ficha.</p><a href="/adopta">Volver a los animales →</a></section>';
  }

  function statusLabel(status) {
    return { available: 'Disponible para adoptar', reserved: 'Reservado', adopted: 'Adoptado', medical: 'En cuidados' }[status];
  }
  function exerciseLabel(value) {
    const level = String(value || '').split('·')[0].trim().toLowerCase();
    if (level.includes('alto')) return 'Alto';
    if (level.includes('bajo')) return 'Bajo';
    return 'Medio';
  }
  function formatDate(date) {
    if (!date) return 'Sin indicar';
    return new Intl.DateTimeFormat('es-ES', { month: 'long', year: 'numeric', timeZone: 'UTC' }).format(new Date(date));
  }
  function setupActions(animal) {
    const modal = document.querySelector('#action-modal');
    let currentAction = 'adoptar';
    document.querySelectorAll('[data-action]').forEach((button) => button.addEventListener('click', () => {
      const action = button.dataset.action;
      currentAction = action;
      document.querySelector('#modal-eyebrow').textContent = 'Contacta con nosotros';
      document.querySelector('#modal-title').textContent = `${action[0].toUpperCase() + action.slice(1)} a ${animal.name}`;
      document.querySelector('#modal-copy').textContent = 'Déjanos tus datos y nos pondremos en contacto contigo.';
      document.querySelector('[name="mensaje"]').value = `Hola, me interesa ${action} a ${animal.name}.`;
      document.querySelector('[name="telefono"]').closest('label').hidden = action !== 'adoptar';
      document.querySelector('[name="consentimiento"]').closest('label').hidden = action !== 'adoptar';
      document.querySelector('#form-status').textContent = '';
      document.querySelector('#donation-links').hidden = action !== 'donar';
      document.querySelector('#interest-form').hidden = action === 'donar';
      if (action === 'donar') {
        document.querySelector('#modal-copy').textContent = 'Elige cómo quieres ayudar a los animales de La Bienvenida.';
      }
      modal.classList.add('open');
      modal.setAttribute('aria-hidden', 'false');
    }));
    document.querySelectorAll('[data-close]').forEach((element) => element.addEventListener('click', () => {
      modal.classList.remove('open');
      modal.setAttribute('aria-hidden', 'true');
    }));
    document.querySelector('#interest-form').addEventListener('submit', async (event) => {
      event.preventDefault();
      const formElement = event.currentTarget;
      const form = new FormData(formElement);
      const status = document.querySelector('#form-status');
      if (currentAction !== 'adoptar') {
        location.href = `mailto:petercanespejos@gmail.com?subject=${encodeURIComponent(`Interés en ${animal.name}`)}&body=${encodeURIComponent(`Nombre: ${form.get('nombre')}\nEmail: ${form.get('email')}\n\n${form.get('mensaje')}`)}`;
        return;
      }
      const submit = document.querySelector('#submit-action');
      submit.disabled = true;
      status.textContent = 'Enviando solicitud…';
      try {
        const response = await fetch('/.netlify/functions/requests', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ animalId: animal.id, animalName: animal.name, name: form.get('nombre'), email: form.get('email'), phone: form.get('telefono'), message: form.get('mensaje') }) });
        const data = await response.json();
        if (!response.ok) throw new Error(data.error || 'No se pudo enviar la solicitud.');
        formElement.reset();
        status.textContent = 'Solicitud enviada. Nos pondremos en contacto contigo pronto.';
      } catch (error) { status.textContent = error.message || 'No se pudo enviar la solicitud.'; }
      finally { submit.disabled = false; }
    });
  }

  function setupGallery(photos, name) {
    const images = photos.length ? photos : [''];
    const main = document.querySelector('#animal-image');
    const thumbnails = document.querySelector('#animal-thumbnails');
    const lightbox = document.querySelector('#photo-lightbox');
    const lightboxImage = document.querySelector('#photo-lightbox-image');
    let current = 0;
    const select = (index) => {
      current = (index + images.length) % images.length;
      main.src = images[current];
      lightboxImage.src = images[current];
      thumbnails.querySelectorAll('button').forEach((button, buttonIndex) => button.classList.toggle('active', buttonIndex === current));
    };
    thumbnails.innerHTML = images.map((photo, index) => `<button type="button" aria-label="Ver foto ${index + 1} de ${name}"><img src="${escapeHtml(photo)}" alt="Miniatura ${index + 1} de ${name}"></button>`).join('');
    thumbnails.querySelectorAll('button').forEach((button, index) => button.addEventListener('click', () => select(index)));
    main.addEventListener('click', () => { if (images[0]) { lightbox.hidden = false; select(current); } });
    document.querySelector('#photo-lightbox-close').addEventListener('click', () => { lightbox.hidden = true; });
    document.querySelector('#photo-previous').addEventListener('click', () => select(current - 1));
    document.querySelector('#photo-next').addEventListener('click', () => select(current + 1));
    select(0);
  }
})();

document.querySelectorAll('a[href="index.html"]').forEach((link) => link.setAttribute('href', '/'));
document.querySelectorAll('a[href="adopta.html"]').forEach((link) => link.setAttribute('href', '/adopta'));
