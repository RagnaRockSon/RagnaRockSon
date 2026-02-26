(function () {
    'use strict';

    if (!window.Lampa) return;

    const VERSION = 'v4.3.1';

    var sources = [
        { name: "BazaNetUa", url: "http://lampaua.mooo.com/online.js" },
        { name: "BanderaOnline", url: "https://lampame.github.io/main/BanderaOnline/BanderaOnline.js" },
        { name: "Online_mod", url: "https://nb557.github.io/plugins/online_mod.js" },
        { name: "Alpac Beta", url: "http://beta.l-vid.online/online.js" }
    ];

    var modalStack = [];
    var tempState = {};
    var hasChanges = false;

    function injectCSS() {
        if (document.getElementById('multi-style')) return;
        var style = document.createElement('style');
        style.id = 'multi-style';
        style.innerHTML = `
            .multi-container { padding:20px; transition: all 0.3s ease; }
            .multi-item { display:flex; justify-content:space-between; align-items:center; padding:15px; margin-bottom:10px; background:rgba(255,255,255,0.05); border-radius:10px; transition: all 0.3s ease; }
            .multi-item.focus { background:rgba(255,255,255,0.1); transform:scale(1.02); }
            .multi-toggle { padding:6px 14px; border-radius:20px; min-width:120px; text-align:center; color:#fff; cursor:pointer; transition: all 0.3s ease; }
            .multi-toggle.enabled { background:#46b85a; }
            .multi-toggle.disabled { background:#d24a4a; }
            .multi-apply { text-align:center; margin-top:20px; padding:15px; border-radius:10px; font-weight:bold; cursor:pointer; background:#156DD1; color:#fff; display:none; transition: all 0.3s ease; }
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

    function pushModal(modalObj) {
        modalStack.push(modalObj);
    }

    function popModal() {
        modalStack.pop();
        return modalStack[modalStack.length - 1] || null;
    }

    function enableOutsideClose(container) {
        setTimeout(function () {
            $(document).on('mousedown.multi', function (e) {
                var topModal = modalStack[modalStack.length - 1];
                if (!topModal) return;
                if (!$(e.target).closest(container).length) {
                    if (topModal.onClose) topModal.onClose();
                    Lampa.Modal.close();
                    popModal();
                }
            });
        }, 100);
    }

    function disableOutsideClose() {
        $(document).off('mousedown.multi');
    }

    function openEditModal(source, isNew, onSave) {
        var container = $('<div class="multi-container"></div>');
        var nameInput = $(`<input type="text" placeholder="Назва" value="${source.name || ''}" style="width:100%;margin-bottom:10px;padding:5px;">`);
        var urlInput = $(`<input type="text" placeholder="URL" value="${source.url || ''}" style="width:100%;margin-bottom:10px;padding:5px;">`);
        var saveBtn = $('<div class="multi-apply selector">Зберегти</div>');

        container.append(nameInput, urlInput, saveBtn);

        saveBtn.on('hover:enter', function () {
            var newName = nameInput.val().trim();
            var newUrl = urlInput.val().trim();
            if (!newName || !newUrl) return;
            source.name = newName;
            source.url = newUrl;
            if (onSave) onSave();
            disableOutsideClose();
            Lampa.Modal.close();
            popModal();
        });

        Lampa.Modal.open({
            title: isNew ? 'Додати джерело' : 'Редагувати джерело',
            html: container,
            size: 'medium',
            onBack: function () {
                disableOutsideClose();
                Lampa.Modal.close();
                popModal();
                return true;
            }
        });

        pushModal({ modal: container, onClose: function () { disableOutsideClose(); } });
        enableOutsideClose(container);
    }

    function openSourcesModal() {
        tempState = {};
        hasChanges = false;

        var container = $('<div class="multi-container"></div>');
        var applyBtn = $('<div class="multi-apply selector">Застосувати зміни</div>');

        function renderList() {
            container.find('.multi-item').remove();
            sources.forEach(function (src, index) {
                var key = 'multi_' + src.name;
                if (!(key in tempState)) tempState[key] = Lampa.Storage.get(key, false);

                var item = $(`
                    <div class="multi-item selector">
                        <div>${src.name}</div>
                        <div class="multi-toggle ${tempState[key] ? 'enabled' : 'disabled'}">
                            ${tempState[key] ? 'Увімкнено' : 'Вимкнено'}
                        </div>
                        <div class="multi-edit" style="margin-left:10px; cursor:pointer; color:#FFD948;">✎</div>
                    </div>
                `);

                item.find('.multi-toggle').on('hover:enter', function () {
                    tempState[key] = !tempState[key];
                    item.find('.multi-toggle')
                        .removeClass('enabled disabled')
                        .addClass(tempState[key] ? 'enabled' : 'disabled')
                        .text(tempState[key] ? 'Увімкнено' : 'Вимкнено');
                    hasChanges = true;
                    applyBtn.show();
                    updateTitle($('.modal__title'));
                });

                item.find('.multi-edit').on('hover:enter', function () {
                    openEditModal(src, false, renderList);
                });

                container.append(item);
            });
        }

        var addBtn = $('<div class="multi-apply selector">Додати джерело</div>');
        addBtn.on('hover:enter', function () {
            var newSource = { name: '', url: '' };
            sources.push(newSource);
            openEditModal(newSource, true, renderList);
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

        container.append(addBtn);
        container.append(applyBtn);
        renderList();

        Lampa.Modal.open({
            title: `Мій мультиплагін ${VERSION} — Балансери`,
            html: container,
            size: 'medium',
            onBack: function () {
                disableOutsideClose();
                Lampa.Modal.close();
                popModal();
                Lampa.Controller.toggle('settings_component');
                return true;
            }
        });

        pushModal({ modal: container, onClose: function () { disableOutsideClose(); } });
        enableOutsideClose(container);

        setTimeout(function () {
            Lampa.Controller.collectionSet(container);
            Lampa.Controller.collectionFocus(container.find('.selector').first());
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