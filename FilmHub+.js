(function(){
'use strict';

if(!window.Lampa) return;

const VERSION = 'v1.0.1';
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
        .filmhub-button{padding:8px 10px;border-radius:6px;background:#156DD1;color:#fff;cursor:pointer;margin-top:5px;display:inline-block;}
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

// ================= HIDE OTHER PLUGINS =================
function hideOtherPlugins(){
    if(!Lampa.SettingsApi || !Lampa.SettingsApi.components) return;
    Object.keys(Lampa.SettingsApi.components).forEach(c=>{
        if(c!=='filmhub_plus'){
            Lampa.SettingsApi.components[c].hidden = true;
        }
    });
}

// ================= ADD BUTTON TO MOVIE CARD =================
function addFilmHubButton(card){
    if(!card || card.find('.filmhub-button').length) return;
    var btn = $('<div class="filmhub-button selector">Відкрити FilmHub+</div>');
    btn.on('hover:enter', openFilmHubModal);
    card.append(btn);
}

// ================= INIT =================
function init(){
    injectCSS();
    loadPluginSources();
    hideOtherPlugins();

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

    // Кнопка в картці фільму/серіалу
    if(Lampa.Listener){
        Lampa.Listener.follow('card', function(card){
            addFilmHubButton(card);
        });
    }

    if(Lampa.Noty) Lampa.Noty.show(`FilmHub+ ${VERSION} завантажено`);
}

function start(){
    init();
}

if(Lampa.Listener){
    Lampa.Listener.follow('app', function(e){if(e&&e.type==='ready') start();});
}else start();

})();