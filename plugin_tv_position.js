(function () {
    'use strict';

    function init() {

        var userAgent = navigator.userAgent.toLowerCase();
        var isSmartTV = /vidaa|webos|tizen|smarttv|metrological|netcast/i.test(userAgent);
        var isAndroidTV = /android.*tv|googletv/i.test(userAgent);
        var shouldMove = isSmartTV || isAndroidTV;

        if (!shouldMove) return;

        // CSS для переміщення бейджів
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
        function reposition() {
            $('.card .qb-unified-block').each(function () {
                var el = $(this);
                if (!el.hasClass('qb-tv-repositioned')) {
                    el.addClass('qb-tv-repositioned');
                    el.css({
                        top: 'auto',
                        left: 'auto',
                        bottom: '0.4em',
                        right: '0.4em',
                        flexDirection: 'column',
                        alignItems: 'flex-end',
                        position: 'absolute',
                        zIndex: 20
                    });
                }
            });
        }

        // Перше застосування
        reposition();

        // MutationObserver для всіх нових елементів, які можуть містити бейджі
        var observer = new MutationObserver(function (mutations) {
            mutations.forEach(function (mutation) {
                if (mutation.addedNodes.length) {
                    $(mutation.addedNodes).each(function () {
                        // переміщуємо всі знайдені бейджі в нових елементах
                        $(this).find('.qb-unified-block').addBack('.qb-unified-block').each(function () {
                            var el = $(this);
                            if (!el.hasClass('qb-tv-repositioned')) {
                                el.addClass('qb-tv-repositioned');
                                el.css({
                                    top: 'auto',
                                    left: 'auto',
                                    bottom: '0.4em',
                                    right: '0.4em',
                                    flexDirection: 'column',
                                    alignItems: 'flex-end',
                                    position: 'absolute',
                                    zIndex: 20
                                });
                            }
                        });
                    });
                }
            });
        });

        observer.observe(document.body, {
            childList: true,
            subtree: true
        });
    }

    function start() {
        if (window.Lampa && Lampa.Plugin) {
            Lampa.Plugin.create({
                id: 'quality_badges_tv_position',
                name: 'Quality Badges TV Position',
                version: '2.0',
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