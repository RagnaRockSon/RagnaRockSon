(function() {
    'use strict';

    const PLUGIN_VERSION = '1.0.0'; // версія плагіна
    const PLUGIN_NAME = 'FilmHub+';

    // Функція для створення кнопки поруч з "Джерела"
    function addPluginButton(render) {
        // Перевірка, чи кнопка вже є
        if (render.find('.filmhub-button').length) return;

        // Створюємо кнопку
        const btn = $('<div class="filmhub-button" style="display:inline-block; margin-right:10px; cursor:pointer;">🎬 ' + PLUGIN_NAME + '</div>');

        // Подія при натисканні
        btn.on('hover:enter', function() {
            Lampa.Noty.show('Відкрито ' + PLUGIN_NAME, {time: 2000});
            // Тут можна додати логіку вашого плагіна
        });

        // Вставляємо кнопку перед "Джерела"
        render.find('.view--torrent .view--torrent__head').prepend(btn);
    }

    // Показати сповіщення про версію при завантаженні Лампи
    function showPluginVersion() {
        Lampa.Noty.show(PLUGIN_NAME + ' v' + PLUGIN_VERSION, {time: 3000});
    }

    // Слухаємо момент, коли відкривається повна карточка фільму
    Lampa.Listener.follow('full', function(e) {
        if (e.type === 'complite') {
            const render = e.object.activity.render();
            addPluginButton(render);
            showPluginVersion();
        }
    });

    // Якщо Лампа вже відкрита
    try {
        if (Lampa.Activity.active().component === 'full') {
            const render = Lampa.Activity.active().activity.render();
            addPluginButton(render);
            showPluginVersion();
        }
    } catch (e) {}

})();