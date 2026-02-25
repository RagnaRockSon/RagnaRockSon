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
    .multi-toggle { padding:6px 14px; border-radius:20px; font-weight:bold; min-width:120px; text-align:center; cursor:pointer; transition: all 0.4s ease; color:#fff; }
    .multi-toggle.enabled { background:#46b85a; box-shadow: 0 0 8px #46b85a; }
    .multi-toggle.disabled { background:#d24a4a; box-shadow: 0 0 8px #d24a4a; }
    .multi-apply, .multi-back { text-align:center; margin-top:15px; padding:15px; border-radius:10px; font-weight:bold; cursor:pointer; transition: all 0.3s; color:#fff; }
    .multi-apply { background:#156DD1; }
    .multi-apply:hover { background:#1f82ff; transform:scale(1.03); }
    .multi-back { background:#777; }
    .multi-back:hover { background:#999; transform:scale(1.03); }
    </style>
    `);

    // ==============================
    // Завантаження активних джерел
    // ==============================
    function loadActiveSources() {
        sources.forEach(function (src) {
            var enabled = false;
            try { enabled = Lampa.Storage.get('multi_' + src.name, false); } 
            catch(e) { console.warn('[MultiPlugin] Storage error for', src.name, e); }
            if (!enabled) return;

            if (document.querySelector('script[src="' + src.url + '"]')) return;

            try {
                var script = document.createElement('script');
                script.src = src.url;
                script.async = false;
                script.onerror = function() { console.error('[MultiPlugin] Failed to load:', src.name); };
                document.body.appendChild(script);
                console.log('[MultiPlugin] Loaded:', src.name);
            } catch(e) { console.error('[MultiPlugin] Error appending script:', src.name, e); }
        });
    }

    // ==============================
    // Модальне меню
    // ==============================
    function openSourcesModal() {
        var changes = false;
        var container = $('<div class="multi-container"></div>');
        var applyButton = $('<div class="multi-apply selector" style="display:none;">Застосувати зміни</div>');
        var backButton = $('<div class="multi-back selector">Назад</div>');

        // ==============================
        // Функція безпечного закриття модалі
        // ==============================
        function safeCloseModal() {
            try { Lampa.Modal.close(); } 
            catch(e) { console.error('[MultiPlugin] Error closing modal', e); }
            $(document).off('click.multiPluginOutside');
        }

        // ==============================
        // Закриття при кліку/тапі поза контейнером
        // ==============================
        setTimeout(function () {
            $(document).on('click.multiPluginOutside touchstart.multiPluginOutside', function(e) {
                if (!$(e.target).closest('.multi-container').length) {
                    safeCloseModal();
                }
            });
        }, 100);

        // ==============================
        // Додавання елементів джерел
        // ==============================
        sources.forEach(function (src) {
            var storageKey = 'multi_' + src.name;
            var enabled = false;
            try { enabled = Lampa.Storage.get(storageKey, false); } 
            catch(e) { console.warn('[MultiPlugin] Storage error for', src.name, e); }

            var item = $(`
                <div class="multi-item selector">
                    <div>${src.name}</div>
                    <div class="multi-toggle ${enabled ? 'enabled' : 'disabled'}">
                        ${enabled ? 'Увімкнено' : 'Вимкнено'}
                    </div>
                </div>
            `);

            item.on('hover:enter', function () {
                try {
                    enabled = !enabled;
                    Lampa.Storage.set(storageKey, enabled);

                    item.find('.multi-toggle')
                        .removeClass('enabled disabled')
                        .addClass(enabled ? 'enabled' : 'disabled')
                        .text(enabled ? 'Увімкнено' : 'Вимкнено');

                    changes = true;
                    applyButton.show();
                } catch(e) { console.error('[MultiPlugin] Error toggling', src.name, e); }
            });

            container.append(item);
        });

        // ==============================
        // Кнопка застосувати зміни
        // ==============================
        applyButton.on('hover:enter', function () {
            if (!changes) return;
            try {
                if (Lampa.Modal && Lampa.Modal.confirm) {
                    Lampa.Modal.confirm({
                        title: 'Перезапуск потрібен',
                        text: 'Щоб застосувати зміни, Lampa потрібно перезавантажити. Перезавантажити зараз?',
                        yes: function () {
                            safeCloseModal();
                            if (Lampa.Manifest && typeof Lampa.Manifest.app_reload === 'function') {
                                Lampa.Manifest.app_reload();
                            } else { location.reload(); }
                        }
                    });
                } else { location.reload(); }
            } catch(e) { console.error('[MultiPlugin] Error applying changes', e); location.reload(); }
        });

        // ==============================
        // Кнопка Назад
        // ==============================
        backButton.on('hover:enter', safeCloseModal);

        container.append(applyButton).append(backButton);

        try { Lampa.Modal.open({ title: 'Мультиплагін — Балансери', html: container }); } 
        catch(e) { console.error('[MultiPlugin] Error opening modal', e); }

        // Навігація
        try {
            Lampa.Controller.collectionSet(container);
            Lampa.Controller.collectionFocus(container.find('.selector').first());
            if (Lampa.Controller && Lampa.Controller.add) {
                Lampa.Controller.add('back', safeCloseModal); // BACK на пульті
            }
        } catch(e) { console.warn('[MultiPlugin] Controller error', e); }
    }

    // ==============================
    // Додаємо в Налаштування
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
            onChange: function () { openSourcesModal(); }
        });
    }

    // ==============================
    // Старт
    // ==============================
    function start() {
        loadActiveSources();
        initSettings();
        console.log('[MultiPlugin] Started safely');
    }

    if (Lampa.Listener) {
        Lampa.Listener.follow('app', function (e) { if (e.type === 'ready') start(); });
    } else { start(); }

})();