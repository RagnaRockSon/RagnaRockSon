(function () {
    'use strict';

    var sources = [
        { name: "BazaNetUa", url: "http://lampaua.mooo.com/online.js" },
        { name: "BanderaOnline", url: "https://lampame.github.io/main/BanderaOnline/BanderaOnline.js" },
        { name: "Online_mod", url: "https://nb557.github.io/plugins/online_mod.js" },
        { name: "Alpac Beta", url: "http://beta.l-vid.online/online.js" }
    ];

    function startPlugin() {
        if (!window.Lampa) {
            setTimeout(startPlugin, 500);
            return;
        }

        Lampa.SettingsApi.addComponent({
            component: 'multi_plugin',
            name: 'Мультиплагін балансерів',
            icon: '<svg viewBox="0 0 28 28"><rect width="28" height="28" fill="#156DD1"/></svg>'
        });

        sources.forEach(function (src) {

            var storageKey = 'multi_' + src.name;
            var enabled = Lampa.Storage.get(storageKey, false);

            Lampa.SettingsApi.addParam({
                component: 'multi_plugin',
                param: {
                    name: src.name,
                    type: 'button'
                },
                field: {
                    name: src.name
                },
                onRender: function (item) {

                    var button = item.find('.settings-param__name');

                    function updateUI() {
                        if (enabled) {
                            button.text(src.name + ' — Вимкнути');
                            button.css({
                                background: '#46b85a',
                                color: '#fff',
                                padding: '6px 10px',
                                borderRadius: '6px'
                            });
                        } else {
                            button.text(src.name + ' — Увімкнути');
                            button.css({
                                background: '#d24a4a',
                                color: '#fff',
                                padding: '6px 10px',
                                borderRadius: '6px'
                            });
                        }
                    }

                    updateUI();

                    item.on('hover:enter', function () {

                        enabled = !enabled;
                        Lampa.Storage.set(storageKey, enabled);

                        if (enabled) {
                            var script = document.createElement('script');
                            script.src = src.url;
                            script.async = false;
                            document.body.appendChild(script);
                            Lampa.Noty.show(src.name + ' підключено');
                        } else {
                            Lampa.Noty.show(src.name + ' вимкнено (перезапуск Lampa для повного відключення)');
                        }

                        updateUI();
                    });
                }
            });

            // автопідключення якщо увімкнений
            if (enabled) {
                var script = document.createElement('script');
                script.src = src.url;
                script.async = false;
                document.body.appendChild(script);
            }

        });

        Lampa.Noty.show('Мультиплагін активний');
    }

    startPlugin();

})();
