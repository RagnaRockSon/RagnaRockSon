(function () {
    'use strict';

    function init() {

        var userAgent = navigator.userAgent.toLowerCase();
        var isSmartTV = /vidaa|webos|tizen|smarttv|metrological|netcast/i.test(userAgent);
        var isAndroidTV = /android.*tv|googletv/i.test(userAgent);
        var shouldMove = isSmartTV || isAndroidTV;

        if (!shouldMove) return;

        // Додаємо CSS тільки один раз
        if (!document.getElementById('qb-tv-position-style')) {
            var style = document.createElement('style');
            style.id = 'qb-tv-position-style';
            style.textContent =
                '.card .qb-unified-block {' +
                'position:absolute !important;' +
                'top:auto !important;' +
                'left:auto !important;' +
                'bottom:0.4em !important;' +
                'right:0.4em !important;' +
                'flex-direction:column !important;' +
                'align-items:flex-end !important;' +
                'z-index:20 !important;' +
                'transition:all 0.3s ease !important;' +
                '}';
            document.head.appendChild(style);
        }

        // Функція переміщення бейджів
        function repositionBadges() {
            var badges = document.querySelectorAll('.card .qb-unified-block:not(.qb-tv-repositioned)');
            for (var i = 0; i < badges.length; i++) {
                badges[i].classList.add('qb-tv-repositioned');
            }
            return badges.length;
        }

        // Початкова спроба перемістити вже існуючі бейджі
        repositionBadges();

        // MutationObserver для нових бейджів
        var observer = new MutationObserver(function () {
            repositionBadges();
        });

        observer.observe(document.body, {
            childList: true,
            subtree: true
        });

        // Періодична перевірка на випадок, якщо бейджі з'являються через асинхронний код основного плагіна
        setInterval(repositionBadges, 2000);
    }

    function start() {
        if (window.Lampa && Lampa.Plugin) {
            Lampa.Plugin.create({
                id: 'quality_badges_tv_position',
                name: 'Quality Badges TV Position',
                version: '1.0',
                description: 'Moves quality badges to bottom-right on TV devices',
                onReady: init
            });
        }
    }

    if (window.Lampa) {
        start();
    } else {
        document.addEventListener('lampa:ready', start);
    }

})();