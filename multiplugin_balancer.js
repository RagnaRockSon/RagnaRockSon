(function() {
    'use strict';

    var pluginName = 'my_multi_plugin';

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
    // Завантаження всіх активних джерел
    // ================================
    function loadActiveSources(){
        sources.forEach(function(src, i){
            var enabled = Lampa.Storage.get(pluginName+'_'+i, true);
            if(enabled) loadSource(src);
        });
    }

    // ================================
    // Ініціалізація налаштувань з індикаторами
    // ================================
    function initSettings() {
        var SettingsApi = Lampa.SettingsApi || Lampa.Settings;
        if(!SettingsApi || !SettingsApi.addComponent) return;

        // Компонент плагіна
        SettingsApi.addComponent({
            component: pluginName,
            name: 'Мій Мультиплагін',
            icon: '<svg viewBox="0 0 28 28"><rect width="28" height="28" fill="currentColor"/></svg>'
        });

        // Чекбокси для джерел з індикаторами
        sources.forEach(function(src, i){
            var storageKey = pluginName+'_'+i;
            var stored = Lampa.Storage.get(storageKey, true);

            SettingsApi.addParam({
                component: pluginName,
                param: {name: 'source_'+i, type: 'switch'},
                field: {name: src.name},
                value: stored,
                onChange: function(value){
                    Lampa.Storage.set(storageKey, value);
                    if(value){
                        loadSource(src);
                        updateIndicator(i, true);
                    } else {
                        updateIndicator(i, false);
                    }
                }
            });

            // Додаємо індикатор поруч
            addIndicator(i, stored);
        });

        // Кнопка для підключення всіх активних
        SettingsApi.addParam({
            component: pluginName,
            param: {name: 'load_sources', type: 'button'},
            field: {name: 'Підключити активні балансери'},
            onChange: function(){
                loadActiveSources();
                updateAllIndicators();
            }
        });
    }

    // ================================
    // Функції для індикаторів
    // ================================
    function addIndicator(index, enabled){
        var componentId = pluginName+'_source_'+index+'_indicator';
        var indicator = $('<span class="source-indicator" id="'+componentId+'">'+(enabled?'Увімкнено':'Вимкнено')+'</span>');
        indicator.css({
            display: 'inline-block',
            padding: '0 6px',
            marginLeft: '10px',
            fontSize: '0.85em',
            color: '#fff',
            backgroundColor: enabled ? '#46b85a' : '#d24a4a',
            borderRadius: '3px'
        });
        $('.settings-component-item[data-component="'+pluginName+'"]').find('.settings-param').eq(index).append(indicator);
    }

    function updateIndicator(index, enabled){
        var componentId = pluginName+'_source_'+index+'_indicator';
        var el = $('#'+componentId);
        if(el.length){
            el.text(enabled?'Увімкнено':'Вимкнено');
            el.css('background-color', enabled ? '#46b85a' : '#d24a4a');
        }
    }

    function updateAllIndicators(){
        sources.forEach(function(src, i){
            var enabled = Lampa.Storage.get(pluginName+'_'+i, true);
            updateIndicator(i, enabled);
        });
    }

    // ================================
    // Старт плагіна
    // ================================
    function startPlugin(){
        waitForLampa(function(){
            initSettings();
            loadActiveSources(); // завантажити активні джерела автоматично
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
