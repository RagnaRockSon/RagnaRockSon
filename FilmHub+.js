(function() {
    'use strict';

    var VERSION = '1.0';
    var PLUGIN_NAME = 'FilmHub+';

    // Повідомлення про завантаження плагіну
    if (Lampa.Noty) Lampa.Noty.show(`Плагін ${PLUGIN_NAME} ${VERSION} завантажено`);

    // Додаємо кнопку в картку фільму
    function addFilmHubButton(e) {
        if (e.render.find('.filmhub-button').length) return;

        var btn = $('<div class="lampac--button filmhub-button">FilmHub+</div>');
        btn.on('hover:enter', function() {
            Lampa.Noty.show('Відкриваємо FilmHub+');
            openFilmHub(e.object);
        });

        // Додаємо кнопку в меню поруч з існуючими
        e.render.find('.card-buttons').prepend(btn);
    }

    // Основна логіка плагіну
    function openFilmHub(movie) {
        // Тут пізніше підключимо джерела і плейлисти
        console.log('FilmHub+ відкрито для фільму:', movie);
        Lampa.Noty.show(`Фільм: ${movie.title || movie.name}`);
    }

    // Реєструємо плагін у Лампі
    Lampa.Component.add(PLUGIN_NAME, function(object) {
        return {
            initialize: function() {
                addFilmHubButton({ render: object.render, object: object.movie });
            }
        }
    });
})();