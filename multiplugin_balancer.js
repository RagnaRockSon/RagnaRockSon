(function() {
    'use strict';

    var sources = [
        {name: "BazaNetUa", url: "http://lampaua.mooo.com/online.js", enabled: true},
        {name: "BanderaOnline", url: "https://lampame.github.io/main/BanderaOnline/BanderaOnline.js", enabled: true},
        {name: "Online_mod", url: "https://nb557.github.io/plugins/online_mod.js", enabled: true},
        {name: "Alpac Beta", url: "http://beta.l-vid.online/online.js", enabled: true}
    ];

    // ================================
    // Функція для підключення активних балансерів
    // ================================
    function loadActiveSources(){
        sources.forEach(function(src){
            if(src.enabled){
                try {
                    var script = document.createElement('script');
                    script.src = src.url;
                    script.async = false;
                    document.body.appendChild(script);
                    console.log('Балансер підключено:', src.name);
                } catch(e){
                    console.warn('Помилка підключення балансера:', src.name, e);
                }
            }
        });
    }

    // ================================
    // Створюємо компонент Lampa після готовності
    // ================================
    waitForLampa(function(){
        Lampa.Noty.show('Мультиплагін активний!');

        Lampa.Component.add('my_interactive_multi_plugin', {
            name: 'Інтерактивний мультиплагін',
            component: {
                template: `
                    <div style="padding:20px;">
                        <h2>Балансери:</h2>
                        <ul>
                            <li v-for="src in sources">
                                <input type="checkbox" v-model="src.enabled"> {{ src.name }}
                            </li>
                        </ul>

                        <button @click="reloadActiveScripts">Підключити активні балансери</button>

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
                        // Можна додати Lampa.Player.open(item.url)
                    },
                    reloadActiveScripts: function(){
                        loadActiveSources();
                        Lampa.Noty.show('Активні балансери підключено');
                    }
                }
            }
        });
    });

    // ================================
    // Функція очікування Lampa
    // ================================
    function waitForLampa(callback){
        if(typeof window.Lampa !== 'undefined' && window.Lampa.Component){
            callback();
        } else {
            setTimeout(function(){ waitForLampa(callback); }, 1000);
        }
    }

})();
