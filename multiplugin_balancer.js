(function () {
'use strict';

if (!window.Lampa) return;

const VERSION = 'v4.5.4';

var sources = [
    { name: "BazaNetUa", url: "http://lampaua.mooo.com/online.js" },
    { name: "BanderaOnline", url: "https://lampame.github.io/main/BanderaOnline/BanderaOnline.js" },
    { name: "Online_mod", url: "https://nb557.github.io/plugins/online_mod.js" },
    { name: "Alpac Beta", url: "http://beta.l-vid.online/online.js" }
];

var tempState = {};
var hasChanges = false;
var outsideHandler = null;

// === CSS ===
function injectCSS() {
    if (document.getElementById('multi-style')) return;
    var style = document.createElement('style');
    style.id = 'multi-style';
    style.innerHTML = `
        .multi-container { padding:20px; transition: all 0.3s ease; }
        .multi-item { display:flex; justify-content:space-between; align-items:center; padding:12px; margin-bottom:8px; background:rgba(255,255,255,0.05); border-radius:10px; }
        .multi-left { width:40%; font-size:14px; overflow:hidden; text-overflow:ellipsis; white-space:nowrap; }
        .multi-right { width:60%; display:flex; gap:8px; justify-content:flex-end; }
        .multi-btn { flex:1; padding:8px 0; border-radius:8px; text-align:center; color:#fff; cursor:pointer; font-size:13px; user-select:none; transition: all 0.2s ease; }
        .multi-toggle.enabled { background:#46b85a; }
        .multi-toggle.disabled { background:#d24a4a; }
        .multi-edit { background:#156DD1; }
        .multi-delete { background:#FF9800; }
        .multi-apply { text-align:center; margin-top:12px; padding:12px; border-radius:10px; font-weight:bold; cursor:pointer; background:#156DD1; color:#fff; display:none; }
        .modal-input { background:rgba(255,255,255,0.1); border:1px solid rgba(255,255,255,0.2); color:#fff; padding:8px; border-radius:5px; margin-bottom:10px; width:100%; box-sizing:border-box; }
        .modal-input::placeholder { color:rgba(255,255,255,0.5); }
        .modal-buttons { display:flex; gap:10px; }
        .modal-buttons .selector { flex:1; padding:10px; border-radius:5px; text-align:center; cursor:pointer; color:#fff; user-select:none; }
        .modal-buttons .save { background:#46b85a; }
        .modal-buttons .cancel { background:#555; }
    `;
    document.head.appendChild(style);
}

// === Загальні функції ===
function updateTitle(modalTitle) {
    if (!modalTitle) return;
    var title = hasChanges ? `Мій мультиплагін ${VERSION} — Балансери ●` : `Мій мультиплагін ${VERSION} — Балансери`;
    modalTitle.text(title);
}

function enableOutsideClose(container, modal) {
    setTimeout(function () {
        outsideHandler = function (e) {
            if (!$(e.target).closest(container).length && !$(e.target).closest('.modal').length) {
                closeModal(modal);
            }
        };
        $('.modal').on('mousedown.multi', outsideHandler);
    }, 200);
}

function disableOutsideClose() {
    $('.modal').off('mousedown.multi');
    outsideHandler = null;
}

function closeModal(modal) {
    disableOutsideClose();
    if (modal && modal.onClose) modal.onClose();
    Lampa.Modal.close();
}

function saveSourcestoStorage() {
    Lampa.Storage.set('multi_sources', JSON.stringify(sources));
}

// === Підмодали ===
function openEditModal(index, callback) {
    var src = sources[index];
    var formHtml = $(`
        <div style="padding:20px;">
            <div style="margin-bottom:10px;">
                <label>Назва:</label>
                <input type="text" class="modal-input edit-name" value="${src.name}" placeholder="Введіть назву">
            </div>
            <div style="margin-bottom:10px;">
                <label>URL:</label>
                <input type="text" class="modal-input edit-url" value="${src.url}" placeholder="Введіть URL">
            </div>
            <div class="modal-buttons">
                <div class="selector save">Зберегти</div>
                <div class="selector cancel">Скасувати</div>
            </div>
        </div>
    `);

    formHtml.find('.save').on('hover:enter', function () {
        var newName = formHtml.find('.edit-name').val().trim();
        var newUrl = formHtml.find('.edit-url').val().trim();
        if (!newName || !newUrl) { if(Lampa.Noty) Lampa.Noty.show('Заповніть всі поля'); return; }
        sources[index] = { name: newName, url: newUrl };
        saveSourcestoStorage();
        hasChanges = true;
        Lampa.Modal.close();
        if (callback) callback();
    });

    formHtml.find('.cancel').on('hover:enter', function () { Lampa.Modal.close(); });

    Lampa.Modal.open({
        title: 'Редагування джерела',
        html: formHtml,
        size: 'medium',
        onBack: function () { Lampa.Modal.close(); return true; }
    });
}

function openAddModal(callback) {
    var formHtml = $(`
        <div style="padding:20px;">
            <div style="margin-bottom:10px;">
                <label>Назва:</label>
                <input type="text" class="modal-input add-name" placeholder="Введіть назву джерела">
            </div>
            <div style="margin-bottom:10px;">
                <label>URL:</label>
                <input type="text" class="modal-input add-url" placeholder="Введіть URL до скрипту">
            </div>
            <div class="modal-buttons">
                <div class="selector save">Додати</div>
                <div class="selector cancel">Скасувати</div>
            </div>
        </div>
    `);

    formHtml.find('.save').on('hover:enter', function () {
        var newName = formHtml.find('.add-name').val().trim();
        var newUrl = formHtml.find('.add-url').val().trim();
        if (!newName || !newUrl) { if(Lampa.Noty) Lampa.Noty.show('Заповніть всі поля'); return; }
        sources.push({ name: newName, url: newUrl });
        saveSourcestoStorage();
        hasChanges = true;
        Lampa.Modal.close();
        if (callback) callback();
    });

    formHtml.find('.cancel').on('hover:enter', function () { Lampa.Modal.close(); });

    Lampa.Modal.open({
        title: 'Додавання нового джерела',
        html: formHtml,
        size: 'medium',
        onBack: function () { Lampa.Modal.close(); return true; }
    });
}

// === Головний модал ===
function openSourcesModal() {
    tempState = {};
    hasChanges = false;

    var container = $('<div class="multi-container"></div>');
    var applyBtn = $('<div class="multi-apply selector">Застосувати зміни</div>');
    container.append(applyBtn);

    function renderSources() {
        container.find('.multi-item').remove();

        sources.forEach(function (src, index) {
            var key = 'multi_' + src.name;
            var current = Lampa.Storage.get(key, false);
            tempState[key] = current;

            var item = $(`
                <div class="multi-item selector">
                    <div class="multi-left">${src.name}</div>
                    <div class="multi-right">
                        <div class="multi-btn multi-toggle ${current ? 'enabled':'disabled'}">${current ? 'Увімкнено':'Вимкнено'}</div>
                        <div class="multi-btn multi-edit">✏️</div>
                        <div class="multi-btn multi-delete">🗑️</div>
                    </div>
                </div>
            `);

            // Toggle
            item.find('.multi-toggle').on('hover:enter', function () {
                tempState[key] = !tempState[key];
                $(this).removeClass('enabled disabled').addClass(tempState[key] ? 'enabled':'disabled')
                    .text(tempState[key] ? 'Увімкнено':'Вимкнено');
                hasChanges = true;
                applyBtn.show();
                updateTitle($('.modal__title'));
            });

            // Edit
            item.find('.multi-edit').on('hover:enter', function () { openEditModal(index, renderSources); });

            // Delete
            item.find('.multi-delete').on('hover:enter', function () {
                sources.splice(index, 1);
                saveSourcestoStorage();
                hasChanges = true;
                renderSources();
                updateTitle($('.modal__title'));
            });

            container.append(item);
        });

        container.append($('<div class="multi-btn multi-btn-add selector">+ Додати джерело</div>'));
        container.find('.multi-btn-add').on('hover:enter', function () { openAddModal(renderSources); });
    }

    renderSources();

    applyBtn.on('hover:enter', function () {
        if(!hasChanges) return;
        Object.keys(tempState).forEach(k => Lampa.Storage.set(k,tempState[k]));
        disableOutsideClose();
        if(Lampa.Manifest && typeof Lampa.Manifest.app_reload==='function') Lampa.Manifest.app_reload();
        else location.reload();
    });

    Lampa.Modal.open({
        title: `Мій мультиплагін ${VERSION} — Балансери`,
        html: container,
        size: 'medium',
        onBack: function () { closeModal({onClose:()=>Lampa.Controller.toggle('settings_component')}); return true; }
    });

    setTimeout(()=>{ 
        Lampa.Controller.collectionSet(container);
        Lampa.Controller.collectionFocus(container.find('.selector').first());
        enableOutsideClose(container, {onClose:()=>Lampa.Controller.toggle('settings_component')});
        updateTitle($('.modal__title'));
    }, 200);
}

// === Активні джерела ===
function loadActiveSources() {
    sources.forEach(function(src){
        if(!Lampa.Storage.get('multi_'+src.name,false)) return;
        if(document.querySelector('script[src="'+src.url+'"]')) return;
        var script=document.createElement('script');
        script.src=src.url;
        script.async=false;
        document.body.appendChild(script);
    });
}

// === Ініціалізація ===
function initSettings() {
    var SettingsApi=Lampa.SettingsApi||Lampa.Settings;
    if(!SettingsApi||!SettingsApi.addComponent) return;

    SettingsApi.addComponent({
        component:'multi_balancers',
        name:`Мій мультиплагін ${VERSION}`,
        icon:'<svg viewBox="0 0 24 24" fill="currentColor"><circle cx="12" cy="12" r="10"/></svg>'
    });

    SettingsApi.addParam({
        component:'multi_balancers',
        param:{name:'multi_manage',type:'button'},
        field:{name:'Керування балансерами'},
        onChange: openSourcesModal
    });
}

// === Старт ===
function start(){
    injectCSS();
    loadActiveSources();
    initSettings();
    if(Lampa.Noty) Lampa.Noty.show(`Мій мультиплагін ${VERSION} завантажено`);
    console.log(`[MultiPlugin ${VERSION}] Loaded`);
}

if(Lampa.Listener){
    Lampa.Listener.follow('app', e=>{if(e&&e.type==='ready') start();});
} else start();

})();