const animals = {
  milo: {
    name: 'Milo',
    status: 'Adopción prioritaria',
    image:
      'https://images.unsplash.com/photo-1552053831-71594a27632d?auto=format&fit=crop&w=1600&q=90',
    tagline: 'Una mirada tranquila y un corazón enorme que solo necesita sentirse seguro.',
    facts: [
      ['Edad', '3 años'],
      ['Sexo', 'Macho'],
      ['Tamaño', 'Mediano · 21 kg'],
      ['Llegada', 'Octubre de 2025'],
    ],
    story:
      'Milo apareció solo cerca de una carretera. Llegó con miedo a los ruidos y algo desconfiado, pero muy pronto descubrimos que detrás de esa cautela había un perro tremendamente cariñoso. Ahora disfruta de los paseos tranquilos, de tumbarse al sol y, sobre todo, de la compañía. Avanza cada día y está preparado para conocer a una familia paciente.',
    quote: '“Cuando confía en ti, apoya la cabeza en tu pierna y ya no quiere separarse.”',
    ideal: 'Un hogar tranquilo donde pueda seguir ganando confianza.',
    care: [
      ['♡', 'Carácter', 'Dulce, sensible y muy leal'],
      ['✚', 'Salud', 'Vacunado, chipado y esterilizado'],
      ['⌂', 'Actividad', 'Paseos moderados y mucha compañía'],
      ['●', 'Necesita', 'Adaptación paciente y rutinas estables'],
    ],
    compat: [
      ['Con adultos', 'Sí'],
      ['Con niños', 'Mayores de 10'],
      ['Con perros', 'Sí, presentación previa'],
      ['Con gatos', 'Por valorar'],
    ],
  },
  luna: {
    name: 'Luna',
    status: 'Lista para adoptar',
    image:
      'https://images.unsplash.com/photo-1573865526739-10659fec78a5?auto=format&fit=crop&w=1600&q=90',
    tagline: 'Curiosa, elegante y experta en encontrar el rincón más soleado de la casa.',
    facts: [
      ['Edad', '2 años'],
      ['Sexo', 'Hembra'],
      ['Tamaño', 'Pequeño · 4 kg'],
      ['Llegada', 'Enero de 2026'],
    ],
    story:
      'Luna llegó junto a sus cachorros y fue una madre extraordinaria. Todos ellos encontraron familia; ahora le toca a ella. Es tranquila al principio, curiosa cuando entra en confianza y una auténtica aficionada a las siestas al sol. Busca una casa serena en la que pueda explorar a su ritmo.',
    quote: '“No pide atención, pero siempre termina eligiendo sentarse cerca de ti.”',
    ideal: 'Una casa serena, con ventanas seguras y rincones elevados.',
    care: [
      ['♡', 'Carácter', 'Tranquila, curiosa e independiente'],
      ['✚', 'Salud', 'Vacunada, chipada y esterilizada'],
      ['⌂', 'Actividad', 'Juego suave y enriquecimiento diario'],
      ['●', 'Necesita', 'Tiempo para explorar sin presión'],
    ],
    compat: [
      ['Con adultos', 'Sí'],
      ['Con niños', 'Tranquilos'],
      ['Con perros', 'Por valorar'],
      ['Con gatos', 'Sí'],
    ],
  },
  bruno: {
    name: 'Bruno',
    status: 'Adopción senior',
    image:
      'https://images.unsplash.com/photo-1537151608828-ea2b11777ee8?auto=format&fit=crop&w=1600&q=90',
    tagline: 'Ocho años de experiencia queriendo bien y todavía muchísimas siestas por compartir.',
    facts: [
      ['Edad', '8 años'],
      ['Sexo', 'Macho'],
      ['Tamaño', 'Pequeño · 9 kg'],
      ['Llegada', 'Marzo de 2025'],
    ],
    story:
      'Bruno vivió siempre en una casa hasta que su persona ya no pudo cuidarlo. La vida del refugio le resulta un poco ruidosa, pero conserva su carácter sereno y confiado. Pasea estupendamente, se adapta a los ritmos tranquilos y solo pide una cama cómoda cerca de los suyos.',
    quote: '“Bruno tiene ese talento de los perros mayores: convierte cualquier casa en un hogar.”',
    ideal: 'Una familia que valore la calma y el cariño de un perro veterano.',
    care: [
      ['♡', 'Carácter', 'Sereno, educado y afectuoso'],
      ['✚', 'Salud', 'Control veterinario al día'],
      ['⌂', 'Actividad', 'Paseos cortos y descansos largos'],
      ['●', 'Necesita', 'Comodidad y compañía'],
    ],
    compat: [
      ['Con adultos', 'Sí'],
      ['Con niños', 'Sí, respetuosos'],
      ['Con perros', 'Sí'],
      ['Con gatos', 'Sí'],
    ],
  },
  nala: {
    name: 'Nala',
    status: 'Recién llegada',
    image:
      'https://images.unsplash.com/photo-1495360010541-f48722b34f7d?auto=format&fit=crop&w=1600&q=90',
    tagline: 'Joven, suave y tímida: una pequeña exploradora que empieza a descubrir el mundo.',
    facts: [
      ['Edad', '1 año'],
      ['Sexo', 'Hembra'],
      ['Tamaño', 'Pequeño · 3,5 kg'],
      ['Llegada', 'Junio de 2026'],
    ],
    story:
      'Nala fue recogida de una colonia tras comprobar que buscaba activamente el contacto humano. Aún se sobresalta con movimientos bruscos, pero responde enseguida al juego y a las palabras suaves. Cada día nos enseña una faceta nueva de su personalidad.',
    quote: '“Una caña de juguete y diez minutos de paciencia son el camino directo a su corazón.”',
    ideal: 'Un hogar paciente que disfrute viéndola descubrir y aprender.',
    care: [
      ['♡', 'Carácter', 'Tímida, juguetona y dulce'],
      ['✚', 'Salud', 'Vacunada y desparasitada'],
      ['⌂', 'Actividad', 'Juego y espacios para trepar'],
      ['●', 'Necesita', 'Un inicio progresivo'],
    ],
    compat: [
      ['Con adultos', 'Sí'],
      ['Con niños', 'Mayores de 12'],
      ['Con perros', 'No probado'],
      ['Con gatos', 'Sí'],
    ],
  },
  roco: {
    name: 'Roco',
    status: 'Listo para adoptar',
    image:
      'https://images.unsplash.com/photo-1477884213360-7e9d7dcc1e48?auto=format&fit=crop&w=1600&q=90',
    tagline: 'Grande por fuera, blandito por dentro y siempre dispuesto a acompañarte.',
    facts: [
      ['Edad', '5 años'],
      ['Sexo', 'Macho'],
      ['Tamaño', 'Grande · 32 kg'],
      ['Llegada', 'Agosto de 2025'],
    ],
    story:
      'Roco fue encontrado en el campo y nadie lo reclamó. Es un perro noble, estable y muy conectado con las personas. Camina bien con correa y se entusiasma con los paseos por la naturaleza. Su tamaño impone, pero su forma favorita de saludar es sentarse y ofrecer la pata.',
    quote: '“Roco no necesita hacer ruido para hacerse querer; su presencia lo dice todo.”',
    ideal: 'Una familia activa con espacio y ganas de compartir aventuras.',
    care: [
      ['♡', 'Carácter', 'Noble, estable y cercano'],
      ['✚', 'Salud', 'Vacunado, chipado y esterilizado'],
      ['⌂', 'Actividad', 'Paseos largos y olfateo'],
      ['●', 'Necesita', 'Espacio y actividad diaria'],
    ],
    compat: [
      ['Con adultos', 'Sí'],
      ['Con niños', 'Mayores de 8'],
      ['Con perros', 'Sí'],
      ['Con gatos', 'Por valorar'],
    ],
  },
  simba: {
    name: 'Simba',
    status: 'Listo para adoptar',
    image:
      'https://images.unsplash.com/photo-1533738363-b7f9aef128ce?auto=format&fit=crop&w=1600&q=90',
    tagline: 'Sociable, divertido y convencido de que cualquier caja le pertenece.',
    facts: [
      ['Edad', '3 años'],
      ['Sexo', 'Macho'],
      ['Tamaño', 'Pequeño · 5 kg'],
      ['Llegada', 'Diciembre de 2025'],
    ],
    story:
      'Simba llegó con una lesión leve ya totalmente recuperada. Desde el primer día dejó claro que le encantan las personas y que piensa participar en todo lo que sucede. Es comunicativo, juguetón y disfruta especialmente de los retos de comida.',
    quote: '“Si buscas un gato con conversación y sentido del humor, Simba ya está preparado.”',
    ideal: 'Una casa estimulante donde forme parte de la vida familiar.',
    care: [
      ['♡', 'Carácter', 'Sociable, curioso y juguetón'],
      ['✚', 'Salud', 'Sano, vacunado y esterilizado'],
      ['⌂', 'Actividad', 'Juego diario y enriquecimiento'],
      ['●', 'Necesita', 'Participar y tener estímulos'],
    ],
    compat: [
      ['Con adultos', 'Sí'],
      ['Con niños', 'Sí'],
      ['Con perros', 'Con adaptación'],
      ['Con gatos', 'Sí'],
    ],
  },
  kira: {
    name: 'Kira',
    status: 'En casa de acogida',
    image:
      'https://images.unsplash.com/photo-1518717758536-85ae29035b6d?auto=format&fit=crop&w=1600&q=90',
    tagline: 'Inteligente, activa y siempre preparada para aprender algo nuevo contigo.',
    facts: [
      ['Edad', '4 años'],
      ['Sexo', 'Hembra'],
      ['Tamaño', 'Mediano · 18 kg'],
      ['Llegada', 'Febrero de 2026'],
    ],
    story:
      'Kira vive temporalmente en una casa de acogida, donde ha demostrado que sabe convivir y adaptarse a una rutina familiar. Aprende muy rápido y disfruta trabajando con premios. Necesita actividad y una persona que quiera seguir enseñándole.',
    quote: '“Kira te mira como si preguntara: ¿qué hacemos ahora? Siempre está lista.”',
    ideal: 'Personas activas que disfruten entrenando y saliendo al campo.',
    care: [
      ['♡', 'Carácter', 'Activa, inteligente y cariñosa'],
      ['✚', 'Salud', 'Vacunada, chipada y esterilizada'],
      ['⌂', 'Actividad', 'Alta: paseos y juegos mentales'],
      ['●', 'Necesita', 'Rutina activa y educación positiva'],
    ],
    compat: [
      ['Con adultos', 'Sí'],
      ['Con niños', 'Mayores de 10'],
      ['Con perros', 'Sí'],
      ['Con gatos', 'No'],
    ],
  },
  coco: {
    name: 'Coco',
    status: 'Listo para adoptar',
    image:
      'https://images.unsplash.com/photo-1518791841217-8f162f1e1131?auto=format&fit=crop&w=1600&q=90',
    tagline: 'Un experto en ronroneos, tardes lentas y hacerse un ovillo a tu lado.',
    facts: [
      ['Edad', '6 años'],
      ['Sexo', 'Macho'],
      ['Tamaño', 'Pequeño · 5,5 kg'],
      ['Llegada', 'Noviembre de 2025'],
    ],
    story:
      'Coco es un gato doméstico que perdió su hogar de manera inesperada. Después de unos días de desconcierto, volvió a mostrar su personalidad afectuosa y relajada. Busca contacto, agradece las caricias y sabe perfectamente cómo disfrutar de la tranquilidad.',
    quote: '“Su ronroneo empieza antes de que tu mano llegue a tocarle.”',
    ideal: 'Un hogar tranquilo donde recibir compañía y muchas caricias.',
    care: [
      ['♡', 'Carácter', 'Mimoso, tranquilo y confiado'],
      ['✚', 'Salud', 'Sano, vacunado y esterilizado'],
      ['⌂', 'Actividad', 'Moderada, juegos suaves'],
      ['●', 'Necesita', 'Rutina estable y compañía'],
    ],
    compat: [
      ['Con adultos', 'Sí'],
      ['Con niños', 'Sí, tranquilos'],
      ['Con perros', 'Por valorar'],
      ['Con gatos', 'Sí'],
    ],
  },
  duna: {
    name: 'Duna',
    status: 'Lista para adoptar',
    image:
      'https://images.unsplash.com/photo-1558788353-f76d92427f16?auto=format&fit=crop&w=1600&q=90',
    tagline: 'Joven, alegre y con una capacidad inagotable para contagiar entusiasmo.',
    facts: [
      ['Edad', '2 años'],
      ['Sexo', 'Hembra'],
      ['Tamaño', 'Mediano · 17 kg'],
      ['Llegada', 'Abril de 2026'],
    ],
    story:
      'Duna llegó al refugio siendo todavía muy joven. Es abierta, expresiva y aprende con facilidad. Le encantan otros perros, jugar con pelotas y cualquier paseo que incluya nuevos olores. Después de la actividad sabe relajarse y buscar cariño.',
    quote: '“Duna convierte un paseo corriente en el mejor plan del día.”',
    ideal: 'Una familia con ganas de compartir actividad, juego y aprendizaje.',
    care: [
      ['♡', 'Carácter', 'Alegre, sociable y curiosa'],
      ['✚', 'Salud', 'Vacunada, chipada y esterilizada'],
      ['⌂', 'Actividad', 'Media-alta'],
      ['●', 'Necesita', 'Ejercicio y educación amable'],
    ],
    compat: [
      ['Con adultos', 'Sí'],
      ['Con niños', 'Sí'],
      ['Con perros', 'Sí'],
      ['Con gatos', 'Por valorar'],
    ],
  },
};

