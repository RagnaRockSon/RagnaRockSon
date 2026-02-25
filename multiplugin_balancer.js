(function () {
    'use strict';

    if (!window.Lampa) return;

    var sources = [
        { name: "BazaNetUa", url: "http://lampaua.mooo.com/online.js" },
        { name: "BanderaOnline", url: "https://lampame.github.io/main/BanderaOnline/BanderaOnline.js" },
        { name: "Online_mod", url: "https://nb557.github.io/plugins/online_mod.js" },
        { name: "Alpac Beta", url: "http://beta.l-vid.online/online.js" }
    ];

    var backControllerHandler = null; // Зберігаємо обробник для чищення

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
    // Завантаження активних
    // ==============================
    function loadActiveSources() {
        sources.forEach(function (src) {
            var enabled = Lampa.Storage.get('multi_' + src.name, false);
            if (!enabled) return;

            // Перевірка, чи скрипт вже завантажений
            if (document.querySelector('script[src="' + src.url + '"]')) return;

            var script = document.createElement('script');
            script.src = src.url;
            script.async = false;
            document.body.appendChild(script);

            console.log('[MultiPlugin] Loaded:', src.name);
        });
    }

    // ==============================
    // Модал керування
    // ==============================
    function openSourcesModal() {
        var container = $('<div class="multi-container"></div>');
        var applyButton = $('<div class="multi-apply selector" style="display:none;">Застосувати зміни</div>');
        var backButton = $('<div class="multi-back selector">Назад</div>');

        var changes = false;
        var isModalOpen = true; // Флаг для відстеження стану модалі

        // ==============================
        // Закриття при кліку поза контейнером (ВИПРАВЛЕНО)
        // ==============================
        var outsideClickHandler = function(e) {
            if (isModalOpen && !$(e.target).closest('.multi-container').length && !$(e.target).closest('.lampaa-modal').length) {
                closeModal();
            }
        };

        setTimeout(function () {
            if (isModalOpen) {
                $(document).on('click.multiPluginOutside', outsideClickHandler);
            }
        }, 100);

        // Функція закриття модалі
        function closeModal() {
            isModalOpen = false;
            Lampa.Modal.close();
            $(document).off('click.multiPluginOutside', outsideClickHandler);
            
            // Видалення обробника Back контролера
            if (backControllerHandler) {
                Lampa.Controller.remove(backControllerHandler);
                backControllerHandler = null;
            }
        }

        sources.forEach(function (src) {
            var storageKey = 'multi_' + src.name;
            var enabled = Lampa.Storage.get(storageKey, false);

            var item = $(`<div class="multi-item selector">
                <div>${src.name}</div>
                <div class="multi-toggle ${enabled ? 'enabled' : 'disabled'}">
                    ${enabled ? 'Увімкнено' : 'Вимкнено'}
                </div>
            </div>`);

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
        // Кнопка застосувати зміни
        // ==============================
        applyButton.on('hover:enter', function () {
            Lampa.Modal.confirm({
                title: 'Перезапуск потрібен',
                text: 'Щоб застосувати зміни, Lampa потрібно перезавантажити. Перезавантажити зараз?',
                yes: function () {
                    closeModal();
                    
                    if (Lampa.Manifest && Lampa.Manifest.app_reload) {
                        Lampa.Manifest.app_reload();
                    } else if (typeof location !== 'undefined') {
                        location.reload();
                    } else {
                        console.error('[MultiPlugin] Cannot reload application');
                    }
                }
            });
        });

        // ==============================
        // Кнопка Назад у модальному меню
        // ==============================
        backButton.on('hover:enter', function () {
            closeModal();
        });

        container.append(applyButton).append(backButton);

        Lampa.Modal.open({
            title: 'Мультиплагін — Балансери',
            html: container
        });

        // ==============================
        // Керування фокусом та навігацією (ВИПРАВЛЕНО)
        // ==============================
        if (Lampa.Controller && Lampa.Controller.collectionSet) {
            Lampa.Controller.collectionSet(container);
            var firstSelector = container.find('.selector').first();
            if (firstSelector.length) {
                Lampa.Controller.collectionFocus(firstSelector);
            }
        }

        // ==============================
        // Back для модального меню (ВИПРАВЛЕНО)
        // ==============================
        if (Lampa.Controller && Lampa.Controller.add) {
            backControllerHandler = function () {
                if (Lampa.Modal.isOpen && Lampa.Modal.isOpen()) {
                    closeModal();
                }
            };
            Lampa.Controller.add('back', backControllerHandler);
        }
    }

    // ==============================
    // Додаємо в Налаштування
    // ==============================
    function initSettings() {
        var SettingsApi = Lampa.SettingsApi || Lampa.Settings;
        if (!SettingsApi || !SettingsApi.addComponent) {
            console.warn('[MultiPlugin] SettingsApi not available');
            return;
        }

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

        // Back для меню плагіна
        if (SettingsApi.addParam) {
            SettingsApi.addParam({
                component: 'multi_balancers',
                param: { name: 'multi_back', type: 'button' },
                field: { name: 'Назад' },
                onChange: function () {
                    if (SettingsApi.close) {
                        SettingsApi.close();
                    } else {
                        console.log('[MultiPlugin] Close menu');
                    }
                }
            });
        }
    }

    // ==============================
    // Старт
    // ==============================
    function start() {
        loadActiveSources();
        initSettings();
        console.log('[MultiPlugin] Started');
    }

    // ==============================
    // Ініціалізація (ВИПРАВЛЕНО)
    // ==============================
    if (Lampa.Listener) {
        Lampa.Listener.follow('app', function (e) {
            if (e.type === 'ready') {
                start();
            }
        });
    } else if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', start);
    } else {
        start();
    }

})();
