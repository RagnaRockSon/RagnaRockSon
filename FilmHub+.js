(function(){
'use strict';

if(!window.Lampa) return;

const VERSION = 'v1.0.0';
var wrapper;
var pluginsSources = [
    { name: "BazaNetUa", url: "http://lampaua.mooo.com/online.js" },
    { name: "BanderaOnline", url: "https://lampame.github.io/main/BanderaOnline/BanderaOnline.js" },
    { name: "Online_mod", url: "https://nb557.github.io/plugins/online_mod.js" },
    { name: "Alpac Beta", url: "http://beta.l-vid.online/online.js" }
];

// ================= CSS =================
function injectCSS(){
    if(document.getElementById('filmhub-style')) return;
    var style = document.createElement('style');
    style.id='filmhub-style';
    style.innerHTML = `
        .filmhub-container{padding:15px;}
        .filmhub-item{padding:10px;margin-bottom:8px;background:rgba(255,255,255,0.05);border-radius:8px;cursor:pointer;color:#fff;}
        .filmhub-title{font-size:14px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;}
    `;
    document.head.appendChild(style);
}

// ================= LOAD PLUGINS =================
function loadPluginSources(){
    pluginsSources.forEach(src=>{
        if(document.querySelector('script[src="'+src.url+'"]')) return;
        var s = document.createElement('script');
        s.src = src.url;
        s.async = false;
        document.body.appendChild(s);
    });
}

// ================= RENDER =================
function renderFilmHub(){
    wrapper.empty();
    var container = $('<div class="filmhub-container"></div>');

    pluginsSources.forEach(src=>{
        var item = $(`<div class="filmhub-item selector"><div class="filmhub-title">${src.name}</div></div>`);
        item.on('hover:enter', function(){
            // тут можна підключати логіку підвантаження фільмів/серій із цього джерела
            if(Lampa.Noty) Lampa.Noty.show(`Вибрано джерело: ${src.name}`);
        });
        container.append(item);
    });

    wrapper.append(container);

    setTimeout(function(){
        Lampa.Controller.collectionSet(wrapper);
        Lampa.Controller.collectionFocus(wrapper.find('.selector').first());
    },100);
}

// ================= MAIN MODAL =================
function openFilmHubModal(){
    wrapper = $('<div></div>');
    renderFilmHub();

    Lampa.Modal.open({
        title:`FilmHub+ ${VERSION}`,
        html:wrapper,
        size:'medium',
        onBack:function(){
            Lampa.Modal.close();
            Lampa.Controller.toggle('settings_component');
            return true;
        }
    });
}

// ================= INIT =================
function init(){
    injectCSS();
    loadPluginSources();

    var S = Lampa.SettingsApi||Lampa.Settings;
    if(!S||!S.addComponent) return;

    S.addComponent({
        component:'filmhub_plus',
        name:`FilmHub+ ${VERSION}`,
        icon:'<svg viewBox="0 0 24 24" fill="currentColor"><circle cx="12" cy="12" r="10"/></svg>'
    });

    S.addParam({
        component:'filmhub_plus',
        param:{name:'filmhub_open',type:'button'},
        field:{name:'Відкрити FilmHub+'},
        onChange: openFilmHubModal
    });

    if(Lampa.Noty) Lampa.Noty.show(`FilmHub+ ${VERSION} завантажено`);
}

function start(){
    init();
}

if(Lampa.Listener){
    Lampa.Listener.follow('app', function(e){if(e&&e.type==='ready') start();});
}else start();

})();