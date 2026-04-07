(function () {
    'use strict';

    function startPlugin() {

        if (!window.Lampa) return;

        // створюємо новий розділ у налаштуваннях
        Lampa.SettingsApi.addComponent({
            component: 'dev_tools',
            name: 'Developer menu'
        });

        // додаємо кнопку
        Lampa.SettingsApi.addParam({
            component: 'dev_tools',
            param: {
                name: 'open_dev',
                type: 'button'
            },
            field: {
                name: 'Відкрити приховане меню'
            },
            onChange: function () {

                Lampa.Noty.show('Меню викликано');

                // спроба відкрити dev меню
                if (Lampa.Dev && Lampa.Dev.open) {
                    Lampa.Dev.open();
                }
                else {
                    Lampa.Noty.show('Dev меню недоступне у цій версії');
                }
            }
        });
    }

    // запуск після завантаження Lampa
    if (window.appready) {
        startPlugin();
    } else {
        Lampa.Listener.follow('app', function (e) {
            if (e.type == 'ready') startPlugin();
        });
    }

})();