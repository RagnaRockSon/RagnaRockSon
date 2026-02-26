(function() {
    'use strict';

    var PLUGIN_NAME = 'FilmHub+';

    function addFilmHubButton(card, movie) {
        if (card.find('.filmhub-button').length) return;

        // Створюємо кнопку з іконкою 🎬
        var btn = $(`
            <div class="lampac--button filmhub-button" 
                 style="display:flex; align-items:center; background:#ff5722; font-weight:bold; padding:0.5em 1em; border-radius:0.5em; margin-right:0.5em;">
                <span style="font-size:1.5em; margin-right:0.5em;">🎬</span>
                ${PLUGIN_NAME}
            </div>
        `);

        btn.on('hover:enter', function() {
            Lampa.Noty.show(`Відкриваємо FilmHub+ для "${movie.title || movie.name}"`);
            openFilmHub(movie);
        });

        // Додаємо кнопку ліворуч у контейнер кнопок
        var container = card.find('.card-buttons');
        if (container.length) container.prepend(btn);
        else card.append(btn);
    }

    function openFilmHub(movie) {
        console.log('FilmHub+ відкрито для фільму:', movie);
        Lampa.Noty.show(`Фільм: ${movie.title || movie.name}`);
        // Тут буде логіка відкриття нашого плагіна
    }

    // Слухаємо рендер картки фільму
    Lampa.Listener.follow('card:render', function(card, movie) {
        addFilmHubButton(card, movie);
    });

})();