(function () {
    'use strict';

    function init() {

        console.log('[Quality Position] Plugin initialized');

        var userAgent = navigator.userAgent.toLowerCase();

        var isSmartTV = /vidaa|webos|tizen|smarttv|metrological|netcast/i.test(userAgent);
        var isAndroidTV = /android.*tv|googletv/i.test(userAgent);
        var shouldMove = isSmartTV || isAndroidTV;

        if (!shouldMove) return;

        if (!document.getElementById('qb-position-style')) {

            var style = document.createElement('style');
            style.id = 'qb-position-style';

            style.textContent =
                '.card .qb-unified-block {' +
                'top:auto !important;' +
                'bottom:0.4em !important;' +
                'left:auto !important;' +
                'right:0.4em !important;' +
                'align-items:flex-end !important;' +
                'flex-direction:column !important;' +
                'transition:all 0.3s ease !important;' +
                '}' +
                '.card .quality-badge {' +
                'margin-left:0 !important;' +
                '}';

            document.head.appendChild(style);
        }

        function reposition() {
            var badges = document.querySelectorAll('.card .qb-unified-block');
            for (var i = 0; i < badges.length; i++) {
                badges[i].classList.add('qb-repositioned');
            }
        }

        reposition();

        var observer = new MutationObserver(function () {
            reposition();
        });

        observer.observe(document.body, {
            childList: true,
            subtree: true
        });
    }

    function start() {
        if (window.Lampa && Lampa.Plugin) {
            Lampa.Plugin.create({
                id: 'quality_badges_position',
                name: 'Quality Badges Position',
                version: '1.3',
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