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
    var outsideHandler = null;

    function injectCSS() {
        if (document.getElementById('multi-style')) return;

        var style = document.createElement('style');
        style.id = 'multi-style';
        style.innerHTML = `
        .multi-container { padding:20px; }
        .multi-item { display:flex; justify-content:space-between; align-items:center; padding:15px; margin-bottom:10px; background:rgba(255,255,255,0.05); border-radius:10px; }
        .multi-toggle { padding:6px 14px; border-radius:20px; min-width:120px; text-align:center; color:#fff; }
        .multi-toggle.enabled { background:#46b85a; }
        .multi-toggle.disabled { background:#d24a4a; }
        .multi-apply, .multi-back { text-align:center; margin-top:15px; padding:15px; border-radius:10px; font-weight:bold; cursor:pointer; color:#fff; }
        .multi-apply { background:#156DD1; }
        .multi-back { background:#777; }
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

        function restoreSettingsController() {
            if (Lampa.Settings && Lampa.Settings.update) {
                Lampa.Settings.update();
            }
        }

        function closeModal() {
            if (outsideHandler) {
                $(document).off('click.multiOutside', outsideHandler);
                outsideHandler = null;
            }

            if (Lampa.Modal) Lampa.Modal.close();

            // 🔥 ГОЛОВНЕ: повертаємо керування Settings
            setTimeout(function(){
                restoreSettingsController();
            }, 50);
        }

        outsideHandler = function (e) {
            if (!$(e.target).closest('.multi-container').length &&
                $(e.target).closest('.lampa-modal').length) {
                closeModal();
            }
        };

        setTimeout(function(){
            $(document).on('click.multiOutside', outsideHandler);
        },100);

        sources.forEach(function (src) {

            var key = 'multi_' + src.name;
            var current = Lampa.Storage.get(key, false);
            tempState[key] = current;

            var item = $(`
                <div class="multi-item selector">
                    <div>${src.name}</div>
                    <div class="multi-toggle ${current ? 'enabled' : 'disabled'}">
                        ${current ? 'Увімкнено' : 'Вимкнено'}
                    </div>
                </div>
            `);

            item.on('hover:enter', function () {
                tempState[key] = !tempState[key];

                item.find('.multi-toggle')
                    .removeClass('enabled disabled')
                    .addClass(tempState[key] ? 'enabled' : 'disabled')
                    .text(tempState[key] ? 'Увімкнено' : 'Вимкнено');

                hasChanges = true;
                applyButton.show();
            });

            container.append(item);
        });

        applyButton.on('hover:enter', function () {

            if (!hasChanges) return;

            Object.keys(tempState).forEach(function (k) {
                Lampa.Storage.set(k, tempState[k]);
            });

            if (Lampa.Manifest && typeof Lampa.Manifest.app_reload === 'function') {
                Lampa.Manifest.app_reload();
            } else {
                location.reload();
            }
        });

        backButton.on('hover:enter', closeModal);

        container.append(applyButton).append(backButton);

        Lampa.Modal.open({
            title: 'Мій мультиплагін v1.6 — Балансери',
            html: container
        });

        setTimeout(function(){
            if (Lampa.Controller) {
                Lampa.Controller.collectionSet(container);
                Lampa.Controller.collectionFocus(container.find('.selector').first());
            }
        },100);
    }

    function initSettings() {

        var SettingsApi = Lampa.SettingsApi || Lampa.Settings;
        if (!SettingsApi || !SettingsApi.addComponent) return;

        SettingsApi.addComponent({
            component: 'multi_balancers',
            name: 'Мій мультиплагін v1.6',
            icon: '<svg viewBox="0 0 24 24" fill="currentColor"><circle cx="12" cy="12" r="10"/></svg>'
        });

        SettingsApi.addParam({
            component: 'multi_balancers',
            param: { name: 'multi_manage', type: 'button' },
            field: { name: 'Керування балансерами' },
            onChange: openSourcesModal
        });
    }

    function start() {
        injectCSS();
        loadActiveSources();
        initSettings();
    }

    if (Lampa.Listener) {
        Lampa.Listener.follow('app', function (e) {
            if (e && e.type === 'ready') start();
        });
    } else {
        start();
    }

})();