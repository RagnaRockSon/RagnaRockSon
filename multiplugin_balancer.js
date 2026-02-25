(function () {
    'use strict';

    if (!window.Lampa) return;
    if (window.multiPluginInitialized) return;
    window.multiPluginInitialized = true;

    var sources = [
        { name: "BazaNetUa", url: "http://lampaua.mooo.com/online.js" },
        { name: "BanderaOnline", url: "https://lampame.github.io/main/BanderaOnline/BanderaOnline.js" },
        { name: "Online_mod", url: "https://nb557.github.io/plugins/online_mod.js" },
        { name: "Alpac Beta", url: "http://beta.l-vid.online/online.js" }
    ];

    // ==============================
    // CSS (додається 1 раз)
    // ==============================
    if (!document.getElementById('multi-style')) {
        var style = document.createElement('style');
        style.id = 'multi-style';
        style.innerHTML = `
        .multi-container { padding:20px; }
        .multi-item { display:flex; justify-content:space-between; align-items:center; padding:15px; margin-bottom:10px; background:rgba(255,255,255,0.05); border-radius:10px; transition:0.3s; }
        .multi-item.focus { background:rgba(255,255,255,0.1); transform:scale(1.02); }
        .multi-toggle { padding:6px 14px; border-radius:20px; font-weight:bold; min-width:120px; text-align:center; color:#fff; }
        .multi-toggle.enabled { background:#46b85a; }
        .multi-toggle.disabled { background:#d24a4a; }
        .multi-apply, .multi-back { text-align:center; margin-top:15px; padding:15px; border-radius:10px; font-weight:bold; cursor:pointer; color:#fff; }
        .multi-apply { background:#156DD1; }
        .multi-back { background:#777; }
        `;
        document.head.appendChild(style);
    }

    // ==============================
    // Завантаження активних
    // ==============================
    function loadActiveSources() {
        sources.forEach(function (src) {
            var enabled = Lampa.Storage.get('multi_' + src.name, false);
            if (!enabled) return;

            if (document.querySelector('script[src="' + src.url + '"]')) return;

            var script = document.createElement('script');
            script.src = src.url;
            document.body.appendChild(script);
        });
    }

    var modalOpened = false;

    // ==============================
    // Модал керування
    // ==============================
    function openSourcesModal() {

        if (modalOpened) return;
        modalOpened = true;

        var initialState = {};
        sources.forEach(function (s) {
            initialState[s.name] = Lampa.Storage.get('multi_' + s.name, false);
        });

        var container = $('<div class="multi-container"></div>');
        var applyButton = $('<div class="multi-apply selector" style="display:none;">Застосувати зміни</div>');
        var backButton = $('<div class="multi-back selector">Назад</div>');

        function checkChanges() {
            var changed = false;
            sources.forEach(function (s) {
                var current = Lampa.Storage.get('multi_' + s.name, false);
                if (current !== initialState[s.name]) changed = true;
            });
            if (changed) applyButton.show();
            else applyButton.hide();
        }

        sources.forEach(function (src) {

            var storageKey = 'multi_' + src.name;
            var enabled = Lampa.Storage.get(storageKey, false);

            var item = $(`
                <div class="multi-item selector">
                    <div>${src.name}</div>
                    <div class="multi-toggle ${enabled ? 'enabled' : 'disabled'}">
                        ${enabled ? 'Увімкнено' : 'Вимкнено'}
                    </div>
                </div>
            `);

            item.on('hover:enter', function () {
                enabled = !enabled;
                Lampa.Storage.set(storageKey, enabled);

                item.find('.multi-toggle')
                    .removeClass('enabled disabled')
                    .addClass(enabled ? 'enabled' : 'disabled')
                    .text(enabled ? 'Увімкнено' : 'Вимкнено');

                checkChanges();
            });

            container.append(item);
        });

        // Apply
        applyButton.on('hover:enter', function () {

            Lampa.Modal.confirm({
                title: 'Перезапуск потрібен',
                text: 'Щоб застосувати зміни, Lampa потрібно перезавантажити. Перезавантажити зараз?',
                yes: function () {
                    if (Lampa.Manifest && Lampa.Manifest.app_reload) {
                        Lampa.Manifest.app_reload();
                    } else {
                        location.reload();
                    }
                }
            });
        });

        // Back
        backButton.on('hover:enter', closeModal);

        container.append(applyButton).append(backButton);

        Lampa.Modal.open({
            title: 'Мультиплагін — Балансери',
            html: container,
            onBack: closeModal,
            onClose: closeModal
        });

        Lampa.Controller.collectionSet(container);
        Lampa.Controller.collectionFocus(container.find('.selector').first());
    }

    function closeModal() {
        modalOpened = false;
        Lampa.Modal.close();
    }

    // ==============================
    // Settings
    // ==============================
    function initSettings() {

        var SettingsApi = Lampa.SettingsApi || Lampa.Settings;
        if (!SettingsApi || !SettingsApi.addComponent) return;

        SettingsApi.addComponent({
            component: 'multi_balancers',
            name: 'Мій мультиплагін',
            icon: '<svg viewBox="0 0 24 24" fill="currentColor"><circle cx="12" cy="12" r="10"/></svg>'
        });

        SettingsApi.addParam({
            component: 'multi_balancers',
            param: { name: 'multi_manage', type: 'button' },
            field: { name: 'Керування балансерами' },
            onChange: function () {
                openSourcesModal();
            }
        });
    }

    function start() {
        loadActiveSources();
        initSettings();
    }

    if (Lampa.Listener) {
        Lampa.Listener.follow('app', function (e) {
            if (e.type === 'ready') start();
        });
    } else {
        start();
    }

})();