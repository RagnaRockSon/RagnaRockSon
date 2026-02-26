(function () {
    'use strict';

    if (!window.Lampa) return;

    const VERSION = 'v4.2';

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
            .multi-edit { margin-left:10px; cursor:pointer; color:#FFD700; }
            .multi-add { text-align:center; margin:15px 0; padding:10px; border-radius:10px; font-weight:bold; cursor:pointer; background:#FF9800; color:#fff; }
        `;
        document.head.appendChild(style);
    }

    function updateTitle() {
        var title = hasChanges
            ? `Мій мультиплагін ${VERSION} — Балансери ●`
            : `Мій мультиплагін ${VERSION} — Балансери`;
        $('.modal__title').text(title);
    }

    function enableOutsideClose(container) {
        setTimeout(function () {
            outsideHandler = function (e) {
                if (!$(e.target).closest(container).length) {
                    closeModal();
                }
            };
            $('.modal').on('mousedown.multi', outsideHandler);
        }, 200);
    }

    function disableOutsideClose() {
        $('.modal').off('mousedown.multi');
        outsideHandler = null;
    }

    function closeModal() {
        disableOutsideClose();
        Lampa.Modal.close();
    }

    function renderSources(container) {
        container.empty();

        sources.forEach(function (src, index) {
            var key = 'multi_' + src.name;
            var current = tempState[key] !== undefined ? tempState[key] : Lampa.Storage.get(key, false);

            var item = $(`
                <div class="multi-item selector">
                    <div>${src.name}</div>
                    <div>
                        <span class="multi-toggle ${current ? 'enabled' : 'disabled'}">${current ? 'Увімкнено' : 'Вимкнено'}</span>
                        <span class="multi-edit selector">✎</span>
                    </div>
                </div>
            `);

            // Перемикання увімкнено/вимкнено
            item.find('.multi-toggle').on('hover:enter', function () {
                tempState[key] = !current;
                current = tempState[key];
                $(this).removeClass('enabled disabled').addClass(current ? 'enabled' : 'disabled').text(current ? 'Увімкнено' : 'Вимкнено');
                hasChanges = true;
                container.find('.multi-apply').show();
                updateTitle();
            });

            // Редагувати назву/посилання
            item.find('.multi-edit').on('hover:enter', function () {
                openEditModal(src, function (newData) {
                    src.name = newData.name;
                    src.url = newData.url;
                    renderSources(container);
                });
            });

            container.append(item);
        });

        // Додати нове джерело
        var addBtn = $('<div class="multi-add selector">Додати нове джерело</div>');
        addBtn.on('hover:enter', function () {
            openEditModal({ name: '', url: '' }, function (newData) {
                sources.push({ name: newData.name, url: newData.url });
                renderSources(container);
            });
        });

        container.append(addBtn);

        // Кнопка застосувати зміни
        var applyBtn = $('<div class="multi-apply selector">Застосувати зміни</div>');
        applyBtn.on('hover:enter', function () {
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
    }

    function openEditModal(src, callback) {
        var form = $(`
            <div style="display:flex; flex-direction:column; gap:10px;">
                <input type="text" placeholder="Назва" value="${src.name}" class="multi-input" style="padding:8px; border-radius:6px; width:100%;">
                <input type="text" placeholder="Посилання" value="${src.url}" class="multi-input" style="padding:8px; border-radius:6px; width:100%;">
                <div class="multi-apply selector">Зберегти</div>
            </div>
        `);

        form.find('.multi-apply').on('hover:enter', function () {
            var name = form.find('input').eq(0).val().trim();
            var url = form.find('input').eq(1).val().trim();
            if (!name || !url) return;
            callback({ name, url });
            Lampa.Modal.close();
        });

        Lampa.Modal.open({
            title: 'Редагувати джерело',
            html: form,
            size: 'medium',
            onBack: function () { return true; }
        });
    }

    function openSourcesModal() {
        tempState = {};
        hasChanges = false;

        var container = $('<div class="multi-container"></div>');

        renderSources(container);

        Lampa.Modal.open({
            title: `Мій мультиплагін ${VERSION} — Балансери`,
            html: container,
            size: 'medium',
            onBack: function () {
                closeModal();
                return true;
            }
        });

        setTimeout(function () {
            Lampa.Controller.collectionSet(container);
            Lampa.Controller.collectionFocus(container.find('.selector').first());
            enableOutsideClose(container);
            updateTitle();
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