(function () {
    'use strict';

    // Назва плагіна
    var PLUGIN_NAME = 'URL Player';

    // Список сторонніх плеєрів: package name для Android-інтентів
    var EXTERNAL_PLAYERS = [
        { name: 'Lampa (вбудований)', id: 'internal' },
        { name: 'VLC', id: 'vlc', package: 'org.videolan.vlc' },
        { name: 'MX Player', id: 'mx', package: 'com.mxtech.videoplayer.ad' },
        { name: 'MX Player Pro', id: 'mxpro', package: 'com.mxtech.videoplayer.pro' },
        { name: 'Just Player', id: 'just', package: 'com.brouken.player' },
        { name: 'UA Player', id: 'ua', package: 'com.lampaua.player' }
    ];

    function openUrlDialog() {
        Lampa.Input.edit({
            title: 'Посилання на відео',
            subtitle: 'Пряме посилання на файл або потік (mp4, mkv, m3u8...)',
            value: '',
            free: true
        }, function (value) {
            if (!value) return;
            selectPlayerFor(value.trim());
        });
    }

    function selectPlayerFor(url) {
        if (!/^https?:\/\//i.test(url)) {
            Lampa.Noty.show('Це не схоже на посилання. Перевірте адресу і спробуйте ще раз');
            return;
        }

        Lampa.Select.show({
            title: 'Чим відтворити?',
            items: EXTERNAL_PLAYERS.map(function (p) {
                return { title: p.name, subtitle: p.id === 'internal' ? 'без переходу з Lampa' : 'відкриється окремим застосунком', id: p.id };
            }),
            onSelect: function (selected) {
                var player = EXTERNAL_PLAYERS.filter(function (p) { return p.id === selected.id; })[0];
                if (player.id === 'internal') playUrl(url);
                else playExternal(url, player);
            },
            onBack: function () {
                Lampa.Controller.toggle('content');
            }
        });
    }

    function playUrl(url) {
        // Запускаємо стандартний плеєр Lampa з переданим URL
        Lampa.Player.play({
            url: url,
            title: 'Відео за посиланням',
            quality: {}, // якщо є кілька якостей — можна передати об'єкт {label: url}
            subtitles: []
        });

        Lampa.Player.playlist([{
            url: url,
            title: 'Відео за посиланням'
        }]);
    }

    function playExternal(url, player) {
        // Працює лише на Android (в т.ч. Android TV) через нативний міст Lampa-застосунку.
        // На Smart TV платформах (Tizen/WebOS) чи в браузері немає системних інтентів —
        // там залишається лише внутрішній плеєр Lampa.
        if (window.Android && typeof Android.openPlayer === 'function' && player.package) {
            try {
                // Android.openPlayer приймає url + метадані; конкретний плеєр обирається
                // системним діалогом "Відкрити за допомогою", якщо кілька застосунків
                // вміють обробити цей intent.
                Android.openPlayer(url, JSON.stringify({
                    title: 'Відео за посиланням',
                    package: player.package
                }));
                return;
            } catch (e) {
                console.error('Android bridge error:', e);
            }
        }

        // Фолбек: явний android intent-URI з вказівкою пакета —
        // спрацьовує у WebView, де дозволені intent:// посилання.
        if (player.package) {
            var intentUrl = 'intent:' + url + '#Intent;' +
                'action=android.intent.action.VIEW;' +
                'type=video/*;' +
                'package=' + player.package + ';' +
                'S.title=Відео за посиланням;' +
                'end';

            var opened = window.open(intentUrl, '_blank');
            if (!opened) {
                Lampa.Noty.show(player.name + ' не встановлено або він не зміг відкрити файл. Відкриваю у вбудованому плеєрі');
                playUrl(url);
            }
            return;
        }

        // Немає підтримки зовнішніх плеєрів на цій платформі — граємо у вбудованому
        Lampa.Noty.show('Зовнішні плеєри доступні лише на Android. Відкриваю у вбудованому плеєрі Lampa');
        playUrl(url);
    }

    function addMenuButton() {
        // Додаємо пункт у головне меню Lampa (іконка у стилі стандартних пунктів меню)
        var icon = '<svg width="30" height="30" viewBox="0 0 30 30" fill="none" xmlns="http://www.w3.org/2000/svg">' +
            '<path d="M9 21C6.79086 21 5 19.2091 5 17C5 15.0928 6.33739 13.5017 8.12071 13.0983C8.04169 12.7443 8 12.3761 8 12C8 9.23858 10.2386 7 13 7C15.1006 7 16.8951 8.29416 17.6335 10.126C17.7546 10.1089 17.8773 10.1 18 10.1C19.8231 10.1 21.3312 11.4243 21.6262 13.1605C23.5439 13.4487 25 15.0768 25 17C25 19.2091 23.2091 21 21 21H9Z" stroke="white" stroke-width="1.6"/>' +
            '<path d="M13 16L17 18.5L13 21V16Z" fill="white"/></svg>';

        var button = $('<li class="menu__item selector"><div class="menu__ico">' + icon + '</div><div class="menu__text">Відео за посиланням</div></li>');
        button.on('hover:enter', openUrlDialog);

        $('.menu .menu__list').eq(0).append(button);
    }

    if (window.appready) {
        addMenuButton();
    } else {
        Lampa.Listener.follow('app', function (e) {
            if (e.type === 'ready') addMenuButton();
        });
    }
})();