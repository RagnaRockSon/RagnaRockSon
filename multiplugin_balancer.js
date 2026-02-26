(function () {
    'use strict';

    if (!window.Lampa) return;

    const VERSION = 'v2.2';

    var sources = [
        { name: "BazaNetUa", url: "http://lampaua.mooo.com/online.js" },
        { name: "BanderaOnline", url: "https://lampame.github.io/main/BanderaOnline/BanderaOnline.js" },
        { name: "Online_mod", url: "https://nb557.github.io/plugins/online_mod.js" },
        { name: "Alpac Beta", url: "http://beta.l-vid.online/online.js" }
    ];

    var tempState = {};
    var hasChanges = false;
    var outsideHandler = null;
    var pluginStack = []; // Стек меню плагіну для відновлення після модалки

    function injectCSS() {
        if (document.getElementById('multi-style')) return;

        var style = document.createElement('style');
        style.id = 'multi-style';
        style.innerHTML = `
            .multi-container { padding:20px; }
            .multi-item { display:flex; justify-content:space-between; align-items:center; padding:15px; margin-bottom:10px; background:rgba(255,255,255,0.05); border-radius:10px; }
            .multi-toggle { padding:6px 14px; border-radius:20px; min-width:120px; text-align:center; color:#fff; cursor:pointer; }
            .multi-toggle.enabled { background:#46b85a; }
            .multi-toggle.disabled { background:#d24a4a; }
            .multi-apply { text-align:center; margin-top:20px; padding:15px; border-radius:10px; font-weight:bold; cursor:pointer; background:#156DD1; color:#fff; display:none; }
        `;
        document.head.appendChild(style);
    }

    function updateTitle() {
        var title = hasChanges
            ? 'Мій мультиплагін ' + VERSION + ' — Балансери ●'
            : 'Мій мультиплагін ' + VERSION + ' — Балансери';

        $('.modal__title').text(title);
    }

    function enableOutsideClose(container) {
        setTimeout(function () {
            outsideHandler = function (e) {
                if (!$(e.target).closest('.multi-container').length) {
                    closeModal();
                }
            };
            $('.modal').on('mousedown.multi', outsideHandler);
        }, 200);
    }

    function disableOutsideClose() {
        $('.modal').off('mousedown.multi');
        outsideHandler = null;
    }

    function closeModal() {
        disableOutsideClose();
        Lampa.Modal.close();

        // Відновлення меню плагіну після закриття модалки
        if (pluginStack.length) {
            var last = pluginStack.pop();
            if (last && last.length) {
                Lampa.Controller.collectionSet(last);
                Lampa.Controller.collectionFocus(last.find('.selector').first());
            }
        }
    }

    function openSourcesModal() {
        tempState = {};
        hasChanges = false;

        // Зберігаємо стан меню плагіну у стек
        var currentPlugin = $('.settings-component[multi_balancers]');
        if (currentPlugin.length) pluginStack.push(currentPlugin);

        var container = $('<div class="multi-container"></div>');
        var applyBtn = $('<div class="multi-apply selector">Застосувати зміни</div>');

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
                applyBtn.show();
                updateTitle();
            });

            container.append(item);
        });

        applyBtn.on('hover:enter', function () {
            if (!hasChanges) return;

            Object.keys(tempState).forEach(function (k) {
                Lampa.Storage.set(k, tempState[k]);
            });

            disableOutsideClose();

            if (Lampa.Manifest && typeof Lampa.Manifest.app_reload === 'function') {
                Lampa.Manifest.app_reload();
            } else {
                location.reload();
            }
        });

        container.append(applyBtn);

        Lampa.Modal.open({
            title: 'Мій мультиплагін ' + VERSION + ' — Балансери',
            html: container,
            onBack: function () {
                closeModal();
                return true;
            }
        });

        setTimeout(function () {
            Lampa.Controller.collectionSet(container);
            Lampa.Controller.collectionFocus(container.find('.selector').first());
            enableOutsideClose(container);
            updateTitle();
        }, 200);
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

    function initSettings() {
        var SettingsApi = Lampa.SettingsApi || Lampa.Settings;
        if (!SettingsApi || !SettingsApi.addComponent) return;

        SettingsApi.addComponent({
            component: 'multi_balancers',
            name: 'Мій мультиплагін ' + VERSION,
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

        if (Lampa.Noty) {
            Lampa.Noty.show('Мій мультиплагін ' + VERSION + ' завантажено');
        }

        console.log('[MultiPlugin ' + VERSION + '] Loaded');
    }

    if (Lampa.Listener) {
        Lampa.Listener.follow('app', function (e) {
            if (e && e.type === 'ready') start();
        });
    } else {
        start();
    }

})();