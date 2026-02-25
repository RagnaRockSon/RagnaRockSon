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
    var stylesAdded = false;
    
    function addStyles() {
        if (stylesAdded) return;
        
        var style = $('<style id="multi-plugin-styles"></style>');
        style.text(`
            .multi-container { padding: 20px; }
            .multi-item { 
                display: flex; 
                justify-content: space-between; 
                align-items: center; 
                padding: 15px; 
                margin-bottom: 10px; 
                background: rgba(255, 255, 255, 0.05); 
                border-radius: 10px; 
                transition: 0.3s;
            }
            .multi-item.focus { 
                background: rgba(255, 255, 255, 0.1); 
                transform: scale(1.02);
            }
            .multi-toggle { 
                padding: 6px 14px; 
                border-radius: 20px; 
                font-weight: bold; 
                min-width: 120px; 
                text-align: center; 
                cursor: pointer; 
                transition: all 0.4s ease; 
                color: #fff;
            }
            .multi-toggle.enabled { 
                background: #46b85a; 
                box-shadow: 0 0 8px #46b85a;
            }
            .multi-toggle.disabled { 
                background: #d24a4a; 
                box-shadow: 0 0 8px #d24a4a;
            }
            .multi-apply, .multi-back { 
                text-align: center; 
                margin-top: 15px; 
                padding: 15px; 
                border-radius: 10px; 
                font-weight: bold; 
                cursor: pointer; 
                transition: all 0.3s; 
                color: #fff;
            }
            .multi-apply { background: #156DD1; }
            .multi-apply:hover { background: #1f82ff; }
            .multi-back { background: #777; }
            .multi-back:hover { background: #999; }
        `);
        
        $('body').append(style);
        stylesAdded = true;
        console.log('[MultiPlugin] Styles added');
    }

    // ==============================
    // Завантаження активних джерел
    // ==============================
    function loadActiveSources() {
        sources.forEach(function (src) {
            var storageKey = 'multi_' + src.name;
            var enabled = Lampa.Storage.get(storageKey, false);
            
            if (!enabled) return;

            // Перевіряємо, чи вже завантажений
            if (document.querySelector('script[src="' + src.url + '"]')) {
                console.log('[MultiPlugin] Already loaded:', src.name);
                return;
            }

            var script = document.createElement('script');
            script.src = src.url;
            script.async = false;
            document.body.appendChild(script);

            console.log('[MultiPlugin] Loaded:', src.name);
        });
    }

    // ==============================
    // Відкриття модалі
    // ==============================
    function openModal() {
        var html = $('<div class="multi-container"></div>');
        var hasChanges = false;

        // Елементи джерел
        sources.forEach(function (src) {
            var storageKey = 'multi_' + src.name;
            var enabled = Lampa.Storage.get(storageKey, false);

            var item = $('<div class="multi-item selector"></div>');
            var nameDiv = $('<div></div>').text(src.name);
            var toggleDiv = $('<div class="multi-toggle"></div>')
                .addClass(enabled ? 'enabled' : 'disabled')
                .text(enabled ? 'Увімкнено' : 'Вимкнено');

            item.append(nameDiv).append(toggleDiv);

            item.on('hover:enter', function () {
                enabled = !enabled;
                Lampa.Storage.set(storageKey, enabled);
                
                toggleDiv
                    .removeClass('enabled disabled')
                    .addClass(enabled ? 'enabled' : 'disabled')
                    .text(enabled ? 'Увімкнено' : 'Вимкнено');
                
                hasChanges = true;
                applyBtn.show();

                console.log('[MultiPlugin] Toggled:', src.name, 'to', enabled);
            });

            html.append(item);
        });

        // Кнопка застосувати
        var applyBtn = $('<div class="multi-apply selector" style="display:none;">Застосувати зміни</div>');
        
        applyBtn.on('hover:enter', function () {
            if (!hasChanges) return;
            
            Lampa.Modal.confirm({
                title: 'Перезапуск потрібен',
                text: 'Lampa буде перезавантажена. Продовжити?',
                yes: function () {
                    if (Lampa.Manifest && Lampa.Manifest.app_reload) {
                        Lampa.Manifest.app_reload();
                    } else {
                        location.reload();
                    }
                }
            });
        });

        // Кнопка назад
        var backBtn = $('<div class="multi-back selector">Назад</div>');
        
        backBtn.on('hover:enter', function () {
            Lampa.Modal.close();
        });

        html.append(applyBtn).append(backBtn);

        // Відкриваємо модаль
        Lampa.Modal.open({
            title: 'Мультиплагін — Балансери',
            html: html
        });

        // Встановлюємо фокус
        if (Lampa.Controller && Lampa.Controller.collectionSet) {
            try {
                Lampa.Controller.collectionSet(html);
                Lampa.Controller.collectionFocus(html.find('.selector').first());
            } catch (e) {
                console.log('[MultiPlugin] Controller error:', e.message);
            }
        }

        console.log('[MultiPlugin] Modal opened');
    }

    // ==============================
    // Ініціалізація налаштувань
    // ==============================
    function initSettings() {
        var SettingsApi = Lampa.SettingsApi || Lampa.Settings;
        
        if (!SettingsApi) {
            console.warn('[MultiPlugin] SettingsApi not found');
            return;
        }

        try {
            // Додаємо компонент
            if (SettingsApi.addComponent) {
                SettingsApi.addComponent({
                    component: 'multi_balancers',
                    name: 'Мультиплагін',
                    icon: '<svg viewBox="0 0 24 24" fill="currentColor"><circle cx="12" cy="12" r="10"/></svg>'
                });
            }

            // Кнопка "Керування"
            if (SettingsApi.addParam) {
                SettingsApi.addParam({
                    component: 'multi_balancers',
                    param: { name: 'multi_manage', type: 'button' },
                    field: { name: 'Керування балансерами' },
                    onChange: function () {
                        openModal();
                    }
                });
            }

            console.log('[MultiPlugin] Settings initialized');
        } catch (e) {
            console.error('[MultiPlugin] Error initializing settings:', e.message);
        }
    }

    // ==============================
    // Головна функція
    // ==============================
    function init() {
        console.log('[MultiPlugin] Initializing...');
        
        addStyles();
        loadActiveSources();
        initSettings();
        
        console.log('[MultiPlugin] Ready');
    }

    // ==============================
    // Старт при готовності Lampa
    // ==============================
    if (Lampa.Listener) {
        Lampa.Listener.follow('app', function (e) {
            if (e.type === 'ready') {
                init();
            }
        });
    } else {
        init();
    }

})();
