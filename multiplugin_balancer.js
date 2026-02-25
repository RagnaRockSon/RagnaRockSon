(function () {
    'use strict';

    if (!window.appready) {
        Lampa.Listener.follow('app', function (e) {
            if (e.type === 'ready') init();
        });
    } else {
        init();
    }

    function init() {

        var sources = [
            { name: "BazaNetUa", url: "http://lampaua.mooo.com/online.js" },
            { name: "BanderaOnline", url: "https://lampame.github.io/main/BanderaOnline/BanderaOnline.js" },
            { name: "Online_mod", url: "https://nb557.github.io/plugins/online_mod.js" },
            { name: "Alpac Beta", url: "http://beta.l-vid.online/online.js" }
        ];

        if (!Lampa.Storage.get('multiplugin_sources')) {
            Lampa.Storage.set('multiplugin_sources', {});
        }

        function getState(name) {
            var data = Lampa.Storage.get('multiplugin_sources') || {};
            return data[name] || false;
        }

        function setState(name, state) {
            var data = Lampa.Storage.get('multiplugin_sources') || {};
            data[name] = state;
            Lampa.Storage.set('multiplugin_sources', data);
        }

        function injectScript(url) {
            if (document.querySelector('script[src="' + url + '"]')) return;
            var script = document.createElement('script');
            script.src = url;
            script.async = true;
            document.body.appendChild(script);
        }

        function removeScript(url) {
            var scripts = document.querySelectorAll('script[src="' + url + '"]');
            scripts.forEach(function (s) {
                s.remove();
            });
        }

        function showRestartModal() {

            Lampa.Modal.open({
                title: 'Перезапуск Lampa',
                html: '<div style="padding:20px;font-size:18px;">Для застосування змін потрібно перезапустити Lampa</div>',
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
        }

        function openMenu() {

            var html = '<div class="multiplugin-menu">';

            sources.forEach(function (source) {

                var active = getState(source.name);

                html += `
                <div class="balancer-item">
                    <div class="balancer-left">
                        <div class="balancer-dot ${active ? 'active' : ''}"></div>
                        <div class="balancer-name">${source.name}</div>
                    </div>
                    <div class="balancer-btn ${active ? 'on' : 'off'}" data-name="${source.name}">
                        ${active ? 'Вимкнути' : 'Увімкнути'}
                    </div>
                </div>`;
            });

            html += '</div>';

            Lampa.Modal.open({
                title: 'Мультибалансер',
                html: html,
                onBack: function () {
                    Lampa.Modal.close();
                }
            });

            setTimeout(function () {

                document.querySelectorAll('.balancer-btn').forEach(function (btn) {

                    btn.addEventListener('click', function () {

                        var name = this.dataset.name;
                        var source = sources.find(function (s) { return s.name === name; });

                        var active = getState(name);

                        if (active) {
                            setState(name, false);
                            removeScript(source.url);
                        } else {
                            setState(name, true);
                            injectScript(source.url);
                        }

                        showRestartModal();
                    });
                });

            }, 300);
        }

        sources.forEach(function (source) {
            if (getState(source.name)) {
                injectScript(source.url);
            }
        });

        Lampa.SettingsApi.addParam({
            component: 'plugins',
            param: {
                name: 'multiplugin_balancer',
                type: 'button',
                title: 'Мультибалансер',
                description: 'Керування балансерами'
            },
            onChange: function () {
                openMenu();
            }
        });

        addStyles();
    }

    function addStyles() {

        var style = document.createElement('style');

        style.innerHTML = `
        .balancer-item{
            display:flex;
            justify-content:space-between;
            align-items:center;
            padding:15px 20px;
            margin-bottom:12px;
            background:#1c1c1c;
            border-radius:14px;
            transition:0.3s;
        }

        .balancer-item:hover{
            background:#262626;
        }

        .balancer-left{
            display:flex;
            align-items:center;
        }

        .balancer-name{
            font-size:18px;
        }

        .balancer-dot{
            width:12px;
            height:12px;
            border-radius:50%;
            margin-right:10px;
            background:#666;
            transition:0.3s;
        }

        .balancer-dot.active{
            background:#00ff88;
            box-shadow:0 0 10px #00ff88;
        }

        .balancer-btn{
            padding:8px 18px;
            border-radius:20px;
            font-weight:bold;
            cursor:pointer;
            transition:0.3s;
        }

        .balancer-btn.on{
            background:#ff4444;
            color:#fff;
        }

        .balancer-btn.off{
            background:#00aa55;
            color:#fff;
        }

        .balancer-btn:hover{
            transform:scale(1.05);
        }
        `;

        document.head.appendChild(style);
    }

})();
