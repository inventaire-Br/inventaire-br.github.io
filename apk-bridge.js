/* Pont APK : exports (Excel, PDF, CSV), photos et liens externes dans l'application Android. Sans effet dans un navigateur. */
(function () {
  var C = window.Capacitor;
  if (!C || !C.isNativePlatform || !C.isNativePlatform()) return;
  var P = function (n) { return (C.Plugins && C.Plugins[n]) || C.registerPlugin(n); };
  var FS = P('Filesystem'), Share = P('Share'), Browser = P('Browser');

  function toB64(blob) {
    return new Promise(function (ok, ko) {
      var r = new FileReader();
      r.onload = function () { ok(String(r.result).split(',')[1]); };
      r.onerror = ko;
      r.readAsDataURL(blob);
    });
  }
  async function saveBlob(blob, name) {
    try {
      var data = await toB64(blob);
      var res = await FS.writeFile({ path: name, data: data, directory: 'CACHE' });
      await Share.share({ title: name, files: [res.uri] });
    } catch (e) {
      if (!/cancel/i.test(String(e && e.message))) alert('Enregistrement impossible : ' + ((e && e.message) || e));
    }
  }
  window.saveBlob = saveBlob;

  // Les photos s'ouvrent d'abord dans une fenêtre vide, puis l'adresse est donnée : on l'ouvre à ce moment-là.
  window.open = function (url) {
    if (url) { Browser.open({ url: String(url) }); return null; }
    return {
      close: function () {},
      get location() { return ''; },
      set location(u) { Browser.open({ url: String(u) }); }
    };
  };

  document.addEventListener('click', function (e) {
    var a = e.target.closest && e.target.closest('a[href]');
    if (!a) return;
    var href = a.href;
    if (a.hasAttribute('download') && href.indexOf('blob:') === 0) {
      e.preventDefault(); e.stopPropagation();
      fetch(href).then(function (r) { return r.blob(); })
        .then(function (b) { saveBlob(b, a.getAttribute('download') || 'fichier'); });
    } else if (/^https?:/.test(href) && href.indexOf(location.origin) !== 0) {
      e.preventDefault();
      Browser.open({ url: href });
    }
  }, true);
})();
