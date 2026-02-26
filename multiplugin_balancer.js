(function () {
    'use strict';

    if (!window.Lampa) return;

    var sources = [
        { name: "BazaNetUa", url: "http://lampaua.mooo.com/online.js" },
        { name: "BanderaOnline", url: "https://lampame.github.io/main/BanderaOnline/BanderaOnline.js" },
        { name: "Online_mod", url: "https://nb557.github.io/plugins/online_mod.js" },
        { name: "Alpac Beta", url: "http://beta.l-vid.online/online.js" }
    ];

    var tempState = {};

    function injectCSS() {
        if (document.getElementById('multi-plugin-style')) return;

        var style = document.createElement('style');
        style.id = 'multi-plugin-style';
        style.innerHTML = `
        .multi-container { padding:20px; }
        .multi-item { display:flex; justify-content:space-between; align-items:center; padding:15px; margin-bottom:10px; background:rgba(255,255,255,0.05); border-radius:10px; transition:0.3s; }
        .multi-item.focus { background:rgba(255,255,255,0.1); transform:scale(1.02); }
        .multi-toggle { padding:6px 14px; border-radius:20px; font-weight:bold; min-width:120px; text-align:center; transition:0.3s; color:#fff; }
        .multi-toggle.enabled { background:#46b85a; box-shadow:0 0 8px #46b85a; }
        .multi-toggle.disabled { background:#d24a4a; box-shadow:0 0 8px #d24a4a; }
        .multi-apply, .multi-back { text-align:center; margin-top:15px; padding:15px; border-radius:10px; font-weight:bold; cursor:pointer; transition:0.3s; color:#fff; }
        .multi-apply { background:#156DD1; }
        .multi-apply.focus { background:#1f82ff; transform:scale(1.05); }
        .multi-back { background:#777; }
        .multi-back.focus { background:#999; }
        `;
        document.head.appendChild(style);
    }

    function loadActiveSources() {
        sources.forEach(function (src) {
            var enabled = Lampa.Storage.get('multi_' + src.name, false);
            if (!enabled) return;

            if (document.querySelector('script[src="' + src.url + '"]')) return;

            var script = document.createElement('script');
            script.src = src.url;
            script.async = false;
            document.body.appendChild(script);
        });
    }

    function openSourcesModal() {

        tempState = {};
        var hasChanges = false;

        var container = $('<div class="multi-container"></div>');
        var applyButton = $('<div class="multi-apply selector" style="display:none;">Застосувати зміни</div>');
        var backButton = $('<div class="multi-back selector">Назад</div>');

        function closeModal() {
            $(document).off('click.multiOutside');
            if (Lampa.Modal && Lampa.Modal.close) {
                Lampa.Modal.close();
            }
        }

        // ✅ СТАБІЛЬНИЙ outside click
        setTimeout(function () {
            $(document).on('click.multiOutside', function (e) {

                if (!container[0]) return;

                var clickedInside = $(e.target).closest('.multi-container').length > 0;
                var clickedModal = $(e.target).closest('.lampa-modal').length > 0;

                if (!clickedInside && clickedModal) {
                    closeModal();
                }
            });
        }, 150);

        sources.forEach(function (src) {

            var key = 'multi_' + src.name;
            var current = Lampa.Storage.get(key, false);
            tempState[key] = current;

            var item