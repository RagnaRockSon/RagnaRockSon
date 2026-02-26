(function(){
'use strict';

if(!window.Lampa) return;

const VERSION = 'v1.0.0';

var sources = [
    { name: "BazaNetUa", url: "http://lampaua.mooo.com/online.js" },
    { name: "BanderaOnline", url: "https://lampame.github.io/main/BanderaOnline/BanderaOnline.js" },
    { name: "Online_mod", url: "https://nb557.github.io/plugins/online_mod.js" },
    { name: "Alpac Beta", url: "http://beta.l-vid.online/online.js" }
];

// ================= CSS =================
function injectCSS(){
    if(document.getElementById('multi-style')) return;
    var style = document.createElement('style');
    style.id = 'multi-style';
    style.innerHTML = `
        .multi-container{padding:15px;}
        .multi-item{padding:10px;margin-bottom:8px;background:rgba(255,255,255,0.05);border-radius:6px;display:flex;justify-content:space-between;align-items:center;}
        .multi-btn{padding:8px 10px;border-radius:6px;background:#156DD1;color:#fff;text-align:center;cursor:pointer;}
        .multi-btn:hover{background:#0f4d91;}
        .modal-title{font-size:16px;margin-bottom:10px;color:#fff;}
    `;
    document.head.appendChild(style);
}

// ================= ВІДКРИТТЯ МЕНЮ =================
function openBalancerModal(contentTitle, items, onSelect){
    var wrapper = $('<div class="multi-container"></div>');

    items.forEach(function(item,index){
        var row = $(`<div class="multi-item selector">${item.name}</div>`);
        row.on('hover:enter',function(){
            if(onSelect) onSelect(item);
        });
        wrapper.append(row);
    });

    Lampa.Modal.open({
        title: contentTitle,
        html: wrapper,
        size:'medium',
        onBack: function(){ Lampa.Modal.close(); return true; }
    });

    setTimeout(function(){
        Lampa.Controller.collectionSet(wrapper);
        Lampa.Controller.collectionFocus(wrapper.find('.selector').first());
    },100);
}

// ================= ПІДКЛЮЧЕННЯ ДЖЕРЕЛ =================
function loadActiveSources(callback){
    var loaded = 0;
    if(!sources.length){ if(callback) callback(); return; }

    sources.forEach(function(src){
        if(document.querySelector('script[src="'+src.url+'"]')){ loaded++; if(loaded===sources.length && callback) callback(); return; }
        var s=document.createElement('script');
        s.src=src.url;
        s.async=false;
        s.onload=function(){ loaded++; if(loaded===sources.length && callback) callback(); };
        document.body.appendChild(s);
    });
}

// ================= ДОБАВЛЕННЯ КНОПКИ В КАРТІ ФІЛЬМУ =================
function addMyBalancerButton(){
    if(!Lampa.Player) return;

    Lampa.Player.addButton({
        name: 'Мій балансер',
        icon: '🎬',
        onClick: function(content){
            // content — дані про фільм/серіал, які передає Player
            // отримуємо список джерел із інших плагінів
            loadActiveSources(function(){
                var availableSources = sources.map(s=>({ name: s.name, url: s.url }));
                openBalancerModal('Мій балансер', availableSources, function(selectedSource){
                    // Тут ми підключаємо обране джерело для перегляду фільму
                    // Наприклад, викликаємо функцію з цього плагіна, передаємо content.id або content.url
                    if(selectedSource && selectedSource.url){
                        if(window.Lampa && Lampa.Player && Lampa.Player.openExternalSource){
                            Lampa.Player.openExternalSource(selectedSource.url, content);
                        } else {
                            console.log('Вибрано джерело:', selectedSource.name, 'для контенту:', content.title);
                        }
                        Lampa.Modal.close();
                    }
                });
            });
        }
    });
}

// ================= INIT =================
function init(){
    injectCSS();
    loadActiveSources(function(){
        addMyBalancerButton();
    });
    if(Lampa.Noty) Lampa.Noty.show(`Мій мультибалансер ${VERSION} завантажено`);
}

// ================= СТАРТ =================
if(Lampa.Listener){
    Lampa.Listener.follow('app',function(e){ if(e && e.type==='ready') init(); });
} else init();

})();