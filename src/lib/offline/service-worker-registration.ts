export function registerServiceWorker() {
  if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
    window.addEventListener('load', () => {
      navigator.serviceWorker
        .register('/sw.js')
        .then((registration) => {
          console.log('Service Worker registrado com sucesso: ', registration.scope);
          
          registration.onupdatefound = () => {
            const installingWorker = registration.installing;
            if (installingWorker == null) {
              return;
            }
            installingWorker.onstatechange = () => {
              if (installingWorker.state === 'installed') {
                if (navigator.serviceWorker.controller) {
                  // Nova atualização disponível
                  console.log('Novo conteúdo disponível; por favor atualize.');
                  // Poderia disparar um evento customizado ou state para mostrar um Toast ao usuário
                } else {
                  // Conteúdo cacheado
                  console.log('Conteúdo cacheado para uso offline.');
                }
              }
            };
          };
        })
        .catch((error) => {
          console.error('Falha ao registrar o Service Worker: ', error);
        });
    });
  }
}
