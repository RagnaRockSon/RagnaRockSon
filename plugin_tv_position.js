/**
 * Quality Badges Position Plugin v1.2
 * Moves quality badges (4K, HD, HDR, etc.) to bottom-right on Smart TV & Android TV
 * Compatible with Quality Badges plugin by yarikrazor
 */

(function () {
    'use strict';

    function startPlugin() {

        console.log('[Quality Position] Plugin loading...');

        var userAgent = navigator.userAgent.toLowerCase();

        // Smart TV detection
        var isSmartTV = /vidaa|webos|tizen|smarttv|metrological|netcast/i.test(userAgent);

        // Android TV detection
        var isAndroidTV = /android.*tv|googletv/i.test(userAgent);

        var shouldMove = isSmartTV || isAndroidTV;

        console.log('[Quality Position] Smart TV:', isSmartTV);
        console.log('[Quality Position] Android TV:', isAndroidTV);
        console.log('[Quality Position] Should move badges:', shouldMove);

        if (!shouldMove) {
            console.log('[Quality Position] Not a TV device, skipping');
            return;
        }

        // ─────────────────────────────────────────────
        // ADD STYLES (тільки один раз)
        // ─────────────────────────────────────────────

        if (!document.getElementById('qb-position-style')) {

            var style = document.createElement('style');
            style.id = 'qb-position-style';

            style.textContent = `
                .card .qb-unified-block {
                    top: auto !important;
                    bottom: 0.4em !important;
                    left: auto !important;
                    right: 0.4em !important;
                    align-items: flex-end !important;
                    flex-direction: column !important;
                    transition: all 0.3s ease !important;
                }

                .card .quality-badge {
                    margin-left: 0 !important;
                }

                .card .qb-unified-block.qb-repositioned {
                    animation: qb-slide-in 0.3s ease;
                }

                @keyframes qb-slide-in {
                    from {
                        opacity: 0;
                        transform: translateX(20px);
                    }
                    to {
                        opacity: 1;
                        transform: translateX(0);
                    }
                }
            `;

            document.head.appendChild(style);
            console.log('[Quality Position] Styles injected');
        }

        // ─────────────────────────────────────────────
        // REPOSITION FUNCTION
        // ─────────────────────────────────────────────

        function repositionBadges() {
            var badges = document.querySelectorAll('.card .qb-unified-block:not(.qb-repositioned)');
            badges.forEach(function (badge) {
                badge.classList.add('qb-repositioned');
            });
            return badges.length;
        }

        var initialCount = repositionBadges();
        console.log('[Quality Position] Initial reposition:', initialCount);

        // ─────────────────────────────────────────────
        // MUTATION OBSERVER
        // ─────────────────────────────────────────────

        if (document.body) {

            var observer = new MutationObserver(function (mutations) {
                var found = 0;

                mutations.forEach(function (mutation) {
                    mutation.addedNodes.forEach(function (node) {

                        if (node.nodeType === 1) {

                            if (node.classList &&
                                node.classList.contains('qb-unified-block') &&
                                !node.classList.contains('qb-repositioned')) {

                                node.classList.add('qb-repositioned');
                                found++;
                            }

                            if (node.querySelectorAll) {
                                var inner = node.querySelectorAll('.qb-unified-block:not(.qb-repositioned)');
                                inner.forEach(function (b) {
                                    b.classList.add('qb-repositioned');
                                    found++;
                                });
                            }
                        }
                    });
                });

                if (found > 0) {
                    console.log('[Quality Position] Repositioned new badges:', found);
                }
            });

            observer.observe(document.body, {
                childList: true,
                subtree: true
            });

            console.log('[Quality Position] DOM observer started');
        }

        setInterval(function () {
            var count = repositionBadges();
            if (count > 0) {
                console.log('[Quality Position] Periodic reposition:', count);
            }
        }, 3000);

        console.log('[Quality Position] Plugin initialized successfully');
    }

    // ─────────────────────────────────────────────
    // CORRECT LAMPA INITIALIZATION
    // ─────────────────────────────────────────────

    if (window.Lampa) {
        startPlugin();
    } else {
        document.addEventListener('lampa:ready', startPlugin);
    }

})();