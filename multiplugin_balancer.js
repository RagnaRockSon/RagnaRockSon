applyButton.on('hover:enter', function () {
    if (!hasChanges) return;

    // Закриваємо основну модаль
    if (Lampa.Modal && Lampa.Modal.close) {
        Lampa.Modal.close();
    }

    // Відкриваємо власне модальне вікно підтвердження
    Lampa.Modal.open({
        title: 'Перезапуск потрібен',
        text: 'Щоб застосувати зміни, Lampa потрібно перезавантажити. Перезавантажити зараз?',
        buttons: [
            {
                name: 'Так',
                onSelect: function () {
                    if (Lampa.Manifest && typeof Lampa.Manifest.app_reload === 'function') {
                        Lampa.Manifest.app_reload();
                    } else {
                        location.reload();
                    }
                }
            },
            {
                name: 'Ні',
                onSelect: function () {
                    Lampa.Modal.close();
                }
            }
        ]
    });
});
