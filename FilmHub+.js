(function(){
'use strict';

if(!window.Lampa) return;

const VERSION = 'v1.0';

var wrapper;
var sources = [
    { name: "BazaNetUa", url: "http://lampaua.mooo.com/online.js" },
    { name: "BanderaOnline", url: "https://lampame.github.io/main/BanderaOnline/BanderaOnline.js" },
    { name: "Online_mod", url: "https://nb557.github.io/plugins/online_mod.js" }
];

// ================= CSS =================
function injectCSS(){
    if(document.getElementById('filmhub-style')) return;
    var style = document.createElement('style');
    style.id = 'filmhub-style';
    style.innerHTML = `
        .filmhub-container{padding:15px;}
        .filmhub-item{padding:10px;margin-bottom:8px;background:rgba(255,255,255,0.05);border-radius:8px;cursor:pointer;}
        .filmhub-item:hover{background:rgba(255,255,255,0.1);}
    `;
    document.head.appendChild(style);
}

// ================= Storage =================
function loadActiveSources(){
    sources.forEach(function(src){
        var enabled = Lampa.Storage.get('filmhub_'+src.name,false);
        if(!enabled) return;
        if(document.querySelector('script[src="'+src.url+'"]')) return;
        var s=document.createElement('script');
        s.src=src.url;
        document.body.appendChild(s);
    });
}

// ================= View =================
function renderModal(movie){
    wrapper = $('<div class="filmhub-container"></div>');

    sources.forEach(function(src,index){
        var item = $(`<div class="filmhub-item">${src.name}</div>`);
        item.on('hover:enter', function(){
            if(Lampa.Noty) Lampa.Noty.show(`Вибране джерело: ${src.name}`);
            // Тут можна викликати методи плагіну джерела для отримання серій/посилань
        });
        wrapper.append(item);
    });

    Lampa.Modal.open({
        title:`FilmHub+ — ${movie.title||'Фільми/Серіали'}`,
        html: wrapper,
        size:'medium',
        onBack:function(){
            Lampa.Modal.close();
            return true;
        }
    });
}

// ================= Приховування інших плагінів =================
function hideOtherPlugins(){
    if(!Lampa.SettingsApi || !Lampa.SettingsApi.components) return;

    Object.keys(Lampa.SettingsApi.components).forEach(c=>{
        if(c!=='filmhub_plus'){
            var comp = Lampa.SettingsApi.components[c];
            if(comp && comp.field && comp.field[0]){
                comp.field[0].hidden = true;
            }
        }
    });
}

// ================= Додавання кнопки в картку фільму =================
function addMovieButton(){
    if(!Lampa.Card || !Lampa.Card.addButton) return;

    Lampa.Card.addButton('filmhub_plus', {
        name:'FilmHub+',
        icon:'<svg viewBox="0 0 24 24" fill="currentColor"><circle cx="12" cy="12" r="10"/></svg>',
        onClick:function(card){
            renderModal(card.movie||{title:'Фільм/Серіал'});
        }
    });
}

// ================= Ініціалізація =================
function init(){
    injectCSS();
    hideOtherPlugins();
    addMovieButton();
    loadActiveSources();

    if(Lampa.Noty) Lampa.Noty.show(`FilmHub+ ${VERSION} завантажено`);
}

// ================= Старт =================
if(Lampa.Listener){
    Lampa.Listener.follow('app',function(e){
        if(e && e.type==='ready') init();
    });
}else init();

})();