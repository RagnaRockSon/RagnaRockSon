(function () {
'use strict';

if (!window.Lampa) return;

const VERSION = 'v4.4';

var sources = [
    { name: "BazaNetUa", url: "http://lampaua.mooo.com/online.js" },
    { name: "BanderaOnline", url: "https://lampame.github.io/main/BanderaOnline/BanderaOnline.js" },
    { name: "Online_mod", url: "https://nb557.github.io/plugins/online_mod.js" },
    { name: "Alpac Beta", url: "http://beta.l-vid.online/online.js" }
];

var tempState = {};
var hasChanges = false;
var outsideHandler = null;

function injectCSS() {
    if (document.getElementById('multi-style')) return;

    var style = document.createElement('style');
    style.id = 'multi-style';
    style.innerHTML = `
        .multi-container { padding:20px; transition: all 0.3s ease; }
        .multi-item {
            display:flex;
            justify-content:space-between;
            align-items:center;
            padding:15px 10px;
            margin-bottom:10px;
            background:rgba(255,255,255,0.05);
            border-radius:10px;
            transition: all 0.3s ease;
            font-size:16px;
        }
        .multi-item.focus { background:rgba(255,255,255,0.1); transform:scale(1.02); }
        .multi-name { flex:1; }
        .multi-actions { display:flex; gap:8px; align-items:center; }
        .multi-toggle, .multi-btn {
            padding:10px 18px;
            border-radius:20px;
            text-align:center;
            cursor:pointer;
            font-size:14px;
            min-width:100px;
            user-select:none;
        }
        .multi-toggle.enabled { background:#46b85a; color:#fff; }
        .multi-toggle.disabled { background:#d24a4a; color:#fff; }
        .multi-btn-edit { background:#FF9800; color:#fff; }
        .multi-btn-delete { background:#d24a4a; color:#fff; }
        .multi-btn-add { background:#46b85a; text-align:center; padding:15px; margin-bottom:10px; color:#fff; }
        .multi-apply { text-align:center; margin-top:20px; padding:15px; border-radius:10px; font-weight:bold; cursor:pointer; background:#156DD1; color:#fff; display:none; transition: all 0.3s ease; }
        .modal-input { background:rgba(255,255,255,0.1); border:1px solid rgba(255,255,255,0.2); color:#fff; padding:10px; border-radius:5px; margin-bottom:10px; width:100%; box-sizing:border-box; }
        .modal-input::placeholder { color:rgba(255,255,255,0.5); }
    `;
    document.head.appendChild(style);
}

function updateTitle(modalTitle) {
    if (!modalTitle) return;
    var title = hasChanges
        ? `Мій мультиплагін ${VERSION} — Балансери ●`
        : `Мій мультиплагін ${VERSION} — Балансери`;
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

function loadSourcesFromStorage() {
    var saved = Lampa.Storage.get('multi_sources', null);
    if (saved) {
        try {
            sources = JSON.parse(saved);
        } catch (e) {
            console.error('[MultiPlugin] Error loading sources:', e);
        }
    }
}

function saveSourcesToStorage() {
    Lampa.Storage.set('multi_sources', JSON.stringify(sources));
}

function openEditModal(index, callback) {
    var src = sources[index];
    var formHtml = $(`
        <div style="padding:20px;">
            <div style="margin-bottom:15px;">
                <label style="display:block; margin-bottom:5px;">Назва:</label>
                <input type="text" class="modal-input edit-name" value="${src.name}" placeholder="Введіть назву">
            </div>
            <div style="margin-bottom:15px;">
                <label style="display:block; margin-bottom:5px;">URL:</label>
                <input type="text" class="modal-input edit-url" value="${src.url}" placeholder="Введіть URL">
            </div>
            <div style="display:flex; gap:10px;">
                <div class="selector" style="flex:1; padding:10px; background:#156DD1; text-align:center; border-radius:5px; cursor:pointer;">Зберегти</div>
                <div class="selector" style="flex:1; padding:10px; background:#555; text-align:center; border-radius:5px; cursor:pointer;">Скасувати</div>
            </div>
        </div>
    `);

    var saveBtn = formHtml.find('div').eq(2).find('.selector').first();
    var cancelBtn = formHtml.find('div').eq(2).find('.selector').last();

    saveBtn.on('hover:enter', function () {
        var newName = formHtml.find('.edit-name').val().trim();
        var newUrl = formHtml.find('.edit-url').val().trim();

        if (!newName || !newUrl) {
            if (Lampa.Noty) Lampa.Noty.show('Заповніть всі поля');
            return;
        }

        sources[index] = { name: newName, url: newUrl };
        saveSourcesToStorage();
        hasChanges = true;
        Lampa.Modal.close();
        if (callback) callback();
    });

    cancelBtn.on('hover:enter', function () {
        Lampa.Modal.close();
    });

    Lampa.Modal.open({
        title: 'Редагування джерела',
        html: formHtml,
        size: 'medium',
        onBack: function () {
            Lampa.Modal.close();
            return true;
        }
    });
}

function openAddModal(callback) {
    var formHtml = $(`
        <div style="padding:20px;">
            <div style="margin-bottom:15px;">
                <label style="display:block; margin-bottom:5px;">Назва:</label>
                <input type="text" class="modal-input add-name" placeholder="Введіть назву джерела">
            </div>
            <div style="margin-bottom:15px;">
                <label style="display:block; margin-bottom:5px;">URL:</label>
                <input type="text" class="modal-input add-url" placeholder="Введіть URL до скрипту">
            </div>
            <div style="display:flex; gap:10px;">
                <div class="selector" style="flex:1; padding:10px; background:#46b85a; text-align:center; border-radius:5px; cursor:pointer;">Додати</div>
                <div class="selector" style="flex:1; padding:10px; background:#555; text-align:center; border-radius:5px; cursor:pointer;">Скасувати</div>
            </div>
        </div>
    `);

    var addBtn = formHtml.find('div').eq(2).find('.selector').first();
    var cancelBtn = formHtml.find('div').eq(2).find('.selector').last();

    addBtn.on('hover:enter', function () {
        var newName = formHtml.find('.add-name').val().trim();
        var newUrl = formHtml.find('.add-url').val().trim();

        if (!newName || !newUrl) {
            if (Lampa.Noty) Lampa.Noty.show('Заповніть всі поля');
            return;
        }

        sources.push({ name: newName, url: newUrl });
        saveSourcesToStorage();
        hasChanges = true;
        Lampa.Modal.close();
        if (callback) callback();
    });

    cancelBtn.on('hover:enter', function () {
        Lampa.Modal.close();
    });

    Lampa.Modal.open({
        title: 'Додавання нового джерела',
        html: formHtml,
        size: 'medium',
        onBack: function () {
            Lampa.Modal.close();
            return true;
        }
    });
}

function openSourcesModal() {
    tempState = {};
    hasChanges = false;

    var container = $('<div class="multi-container"></div>');
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
                    <div class="multi-name"><strong>${src.name}</strong></div>
                    <div class="multi-actions">
                        <div class="multi-toggle ${current ? 'enabled' : 'disabled'}" data-key="${key}">
                            ${current ? 'Увімкнено' : 'Вимкнено'}
                        </div>
                        <div class="multi-btn multi-btn-edit selector" data-index="${index}">✏️</div>
                        <div class="multi-btn multi-btn-delete selector" data-index="${index}">🗑️</div>
                    </div>
                </div>
            `);

            // Toggle увімкнення/вимкнення
            item.find('.multi-toggle').on('hover:enter', function () {
                var k = $(this).data('key');
                tempState[k] = !tempState[k];
                $(this)
                    .removeClass('enabled disabled')
                    .addClass(tempState[k] ? 'enabled' : 'disabled')
                    .text(tempState[k] ? 'Увімкнено' : 'Вимкнено');
                hasChanges = true;
                applyBtn.show();
                updateTitle($('.modal__title'));
            });

            item.find('.multi-btn-edit').on('hover:enter', function () {
                openEditModal($(this).data('index'), renderSources);
            });

            item.find('.multi-btn-delete').on('hover:enter', function () {
                var idx = $(this).data('index');
                sources.splice(idx, 1);
                saveSourcesToStorage();
                hasChanges = true;
                renderSources();
                updateTitle($('.modal__title'));
            });

            container.append(item);
        });

        container.append(addBtn);
        container.append(applyBtn);
    }

    renderSources();

    addBtn.on('hover:enter', function () {
        openAddModal(renderSources);
    });

    applyBtn.on('hover:enter', function () {
        if (!hasChanges) return;
        Object.keys(tempState).forEach(function (k) {
            Lampa.Storage.set(k, tempState[k]);
        });
        disableOutsideClose();
        if (Lampa.Manifest && typeof Lampa.Manifest.app_reload === 'function') {
            Lampa.Manifest.app_reload();
        } else {
            location.reload();
        }
    });

    Lampa.Modal.open({
        title: `Мій мультиплагін ${VERSION} — Балансери`,
        html: container,
        size: 'medium',
        onBack: function () {
            closeModal({ onClose: function () { Lampa.Controller.toggle('settings_component'); } });
            return true;
        }
    });

    setTimeout(function () {
        Lampa.Controller.collectionSet(container);
        Lampa.Controller.collectionFocus(container.find('.selector').first());
        enableOutsideClose(container, { onClose: function () { Lampa.Controller.toggle('settings_component'); } });
        updateTitle($('.modal__title'));
    }, 200);
}

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

function start() {
    injectCSS();
    loadSourcesFromStorage();
    loadActiveSources();
    initSettings();

    if (Lampa.Noty) {
        Lampa.Noty.show(`Мій мультиплагін ${VERSION} завантажено`);
    }

    console.log(`[MultiPlugin ${VERSION}] Loaded`);
}

if (Lampa.Listener) {
    Lampa.Listener.follow('app', function (e) {
        if (e && e.type === 'ready') start();
    });
} else {
    start();
}

})();