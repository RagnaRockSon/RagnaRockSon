(function () {
    'use strict';

    if (!window.Lampa) return;

    var sources = [
        { name: "BazaNetUa", url: "http://lampaua.mooo.com/online.js" },
        { name: "BanderaOnline", url: "https://lampame.github.io/main/BanderaOnline/BanderaOnline.js" },
        { name: "Online_mod", url: "https://nb557.github.io/plugins/online_mod.js" },
        { name: "Alpac Beta", url: "http://beta.l-vid.online/online.js" }
    ];

    // ==============================
    // CSS
    // ==============================
    $('body').append(`
    <style>
    .multi-container { padding:20px; position: relative; }
    .multi-item { display:flex; justify-content:space-between; align-items:center; padding:15px; margin-bottom:10px; background:rgba(255,255,255,0.05); border-radius:10px; transition:0.3s; }
    .multi-item.focus { background:rgba(255,255,255,0.1); transform:scale(1.02); }
    .multi-toggle { padding:6px 14px; border-radius:20px; font-weight:bold; min-width:120px; text-align:center; cursor:pointer; transition: all 0.3s ease; color:#fff; }
    .multi-toggle.enabled { background:#46b85a; box-shadow: 0 0 8px #46b85a; }
    .multi-toggle.disabled { background:#d24a4a; box-shadow: 0 0 8px #d24a4a; }
    .multi-apply, .multi-back { text-align:center; margin-top:15px; padding:15px; border-radius:10px; font-weight:bold; cursor:pointer; transition: all 0.3s; color:#fff; }
    .multi-apply { background:#156DD1; }
    .multi-apply.focus, .multi-apply:hover { background:#1f82ff; transform:scale(1.03); }
    .multi-back { background:#777; }
    .multi-back.focus, .multi-back:hover { background:#999; transform:scale(1.03); }
    </style>
    `);

    // ==============================
    // Завантаження активних джерел
    // ==============================
    function loadActiveSources() {
        sources.forEach(function (src) {
            var enabled = Lampa.Storage.get('multi_' + src.name, false);
            if