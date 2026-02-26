(function() {
    'use strict';

    const PLUGIN_NAME = 'FilmHub+';
    const PLUGIN_VERSION = 'dev-0.1';

    function addFilmHubButton(e) {
        if (e.render.find('.filmhub-button').length) return;

        var btnHtml = `
            <div class="lampac--button filmhub-button">
                <span class="icon">🎬</span>
                <span class="title">${PLUGIN_NAME} (${PLUGIN_VERSION})</span>
            </div>
        `;
        var btn = $(btnHtml);

        btn.on('hover:enter', function() {
            resetTemplates();

            // показуємо сповіщення про завантаження
            Lampa.Noty.show(`Завантаження ${PLUGIN_NAME}...`, {time: 2000});

            Lampa.Component.add('FilmHubPlus', component);

            var id = Lampa.Utils.hash(e.movie.number_of_seasons ? e.movie.original_name : e.movie.original_title);
            var all = Lampa.Storage.get('clarification_search', '{}');

            Lampa.Activity.push({
                url: '',
                title: PLUGIN_NAME,
                component: 'FilmHubPlus',
                search: all[id] ? all[id] : e.movie.title,
                search_one: e.movie.title,
                search_two: e.movie.original_title,
                movie: e.movie,
                page: 1,
                clarification: all[id] ? true : false
            });
        });

        e.render.prepend(btn);
    }

    // відслідковуємо рендер картки
    Lampa.Listener.follow('full', function(e) {
        if (e.type === 'complite') {
            addFilmHubButton({
                render: e.object.activity.render().find('.view--torrent'),
                movie: e.data.movie
            });
        }
    });

    // якщо активна картка вже відкрита
    try {
        if (Lampa.Activity.active().component === 'full') {
            addFilmHubButton({
                render: Lampa.Activity.active().activity.render().find('.view--torrent'),
                movie: Lampa.Activity.active().card
            });
        }
    } catch (err) {
        console.error(`${PLUGIN_NAME} init error:`, err);
    }

    // показуємо коротке повідомлення про версію при старті
    Lampa.Noty.show(`${PLUGIN_NAME} [${PLUGIN_VERSION}] завантажено`, {time: 1500});

})();