const medicalRecords = {
  milo: {
    condition: false,
    title: 'Sin enfermedades diagnosticadas',
    detail:
      'Su última revisión veterinaria no muestra patologías activas. Vacunación y desparasitación al día.',
  },
  luna: {
    condition: false,
    title: 'Sin enfermedades diagnosticadas',
    detail:
      'Analítica y revisión general dentro de parámetros normales. Esterilizada y con vacunas al día.',
  },
  bruno: {
    condition: true,
    title: 'Artrosis leve controlada',
    detail:
      'Recibe un suplemento articular y revisiones periódicas. Lleva una vida normal con ejercicio moderado.',
  },
  nala: {
    condition: false,
    title: 'Sin enfermedades diagnosticadas',
    detail:
      'Pruebas felinas negativas. Continúa con controles rutinarios propios de una gata joven.',
  },
  roco: {
    condition: false,
    title: 'Sin enfermedades diagnosticadas',
    detail: 'Revisión general favorable, vacunado, desparasitado y esterilizado.',
  },
  simba: {
    condition: false,
    title: 'Sin enfermedades diagnosticadas',
    detail:
      'Totalmente recuperado de una lesión leve anterior. No necesita tratamiento actualmente.',
  },
  kira: {
    condition: true,
    title: 'Dermatitis alérgica leve',
    detail:
      'Controlada con alimentación específica y seguimiento veterinario. No limita su vida cotidiana.',
  },
  coco: {
    condition: true,
    title: 'Enfermedad renal en fase inicial',
    detail:
      'Necesita dieta renal y controles periódicos. Actualmente se encuentra estable y sin síntomas importantes.',
  },
  duna: {
    condition: false,
    title: 'Sin enfermedades diagnosticadas',
    detail:
      'Exploración veterinaria completa favorable. Vacunación, chip y desparasitación al día.',
  },
};

