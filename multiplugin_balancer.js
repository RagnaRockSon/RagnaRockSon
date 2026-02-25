(function(){
    var pluginName = 'multi_plugin_buttons';
    var sources = [
        {name: "BazaNetUa", url: "http://lampaua.mooo.com/online.js"},
        {name: "BanderaOnline", url: "https://lampame.github.io/main/BanderaOnline/BanderaOnline.js"},
        {name: "Online_mod", url: "https://nb557.github.io/plugins/online_mod.js"},
        {name: "Alpac Beta", url: "http://beta.l-vid.online/online.js"}
    ];

    function loadScript(src, callback){
        var script = document.createElement('script');
        script.src = src.url;
        script.async = false;
        script.onload = callback || function(){};
        document.body.appendChild(script);
    }

    function enableSource(i){
        if(!sources[i]._active){
            sources[i]._active = true;
            Lampa.Storage.set(pluginName+'_'+i,true);
            loadScript(sources[i],function(){
                console.log('Loaded:', sources[i].name);
            });
        }
    }

    function disableSource(i){
        if(sources[i]._active){
            sources[i]._active = false;
            Lampa.Storage.set(pluginName+'_'+i,false);
            console.log('Disabled:', sources[i].name);
            // Для Bandera Online можна додатково відключати компонент, якщо він доданий
            if(sources[i].name === "BanderaOnline" && window.bandera_online){
                window.bandera_online = false;
            }
        }
    }

    function updateButton(i){
        var btn = $('.settings-component-item[data-component="'+pluginName+'"]').find('.settings-param').eq(i);
        if(btn.length){
            var enabled = !!sources[i]._active;
            btn.find('.settings-param__name').text(sources[i].name + ' [' + (enabled?'Увімкнено':'Вимкнено') + ']');
            btn.css({
                'background-color': enabled ? '#46b85a' : '#d24a4a',
                'transition':'all 0.3s ease'
            });
        }
    }

    function initSettings(){
        var SettingsApi = Lampa.SettingsApi || Lampa.Settings;
        if(!SettingsApi || !SettingsApi.addComponent) return;

        SettingsApi.addComponent({
            component: pluginName,
            name: 'Мультиплагін кнопки',
            icon: '<svg viewBox="0 0 28 28"><rect width="28" height="28" fill="currentColor"/></svg>'
        });

        sources.forEach(function(src,i){
            src._active = Lampa.Storage.get(pluginName+'_'+i,false);

            SettingsApi.addParam({
                component: pluginName,
                param: {name:'source_'+i,type:'button'},
                field: {name: src.name + ' [' + (src._active?'Увімкнено':'Вимкнено') + ']'},
                onChange: function(){
                    if(src._active) disableSource(i);
                    else enableSource(i);
                    updateButton(i);
                }
            });
        });
    }

    function startPlugin(){
        waitForLampa(function(){
            initSettings();
            // Завантажити активні джерела
            sources.forEach(function(src,i){
                if(src._active) enableSource(i);
                updateButton(i);
            });
        });
    }

    function waitForLampa(cb){
        if(typeof window.Lampa !== 'undefined' && window.Lampa.SettingsApi) cb();
        else setTimeout(function(){ waitForLampa(cb);},500);
    }

    startPlugin();

})();
