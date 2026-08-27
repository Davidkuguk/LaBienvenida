(() => {
  const visitorKey = 'la-bienvenida-visitor-id';
  const sessionKey = 'la-bienvenida-visit-recorded';

  const trackVisit = () => {
    try {
    if (sessionStorage.getItem(sessionKey)) {
      return;
    }

    let visitorId = localStorage.getItem(visitorKey);
    if (!visitorId) {
      visitorId =
        typeof crypto.randomUUID === 'function'
          ? crypto.randomUUID()
          : `${Date.now().toString(36)}-${Math.random().toString(36).slice(2)}-${Math.random().toString(36).slice(2)}`;
      localStorage.setItem(visitorKey, visitorId);
    }

    fetch('/.netlify/functions/visitors', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ visitorId }),
      keepalive: true,
    })
      .then((response) => {
        if (response.ok) {
          sessionStorage.setItem(sessionKey, 'true');
        }
      })
      .catch(() => {
        // El contador solo está disponible cuando la web se ejecuta en Netlify.
      });
    } catch {
      // No se realiza seguimiento si el navegador bloquea el almacenamiento local.
    }
  };

  if ('requestIdleCallback' in window) window.requestIdleCallback(trackVisit, { timeout: 2000 });
  else window.setTimeout(trackVisit, 1000);
})();