const id = new URLSearchParams(location.search).get('id')?.toLowerCase() || 'milo';
const animal = animals[id] || animals.milo;
const medical = medicalRecords[id] || medicalRecords.milo;
document.title = `${animal.name} busca hogar · La Bienvenida`;
document.querySelector('#animal-image').src = animal.image;
document.querySelector('#animal-image').alt = `${animal.name}, animal en adopción`;
document.querySelector('#animal-status').textContent = animal.status;
document.querySelector('#animal-name').textContent = animal.name;
document.querySelector('#animal-tagline').textContent = animal.tagline;
document.querySelector('#quick-facts').innerHTML =
  animal.facts
    .map(
      ([label, value]) => `<div class="fact"><span>${label}</span><strong>${value}</strong></div>`,
    )
    .join('') +
  `<div class="fact medical-fact ${medical.condition ? 'has-condition' : ''}"><div><span>Estado veterinario</span><strong>${medical.title}</strong><small>${medical.detail}</small></div><b>${medical.condition ? 'Requiere seguimiento' : 'Sin patologías'}</b></div>`;
document.querySelector('#personality-tags').innerHTML = animal.care[0][2]
  .split(',')
  .map((trait) => `<span>${trait.trim()}</span>`)
  .join('');
document.querySelector('#story-title').textContent = `Conoce a ${animal.name}`;
document.querySelector('#animal-story').textContent = animal.story;
document.querySelector('#care-grid').innerHTML = animal.care
  .map(
    ([icon, title, copy]) =>
      `<div class="care-item"><span class="care-icon">${icon}</span><h3>${title}</h3><p>${copy}</p></div>`,
  )
  .join('');
