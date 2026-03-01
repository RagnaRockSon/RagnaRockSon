/**
 * Quality Badges Position Plugin v1.0
 * Moves quality badges (4K, HD, HDR, etc.) to bottom-right on Smart TV & Android TV
 * 
 * Compatible with Quality Badges plugin by yarikrazor
 */

(function() {
    'use strict';

    console.log('[Quality Position] Plugin loading...');

    // ─────────────────────────────────────────────────────────────────
    // DETECT DEVICE TYPE
    // ─────────────────────────────────────────────────────────────────

    var userAgent = navigator.userAgent.toLowerCase();
    
    // Детектуємо смарт-ТВ
    var isSmartTV = /vidaa|web0s|tizen|smarttv|metrological|netcast/i.test(userAgent);
    
    // Детектуємо Android TV
    var isAndroidTV = /android.*tv|smarttv|googletv/i.test(userAgent);
    
    // Детектуємо чи потрібно переміщувати
    var shouldMove = isSmartTV || isAndroidTV;
    
    console.log('[Quality Position] Smart TV:', isSmartTV);
    console.log('[Quality Position] Android TV:', isAndroidTV);
    console.log('[Quality Position] Should move badges:', shouldMove);

    if (!shouldMove) {
        console.log('[Quality Position] Not a TV device, skipping');
        return;
    }

    // ─────────────────────────────────────────────────────────────────
    // ADD STYLES FOR TV DEVICES
    // ─────────────────────────────────────────────────────────────────

    var style = document.createElement('style');
    style.textContent = `
        /* Move badges to bottom-right on TV devices */
        .card .qb-unified-block {
            top: auto !important;
            bottom: 0.4em !important;
            left: auto !important;
            right: 0.4em !important;
            align-items: flex-end !important;
            flex-direction: column !important;
        }

        /* Ensure proper spacing from bottom-right corner */
        .card .quality-badge {
            margin-left: 0 !important;
        }

        /* Add transition for smooth animation */
        .card .qb-unified-block {
            transition: all 0.3s ease !important;
        }

        /* Mark as repositioned */
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

    // ─────────────────────────────────────────────────────────────────
    // MONITOR EXISTING AND NEW BADGES
    // ─────────────────────────────────────────────────────────────────

    function repositionBadges() {
        var badges = document.querySelectorAll('.card .qb-unified-block:not(.qb-repositioned)');
        
        badges.forEach(function(badge) {
            badge.classList.add('qb-repositioned');
            console.log('[Quality Position] Badge repositioned');
        });

        return badges.length;
    }

    // Initial repositioning
    var count = repositionBadges();
    console.log('[Quality Position] Found and repositioned', count, 'badges');

    // Use MutationObserver for new badges
    var observer = new MutationObserver(function(mutations) {
        mutations.forEach(function(mutation) {
            if (mutation.addedNodes.length) {
                var found = 0;
                mutation.addedNodes.forEach(function(node) {
                    if (node.nodeType === 1) {  // Element node
                        if (node.classList && node.classList.contains('qb-unified-block')) {
                            if (!node.classList.contains('qb-repositioned')) {
                                node.classList.add('qb-repositioned');
                                found++;
                            }
                        }
                        
                        var badges = node.querySelectorAll ? node.querySelectorAll('.qb-unified-block:not(.qb-repositioned)') : [];
                        badges.forEach(function(b) {
                            b.classList.add('qb-repositioned');
                            found++;
                        });
                    }
                });
                
                if (found > 0) {
                    console.log('[Quality Position] Repositioned', found, 'new badge(s)');
                }
            }
        });
    });

    observer.observe(document.body, {
        childList: true,
        subtree: true,
        attributes: false,
        characterData: false
    });

    console.log('[Quality Position] DOM observer started');

    // Periodic check for missed badges
    setInterval(function() {
        var count = repositionBadges();
        if (count > 0) {
            console.log('[Quality Position] Periodic check: repositioned', count, 'badge(s)');
        }
    }, 3000);

    console.log('[Quality Position] Plugin initialized successfully');

})();
