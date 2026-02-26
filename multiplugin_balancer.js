(function () {
'use strict';

if (!window.Lampa) return;

const VERSION = 'v4.6.3';

var sources = [
    { name: "BazaNetUa", url: "http://lampaua.mooo.com/online.js" },
    { name: "BanderaOnline", url: "https://lampame.github.io/main/BanderaOnline/BanderaOnline.js" },
    { name: "Online_mod", url: "https://nb557.github.io/plugins/online_mod.js" },
    { name: "Alpac Beta", url: "http://beta.l-vid.online/online.js" }
];

var tempState = {};
var hasChanges = false;
var viewMode = 'list'; // list | add | edit | confirmDelete
var editIndex = null;
var deleteIndex = null;
var wrapper;

// ================= CSS =================
function injectCSS() {
    if (document.getElementById('multi-style')) return;
    var style = document.createElement('style');
    style.id = 'multi-style';
    style.innerHTML = `
        .multi-container { padding:15px; }
        .multi-item { display:flex; justify-content:space-between; align-items:center; padding:10px; margin-bottom:8px; background:rgba(255,255,255,0.05); border-radius:8px; }
        .multi-left { width:40%; overflow:hidden; text-overflow:ellipsis; white-space:nowrap; font-size:14px; }
        .multi-right { width:60%; display:flex; gap:6px; }
        .multi-btn { flex:1; text-align:center; padding:8px 0; border-radius:6px; font-size:13px; cursor:pointer; color:#fff; }
        .enabled { background:#46b85a; }
        .disabled { background:#d24a4a; }
        .edit { background:#FF9800; }
        .delete { background:#f44336; }
        .add { background:#156DD1; margin-top:10px; }
        .apply { background:#156DD1; margin-top:12px; display:none; }
        .modal-input { width:100%; padding:10px; margin-bottom:12px; border-radius:6px; border:1px solid rgba(255,255,255,0.2); background:rgba(255,255,255,0.1); color:#fff; }
    `;
    document.head.appendChild(style);
}

// ================= STORAGE =================
function loadSources() {
    var saved = Lampa.Storage.get('multi_sources', null);
    if (saved) {
        try { sources = JSON.parse(saved); }
        catch(e){ console.log(e); }
    }
}

function saveSources() {
    Lampa.Storage.set('multi_sources', JSON.stringify(sources));
}

// ================= VIEW RENDER =================
function renderList() {
    viewMode = 'list';
    wrapper.empty();

    var container = $('<div class="multi-container"></div>');
    var applyBtn = $('<div class="multi-btn apply selector">Застосувати зміни</div>');
    var addBtn = $('<div class="multi-btn add selector">+ Додати джерело</div>');

    sources.forEach(function(src,index){

        var key = 'multi_' + src.name;
        var current = Lampa.Storage.get(key,false);
        tempState[key] = current;

        var item = $(`
            <div class="multi-item selector">
                <div class="multi-left">${src.name}</div>
                <div class="multi-right">
                    <div class="multi-btn selector ${current?'enabled':'disabled'}" data-key="${key}">
                        ${current?'Увімкнено':'Вимкнено'}
                    </div>
                    <div class="multi-btn edit selector" data-index="${index}">✏️</div>
                    <div class="multi-btn delete selector" data-index="${index}">🗑️</div>
                </div>
            </div>
        `);

        item.find('[data-key]').on('hover:enter', function(){
            var k = $(this).data('key');
            tempState[k] = !tempState[k];
            $(this)
                .toggleClass('enabled disabled')
                .text(tempState[k]?'Увімкнено':'Вимкнено');
            hasChanges = true;
            applyBtn.show();
        });

        item.find('.edit').on('hover:enter', function(){
            editIndex = $(this).data('index');
            renderEdit();
        });

        item.find('.delete').on('hover:enter', function(){
            deleteIndex = $(this).data('index');
            renderConfirmDelete();
        });

        container.append(item);
    });

    addBtn.on('hover:enter', function(){ renderAdd(); });
    applyBtn.on('hover:enter', function(){
        Object.keys(tempState).forEach(function(k){ Lampa.Storage.set(k,tempState[k]); });
        if(Lampa.Manifest && Lampa.Manifest.app_reload) Lampa.Manifest.app_reload();
        else location.reload();
    });

    container.append(addBtn);
    container.append(applyBtn);
    wrapper.append(container);

    setTimeout(function(){
        Lampa.Controller.collectionSet(wrapper);
        Lampa.Controller.collectionFocus(wrapper.find('.selector').first());
    },100);
}

function renderAdd(){
    viewMode='add';
    wrapper.empty();

    var html = $(`
        <div class="multi-container">
            <input class="modal-input add-name" placeholder="Назва">
            <input class="modal-input add-url" placeholder="URL">
            <div class="multi-btn enabled selector">Додати</div>
            <div class="multi-btn delete selector">Назад</div>
        </div>
    `);

    html.find('input').on('keydown', function(e){ e.stopPropagation(); });

    html.find('.enabled').on('hover:enter',function(){
        var name = html.find('.add-name').val().trim();
        var url = html.find('.add-url').val().trim();
        if(!name||!url){ Lampa.Noty.show('Заповніть всі поля'); return;}
        sources.push({name:name,url:url});
        saveSources();
        renderList();
    });

    html.find('.delete').on('hover:enter',renderList);
    wrapper.append(html);

    setTimeout(function(){
        Lampa.Controller.collectionSet(wrapper);
        Lampa.Controller.collectionFocus(wrapper.find('.selector').first());
    },100);
}

function renderEdit(){
    viewMode='edit';
    wrapper.empty();

    var src = sources[editIndex];

    var html = $(`
        <div class="multi-container">
            <input class="modal-input edit-name" value="${src.name}">
            <input class="modal-input edit-url" value="${src.url}">
            <div class="multi-btn enabled selector">Зберегти</div>
            <div class="multi-btn delete selector">Назад</div>
        </div>
    `);

    html.find('input').on('keydown', function(e){ e.stopPropagation(); });

    html.find('.enabled').on('hover:enter',function(){
        var name = html.find('.edit-name').val().trim();
        var url = html.find('.edit-url').val().trim();
        if(!name||!url){ Lampa.Noty.show('Заповніть всі поля'); return;}
        sources[editIndex]={name:name,url:url};
        saveSources();
        renderList();
    });

    html.find('.delete').on('hover:enter',renderList);
    wrapper.append(html);

    setTimeout(function(){
        Lampa.Controller.collectionSet(wrapper);
        Lampa.Controller.collectionFocus(wrapper.find('.selector').first());
    },100);
}

// ================= CONFIRM DELETE =================
function renderConfirmDelete(){
    viewMode='confirmDelete';
    wrapper.empty();

    var html = $(`
        <div class="multi-container">
            <div style="margin-bottom:12px;">Підтвердити видалення джерела?</div>
            <div class="multi-btn enabled selector">Підтвердити</div>
            <div class="multi-btn delete selector">Скасувати</div>
        </div>
    `);

    html.find('.enabled').on('hover:enter', function(){
        if(deleteIndex!==null){
            sources.splice(deleteIndex,1);
            saveSources();
            deleteIndex = null;
            renderList();
        }
    });

    html.find('.delete').on('hover:enter', function(){
        deleteIndex = null;
        renderList();
    });

    wrapper.append(html);

    setTimeout(function(){
        Lampa.Controller.collectionSet(wrapper);
        Lampa.Controller.collectionFocus(wrapper.find('.selector').first());
    },100);
}

// ================= MAIN MODAL =================
function openSourcesModal(){
    wrapper = $('<div></div>');
    renderList();

    // === Єдиний обробник закриття клавіш
    function handleBackspace(e){
        if(viewMode==='list') return; // дозволяємо закриття головного меню
        if($(e.target).is('input')) return; // не закривати, якщо фокус на інпуті
        renderList(); 
        e.preventDefault();
    }

    $(document).off('keydown.multi').on('keydown.multi', function(e){
        if(e.key==='Backspace' || e.key==='Delete') handleBackspace(e);
    });

    Lampa.Modal.open({
        title: `Мій мультиплагін ${VERSION} — Балансери`,
        html: wrapper,
        size:'medium',
        onBack:function(){
            if(viewMode!=='list'){ renderList(); return true; }
            Lampa.Modal.close();
            Lampa.Controller.toggle('settings_component');
            return true;
        }
    });
}

// ================= INIT =================
function loadActive(){
    sources.forEach(function(src){
        if(!Lampa.Storage.get('multi_'+src.name,false)) return;
        if(document.querySelector('script[src="'+src.url+'"]')) return;
        var s=document.createElement('script');
        s.src=src.url;
        document.body.appendChild(s);
    });
}

function init(){
    var S=Lampa.SettingsApi||Lampa.Settings;
    if(!S||!S.addComponent) return;

    S.addComponent({
        component:'multi_balancers',
        name:`Мій мультиплагін ${VERSION}`,
        icon:'<svg viewBox="0 0 24 24" fill="currentColor"><circle cx="12" cy="12" r="10"/></svg>'
    });

    S.addParam({
        component:'multi_balancers',
        param:{name:'multi_manage',type:'button'},
        field:{name:'Керування балансерами'},
        onChange:openSourcesModal
    });
}

function start(){
    injectCSS();
    loadSources();
    loadActive();
    init();

    // === показуємо сповіщення про завантаження плагіна
    if(Lampa.Noty) Lampa.Noty.show(`Мій мультиплагін ${VERSION} завантажено`);
}

if(Lampa.Listener){
    Lampa.Listener.follow('app',function(e){ if(e&&e.type==='ready') start(); });
}else start();

})();