document.querySelector('#ideal-title').textContent = animal.ideal;
document.querySelector('#compat-list').innerHTML = animal.compat
  .map(
    ([label, value]) =>
      `<div class="compat-row"><span>${label}</span><b class="${/valorar|adaptación|Mayores/.test(value) ? 'maybe' : ''}">${value}</b></div>`,
  )
  .join('');

const modal = document.querySelector('#action-modal'),
  title = document.querySelector('#modal-title'),
  copy = document.querySelector('#modal-copy'),
  eyebrow = document.querySelector('#modal-eyebrow'),
  donations = document.querySelector('#donation-options'),
  message = document.querySelector('[name="mensaje"]'),
  submit = document.querySelector('#submit-action');
let currentAction = '';
const modalText = {
  adoptar: [
    'Adopción responsable',
    `Quiero adoptar a ${animal.name}`,
    `Cuéntanos un poco sobre ti. Revisaremos tu solicitud y nos pondremos en contacto para organizar una primera conversación.`,
    'Enviar solicitud',
  ],
  apadrinar: [
    'Acompáñale desde cerca',
    `Apadrina a ${animal.name}`,
    `Tu aportación mensual ayuda con alimento, cuidados veterinarios y bienestar mientras espera su hogar definitivo.`,
    'Quiero apadrinar',
  ],
  donar: [
    'Cada gesto cuenta',
    `Ayuda a ${animal.name}`,
    `Elige una cantidad orientativa. Te enviaremos las opciones disponibles para completar la donación de forma segura.`,
    'Quiero donar',
  ],
};
function openModal(action) {
  currentAction = action;
  const data = modalText[action];
  eyebrow.textContent = data[0];
  title.textContent = data[1];
  copy.textContent = data[2];
  submit.textContent = data[3];
  donations.hidden = action !== 'donar';
  message.value = `Hola, me interesa ${action} a ${animal.name}.`;
  modal.classList.add('open');
  modal.setAttribute('aria-hidden', 'false');
  document.body.style.overflow = 'hidden';
}
function closeModal() {
  modal.classList.remove('open');
  modal.setAttribute('aria-hidden', 'true');
  document.body.style.overflow = '';
}
document
  .querySelectorAll('[data-action]')
  .forEach((button) => button.addEventListener('click', () => openModal(button.dataset.action)));
