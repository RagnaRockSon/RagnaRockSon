(function() {
    'use strict';

    // ================================
    // Балансери
    // ================================
    var sources = [
        {name: "BazaNetUa", url: "http://lampaua.mooo.com/online.js"},
        {name: "BanderaOnline", url: "https://lampame.github.io/main/BanderaOnline/BanderaOnline.js"},
        {name: "Online_mod", url: "https://nb557.github.io/plugins/online_mod.js"},
        {name: "Alpac Beta", url: "http://beta.l-vid.online/online.js"}
    ];

    // ================================
    // Стан джерел
    // ================================
    var sourceState = {};
    sources.forEach(function(src) {
        var stored = Lampa.Storage.get('multi_plugin_' + src.name, 'enabled');
        sourceState[src.name] = (stored === 'enabled'); // true = увімкнено
    });

    // ================================
    // Функція підключення скрипта
    // ================================
    function loadSource(src) {
        if (!sourceState[src.name]) return; // якщо вимкнено — не підключаємо
        try {
            var script = document.createElement('script');
            script.src = src.url;
            script.async = false;
            document.body.appendChild(script);
            console.log('Балансер підключено:', src.name);
        } catch(e) {
            console.warn('Помилка підключення', src.name, e);
        }
    }

    // ================================
    // Toggle кнопка
    // ================================
    function toggleSource(name, button) {
        sourceState[name] = !sourceState[name];
        Lampa.Storage.set('multi_plugin_' + name, sourceState[name] ? 'enabled' : 'disabled');
        updateButton(name, button);

        if (sourceState[name]) {
            var src = sources.find(s => s.name === name);
            loadSource(src);
        }
    }

    function updateButton(name, button) {
        if (sourceState[name]) {
            button.text(name + ' ✅ Увімкнено');
            button.css('background-color', '#46b85a'); // зелена
        } else {
            button.text(name + ' ❌ Вимкнено');
            button.css('background-color', '#d24a4a'); // червона
        }
    }

    // ================================
    // Створення меню
    // ================================
    function createMenu() {
        var SettingsApi = Lampa.SettingsApi || Lampa.Settings;
        if (!SettingsApi || !SettingsApi.addComponent) return;

        SettingsApi.addComponent({
            component: 'multi_plugin',
            name: 'Мій Мультиплагін',
            icon: '<svg viewBox="0 0 28 28"><rect width="28" height="28" fill="#156DD1"/></svg>'
        });

        sources.forEach(function(src) {
            SettingsApi.addParam({
                component: 'multi_plugin',
                param: {name: src.name, type: 'button'},
                field: {name: src.name},
                onChange: function() {
                    var btn = $('.settings-param-' + src.name);
                    toggleSource(src.name, btn);
                }
            });
        });

        // Після створення меню оновлюємо кнопки
        setTimeout(function() {
            sources.forEach(function(src) {
                var btn = $('.settings-param-' + src.name);
                updateButton(src.name, btn);
            });
        }, 100);
    }

    // ================================
    // Старт плагіна
    // ================================
    function startPlugin() {
        if (!window.Lampa) {
            setTimeout(startPlugin, 500);
            return;
        }

        Lampa.Noty.show('Мультиплагін активний!');
        createMenu();

        // Підключаємо всі активні балансери
        sources.forEach(loadSource);
    }

    startPlugin();
})();
