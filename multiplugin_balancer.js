(function () {  
'use strict';  
  
if (!window.Lampa) return;  
  
const VERSION = 'v4.5.8';  
  
var sources = [  
    { name: "BazaNetUa", url: "http://lampaua.mooo.com/online.js" },  
    { name: "BanderaOnline", url: "https://lampame.github.io/main/BanderaOnline/BanderaOnline.js" },  
    { name: "Online_mod", url: "https://nb557.github.io/plugins/online_mod.js" },  
    { name: "Alpac Beta", url: "http://beta.l-vid.online/online.js" }  
];  
  
var tempState = {};  
var hasChanges = false;  
var modalStack = []; // стек відкритих модалок  
  
function injectCSS() {  
    if (document.getElementById('multi-style')) return;  
    var style = document.createElement('style');  
    style.id = 'multi-style';  
    style.innerHTML = `  
        .multi-container { padding:15px; transition: all 0.3s ease; }  
        .multi-item { display:flex; justify-content:space-between; align-items:center; padding:10px; margin-bottom:8px; background:rgba(255,255,255,0.05); border-radius:8px; transition: all 0.3s ease; }  
        .multi-left { width:40%; overflow:hidden; text-overflow:ellipsis; white-space:nowrap; font-size:14px; line-height:18px; }  
        .multi-right { width:60%; display:flex; justify-content:space-between; gap:5px; }  
        .multi-btn { flex:1; text-align:center; padding:8px 0; border-radius:6px; font-size:13px; cursor:pointer; color:#fff; transition: all 0.3s ease; }  
        .multi-toggle.enabled { background:#46b85a; }  
        .multi-toggle.disabled { background:#d24a4a; }  
        .multi-btn-edit { background:#FF9800; }  
        .multi-btn-delete { background:#d24a4a; }  
        .multi-btn-add { background:#156DD1; padding:10px 0; margin-top:10px; border-radius:8px; text-align:center; font-weight:bold; }  
        .multi-apply { text-align:center; margin-top:12px; padding:12px; border-radius:8px; font-weight:bold; cursor:pointer; background:#156DD1; color:#fff; display:none; transition: all 0.3s ease; }  
        .modal-input { background:rgba(255,255,255,0.1); border:1px solid rgba(255,255,255,0.2); color:#fff; padding:10px; border-radius:5px; margin-bottom:10px; width:100%; box-sizing:border-box; }  
        .modal-input::placeholder { color:rgba(255,255,255,0.5); }  
    `;  
    document.head.appendChild(style);  
}  
  
function updateTitle(modalTitle) {  
    if (!modalTitle) return;  
    var title = hasChanges ? `Мій мультиплагін ${VERSION} — Балансери ●` : `Мій мультиплагін ${VERSION} — Балансери`;  
    modalTitle.text(title);  
}  
  
// === Єдиний обробник модалок ===  
function openModal(config) {  
    modalStack.push(config);  
    Lampa.Modal.open({  
        title: config.title,  
        html: config.html,  
        size: config.size || 'medium',  
        onBack: function () {  
            Lampa.Modal.close();  
            modalStack.pop();  
            if (modalStack.length > 0 && modalStack[modalStack.length-1].onReturn) {  
                modalStack[modalStack.length-1].onReturn();  
            }  
            return true;  
        }  
    });  
}  
  
function closeTopModal() {  
    if (modalStack.length) {  
        Lampa.Modal.close();  
        modalStack.pop();  
    }  
}  
  
function handleOutsideClick(e) {  
    if (!modalStack.length) return;  
    var topModal = $('.modal').last();  
    if (!$(e.target).closest(topModal).length) {  
        closeTopModal();  
        if (modalStack.length && modalStack[modalStack.length-1].onReturn) {  
            modalStack[modalStack.length-1].onReturn();  
        }  
    }  
}  
  
function attachOutsideClickHandler() {  
    $(document).off('mousedown.multi').on('mousedown.multi', handleOutsideClick);  
}  
  
function detachOutsideClickHandler() {  
    $(document).off('mousedown.multi');  
}  
  
function loadSourcesFromStorage() {  
    var saved = Lampa.Storage.get('multi_sources', null);  
    if (saved) {  
        try { sources = JSON.parse(saved); } catch(e){ console.error(e); }  
    }  
}  
function saveSourcestoStorage() { Lampa.Storage.set('multi_sources', JSON.stringify(sources)); }  
  
function openEditModal(index, callback, mainContainer) {  
    var src = sources[index];  
    var html = $(`  
        <div style="padding:20px;">  
            <div style="margin-bottom:15px;">  
                <label>Назва:</label><input type="text" class="modal-input edit-name" value="${src.name}">  
            </div>  
            <div style="margin-bottom:15px;">  
                <label>URL:</label><input type="text" class="modal-input edit-url" value="${src.url}">  
            </div>  
            <div style="display:flex; gap:10px;">  
                <div class="selector save" style="flex:1;padding:10px;background:#156DD1;text-align:center;border-radius:5px;cursor:pointer;">Зберегти</div>  
                <div class="selector cancel" style="flex:1;padding:10px;background:#555;text-align:center;border-radius:5px;cursor:pointer;">Скасувати</div>  
            </div>  
        </div>`);  
  
    html.find('.save').on('hover:enter', function(){  
        var n=$('.edit-name', html).val().trim();  
        var u=$('.edit-url', html).val().trim();  
        if(!n||!u){ if(Lampa.Noty) Lampa.Noty.show('Заповніть всі поля'); return; }  
        sources[index]={name:n,url:u};  
        saveSourcestoStorage();  
        hasChanges=true;  
        closeTopModal();  
        callback();  
    });  
  
    html.find('.cancel').on('hover:enter', ()=>{ closeTopModal(); callback(); });  
  
    openModal({title:'Редагування джерела',html:html,size:'medium',onReturn:()=>attachOutsideClickHandler()});  
}  
  
function openAddModal(callback, mainContainer){  
    var html=$(`<div style="padding:20px;">  
        <div style="margin-bottom:15px;"><label>Назва:</label><input type="text" class="modal-input add-name"></div>  
        <div style="margin-bottom:15px;"><label>URL:</label><input type="text" class="modal-input add-url"></div>  
        <div style="display:flex;gap:10px;">  
            <div class="selector add" style="flex:1;padding:10px;background:#46b85a;text-align:center;border-radius:5px;cursor:pointer;">Додати</div>  
            <div class="selector cancel" style="flex:1;padding:10px;background:#555;text-align:center;border-radius:5px;cursor:pointer;">Скасувати</div>  
        </div></div>`);  
  
    html.find('.add').on('hover:enter',()=>{  
        var n=$('.add-name', html).val().trim();  
        var u=$('.add-url', html).val().trim();  
        if(!n||!u){ if(Lampa.Noty) Lampa.Noty.show('Заповніть всі поля'); return; }  
        sources.push({name:n,url:u});  
        saveSourcestoStorage();  
        hasChanges=true;  
        closeTopModal();  
        callback();  
    });  
  
    html.find('.cancel').on('hover:enter',()=>{ closeTopModal(); callback(); });  
  
    openModal({title:'Додавання нового джерела',html:html,size:'medium',onReturn:()=>attachOutsideClickHandler()});  
}  
  
function openSourcesModal(){  
    tempState={};  
    hasChanges=false;  
    var container=$('<div class="multi-container"></div>');  
    var applyBtn=$('<div class="multi-apply selector">Застосувати зміни</div>');  
    var addBtn=$('<div class="multi-btn multi-btn-add selector">+ Додати джерело</div>');  
  
    function renderSources(){  
        container.find('.multi-item').remove();  
        sources.forEach(function(src,index){  
            var key='multi_'+src.name;  
            var current=Lampa.Storage.get(key,false);  
            tempState[key]=current;  
            var item=$(`<div class="multi-item selector" data-index="${index}">  
                <div class="multi-left">${src.name}</div>  
                <div class="multi-right">  
                    <div class="multi-btn multi-toggle selector ${current?'enabled':'disabled'}" data-key="${key}">${current?'Увімкнено':'Вимкнено'}</div>  
                    <div class="multi-btn multi-btn-edit selector" data-index="${index}">✏️</div>  
                    <div class="multi-btn multi-btn-delete selector" data-index="${index}">🗑️</div>  
                </div></div>`);  
  
            item.find('.multi-toggle').on('hover:enter',function(){  
                var k=$(this).data('key');  
                tempState[k]=!tempState[k];  
                $(this).removeClass('enabled disabled').addClass(tempState[k]?'enabled':'disabled').text(tempState[k]?'Увімкнено':'Вимкнено');  
                hasChanges=true; applyBtn.show(); updateTitle($('.modal__title'));  
            });  
  
            item.find('.multi-btn-edit').on('hover:enter',function(){ openEditModal($(this).data('index'),renderSources,container); });  
            item.find('.multi-btn-delete').on('hover:enter',function(){  
                sources.splice($(this).data('index'),1); saveSourcestoStorage(); hasChanges=true; renderSources(); updateTitle($('.modal__title'));  
            });  
            container.append(item);  
        });  
        container.append(addBtn); container.append(applyBtn);  
    }  
  
    renderSources();  
    addBtn.on('hover:enter',()=>openAddModal(renderSources,container));  
    applyBtn.on('hover:enter',()=>{ Object.keys(tempState).forEach(k=>Lampa.Storage.set(k,tempState[k])); if(Lampa.Manifest&&typeof Lampa.Manifest.app_reload==='function')Lampa.Manifest.app_reload(); else location.reload(); });  
  
    openModal({title:`Мій мультиплагін ${VERSION} — Балансери`,html:container,size:'medium',onReturn:()=>attachOutsideClickHandler()});  
    attachOutsideClickHandler();  
}  
  
function loadActiveSources(){  
    sources.forEach(function(src){  
        if(!Lampa.Storage.get('multi_'+src.name,false))return;  
        if(document.querySelector('script[src="'+src.url+'"]'))return;  
        var s=document.createElement('script'); s.src=src.url; s.async=false; document.body.appendChild(s);  
    });  
}  
  
function initSettings(){  
    var SettingsApi=Lampa.SettingsApi||Lampa.Settings;  
    if(!SettingsApi||!SettingsApi.addComponent)return;  
    SettingsApi.addComponent({component:'multi_balancers',name:`Мій мультиплагін ${VERSION}`,icon:'<svg viewBox="0 0 24 24" fill="currentColor"><circle cx="12" cy="12" r="10"/></svg>'});  
    SettingsApi.addParam({component:'multi_balancers',param:{name:'multi_manage',type:'button'},field:{name:'Керування балансерами'},onChange:openSourcesModal});  
}  
  
function start(){ injectCSS(); loadSourcesFromStorage(); loadActiveSources(); initSettings(); if(Lampa.Noty)Lampa.Noty.show(`Мій мультиплагін ${VERSION} завантажено`); console.log(`[MultiPlugin ${VERSION}] Loaded`);}  
  
if(Lampa.Listener){ Lampa.Listener.follow('app',e=>{if(e&&e.type==='ready')start();});} else start();  
  
})();