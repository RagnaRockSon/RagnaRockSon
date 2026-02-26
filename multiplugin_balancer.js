(function () {
    'use strict';

    if (!window.Lampa) return;
    const VERSION = 'v4.4.7';

    var sources = [
        { name: "BazaNetUa", url: "http://lampaua.mooo.com/online.js" },
        { name: "BanderaOnline", url: "https://lampame.github.io/main/BanderaOnline/BanderaOnline.js" },
        { name: "Online_mod", url: "https://nb557.github.io/plugins/online_mod.js" },
        { name: "Alpac Beta", url: "http://beta.l-vid.online/online.js" }
    ];

    var tempState = {};
    var hasChanges = false;
    var outsideHandler = null;

    // --- CSS ---
    function injectCSS() {
        if (document.getElementById('multi-style')) return;

        var style = document.createElement('style');
        style.id = 'multi-style';
        style.innerHTML = `
            .multi-container { padding:15px; transition: all 0.3s ease; }
            .multi-item { display:flex; justify-content:space-between; align-items:center; padding:10px 12px; margin-bottom:8px; background:rgba(255,255,255,0.05); border-radius:10px; transition: all 0.2s ease; }
            .multi-item.focus { background:rgba(255,255,255,0.1); transform:scale(1.01); }
            .multi-left { flex:1; display:flex; align-items:center; }
            .multi-left strong { font-size:16px; white-space:nowrap; overflow:hidden; text-overflow:ellipsis; }
            .multi-right { display:flex; gap:10px; align-items:center; flex-shrink:0; }
            .multi-toggle, .multi-btn { padding:6px 12px; border-radius:8px; text-align:center; color:#fff; cursor:pointer; font-size:14px; transition: all 0.2s ease; height:36px; line-height:36px; display:flex; align-items:center; justify-content:center; }
            .multi-toggle.enabled { background:#46b85a; }
            .multi-toggle.disabled { background:#d24a4a; }
            .multi-btn-edit { background:#FF9800; min-width:36px; }
            .multi-btn-delete { background:#d24a4a; min-width:36px; }
            .multi-btn-add { background:#156DD1; margin-top:12px; width:100%; padding:12px; border-radius:10px; text-align:center; font-weight:bold; }
            .multi-apply { text-align:center; margin-top:10px; padding:12px; border-radius:10px; font-weight:bold; cursor:pointer; background:#156DD1; color:#fff; display:none; transition: all 0.2s ease; }

            /* Модалки Add/Edit джерела */
            .modal-input { width:100%; padding:10px 12px; margin-bottom:12px; border-radius:8px; border:1px solid rgba(255,255,255,0.2); background:rgba(0,0,0,0.2); color:#fff; font-size:14px; box-sizing:border-box; }
            .modal-input::placeholder { color:rgba(255,255,255,0.5); }
            .modal-buttons { display:flex; gap:10px; margin-top:10px; }
            .modal-button { flex:1; padding:10px; text-align:center; border-radius:8px; cursor:pointer; font-weight:bold; color:#fff; transition: all 0.2s ease; display:flex; justify-content:center; align-items:center; }
            .modal-button.save { background:#46b85a; }
            .modal-button.cancel { background:#555; }
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
            try { sources = JSON.parse(saved); } catch(e){ console.error(e); }
        }
    }

    function saveSourcestoStorage() {
        Lampa.Storage.set('multi_sources', JSON.stringify(sources));
    }

    // --- Модалки Edit/Add ---
    function openEditModal(index, callback) {
        var src = sources[index];
        var formHtml = $(`
            <div style="padding:10px;">
                <input type="text" class="modal-input edit-name" value="${src.name}" placeholder="Назва джерела">
                <input type="text" class="modal-input edit-url" value="${src.url}" placeholder="URL до скрипту">
                <div class="modal-buttons">
                    <div class="modal-button save">Зберегти</div>
                    <div class="modal-button cancel">Скасувати</div>
                </div>
            </div>
        `);

        formHtml.find('.save').on('hover:enter', function() {
            var newName = formHtml.find('.edit-name').val().trim();
            var newUrl = formHtml.find('.edit-url').val().trim();
            if(!newName || !newUrl){ if(Lampa.Noty) Lampa.Noty.show('Заповніть всі поля'); return; }
            sources[index] = {name:newName, url:newUrl};
            saveSourcestoStorage();
            hasChanges = true;
            Lampa.Modal.close();
            if(callback) callback();
        });

        formHtml.find('.cancel').on('hover:enter', function(){ Lampa.Modal.close(); });

        Lampa.Modal.open({ title:'Редагування джерела', html:formHtml, size:'medium', onBack:function(){ Lampa.Modal.close(); return true; }});
    }

    function openAddModal(callback) {
        var formHtml = $(`
            <div style="padding:10px;">
                <input type="text" class="modal-input add-name" placeholder="Назва джерела">
                <input type="text" class="modal-input add-url" placeholder="URL до скрипту">
                <div class="modal-buttons">
                    <div class="modal-button save">Додати</div>
                    <div class="modal-button cancel">Скасувати</div>
                </div>
            </div>
        `);

        formHtml.find('.save').on('hover:enter', function() {
            var newName = formHtml.find('.add-name').val().trim();
            var newUrl = formHtml.find('.add-url').val().trim();
            if(!newName || !newUrl){ if(Lampa.Noty) Lampa.Noty.show('Заповніть всі поля'); return; }
            sources.push({name:newName,url:newUrl});
            saveSourcestoStorage();
            hasChanges = true;
            Lampa.Modal.close();
            if(callback) callback();
        });

        formHtml.find('.cancel').on('hover:enter', function(){ Lampa.Modal.close(); });

        Lampa.Modal.open({ title:'Додавання джерела', html:formHtml, size:'medium', onBack:function(){ Lampa.Modal.close(); return true; }});
    }

    // --- Меню балансерів ---
    function openSourcesModal() {
        tempState = {}; hasChanges = false;

        var container = $('<div class="multi-container"></div>');
        var applyBtn = $('<div class="multi-apply selector">Застосувати зміни</div>');
        var addBtn = $('<div class="multi-btn-add selector">+ Додати джерело</div>');

        function renderSources() {
            container.find('.multi-item').remove();
            sources.forEach(function(src,index){
                var key = 'multi_'+src.name;
                var current = Lampa.Storage.get(key,false);
                tempState[key] = current;

                var item = $(`
                    <div class="multi-item selector" data-index="${index}">
                        <div class="multi-left"><strong>${src.name}</strong></div>
                        <div class="multi-right">
                            <div class="multi-toggle selector ${current?'enabled':'disabled'}" data-index="${index}">${current?'Увімкнено':'Вимкнено'}</div>
                            <div class="multi-btn-edit selector" data-index="${index}">Ред.</div>
                            <div class="multi-btn-delete selector" data-index="${index}">Вид.</div>
                        </div>
                    </div>
                `);

                // Toggle працює як кнопка
                item.find('.multi-toggle').on('hover:enter', function(){
                    var idx = $(this).data('index');
                    var key = 'multi_'+sources[idx].name;
                    tempState[key] = !tempState[key];
                    $(this).removeClass('enabled disabled').addClass(tempState[key]?'enabled':'disabled').text(tempState[key]?'Увімкнено':'Вимкнено');
                    hasChanges = true; applyBtn.show(); updateTitle($('.modal__title'));
                });

                item.find('.multi-btn-edit').on('hover:enter', function(){ openEditModal($(this).data('index'), renderSources); });
                item.find('.multi-btn-delete').on('hover:enter', function(){ sources.splice($(this).data('index'),1); saveSourcestoStorage(); hasChanges=true; renderSources(); updateTitle($('.modal__title')); });

                container.append(item);
            });

            container.append(addBtn); container.append(applyBtn);
        }

        renderSources();

        addBtn.on('hover:enter', function(){ openAddModal(renderSources); });

        applyBtn.on('hover:enter', function(){
            if(!hasChanges) return;
            Object.keys(tempState).forEach(function(k){ Lampa.Storage.set(k,tempState[k]); });
            disableOutsideClose();
            if(Lampa.Manifest && typeof Lampa.Manifest.app_reload==='function'){ Lampa.Manifest.app_reload(); }
            else { location.reload(); }
        });

        Lampa.Modal.open({
            title:`Мій мультиплагін ${VERSION} — Балансери`,
            html:container,
            size:'medium',
            onBack:function(){ closeModal({onClose:function(){ Lampa.Controller.toggle('settings_component'); }}); return true; }
        });

        setTimeout(function(){
            Lampa.Controller.collectionSet(container);
            Lampa.Controller.collectionFocus(container.find('.selector').first());
            enableOutsideClose(container,{onClose:function(){ Lampa.Controller.toggle('settings_component'); }});
            updateTitle($('.modal__title'));
        },200);
    }

    function loadActiveSources(){
        sources.forEach(function(src){
            var enabled = Lampa.Storage.get('multi_'+src.name,false);
            if(!enabled) return;
            if(document.querySelector('script[src="'+src.url+'"]')) return;

            var script = document.createElement('script');
            script.src = src.url;
            script.async = false;
            document.body.appendChild(script);
        });
    }

    function initSettings(){
        var SettingsApi = Lampa.SettingsApi||Lampa.Settings;
        if(!SettingsApi||!SettingsApi.addComponent) return;

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

    function start(){
        injectCSS();
        loadSourcesFromStorage();
        loadActiveSources();
        initSettings();
        if(Lampa.Noty) Lampa.Noty.show(`Мій мультиплагін ${VERSION} завантажено`);
        console.log(`[MultiPlugin ${VERSION}] Loaded`);
    }

    if(Lampa.Listener){ Lampa.Listener.follow('app',function(e){ if(e&&e.type==='ready') start(); }); }
    else { start(); }

})();