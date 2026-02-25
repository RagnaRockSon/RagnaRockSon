(function() {
    'use strict';

    // Балансери
    var sources = [
        {name: "BazaNetUa", url: "http://lampaua.mooo.com/online.js", enabled: true},
        {name: "BanderaOnline", url: "https://lampame.github.io/main/BanderaOnline/BanderaOnline.js", enabled: true},
        {name: "Online_mod", url: "https://nb557.github.io/plugins/online_mod.js", enabled: true},
        {name: "Alpac Beta", url: "http://beta.l-vid.online/online.js", enabled: true}
    ];

    function startPlugin() {
        if(typeof window.Lampa === 'undefined' || !window.Lampa.Component) {
            setTimeout(startPlugin, 500);
            return;
        }

        Lampa.Noty.show('Мультиплагін активний!');

        // Додаємо компонент у Lampa
        Lampa.Component.add('interactive_multi_plugin', {
            name: 'Інтерактивний мультиплагін',
            component: {
                template: `
                    <div style="padding:20px;">
                        <h2>Балансери (увімкнути/вимкнути):</h2>
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

                        <button @click="reloadActiveScripts">Підключити активні балансери</button>
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
                    // Пошук по активних балансерах
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

                    // Відкриваємо плеєр (тут можна додати Lampa.Player)
                    open: function(item){
                        Lampa.Noty.show('Відкриваємо джерело: ' + item.source);
                    },

                    // Підключаємо скрипти лише активних балансерів
                    reloadActiveScripts: function(){
                        var self = this;
                        self.sources.forEach(function(src){
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
                        Lampa.Noty.show('Активні балансери підключено');
                    }
                }
            }
        });
    }

    startPlugin();
})();
