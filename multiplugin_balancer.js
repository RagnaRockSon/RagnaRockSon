(function () {

    if (window.multi_balancer_ready) return;
    window.multi_balancer_ready = true;

    var sources = [
        { key: "baza", name: "BazaNetUa", url: "http://lampaua.mooo.com/online.js" },
        { key: "bandera", name: "BanderaOnline", url: "https://lampame.github.io/main/BanderaOnline/BanderaOnline.js" },
        { key: "online_mod", name: "Online_mod", url: "https://nb557.github.io/plugins/online_mod.js" },
        { key: "alpac", name: "Alpac Beta", url: "http://beta.l-vid.online/online.js" }
    ];

    function loadScript(url) {
        var script = document.createElement('script');
        script.src = url;
        script.async = true;
        document.body.appendChild(script);
    }

    function initActiveSources() {
        sources.forEach(function (src) {
            if (Lampa.Storage.get('multi_' + src.key, false)) {
                loadScript(src.url);
            }
        });
    }

    function openSourcesModal() {

        var html = $('<div class="multi-balancers"></div>');

        sources.forEach(function (src) {

            var storageKey = 'multi_' + src.key;
            var enabled = Lampa.Storage.get(storageKey, false);

            var item = $(`
                <div class="multi-item selector">
                    <div class="multi-name">${src.name}</div>
                    <div class="multi-toggle ${enabled ? 'enabled' : 'disabled'}">
                        <div class="multi-dot"></div>
                        <span>${enabled ? 'Увімкнено' : 'Вимкнено'}</span>
                    </div>
                </div>
            `);

            item.on('hover:enter', function () {

                enabled = !enabled;
                Lampa.Storage.set(storageKey, enabled);

                Lampa.Modal.open({
                    title: 'Перезапуск потрібен',
                    text: src.name + ': зміни застосуються після перезапуску Lampa.',
                    buttons: [
                        {
                            name: 'Перезапустити',
                            onSelect: function () {
                                location.reload();
                            }
                        },
                        {
                            name: 'Пізніше',
                            onSelect: function () {
                                Lampa.Modal.close();
                            }
                        }
                    ]
                });

            });

            html.append(item);
        });

        Lampa.Modal.open({
            title: 'Мульти Балансери',
            html: html,
            size: 'medium'
        });
    }

    function initSettings() {

        if (!Lampa.SettingsApi || !Lampa.SettingsApi.addComponent) return;

        Lampa.SettingsApi.addComponent({
            component: 'multi_balancer',
            name: 'Мульти Балансери',
            icon: '<svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><circle cx="6" cy="12" r="3"/><circle cx="18" cy="12" r="3"/></svg>'
        });

        Lampa.SettingsApi.addParam({
            component: 'multi_balancer',
            param: {
                name: 'open_sources',
                type: 'button'
            },
            field: {
                name: 'Керування джерелами'
            },
            onChange: function () {
                openSourcesModal();
            }
        });
    }

    function addStyles() {
        $('body').append(`
            <style>
            .multi-item {
                display:flex;
                justify-content:space-between;
                align-items:center;
                padding:1em;
                background:rgba(255,255,255,0.05);
                border-radius:.5em;
                margin-bottom:1em;
                transition:0.25s;
            }
            .multi-item.focus {
                background:rgba(255,255,255,0.15);
                transform:scale(1.03);
            }
            .multi-toggle {
                display:flex;
                align-items:center;
                gap:.6em;
                font-weight:bold;
                transition:0.3s;
            }
            .multi-dot {
                width:10px;
                height:10px;
                border-radius:50%;
                transition:0.3s;
            }
            .multi-toggle.enabled span { color:#46b85a; }
            .multi-toggle.enabled .multi-dot { background:#46b85a; }
            .multi-toggle.disabled span { color:#d24a4a; }
            .multi-toggle.disabled .multi-dot { background:#d24a4a; }
            </style>
        `);
    }

    function start() {
        addStyles();
        initSettings();
        initActiveSources();
    }

    if (window.Lampa) start();
    else document.addEventListener('lampa', start);

})();
