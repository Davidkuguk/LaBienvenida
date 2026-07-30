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
      ['Ejercicio', animal.exercise],
    ];
    document.querySelector('#quick-facts').innerHTML = facts.map(([label, value]) =>
      `<div class="fact ${label === 'Ejercicio' ? 'exercise-fact' : ''}"><span>${escapeHtml(label)}</span><strong>${escapeHtml(value)}</strong></div>`
    ).join('') + `<div class="fact medical-fact"><div><span>Estado veterinario</span><strong>${escapeHtml(animal.medicalStatus)}</strong><small>${escapeHtml(animal.medicalDetail)}</small></div><b>Información actualizada</b></div>`;

    document.querySelector('#care-grid').innerHTML = [
      ['♡', 'Carácter', animal.description],
      ['✚', 'Salud', animal.medicalDetail],
      ['⌂', 'Actividad', animal.exercise],
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
  function formatDate(date) {
    if (!date) return 'Sin indicar';
    return new Intl.DateTimeFormat('es-ES', { month: 'long', year: 'numeric', timeZone: 'UTC' }).format(new Date(date));
  }
  function setupActions(animal) {
    const modal = document.querySelector('#action-modal');
    document.querySelectorAll('[data-action]').forEach((button) => button.addEventListener('click', () => {
      const action = button.dataset.action;
      document.querySelector('#modal-eyebrow').textContent = 'Contacta con nosotros';
      document.querySelector('#modal-title').textContent = `${action[0].toUpperCase() + action.slice(1)} a ${animal.name}`;
      document.querySelector('#modal-copy').textContent = 'Déjanos tus datos y nos pondremos en contacto contigo.';
      document.querySelector('[name="mensaje"]').value = `Hola, me interesa ${action} a ${animal.name}.`;
      document.querySelector('#donation-options').hidden = action !== 'donar';
      modal.classList.add('open');
      modal.setAttribute('aria-hidden', 'false');
    }));
    document.querySelectorAll('[data-close]').forEach((element) => element.addEventListener('click', () => {
      modal.classList.remove('open');
      modal.setAttribute('aria-hidden', 'true');
    }));
    document.querySelector('#interest-form').addEventListener('submit', (event) => {
      event.preventDefault();
      const form = new FormData(event.currentTarget);
      location.href = `mailto:petercanespejos@gmail.com?subject=${encodeURIComponent(`Interés en ${animal.name}`)}&body=${encodeURIComponent(`Nombre: ${form.get('nombre')}\nEmail: ${form.get('email')}\n\n${form.get('mensaje')}`)}`;
    });
  }
})();

document.querySelectorAll('a[href="index.html"]').forEach((link) => link.setAttribute('href', '/'));
document.querySelectorAll('a[href="adopta.html"]').forEach((link) => link.setAttribute('href', '/adopta'));
