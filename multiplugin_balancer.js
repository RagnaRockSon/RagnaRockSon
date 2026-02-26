(function () {
'use strict';

if (!window.Lampa) return;

const VERSION = 'v4.6.0';

var sources = [
    { name: "BazaNetUa", url: "http://lampaua.mooo.com/online.js" },
    { name: "BanderaOnline", url: "https://lampame.github.io/main/BanderaOnline/BanderaOnline.js" },
    { name: "Online_mod", url: "https://nb557.github.io/plugins/online_mod.js" },
    { name: "Alpac Beta", url: "http://beta.l-vid.online/online.js" }
];

var tempState = {};
var hasChanges = false;
var activeModal = null; // єдиний обробник модалок

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
        .multi-right { width:60%; display:flex; justify-content:flex-end; gap:5px; }
        .multi-btn { flex:1; text-align:center; padding:8px 0; border-radius:6px; font-size:13px; cursor:pointer; color:#fff; transition: all 0.3s ease; user-select:none; }
        .multi-toggle.enabled { background:#46b85a; }
        .multi-toggle.disabled { background:#d24a4a; }
        .multi-btn-edit { background:#156DD1; }
        .multi-btn-delete { background:#f44336; }
        .multi-btn-add { background:#156DD1; padding:10px 0; margin-top:10px; border-radius:8px; text-align:center; font-weight:bold; cursor:pointer; }
        .multi-apply { text-align:center; margin-top:12px; padding:12px; border-radius:8px; font-weight:bold; cursor:pointer; background:#156DD1; color:#fff; display:none; transition: all 0.3s ease; }
        .fade-out { opacity:0; transform:scale(0.95); transition: all 0.2s ease; }
        .fade-in { opacity:1; transform:scale(1); transition: all 0.3s ease; }
        .modal-input { background:rgba(255,255,255,0.1); border:1px solid rgba(255,255,255,0.2); color:#fff; padding:10px; border-radius:5px; margin-bottom:10px; width:100%; box-sizing:border-box; }
        .modal-input::placeholder { color:rgba(255,255,255,0.5); }
    `;
    document.head.appendChild(style);
}

// === Загальні функції ===
function updateTitle(modalTitle) {
    if (!modalTitle) return;
    var title = hasChanges
        ? `Мій мультиплагін ${VERSION} — Балансери ●`
        : `Мій мультиплагін ${VERSION} — Балансери`;
    modalTitle.text(title);
}

function closeActiveModal() {
    if (activeModal && activeModal.onClose) activeModal.onClose();
    activeModal = null;
    Lampa.Modal.close();
}

function saveSourcestoStorage() {
    Lampa.Storage.set('multi_sources', JSON.stringify(sources));
}

// === Підмодалки ===
function openEditModal(index, callback) {
    var src = sources[index];
    var formHtml = $(`
        <div style="padding:20px;">
            <div style="margin-bottom:15px;">
                <label>Назва:</label>
                <input type="text" class="modal-input edit-name" value="${src.name}" placeholder="Введіть назву">
            </div>
            <div style="margin-bottom:15px;">
                <label>URL:</label>
                <input type="text" class="modal-input edit-url" value="${src.url}" placeholder="Введіть URL">
            </div>
            <div style="display:flex; gap:10px;">
                <div class="selector save-btn" style="flex:1; padding:10px; background:#46b85a; text-align:center; border-radius:5px; cursor:pointer;">Зберегти</div>
                <div class="selector cancel-btn" style="flex:1; padding:10px; background:#555; text-align:center; border-radius:5px; cursor:pointer;">Скасувати</div>
            </div>
        </div>
    `);

    formHtml.find('.save-btn').on('hover:enter', function () {
        var newName = formHtml.find('.edit-name').val().trim();
        var newUrl = formHtml.find('.edit-url').val().trim();
        if (!newName || !newUrl) { Lampa.Noty.show('Заповніть всі поля'); return; }
        sources[index] = { name: newName, url: newUrl };
        saveSourcestoStorage();
        hasChanges = true;
        closeActiveModal();
        if (callback) callback();
    });

    formHtml.find('.cancel-btn').on('hover:enter', closeActiveModal);

    activeModal = { onClose: callback };
    Lampa.Modal.open({ title: 'Редагування джерела', html: formHtml, size: 'medium', onBack: closeActiveModal });
}

function openAddModal(callback) {
    var formHtml = $(`
        <div style="padding:20px;">
            <div style="margin-bottom:15px;">
                <label>Назва:</label>
                <input type="text" class="modal-input add-name" placeholder="Введіть назву джерела">
            </div>
            <div style="margin-bottom:15px;">
                <label>URL:</label>
                <input type="text" class="modal-input add-url" placeholder="Введіть URL до скрипту">
            </div>
            <div style="display:flex; gap:10px;">
                <div class="selector add-btn" style="flex:1; padding:10px; background:#46b85a; text-align:center; border-radius:5px; cursor:pointer;">Додати</div>
                <div class="selector cancel-btn" style="flex:1; padding:10px; background:#555; text-align:center; border-radius:5px; cursor:pointer;">Скасувати</div>
            </div>
        </div>
    `);

    formHtml.find('.add-btn').on('hover:enter', function () {
        var newName = formHtml.find('.add-name').val().trim();
        var newUrl = formHtml.find('.add-url').val().trim();
        if (!newName || !newUrl) { Lampa.Noty.show('Заповніть всі поля'); return; }
        sources.push({ name: newName, url: newUrl });
        saveSourcestoStorage();
        hasChanges = true;
        closeActiveModal();
        if (callback) callback();
    });

    formHtml.find('.cancel-btn').on('hover:enter', closeActiveModal);

    activeModal = { onClose: callback };
    Lampa.Modal.open({ title: 'Додавання нового джерела', html: formHtml, size: 'medium', onBack: closeActiveModal });
}

// === Підтвердження видалення ===
function confirmDelete(callback) {
    var wrapper = $('<div>Ця дія необоротна</div>');
    var btns = $(`
        <div style="display:flex; gap:10px; margin-top:10px;">
            <div class="selector" style="flex:1; background:#f44336; padding:10px; text-align:center; border-radius:5px; cursor:pointer;">Так</div>
            <div class="selector" style="flex:1; background:#555; padding:10px; text-align:center; border-radius:5px; cursor:pointer;">Ні</div>
        </div>
    `);
    wrapper.append(btns);

    btns.find('div').first().on('hover:enter', function () { closeActiveModal(); callback(); });
    btns.find('div').last().on('hover:enter', closeActiveModal);

    activeModal = {};
    Lampa.Modal.open({ title: 'Видалити джерело?', html: wrapper, size: 'small', onBack: closeActiveModal });
}

// === Головна модалка ===
function openSourcesModal() {
    tempState = {};
    hasChanges = false;

    var container = $('<div class="multi-container fade-in"></div>');
    var applyBtn = $('<div class="multi-apply selector">Застосувати зміни</div>');
    var addBtn = $('<div class="multi-btn multi-btn-add selector">+ Додати джерело</div>');

    function renderSources() {
        container.find('.multi-item').remove();

        sources.forEach(function (src, index) {
            var key = 'multi_' + src.name;
            var current = Lampa.Storage.get(key, false);
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

            // Увімкнення/вимкнення
            item.find('.multi-toggle').on('hover:enter', function () {
                var key = $(this).data('key');
                tempState[key] = !tempState[key];
                $(this).removeClass('enabled disabled').addClass(tempState[key] ? 'enabled' : 'disabled').text(tempState[key] ? 'Увімкнено' : 'Вимкнено');
                hasChanges = true;
                applyBtn.show();
                updateTitle($('.modal__title'));
            });

            // Редагування
            item.find('.multi-btn-edit').on('hover:enter', function () { openEditModal($(this).data('index'), renderSources); });

            // Видалення
            item.find('.multi-btn-delete').on('hover:enter', function () {
                var idx = $(this).data('index');
                confirmDelete(function () {
                    sources.splice(idx, 1);
                    saveSourcestoStorage();
                    hasChanges = true;
                    renderSources();
                    updateTitle($('.modal__title'));
                });
            });

            container.append(item);
        });

        container.append(addBtn);
        container.append(applyBtn);
    }

    renderSources();

    addBtn.on('hover:enter', function () { openAddModal(renderSources); });

    applyBtn.on('hover:enter', function () {
        if (!hasChanges) return;
        Object.keys(tempState).forEach(k => Lampa.Storage.set(k, tempState[k]));
        closeActiveModal();
        if (Lampa.Manifest && typeof Lampa.Manifest.app_reload === 'function') Lampa.Manifest.app_reload();
        else location.reload();
    });

    activeModal = { onClose: function() { Lampa.Controller.toggle('settings_component'); } };
    Lampa.Modal.open({ title: `Мій мультиплагін ${VERSION} — Балансери`, html: container, size: 'medium', onBack: closeActiveModal });

    setTimeout(function () {
        Lampa.Controller.collectionSet(container);
        Lampa.Controller.collectionFocus(container.find('.selector').first());
        updateTitle($('.modal__title'));
    }, 200);
}

// === Завантаження активних джерел ===
function loadActiveSources() {
    sources.forEach(function (src) {
        var enabled = Lampa.Storage.get('multi_' + src.name, false);
        if (!enabled) return;
        if (document.querySelector('script[src="' + src.url + '"]')) return;

        var script = document.createElement('script');
        script.src = src.url;
        script.async = false;
        document.body.appendChild(script);
    });
}

// === Ініціалізація ===
function initSettings() {
    var SettingsApi = Lampa.SettingsApi || Lampa.Settings;
    if (!SettingsApi || !SettingsApi.addComponent) return;

    SettingsApi.addComponent({
        component: 'multi_balancers',
        name: `Мій мультиплагін ${VERSION}`,
        icon: '<svg viewBox="0 0 24 24" fill="currentColor"><circle cx="12" cy="12" r="10"/></svg>'
    });

    SettingsApi.addParam({
        component: 'multi_balancers',
        param: { name: 'multi_manage', type: 'button' },
        field: { name: 'Керування балансерами' },
        onChange: openSourcesModal
    });
}

// === Старт ===
function start() {
    injectCSS();
    var saved = Lampa.Storage.get('multi_sources', null);
    if (saved) { try { sources = JSON.parse(saved); } catch(e){console.error(e);} }
    loadActiveSources();
    initSettings();
    if (Lampa.Noty) Lampa.Noty.show(`Мій мультиплагін ${VERSION} завантажено`);
    console.log(`[MultiPlugin ${VERSION}] Loaded`);
}

if (Lampa.Listener) {
    Lampa.Listener.follow('app', function(e){ if(e && e.type==='ready') start(); });
} else start();

})();