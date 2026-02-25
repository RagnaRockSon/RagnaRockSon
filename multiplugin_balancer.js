(function() {
    'use strict';

    // ================================
    // Джерела / балансери
    // ================================
    var sources = [
        {name: "BazaNetUa", url: "http://lampaua.mooo.com/online.js", enabled: true},
        {name: "BanderaOnline", url: "https://lampame.github.io/main/BanderaOnline/BanderaOnline.js", enabled: true},
        {name: "Online_mod", url: "https://nb557.github.io/plugins/online_mod.js", enabled: true},
        {name: "Alpac Beta", url: "http://beta.l-vid.online/online.js", enabled: true}
    ];

    // ================================
    // Завантаження скриптів
    // ================================
    function loadSource(src){
        try {
            var script = document.createElement('script');
            script.src = src.url;
            script.async = false; // порядок підключення
            document.body.appendChild(script);
        } catch(e){
            console.warn('Помилка підключення', src.name);
        }
    }

    function loadActiveSources(){
        sources.forEach(function(src){
            if(src.enabled) loadSource(src);
        });
        Lampa.Noty.show('Активні балансери підключено');
    }

    // ================================
    // Налаштування в меню Lampa
    // ================================
    function initSettings() {
        var SettingsApi = Lampa.SettingsApi || Lampa.Settings;
        if(!SettingsApi || !SettingsApi.addComponent) return;

        // Компонент плагіна
        SettingsApi.addComponent({
            component: 'my_multi_plugin',
            name: 'Мій Мультиплагін',
            icon: '<svg viewBox="0 0 28 28"><rect width="28" height="28" fill="currentColor"/></svg>'
        });

        // Чекбокси для джерел
        sources.forEach(function(src, i){
            SettingsApi.addParam({
                component: 'my_multi_plugin',
                param: {name: 'source_'+i, type: 'switch'},
                field: {name: src.name},
                onChange: function(value){
                    src.enabled = value;
                }
            });
        });

        // Кнопка підключення активних джерел
        SettingsApi.addParam({
            component: 'my_multi_plugin',
            param: {name: 'load_sources', type: 'button'},
            field: {name: 'Підключити активні балансери'},
            onChange: function(){
                loadActiveSources();
            }
        });
    }

    // ================================
    // Компонент для пошуку фільмів/серіалів
    // ================================
    function initSearchComponent(){
        Lampa.Component.add('my_multi_plugin_search', {
            template: `
                <div style="padding: 20px;">
                    <h2>Пошук фільмів/серіалів:</h2>
                    <input v-model="query" placeholder="Введіть назву..." @keyup.enter="searchAll"/>
                    <ul>
                        <li v-for="item in results" @click="open(item)">
                            {{ item.name }} - {{ item.source }}
                        </li>
                    </ul>
                </div>
            `,
            data: function() {
                return {
                    query: '',
                    results: []
                };
            },
            methods: {
                searchAll: function() {
                    var self = this;
                    self.results = [];

                    // Показуємо всі підключені джерела
                    sources.forEach(function(src){
                        if(src.enabled){
                            self.results.push({
                                name: "Пошук через " + src.name,
                                url: src.url,
                                source: src.name
                            });
                        }
                    });

                    Lampa.Noty.show('Результати пошуку сформовано');
                },
                open: function(item) {
                    Lampa.Noty.show('Відкриваємо джерело: ' + item.name);
                    // Тут можна додати Lampa.Player.open(item.url)
                }
            }
        });
    }

    // ================================
    // Очікування Lampa перед ініціалізацією
    // ================================
    function startPlugin(){
        waitForLampa(function(){
            initSettings();
            initSearchComponent();
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
