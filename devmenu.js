(function () {

    function openHiddenMenu() {

        if (window.Lampa && Lampa.Settings) {
            Lampa.Noty.show('Відкриття сервісного меню');

            // спроба відкрити dev меню
            if (Lampa.Dev) {
                Lampa.Dev.open();
            }
            else {
                Lampa.Noty.show('Dev меню не знайдено');
            }
        }
    }

    Lampa.SettingsApi.addComponent({
        component: 'developer_tools',
        name: 'Developer Tools'
    });

    Lampa.SettingsApi.addParam({
        component: 'developer_tools',
        param: {
            name: 'open_dev_menu',
            type: 'button'
        },
        field: {
            name: 'Відкрити приховане меню'
        },
        onChange: openHiddenMenu
    });

})();