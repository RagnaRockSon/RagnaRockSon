(function() {
    'use strict';

    const PLUGIN_NAME = 'FilmHub+';
    const PLUGIN_VERSION = 'v0.1-dev';

    // Показати сповіщення при старті Лампи
    Lampa.Noty.show(`Завантажено плагін ${PLUGIN_NAME} ${PLUGIN_VERSION}`, {time: 4000});

    function addPluginButton(cardActivity) {
        if (!cardActivity) return;

        // Шукаємо контейнер кнопок джерел
        const sourceBtnContainer = cardActivity.find('.view--sources');
        if (!sourceBtnContainer.length) return;

        // Перевірка, чи кнопка вже додана
        if (sourceBtnContainer.find('.filmhub-btn').length) return;

        // Створюємо нашу кнопку
        const btn = $('<div class="filmhub-btn" style="margin-right:0.5em; padding:0.4em 0.8em; background:#FF4500; color:white; border-radius:0.3em; cursor:pointer;">🎬 FilmHub+</div>');

        // Клік на кнопку
        btn.on('hover:enter', function() {
            Lampa.Noty.show('Запуск FilmHub+...', {time: 3000});
            // Тут виклик твого компоненту або функції плагіна
            console.log('Тут має бути твій компонент');
        });

        // Додаємо кнопку всередину контейнера джерел (першою зліва)
        sourceBtnContainer.prepend(btn);
    }

    // Слідкуємо за рендером карточки фільму
    Lampa.Listener.follow('full', function(e) {
        if (e.type === 'complite') {
            addPluginButton(e.object.activity.render());
        }
    });

    // Додатково перевіряємо активну карточку при старті
    try {
        const activeActivity = Lampa.Activity.active();
        if (activeActivity.component === 'full') {
            addPluginButton(activeActivity.activity.render());
        }
    } catch (err) {
        console.error('FilmHub+ error:', err);
    }

})();