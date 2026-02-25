(function() {
    'use strict';

    // ================================
    // Балансери
    // ================================
    var sources = [
        {name: "BazaNetUa", url: "http://lampaua.mooo.com/online.js", enabled: true},
        {name: "BanderaOnline", url: "https://lampame.github.io/main/BanderaOnline/BanderaOnline.js", enabled: true},
        {name: "Online_mod", url: "https://nb557.github.io/plugins/online_mod.js", enabled: true},
        {name: "Alpac Beta", url: "http://beta.l-vid.online/online.js", enabled: true}
    ];

    // ================================
    // Перевірка готовності Lampa
    // ================================
    function startPlugin() {
        if(typeof window.Lampa === 'undefined' || !window.Lampa.Component) {
            setTimeout(startPlugin, 500);
            return;
        }

        Lampa.Noty.show('Мультиплагін активний!');

        // ================================
        // Підключаємо активні балансери
        // ================================
        sources.forEach(function(src){
            if(src.enabled){
                try {
                    var script = document.createElement('script');
                    script.src = src.url;
                    script.async = false;
                    document.body.appendChild(script);
                    console.log('Балансер підключено:', src.name);
                } catch(e) {
                    console.warn('Помилка підключення балансера', src.name, e);
                }
            }
        });

        // ================================
        // Створення меню Lampa
        // ================================
        Lampa.Component.add('my_multi_plugin', {
            name: 'Мій Мультиплагін',
            component: {
                template: `
                    <div style="padding:20px;">
                        <h2>Балансери:</h2>
                        <ul>
                            <li v-for="src in sources">
                                <input type="checkbox" v-model="src.enabled"> {{ src.name }}
                            </li>
                        </ul>

                        <h2>Пошук фільмів/серіалів:</h2>
                        <input v-model="query" placeholder="Введіть назву..." @keyup.enter="searchAll"/>
                        <ul>
                            <li v-for="item in results" @click="open(item)">
                                {{ item.name }} - {{ item.source }}
                            </li>
                        </ul>
                    </div>
                `,
                data: function(){ 
                    return { 
                        sources: sources,
                        query: '',
                        results: []
                    };
                },
                methods: {
                    searchAll: function(){
                        var self = this;
                        self.results = [];

                        self.sources.forEach(function(src){
                            if(src.enabled){
                                self.results.push({
                                    name: "Пошук через " + src.name + ": " + self.query,
                                    url: src.url,
                                    source: src.name
                                });
                            }
                        });

                        if(self.results.length === 0){
                            Lampa.Noty.show('Жоден балансер не активний!');
                        }
                    },
                    open: function(item){
                        Lampa.Noty.show('Відкриваємо джерело: ' + item.source);
                        // Тут можна додати Lampa.Player.open(item.url)
                    }
                }
            }
        });
    }

    // ================================
    // Старт плагіна
    // ================================
    startPlugin();

})();
