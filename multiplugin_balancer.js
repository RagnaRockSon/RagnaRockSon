(function () {
    'use strict';

    var sources = [
        { name: "BazaNetUa", url: "http://lampaua.mooo.com/online.js" },
        { name: "BanderaOnline", url: "https://lampame.github.io/main/BanderaOnline/BanderaOnline.js" },
        { name: "Online_mod", url: "https://nb557.github.io/plugins/online_mod.js" },
        { name: "Alpac Beta", url: "http://beta.l-vid.online/online.js" }
    ];

    function startPlugin() {
        if (!window.Lampa) {
            setTimeout(startPlugin, 500);
            return;
        }

        Lampa.SettingsApi.addComponent({
            component: 'multi_balancers',
            name: 'Мультиплагін балансерів',
            icon: '<svg viewBox="0 0 28 28"><rect width="28" height="28" fill="#156DD1"/></svg>'
        });

        sources.forEach(function (src) {

            var storageKey = 'multi_' + src.name;
            var enabled = Lampa.Storage.get(storageKey, false);

            Lampa.SettingsApi.addParam({
                component: 'multi_balancers',
                param: {
                    name: src.name,
                    type: 'button'
                },
                field: {
                    name: src.name
                },
                onRender: function (item) {

                    var wrapper = item.find('.settings-param__name');

                    wrapper.css({
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        width: '100%',
                        transition: 'all 0.3s ease'
                    });

                    var statusDot = $('<div></div>').css({
                        width: '10px',
                        height: '10px',
                        borderRadius: '50%',
                        marginRight: '10px',
                        transition: '0.3s'
                    });

                    var toggle = $('<div></div>').css({
                        width: '50px',
                        height: '22px',
                        borderRadius: '20px',
                        position: 'relative',
                        transition: '0.3s',
                        cursor: 'pointer'
                    });

                    var knob = $('<div></div>').css({
                        width: '18px',
                        height: '18px',
                        borderRadius: '50%',
                        position: 'absolute',
                        top: '2px',
                        transition: '0.3s'
                    });

                    toggle.append(knob);

                    var left = $('<div></div>').css({
                        display: 'flex',
                        alignItems: 'center'
                    });

                    var nameText = $('<div>' + src.name + '</div>');

                    left.append(statusDot);
                    left.append(nameText);

                    wrapper.html('');
                    wrapper.append(left);
                    wrapper.append(toggle);

                    function updateUI() {
                        if (enabled) {
                            statusDot.css({ background: '#46b85a' });
                            toggle.css({ background: '#46b85a' });
                            knob.css({ left: '28px', background: '#fff' });
                        } else {
                            statusDot.css({ background: '#d24a4a' });
                            toggle.css({ background: '#444' });
                            knob.css({ left: '2px', background: '#ccc' });
                        }
                    }

                    updateUI();

                    item.on('hover:enter', function () {

                        enabled = !enabled;
                        Lampa.Storage.set(storageKey, enabled);

                        if (enabled) {
                            var script = document.createElement('script');
                            script.src = src.url;
                            script.async = false;
                            script.setAttribute('data-balancer', src.name);
                            document.body.appendChild(script);
                            Lampa.Noty.show(src.name + ' підключено');
                        } else {
                            $('script[data-balancer="' + src.name + '"]').remove();
                            Lampa.Noty.show(src.name + ' вимкнено');
                        }

                        updateUI();
                    });

                }
            });

            // автопідключення при запуску
            if (enabled) {
                var script = document.createElement('script');
                script.src = src.url;
                script.async = false;
                script.setAttribute('data-balancer', src.name);
                document.body.appendChild(script);
            }

        });

        Lampa.Noty.show('Мультиплагін активний');
    }

    startPlugin();

})();
