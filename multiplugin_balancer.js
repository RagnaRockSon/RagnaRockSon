(function () {
'use strict';

if (!window.Lampa) return;

const VERSION = 'v4.5.9';

var sources = [
    { name: "BazaNetUa", url: "http://lampaua.mooo.com/online.js" },
    { name: "BanderaOnline", url: "https://lampame.github.io/main/BanderaOnline/BanderaOnline.js" },
    { name: "Online_mod", url: "https://nb557.github.io/plugins/online_mod.js" },
    { name: "Alpac Beta", url: "http://beta.l-vid.online/online.js" }
];

var tempState = {};
var hasChanges = false;
var wrapper = null;

// === CSS ===
function injectCSS() {
    if (document.getElementById('multi-style')) return;
    var style = document.createElement('style');
    style.id = 'multi-style';
    style.innerHTML = `
        .multi-container { padding:15px; transition: all 0.3s ease; }
        .multi-item { display:flex; justify-content:space-between; align-items:center; padding:10px; margin-bottom:8px; background:rgba(255,255,255,0.05); border-radius:8px; transition: all 0.3s ease; }
        .multi-item.focus { background:rgba(255,255,255,0.1); transform:scale(1.02); }
        .multi-left { width:40%; overflow:hidden; text-overflow:ellipsis; white-space:nowrap; font-size:14px; line-height:18px; }
        .multi-right { width:60%; display:flex; justify-content:space-between; gap:5px; }
        .multi-btn { flex:1; text-align:center; padding:8px 0; border-radius:6px; font-size:13px; cursor:pointer; color:#fff; transition: all 0.3s ease; }
        .multi-toggle.enabled { background:#46b85a; }
        .multi-toggle.disabled { background:#d24a4a; }
        .multi-btn-edit { background:#FF9800; }
        .multi-btn-delete { background:#d24a4a; }
        .multi-btn-add { background:#156DD1; padding:10px 0; margin-top:10px; border-radius:8px; text-align:center; font-weight:bold; cursor:pointer; }
        .multi-apply { text-align:center; margin-top:12px; padding:12px; border-radius:8px; font-weight:bold; cursor:pointer; background:#156DD1; color:#fff; display:none; transition: all 0.3s ease; }
        .modal-input { background:rgba(255,255,255,0.1); border:1px solid rgba(255,255,255,0.2); color:#fff; padding:10px; border-radius:5px; margin-bottom:10px; width:100%; box-sizing:border-box; }
        .modal-input::placeholder { color:rgba(255,255,255,0.5); }
    `;
    document.head.appendChild(style);
}

// === Збереження та завантаження ===
function loadSourcesFromStorage() {
    var saved = Lampa.Storage.get('multi_sources', null);
    if (saved) {
        try { sources = JSON.parse(saved); } catch(e){ console.error(e); }
    }
}

function saveSourcesToStorage() {
    Lampa.Storage.set('multi_sources', JSON.stringify(sources));
}

// === Єдиний рендер модалки ===
function renderSources() {
    wrapper.empty();
    sources.forEach(function(src, index){
        var key = 'multi_' + src.name;
        var current = Lampa.Storage.get(key,false);
        tempState[key] = current;

        var item = $(`
            <div class="multi-item selector" data-index="${index}">
                <div class="multi-left">${src.name}</div>
                <div class="multi-right">
                    <div class="multi-btn multi-toggle selector ${current?'enabled':'disabled'}" data-key="${key}">${current?'Увімкнено':'Вимкнено'}</div>
                    <div class="multi-btn multi-btn-edit selector" data-index="${index}">✏️</div>
                    <div class="multi-btn multi-btn-delete selector" data-index="${index}">🗑️</div>
                </div>
            </div>
        `);

        // Toggle
        item.find('.multi-toggle').on('hover:enter', function(){
            var key = $(this).data('key');
            tempState[key] = !tempState[key];
            $(this).removeClass('enabled disabled').addClass(tempState[key]?'enabled':'disabled').text(tempState[key]?'Увімкнено':'Вимкнено');
            hasChanges = true;
            wrapper.find('.multi-apply').show();
        });

        // Edit
        item.find('.multi-btn-edit').on('hover:enter', function(){
            var idx = $(this).data('index');
            openEditModal(idx, renderSources);
        });

        // Delete
        item.find('.multi-btn-delete').on('hover:enter', function(){
            var idx = $(this).data('index');
            sources.splice(idx,1);
            saveSourcesToStorage();
            hasChanges = true;
            renderSources();
        });

        wrapper.append(item);
    });

    // Додати джерело
    var addBtn = $('<div class="multi-btn multi-btn-add selector">+ Додати джерело</div>');
    addBtn.on('hover:enter', function(){ openAddModal(renderSources); });
    wrapper.append(addBtn);

    // Застосувати зміни
    var applyBtn = $('<div class="multi-apply selector">Застосувати зміни</div>');
    applyBtn.on('hover:enter', function(){
        if(!hasChanges) return;
        Object.keys(tempState).forEach(k=>Lampa.Storage.set(k,tempState[k]));
        if(Lampa.Manifest && typeof Lampa.Manifest.app_reload==='function') Lampa.Manifest.app_reload();
        else location.reload();
    });
    wrapper.append(applyBtn);
}

// === Підмодалки ===
function openEditModal(index, callback){
    var src = sources[index];
    var form = $(`
        <div style="padding:20px;">
            <div style="margin-bottom:10px;">
                <label>Назва:</label>
                <input type="text" class="modal-input edit-name" value="${src.name}" placeholder="Введіть назву">
            </div>
            <div style="margin-bottom:10px;">
                <label>URL:</label>
                <input type="text" class="modal-input edit-url" value="${src.url}" placeholder="Введіть URL">
            </div>
            <div style="display:flex;gap:10px;">
                <div class="selector save" style="flex:1;padding:10px;background:#156DD1;text-align:center;border-radius:5px;cursor:pointer;">Зберегти</div>
                <div class="selector cancel" style="flex:1;padding:10px;background:#555;text-align:center;border-radius:5px;cursor:pointer;">Скасувати</div>
            </div>
        </div>
    `);

    form.find('.save').on('hover:enter', function(){
        var newName = form.find('.edit-name').val().trim();
        var newUrl = form.find('.edit-url').val().trim();
        if(!newName||!newUrl){ if(Lampa.Noty) Lampa.Noty.show('Заповніть всі поля'); return; }
        sources[index] = { name:newName, url:newUrl };
        saveSourcesToStorage();
        hasChanges=true;
        Lampa.Modal.close();
        if(callback) callback();
    });

    form.find('.cancel').on('hover:enter', ()=>Lampa.Modal.close());

    Lampa.Modal.update ? Lampa.Modal.update(form) : Lampa.Modal.open({title:'Редагування джерела', html:form, size:'medium'});
}

function openAddModal(callback){
    var form = $(`
        <div style="padding:20px;">
            <div style="margin-bottom:10px;">
                <label>Назва:</label>
                <input type="text" class="modal-input add-name" placeholder="Введіть назву джерела">
            </div>
            <div style="margin-bottom:10px;">
                <label>URL:</label>
                <input type="text" class="modal-input add-url" placeholder="Введіть URL до скрипту">
            </div>
            <div style="display:flex;gap:10px;">
                <div class="selector save" style="flex:1;padding:10px;background:#46b85a;text-align:center;border-radius:5px;cursor:pointer;">Додати</div>
                <div class="selector cancel" style="flex:1;padding:10px;background:#555;text-align:center;border-radius:5px;cursor:pointer;">Скасувати</div>
            </div>
        </div>
    `);

    form.find('.save').on('hover:enter', function(){
        var newName = form.find('.add-name').val().trim();
        var newUrl = form.find('.add-url').val().trim();
        if(!newName||!newUrl){ if(Lampa.Noty) Lampa.Noty.show('Заповніть всі поля'); return; }
        sources.push({name:newName,url:newUrl});
        saveSourcesToStorage();
        hasChanges=true;
        Lampa.Modal.close();
        if(callback) callback();
    });

    form.find('.cancel').on('hover:enter', ()=>Lampa.Modal.close());
    Lampa.Modal.update ? Lampa.Modal.update(form) : Lampa.Modal.open({title:'Додавання нового джерела', html:form, size:'medium'});
}

// === Головна модалка ===
function openSourcesModal(){
    tempState={};
    hasChanges=false;
    wrapper = $('<div class="multi-container"></div>');
    renderSources();

    Lampa.Modal.open({
        title:`Мій мультиплагін ${VERSION} — Балансери`,
        html:wrapper,
        size:'medium',
        onBack:function(){ Lampa.Controller.toggle('settings_component'); return true; }
    });

    setTimeout(()=>{ Lampa.Controller.collectionSet(wrapper); Lampa.Controller.collectionFocus(wrapper.find('.selector').first()); },200);
}

// === Завантаження активних джерел ===
function loadActiveSources(){
    sources.forEach(src=>{
        if(!Lampa.Storage.get('multi_'+src.name,false)) return;
        if(document.querySelector('script[src="'+src.url+'"]')) return;
        var script=document.createElement('script');
        script.src=src.url;
        script.async=false;
        document.body.appendChild(script);
    });
}

// === Налаштування плагіну ===
function initSettings(){
    var SettingsApi = Lampa.SettingsApi || Lampa.Settings;
    if(!SettingsApi || !SettingsApi.addComponent) return;

    SettingsApi.addComponent({
        component:'multi_balancers',
        name:`Мій мультиплагін ${VERSION}`,
        icon:'<svg viewBox="0 0 24 24" fill="currentColor"><circle cx="12" cy="12" r="10"/></svg>'
    });

    SettingsApi.addParam({
        component:'multi_balancers',
        param:{name:'multi_manage', type:'button'},
        field:{name:'Керування балансерами'},
        onChange: openSourcesModal
    });
}

// === Старт ===
function start(){
    injectCSS();
    loadSourcesFromStorage();
    loadActiveSources();
    initSettings();
    if(Lampa.Noty) Lampa.Noty.show(`Мій мультиплагін ${VERSION} завантажено`);
    console.log(`[MultiPlugin ${VERSION}] Loaded`);
}

if(Lampa.Listener){
    Lampa.Listener.follow('app', e=>{ if(e && e.type==='ready') start(); });
} else { start(); }

})();