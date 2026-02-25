(function () {
    'use strict';

    if (!window.Lampa) return;

    var sources = [
        { name: "BazaNetUa", url: "http://lampaua.mooo.com/online.js" },
        { name: "BanderaOnline", url: "https://lampame.github.io/main/BanderaOnline/BanderaOnline.js" },
        { name: "Online_mod", url: "https://nb557.github.io/plugins/online_mod.js" },
        { name: "Alpac Beta", url: "http://beta.l-vid.online/online.js" }
    ];

    var navigationStack = []; // Стек для відстеження рівнів навігації
    var currentLevel = null; // Поточний рівень

    // ==============================
    // CSS
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
    // Вихід назад на попередній рівень
    // ==============================
    function goBack() {
        if (navigationStack.length === 0) {
            console.log('[MultiPlugin] No previous level');
            return;
        }

        var previousLevel = navigationStack.pop();
        console.log('[MultiPlugin] Going back to level:', previousLevel.name);

        if (previousLevel.type === 'modal') {
            closeAllAndOpenBalancersModal();
        } else if (previousLevel.type === 'settings') {
            // Закриваємо модаль і повертаємось до меню налаштувань
            if (Lampa.Modal && typeof Lampa.Modal.close === 'function') {
                Lampa.Modal.close();
            }
        }
    }

    // ==============================
    // Закриття всіх модалей
    // ==============================
    function closeAll() {
        if (Lampa.Modal && typeof Lampa.Modal.close === 'function') {
            Lampa.Modal.close();
        }
        $(document).off('click.multiPluginOutside');
        navigationStack = [];
        currentLevel = null;
    }

    // ==============================
    // Відкриття модалі балансерів
    // ==============================
    function closeAllAndOpenBalancersModal() {
        if (Lampa.Modal && typeof Lampa.Modal.close === 'function') {
            Lampa.Modal.close();
        }
        $(document).off('click.multiPluginOutside');
        
        setTimeout(function() {
            openSourcesModal();
        }, 100);
    }

    // ==============================
    // Модал керування балансерами
    // ==============================
    function openSourcesModal() {
        currentLevel = { type: 'modal', name: 'balancers' };
        navigationStack.push(currentLevel);

        var container = $('<div class="multi-container"></div>');
        var applyButton = $('<div class="multi-apply selector" style="display:none;">Застосувати зміни</div>');
        var backButton = $('<div class="multi-back selector">Назад</div>');

        var hasChanges = false;

        // ==============================
        // Обробник для кліку поза модаллю
        // ==============================
        var outsideClickHandler = function(e) {
            var $target = $(e.target);
            var isInContainer = $target.closest('.multi-container').length > 0;
            var isInModal = $target.closest('.lampa-modal, .modal, [class*="modal"]').length > 0;

            if (!isInContainer && !isInModal) {
                goBack();
            }
        };

        setTimeout(function () {
            $(document).on('click.multiPluginOutside', outsideClickHandler);
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
                        closeAll();
                        
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
            goBack();
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
        // Back контролер
        // ==============================
        if (Lampa.Controller && typeof Lampa.Controller.add === 'function') {
            Lampa.Controller.add('back', function () {
                goBack();
            });
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

            // ==============================
            // Кнопка "Керування балансерами"
            // ==============================
            SettingsApi.addParam({
                component: 'multi_balancers',
                param: { name: 'multi_manage', type: 'button' },
                field: { name: 'Керування балансерами' },
                onChange: function () {
                    currentLevel = { type: 'settings', name: 'main' };
                    navigationStack = [currentLevel]; // Очищуємо стек і додаємо поточний рівень
                    openSourcesModal();
                }
            });

            // ==============================
            // Кнопка "Назад" у меню плагіна
            // ==============================
            SettingsApi.addParam({
                component: 'multi_balancers',
                param: { name: 'multi_back', type: 'button' },
                field: { name: 'Назад' },
                onChange: function () {
                    closeAll();
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
