(function() {
    'use strict';

    var sources = [
        {name: "BazaNetUa", url: "http://lampaua.mooo.com/online.js"},
        {name: "BanderaOnline", url: "https://lampame.github.io/main/BanderaOnline/BanderaOnline.js"},
        {name: "Online_mod", url: "https://nb557.github.io/plugins/online_mod.js"},
        {name: "Alpac Beta", url: "http://beta.l-vid.online/online.js"}
    ];

    function startPlugin() {
        if(typeof window.Lampa === 'undefined' || !window.Lampa.Component) {
            setTimeout(startPlugin, 500);
            return;
        }

        Lampa.Noty.show('Мультиплагін GitHub активний!');

        sources.forEach(function(src) {
            try {
                var script = document.createElement('script');
                script.src = src.url;
                script.async = false;
                document.body.appendChild(script);
                console.log('Балансер підключено:', src.name);
            } catch(e) {
                console.warn('Помилка підключення балансера', src.name, e);
            }
        });

        Lampa.Component.add('my_github_plugin', {
            name: 'Мій GitHub Мультиплагін',
            component: {
                template: `
                    <div style="padding:20px;">
                        <h2>Пошук фільмів/серіалів:</h2>
                        <input v-model="query" placeholder="Введіть назву..." @keyup.enter="searchAll"/>
                        <ul>
                            <li v-for="item in results" @click="open(item)">
                                {{ item.name }} - {{ item.source }}
                            </li>
                        </ul>
                    </div>
                `,
                data: function() { return { query:'', results:[] }; },
                methods: {
                    searchAll: function() {
                        var self = this;
                        self.results = [];
                        sources.forEach(function(src) {
                            self.results.push({
                                name: "Пошук через " + src.name + ": " + self.query,
                                url: src.url,
                                source: src.name
                            });
                        });
                    },
                    open: function(item) {
                        Lampa.Noty.show('Відкриваємо джерело: ' + item.source);
                    }
                }
            }
        });
    }

    startPlugin();

})();
