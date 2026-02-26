(function() {
    'use strict';

    const VERSION = 'FilmHub+ v1.0';

    // Повідомлення про завантаження плагіну
    if (Lampa.Noty) Lampa.Noty.show(`Мій плагін ${VERSION} завантажено`);

    // --- Додати кнопку у картку фільму ---
    function addFilmHubButton(card) {
        if (!card || card.find('.filmhub-button').length) return;

        // Створюємо кнопку
        const btn = $('<div class="lampac--button filmhub-button">FilmHub+</div>');

        // Додаємо іконку (можна змінити на свою)
        btn.css({
            'background-image': 'url(./img/filmhub-icon.png)',
            'background-size': 'contain',
            'background-repeat': 'no-repeat',
            'background-position': 'center',
            'width': '4em',
            'height': '4em',
            'margin-right': '0.5em'
        });

        btn.on('hover:enter', function() {
            openFilmHub(card.movie);
        });

        // Вставляємо кнопку зліва від оригінальних
        card.find('.controls').prepend(btn);
    }

    // --- Відкрити FilmHub+ ---
    function openFilmHub(movie) {
        if (!movie) return;

        const network = new Lampa.Reguest();
        const scroll = new Lampa.Scroll({mask: true, over: true});

        // UI контейнер
        const container = $('<div class="filmhub-container"></div>');
        scroll.body().append(container);
        Lampa.Controller.enable('content');

        // Запит доступних потоків з оригінальних плагінів
        network.timeout(10000);
        const url = `http://lampaua.mooo.com/lite/events?movie_id=${encodeURIComponent(movie.id)}`;

        network.silent(url, function(json) {
            if (!json || !json.online) {
                Lampa.Noty.show('Потоки не знайдені');
                return;
            }

            // Створюємо список
            json.online.forEach(function(source) {
                const name = source.name || 'Без назви';
                const item = $(`<div class="filmhub-source">${name}</div>`);
                container.append(item);

                item.on('hover:enter', function() {
                    playFilmHubStream(source, movie);
                });
            });

            scroll.update();
        }, function() {
            Lampa.Noty.show('Помилка при завантаженні потоків');
        });
    }

    // --- Відтворення потоку через Lampa.Player ---
    function playFilmHubStream(file, movie) {
        if (!file || !file.url) return;

        const element = {
            title: movie.title || movie.original_title,
            url: file.url,
            quality: file.qualitys,
            subtitles: file.subtitles,
            season: file.season,
            episode: file.episode,
            voice_name: file.voice_name
        };

        Lampa.Player.play(element);
    }

    // --- Підключення до карток фільмів ---
    Lampa.Card.add(function(card) {
        addFilmHubButton(card);
    });

})();