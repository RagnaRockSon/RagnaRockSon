(function () {
    'use strict';

    if (!window.Lampa) return;

    const VERSION = 'v4.1';

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
            .multi-item { display:flex; justify-content:space-between; align-items:center; padding:15px; margin-bottom:10px; background:rgba(255,255,255,0.05); border-radius:10px; transition: all 0.3s ease; }
            .multi-item.focus { background:rgba(255,255,255,0.1); transform:scale(1.02); }
            .multi-toggle { padding:6px 14px; border-radius:20px; min-width:120px; text-align:center; color:#fff; cursor:pointer; transition: all 0.3s ease; }
            .multi-toggle.enabled { background:#46b85a; }
            .multi-toggle.disabled { background:#d24a4a; }
            .multi-apply { text-align:center; margin-top:20px; padding:15px; border-radius:10px; font-weight:bold; cursor:pointer; background:#156DD1; color:#fff; display:none; transition: all 0.3s ease; }
            .multi-apply:hover { transform:scale(1.03); background:#1f82ff; }
            .multi-edit-btn { margin-left:10px; cursor:pointer; font-weight:bold; color:#FFD948; }
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
                if (!$(e.target).closest(container).length) {
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

    // --- Модал редагування джерела ---
    function openEditSourceModal(srcIndex) {
        var src = sources[srcIndex] || { name: '', url: '' };
        var wrapper = $(`
            <div style="padding:15px;">
                <label>Назва джерела:</label>
                <input type="text" class="edit-name" value="${src.name}" style="width:100%; margin-bottom:10px;">
                <label>URL джерела:</label>
                <input type="text" class="edit-url" value="${src.url}" style="width:100%; margin-bottom:15px;">
                <div class="multi-apply selector">Зберегти</div>
            </div>
        `);

        wrapper.find('.multi-apply').on('hover:enter', function () {
            var newName = wrapper.find('.edit-name').val().trim();
            var newUrl = wrapper.find('.edit-url').val().trim();
            if (!newName || !newUrl) return Lampa.Noty.show('Заповніть обидва поля');

            if (srcIndex >= 0) {
                sources[srcIndex].name = newName;
                sources[srcIndex].url = newUrl;
            } else {
                sources.push({ name: newName, url: newUrl });
            }

            hasChanges = true;
            closeModal({ onClose: openSourcesModal });
        });

        Lampa.Modal.open({
            title: srcIndex >= 0 ? 'Редагувати джерело' : 'Додати джерело',
            html: wrapper,
            size: 'medium',
            onBack: function () { closeModal({ onClose: openSourcesModal }); return true; }
        });
    }

    function openSourcesModal() {
        tempState = {};
        hasChanges = false;

        var container = $('<div class="multi-container"></div>');
        var applyBtn = $('<div class="multi-apply selector">Застосувати зміни</div>');

        sources.forEach(function (src, index) {
            var key = 'multi_' + src.name;
            var current = Lampa.Storage.get(key, false);
            tempState[key] = current;

            var item = $(`
                <div class="multi-item selector">
                    <div>${src.name}</div>
                    <div>
                        <span class="multi-toggle ${current ? 'enabled' : 'disabled'}">
                            ${current ? 'Увімкнено' : 'Вимкнено'}
                        </span>
                        <span class="multi-edit-btn">✎</span>
                    </div>
                </div>
            `);

            item.find('.multi-toggle').on('hover:enter', function () {
                tempState[key] = !tempState[key];
                $(this).removeClass('enabled disabled').addClass(tempState[key] ? 'enabled' : 'disabled')
                    .text(tempState[key] ? 'Увімкнено' : 'Вимкнено');
                hasChanges = true;
                applyBtn.show();
                updateTitle($('.modal__title'));
            });

            item.find('.multi-edit-btn').on('hover:enter', function () {
                closeModal({ onClose: function () { openEditSourceModal(index); } });
            });

            container.append(item);
        });

        var addBtn = $('<div class="multi-item selector"><div>Додати нове джерело</div></div>');
        addBtn.on('hover:enter', function () {
            closeModal({ onClose: function () { openEditSourceModal(-1); } });
        });
        container.append(addBtn);

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

        container.append(applyBtn);

        Lampa.Modal.open({
            title: `Мій мультиплагін ${VERSION} — Балансери`,
            html: container,
            size: 'medium',
            onBack: function () { closeModal({ onClose: function () { Lampa.Controller.toggle('settings_component'); } }); return true; }
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
        loadActiveSources();
        initSettings();
        if (Lampa.Noty) Lampa.Noty.show(`Мій мультиплагін ${VERSION} завантажено`);
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