document.querySelectorAll('[data-close]').forEach((el) => el.addEventListener('click', closeModal));
document.addEventListener('keydown', (event) => {
  if (event.key === 'Escape') closeModal();
});
donations.querySelectorAll('button').forEach((button) =>
  button.addEventListener('click', () => {
    donations.querySelectorAll('button').forEach((item) => item.classList.remove('active'));
    button.classList.add('active');
  }),
);
document.querySelector('#interest-form').addEventListener('submit', (event) => {
  event.preventDefault();
  const amount = donations.querySelector('.active')?.textContent || '';
  const subject =
    currentAction === 'donar'
      ? `Donación para ${animal.name}: ${amount}`
      : `Quiero ${currentAction} a ${animal.name}`;
  const form = new FormData(event.currentTarget);
  location.href = `mailto:petercanespejos@gmail.com?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(`Nombre: ${form.get('nombre')}\nEmail: ${form.get('email')}\n\n${form.get('mensaje')}`)}`;
});
document.querySelectorAll('a[href="index.html"]').forEach((link) => link.setAttribute('href', '/'));
document
  .querySelectorAll('a[href="adopta.html"]')
  .forEach((link) => link.setAttribute('href', '/adopta'));

const detailHeader = document.querySelector('.detail-header');
const detailBackLink = detailHeader?.querySelector('.back-link');
if (detailHeader && detailBackLink) {
  const accessLink = document.createElement('a');
  accessLink.className = 'access-link';
  accessLink.href = '/admin';
  accessLink.textContent = 'Acceder';
  detailHeader.insertBefore(accessLink, detailBackLink);
}
