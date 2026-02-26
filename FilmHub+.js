(function () {

    if (!window.Lampa) return;

    console.log('FilmHub+ loaded');

    var component = {};

    component.create = function () {
        var movie = this.activity.movie;

        this.activity.loader(true);

        this.activity.render(`
            <div style="padding:40px">
                <h1>🎬 FilmHub+</h1>
                <h2>${movie.title || movie.name}</h2>

                <div class="selector" style="margin-top:30px">
                    ▶ Тестове джерело
                </div>
            </div>
        `);

        this.activity.loader(false);
    };

    component.destroy = function () {};

    Lampa.Component.add('filmhub_plus', component);

    function insertButton() {

        var card = $('.full-start__buttons');

        if (!card.length) return;
        if (card.find('.filmhub-btn').length) return;

        var btn = $('<div class="full-start__button selector filmhub-btn">🎬 FilmHub+</div>');

        btn.on('hover:enter', function () {

            var movie = Lampa.Activity.active().movie;

            Lampa.Activity.push({
                component: 'filmhub_plus',
                movie: movie
            });

        });

        card.append(btn);
    }

    Lampa.Listener.follow('activity', function (e) {
        if (e.component == 'full') {
            setTimeout(insertButton, 500);
        }
    });

})();