(function () {
    'use strict';

    if (!window.Lampa) return;

    const VERSION = 'v3.1';

    var sources = [
        { name: "BazaNetUa", url: "http://lampaua.mooo.com/online.js" },
        { name: "BanderaOnline", url: "https://lampame.github.io/main/BanderaOnline/BanderaOnline.js" },
        { name: "Online_mod", url: "https://nb557.github.io/plugins/online_mod.js" },
        { name: "Alpac Beta", url: "http://beta.l-vid.online/online.js" }
    ];

    var tempState = {};
    var hasChanges = false;
    var outsideHandler = null;

    function injectCSS() {
        if (document.getElementById('multi-style')) return;
        var style = document.createElement('style');
        style.id = 'multi-style';
        style.innerHTML = `
            /* Контейнер модалки */
            .multi-container {
                padding:20px;
                opacity:0;
                transform: translateY(-20px);
                transition: opacity 0.3s ease, transform 0.3s ease;
            }
            .multi-container.show {
                opacity:1;
                transform: translateY(0);
            }
            /* Елементи списку */
            .multi-item {
                display:flex;
                justify-content:space-between;
                align-items:center;
                padding:15px;
                margin-bottom:10px;
                background:rgba(255,255,255,0.05);
                border-radius:10px;
                transition: background 0.3s, transform 0.2s;
            }
            .multi-item.focus {
                background:rgba(255,255,255,0.15);
                transform: scale(1.03);
            }
            /* Тогл кнопка */
            .multi-toggle {
                padding:6px 14px;
                border-radius:20px;
                min-width:120px;
                text-align:center;
                color:#fff;
                cursor:pointer;
                transition: all 0.3s;
            }
            .multi-toggle.enabled { background:#46b85a; box-shadow:0 0 8px #46b85a; }
            .multi-toggle.disabled { background:#d24a4a; box-shadow:0 0 8px #d24a4a; }
            /* Кнопка застосувати */
            .multi-apply {
                text-align:center;
                margin-top:20px;
                padding:15px;
                border-radius:10px;
                font-weight:bold;
                cursor:pointer;
                background:#156DD1;
                color:#fff;
                display:none;
                transition: all 0.3s;
            }
            .multi-apply:hover {
                background:#1f82ff;
                transform: scale(1.03);
            }
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
    }

    function openSourcesModal() {
        tempState = {};
        hasChanges = false;

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
            container.addClass('show'); // плавна анімація появи
            Lampa.Controller.collectionSet(container);
            Lampa.Controller.collectionFocus(container.find('.selector').first());

            // Додаємо підсвітку елементу
            container.find('.selector').first().addClass('focus');
            container.on('hover:focus', '.selector', function () {
                container.find('.selector').removeClass('focus');
                $(this).addClass('focus');
            });

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