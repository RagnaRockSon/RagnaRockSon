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
    if (!document.getElementById('multi-plugin-style')) {
        var style = document.createElement('style');
        style.id = 'multi-plugin-style';
        style.innerHTML = `
        .multi-container { padding:20px; }
        .multi-item { display:flex; justify-content:space-between; align-items:center; padding:15px; margin-bottom:10px; background:rgba(255,255,255,0.05); border-radius:10px; transition:0.3s; }
        .multi-item.focus { background:rgba(255,255,255,0.1); transform:scale(1.02); }
        .multi-toggle { padding:6px 14px; border-radius:20px; font-weight:bold; min-width:120px; text-align:center; cursor:pointer; transition:0.3s; }
        .multi-toggle.enabled { background:#46b85a; }
        .multi-toggle.disabled { background:#d24a4a; }
        .multi-apply { text-align:center; margin-top:20px; padding:15px; background:#156DD1; border-radius:10px; font-weight:bold; transition:0.3s; cursor:pointer; }
        .multi-apply.focus { background:#1f82ff; transform:scale(1.03); }
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
            script.async = false;
            document.body.appendChild(script);

            console.log('[MultiPlugin] Loaded:', src.name);
        });
    }

    // ==============================
    // Модальне меню балансерів
    // ==============================
    function openSourcesModal() {

        var changes = false;
        var container = $('<div class="multi-container"></div>');
        var applyButton = $('<div class="multi-apply selector" style="display:none;">Застосувати зміни</div>');

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

                changes = true;
                applyButton.show();
            });

            container.append(item);
        });

        // ==============================
        // Кнопка застосування
        // ==============================
        applyButton.on('hover:enter', function () {

            if (!changes) return;

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

        container.append(applyButton);

        Lampa.Modal.open({
            title: 'Мультиплагін — Балансери',
            html: container
        });

        Lampa.Controller.collectionSet(container);
        Lampa.Controller.collectionFocus(container.find('.selector').first());

        // ==============================
        // BACK з пульта
        // ==============================
        var backHandler = function () {
            Lampa.Modal.close();
        };

        if (Lampa.Controller && Lampa.Controller.add) {
            Lampa.Controller.add('back', backHandler);
        }

        // ==============================
        // Клік поза контейнером
        // ==============================
        setTimeout(function () {

            function outsideClickHandler(e) {

                var $target = $(e.target);

                var isInside = $target.closest('.multi-container').length > 0;
                var isModal = $target.closest('.lampa-modal, .modal').length > 0;

                if (!isInside && !isModal) {
                    Lampa.Modal.close();
                    $(document).off('click.multiOutside');
                }
            }

            $(document).on('click.multiOutside', outsideClickHandler);

        }, 200);
    }

    // ==============================
    // Додаємо в налаштування
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

    // ==============================
    // Старт
    // ==============================
    function start() {
        loadActiveSources();
        initSettings();
        console.log('[MultiPlugin] Started');
    }

    if (Lampa.Listener) {
        Lampa.Listener.follow('app', function (e) {
            if (e.type === 'ready') start();
        });
    } else {
        start();
    }

})();