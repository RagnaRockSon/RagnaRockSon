(function () {
    'use strict';

    if (!window.Lampa) return;

    var sources = [
        { name: "BazaNetUa", url: "http://lampaua.mooo.com/online.js" },
        { name: "BanderaOnline", url: "https://lampame.github.io/main/BanderaOnline/BanderaOnline.js" },
        { name: "Online_mod", url: "https://nb557.github.io/plugins/online_mod.js" },
        { name: "Alpac Beta", url: "http://beta.l-vid.online/online.js" }
    ];

    var modalState = {
        isOpen: false,
        outsideClickHandler: null,
        container: null
    };

    // ==============================
    // Додаємо CSS
    // ==============================
    function injectCSS() {
        if (document.getElementById('multi-plugin-styles')) return;
        var style = document.createElement('style');
        style.id = 'multi-plugin-styles';
        style.textContent = `
            .multi-container { padding:20px; position: relative; }
            .multi-item { display:flex; justify-content:space-between; align-items:center; padding:15px; margin-bottom:10px; background:rgba(255,255,255,0.05); border-radius:10px; transition:0.3s; cursor:pointer; }
            .multi-item.focus { background:rgba(255,255,255,0.1); transform:scale(1.02); }
            .multi-toggle { padding:6px 14px; border-radius:20px; font-weight:bold; min-width:120px; text-align:center; cursor:pointer; transition: all 0.4s ease; color:#fff; }
            .multi-toggle.enabled { background:#46b85a; box-shadow: 0 0 8px #46b85a; }
            .multi-toggle.disabled { background:#d24a4a; box-shadow: 0 0 8px #d24a4a; }
            .multi-apply, .multi-back { text-align:center; margin-top:15px; padding:15px; border-radius:10px; font-weight:bold; cursor:pointer; transition: all 0.3s; color:#fff; }
            .multi-apply { background:#156DD1; }
            .multi-apply:hover { background:#1f82ff; transform:scale(1.03); }
            .multi-back { background:#777; }
            .multi-back:hover { background:#999; transform:scale(1.03); }
        `;
        document.head.appendChild(style);
    }

    // ==============================
    // Завантаження активних джерел
    // ==============================
    function loadActiveSources() {
        sources.forEach(function (src) {
            var enabled = Lampa.Storage.get('multi_' + src.name, false);
            if (!enabled) return;
            if (document.querySelector('script[src="' + src.url + '"]')) return;

            var script = document.createElement('script');
            script.src = src.url;
            script.async = false;
            script.onerror = function() { console.error('[MultiPlugin] Failed to load:', src.name); };
            document.body.appendChild(script);

            console.log('[MultiPlugin] Loaded:', src.name);
        });
    }

    // ==============================
    // Відкриття модального вікна балансерів
    // ==============================
    function openSourcesModal() {
        if (modalState.isOpen) return;

        modalState.isOpen = true;
        
        // Перевіряємо наявність jQuery
        var $ = window.jQuery || window.$;
        if (!$) {
            console.error('[MultiPlugin] jQuery не знайдена');
            return;
        }

        var container = $('<div class="multi-container"></div>');
        var applyButton = $('<div class="multi-apply selector" style="display:none;">Застосувати зміни</div>');
        var backButton = $('<div class="multi-back selector">Назад</div>');
        modalState.container = container;

        var hasChanges = false;
        var currentFocusIndex = 0;

        // Закриття модалі
        function closeModal() {
            modalState.isOpen = false;
            if (Lampa.Modal && Lampa.Modal.close) {
                Lampa.Modal.close();
            }
            if (modalState.outsideClickHandler) {
                $(document).off('click.multiPluginOutside', modalState.outsideClickHandler);
            }
            if (Lampa.Controller && Lampa.Controller.remove) {
                Lampa.Controller.remove('back');
            }
            modalState.container = null;
        }

        // Клік поза контейнером закриває модаль
        modalState.outsideClickHandler = function(e) {
            var $target = $(e.target);
            if (!$target.closest('.multi-container').length && 
                !$target.closest('.lampa-modal, .modal, [class*="modal"]').length) {
                closeModal();
            }
        };

        setTimeout(function() {
            $(document).on('click.multiPluginOutside', modalState.outsideClickHandler);
        }, 100);

        // Додаємо джерела
        sources.forEach(function (src, index) {
            var storageKey = 'multi_' + src.name;
            var enabled = Lampa.Storage.get(storageKey, false);
            var item = $(`
                <div class="multi-item selector" data-index="${index}">
                    <div>${src.name}</div>
                    <div class="multi-toggle ${enabled ? 'enabled' : 'disabled'}">
                        ${enabled ? 'Увімкнено' : 'Вимкнено'}
                    </div>
                </div>
            `);

            item.on('click', function () {
                enabled = !enabled;
                Lampa.Storage.set(storageKey, enabled);
                item.find('.multi-toggle')
                    .removeClass('enabled disabled')
                    .addClass(enabled ? 'enabled' : 'disabled')
                    .text(enabled ? 'Увімкнено' : 'Вимкнено');
                hasChanges = true;
                applyButton.show();
            });

            container.append(item);
        });

        // Кнопка застосувати зміни
        applyButton.on('click', function () {
            if (hasChanges && Lampa.Modal && Lampa.Modal.confirm) {
                Lampa.Modal.confirm({
                    title: 'Перезапуск потрібен',
                    text: 'Щоб застосувати зміни, Lampa потрібно перезавантажити. Перезавантажити зараз?',
                    yes: function () {
                        closeModal();
                        if (Lampa.Manifest && typeof Lampa.Manifest.app_reload === 'function') {
                            Lampa.Manifest.app_reload();
                        } else {
                            location.reload();
                        }
                    }
                });
            }
        });

        // Кнопка Назад
        backButton.on('click', closeModal);

        container.append(applyButton).append(backButton);

        if (Lampa.Modal && Lampa.Modal.open) {
            Lampa.Modal.open({ 
                title: 'Мультиплагін — Балансери', 
                html: container 
            });
        }

        if (Lampa.Controller && Lampa.Controller.collectionSet) {
            Lampa.Controller.collectionSet(container);
            var firstSelector = container.find('.selector').first();
            if (firstSelector && firstSelector.length) {
                Lampa.Controller.collectionFocus(firstSelector);
            }
        }

        // Back кнопка на пульті
        if (Lampa.Controller && Lampa.Controller.add && typeof Lampa.Controller.add === 'function') {
            Lampa.Controller.add('back', closeModal);
        }
    }

    // ==============================
    // Додаємо плагін у налаштування
    // ==============================
    function initSettings() {
        var SettingsApi = Lampa.SettingsApi || Lampa.Settings;
        if (!SettingsApi || typeof SettingsApi.addComponent !== 'function') return;

        SettingsApi.addComponent({
            component: 'multi_balancers',
            name: 'Мій мультиплагін',
            icon: '<svg viewBox="0 0 24 24" fill="currentColor"><circle cx="12" cy="12" r="10"/></svg>'
        });

        SettingsApi.addParam({
            component: 'multi_balancers',
            param: { name: 'multi_manage', type: 'button' },
            field: { name: 'Керування балансерами' },
            onChange: openSourcesModal
        });

        SettingsApi.addParam({
            component: 'multi_balancers',
            param: { name: 'multi_back', type: 'button' },
            field: { name: 'Назад' },
            onChange: function () {
                if (SettingsApi.close && typeof SettingsApi.close === 'function') {
                    SettingsApi.close();
                }
            }
        });
    }

    // ==============================
    // Старт плагіна
    // ==============================
    function start() {
        injectCSS();
        loadActiveSources();
        initSettings();
        console.log('[MultiPlugin] Запущено');
    }

    if (Lampa && Lampa.Listener && typeof Lampa.Listener.follow === 'function') {
        Lampa.Listener.follow('app', function (e) {
            if (e && e.type === 'ready') {
                start();
            }
        });
    } else {
        document.addEventListener('DOMContentLoaded', start);
    }

})();
