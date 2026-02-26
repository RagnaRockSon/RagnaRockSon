(function() {
    'use strict';

    const PLUGIN_NAME = 'FilmHubPlus';
    const PLUGIN_VERSION = '0.1-dev';

    // Сповіщення про завантаження плагіна при старті Лампи
    Lampa.Noty.show(`🔥 ${PLUGIN_NAME} v${PLUGIN_VERSION} завантажується`, {time: 3000});

    function addButton(e) {
        if (e.render.find('.filmhubplus--button').length) return;

        // Створюємо кнопку
        const btn = $('<div class="filmhubplus--button lampac--button">🎬 FilmHub+</div>');

        // Клік по кнопці
        btn.on('hover:enter', function() {
            // Скидання старих шаблонів
            resetTemplates();

            // Додаємо компонент нашого плагіна
            Lampa.Component.add(PLUGIN_NAME, component);

            // Підготовка пошуку для фільму
            const id = Lampa.Utils.hash(e.movie.number_of_seasons ? e.movie.original_name : e.movie.original_title);
            const all = Lampa.Storage.get('clarification_search','{}');

            Lampa.Activity.push({
                url: '',
                title: Lampa.Lang.translate('title_online'),
                component: PLUGIN_NAME,
                search: all[id] ? all[id] : e.movie.title,
                search_one: e.movie.title,
                search_two: e.movie.original_title,
                movie: e.movie,
                page: 1,
                clarification: all[id] ? true : false
            });
        });

        // Додаємо кнопку ліворуч від блоку джерел
        e.render.before(btn);
    }

    // Слідкуємо за відкриттям повної картки фільму
    Lampa.Listener.follow('full', function(e) {
        if (e.type === 'complite') {
            addButton({
                render: e.object.activity.render().find('.view--torrent'),
                movie: e.data.movie
            });
        }
    });

    // Якщо вже відкрита активна картка
    try {
        if (Lampa.Activity.active().component === 'full') {
            addButton({
                render: Lampa.Activity.active().activity.render().find('.view--torrent'),
                movie: Lampa.Activity.active().card
            });
        }
    } catch (err) {}

    // Версія для розробки
    if (!window.FilmHubPlus_plugin) {
        window.FilmHubPlus_plugin = true;
    }

})();