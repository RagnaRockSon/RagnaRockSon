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
        container: null,
        backKeyHandler: null
    };

    // ==============================
    // CSS (додаємо один раз)
    // ==============================
    function injectCSS() {
        if (document.getElementById('multi-plugin-styles')) return;

        var style = document.createElement('style');
        style.id = 'multi-plugin-styles';
        style.textContent = `
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
            script.onerror = function() {
                console.error('[MultiPlugin] Failed to load:', src.name);
            };
            document.body.appendChild(script);

            console.log('[MultiPlugin] Loaded:', src.name);
        });
    }

    // ==============================
    // Закриття модалі
    // ==============================
    function closeModal() {
        if (!modalState.isOpen) return;

        modalState.isOpen = false;

        // Закриваємо Lampa Modal
        if (Lampa.Modal && typeof Lampa.Modal.close === 'function') {
            Lampa.Modal.close();
        }

        // Видаляємо обробник click
        if (modalState.outsideClickHandler) {
            $(document).off('click.multiPluginOutside');
            modalState.outsideClickHandler = null;
        }

        // Очищуємо контейнер
        if (modalState.container) {
            modalState.container = null;
        }

        console.log('[MultiPlugin] Modal closed');
    }

    // ==============================
    // Модал керування
    // ==============================
    function openSourcesModal() {
        // Закриваємо попередню модаль, якщо вона відкрита
        if (modalState.isOpen) {
            return;
        }

        var container = $('<div class="multi-container"></div>');
        var applyButton = $('<div class="multi-apply selector" style="display:none;">Застосувати зміни</div>');
        var backButton = $('<div class="multi-back selector">Назад</div>');

        var hasChanges = false;
        modalState.isOpen = true;
        modalState.container = container;

        // ==============================
        // Обробник для кліку поза модаллю
        // ==============================
        modalState.outsideClickHandler = function(e) {
            if (modalState.isOpen) {
                var $target = $(e.target);
                var isInContainer = $target.closest('.multi-container').length > 0;
                var isInModal = $target.closest('.lampa-modal, .modal, [class*="modal"]').length > 0;

                if (!isInContainer && !isInModal) {
                    closeModal();
                }
            }
        };

        setTimeout(function () {
            if (modalState.isOpen) {
                $(document).on('click.multiPluginOutside', modalState.outsideClickHandler);
            }
        }, 150);

        // ==============================
        // Додавання елементів джерел
        // ==============================
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

                hasChanges = true;
                applyButton.show();
            });

            container.append(item);
        });

        // ==============================
        // Кнопка застосувати зміни
        // ==============================
        applyButton.on('hover:enter', function () {
            if (hasChanges) {
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

        // ==============================
        // Кнопка Назад
        // ==============================
        backButton.on('hover:enter', function () {
            closeModal();
        });

        container.append(applyButton).append(backButton);

        // ==============================
        // Відкриття модалі
        // ==============================
        if (Lampa.Modal && typeof Lampa.Modal.open === 'function') {
            Lampa.Modal.open({
                title: 'Мультиплагін — Балансери',
                html: container
            });
        }

        // ==============================
        // Налаштування навігації
        // ==============================
        if (Lampa.Controller && typeof Lampa.Controller.collectionSet === 'function') {
            Lampa.Controller.collectionSet(container);
            var firstSelector = container.find('.selector').first();
            if (firstSelector && firstSelector.length) {
                Lampa.Controller.collectionFocus(firstSelector);
            }
        }

        // ==============================
        // Back контролер (ВИПРАВЛЕНО)
        // ==============================
        if (Lampa.Controller) {
            // Видаляємо старий обробник, якщо він існує
            if (modalState.backKeyHandler) {
                try {
                    Lampa.Controller.remove && Lampa.Controller.remove(modalState.backKeyHandler);
                } catch (e) {
                    console.log('[MultiPlugin] Could not remove previous back handler');
                }
            }

            // Створюємо новий обробник
            modalState.backKeyHandler = function () {
                if (modalState.isOpen) {
                    closeModal();
                }
            };

            // Додаємо обробник
            if (typeof Lampa.Controller.add === 'function') {
                Lampa.Controller.add('back', modalState.backKeyHandler);
            }
        }
    }

    // ==============================
    // Додаємо в Налаштування
    // ==============================
    function initSettings() {
        var SettingsApi = Lampa.SettingsApi || Lampa.Settings;
        if (!SettingsApi || typeof SettingsApi.addComponent !== 'function') {
            console.warn('[MultiPlugin] SettingsApi not available');
            return;
        }

        try {
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
        } catch (e) {
            console.error('[MultiPlugin] Error initializing settings:', e);
        }
    }

    // ==============================
    // Старт
    // ==============================
    function start() {
        injectCSS();
        loadActiveSources();
        initSettings();
        console.log('[MultiPlugin] Started successfully');
    }

    // ==============================
    // Ініціалізація
    // ==============================
    if (Lampa && Lampa.Listener && typeof Lampa.Listener.follow === 'function') {
        Lampa.Listener.follow('app', function (e) {
            if (e && e.type === 'ready') {
                start();
            }
        });
    } else {
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', start);
        } else {
            setTimeout(start, 100);
        }
    }

})();
