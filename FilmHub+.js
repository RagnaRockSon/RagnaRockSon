(function() {
    'use strict';

    if (window.MyPluginLoaded) return;
    window.MyPluginLoaded = true;

    const PLUGIN_VERSION = '0.1-dev';
    const BUTTON_TITLE = '🎬 FilmHub+';

    // Показ сповіщення про версію плагіна при старті Лампи
    Lampa.Noty.show(`MyPlugin v${PLUGIN_VERSION} завантажено`, {time: 3000});

    // Функція додавання кнопки
    function addPluginButton(cardActivity, movie) {
        if (!cardActivity || cardActivity.find('.myplugin-button').length) return;

        // Створюємо кнопку
        const btn = $('<div class="myplugin-button focus">' + BUTTON_TITLE + '</div>');
        btn.css({
            display: 'inline-block',
            marginRight: '0.5em',
            padding: '0.5em 1em',
            background: '#ff3d00',
            color: '#fff',
            borderRadius: '0.3em',
            cursor: 'pointer',
            fontWeight: 'bold'
        });

        btn.on('hover:enter', function() {
            // Тут можна підключити компонент або функціонал плагіна
            Lampa.Noty.show('Запущено MyPlugin', {time: 2000});
            console.log('MyPlugin запущено для', movie.title || movie.name);
        });

        // Знаходимо контейнер джерел, універсально
        let container = cardActivity.find('[class*="view--"]').first();
        if (!container.length) {
            // якщо не знайшли стандартний блок
            container = cardActivity;
        }

        // Вставляємо кнопку зліва від всіх елементів
        container.prepend(btn);
    }

    // Слідкуємо за завантаженням карточки фільму
    Lampa.Listener.follow('full', function(e) {
        if (e.type === 'complite') {
            addPluginButton(e.object.activity.render(), e.data.movie);
        }
    });

    // Якщо вже відкрита карточка
    try {
        const active = Lampa.Activity.active();
        if (active && active.component === 'full') {
            addPluginButton(active.activity.render(), active.card);
        }
    } catch(e) {}

})();