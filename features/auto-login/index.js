const AutoLogin = {
  init() {
    TahvelUtils.onElementReady('#nn-login', (btn) => {
      if (btn.offsetParent !== null) {
        window.location.href = 'https://tahvel.edu.ee/hois_back/haridLogin';
      }
    });
  }
};
