(function() {
    'use strict';

    var pluginName = 'my_multi_plugin_buttons';

    var sources = [
        {name: "BazaNetUa", url: "http://lampaua.mooo.com/online.js"},
        {name: "BanderaOnline", url: "https://lampame.github.io/main/BanderaOnline/BanderaOnline.js"},
        {name: "Online_mod", url: "https://nb557.github.io/plugins/online_mod.js"},
        {name: "Alpac Beta", url: "http://beta.l-vid.online/online.js"}
    ];

    // ================================
    // Завантаження скрипту
    // ================================
    function loadSource(src){
        try {
            var script = document.createElement('script');
            script.src = src.url;
            script.async = false;
            document.body.appendChild(script);
            Lampa.Noty.show('Підключено: ' + src.name);
        } catch(e){
            console.warn('Помилка підключення', src.name);
        }
    }

    // ================================
    // Створення кнопок у меню
    // ================================
    function initSettings() {
        var SettingsApi = Lampa.SettingsApi || Lampa.Settings;
        if(!SettingsApi || !SettingsApi.addComponent) return;

        // Додати компонент
        SettingsApi.addComponent({
            component: pluginName,
            name: 'Мій Мультиплагін (кнопки)',
            icon: '<svg viewBox="0 0 28 28"><rect width="28" height="28" fill="currentColor"/></svg>'
        });

        // Додаємо кнопки для кожного джерела
        sources.forEach(function(src, i){
            var storageKey = pluginName+'_'+i;
            var enabled = Lampa.Storage.get(storageKey, false);

            SettingsApi.addParam({
                component: pluginName,
                param: {name: 'source_'+i, type: 'button'},
                field: {name: src.name + ' [' + (enabled?'Увімкнено':'Вимкнено') + ']'},
                onChange: function(){
                    enabled = !enabled;
                    Lampa.Storage.set(storageKey, enabled);
                    updateButton(i, enabled);
                    if(enabled) loadSource(src);
                }
            });
        });
    }

    // ================================
    // Оновлення кнопки
    // ================================
    function updateButton(index, enabled){
        var btn = $('.settings-component-item[data-component="'+pluginName+'"]').find('.settings-param').eq(index);
        if(btn.length){
            var name = sources[index].name + ' [' + (enabled?'Увімкнено':'Вимкнено') + ']';
            btn.find('.settings-param__name').text(name);
            btn.css('background-color', enabled ? '#46b85a' : '#d24a4a');
        }
    }

    // ================================
    // Старт плагіна
    // ================================
    function startPlugin(){
        waitForLampa(function(){
            initSettings();
            // Завантажити активні джерела
            sources.forEach(function(src, i){
                if(Lampa.Storage.get(pluginName+'_'+i, false)){
                    loadSource(src);
                    updateButton(i, true);
                }
            });
        });
    }

    function waitForLampa(callback){
        if(typeof window.Lampa !== 'undefined' && window.Lampa.SettingsApi){
            callback();
        } else {
            setTimeout(function(){ waitForLampa(callback); }, 500);
        }
    }

    startPlugin();

})();
