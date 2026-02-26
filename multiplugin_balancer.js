function openEditModal(index, callback, parentModal) {
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
                <div class="selector" style="flex:1; padding:10px; background:#156DD1; text-align:center; border-radius:5px; cursor:pointer;">Зберегти</div>
                <div class="selector" style="flex:1; padding:10px; background:#555; text-align:center; border-radius:5px; cursor:pointer;">Скасувати</div>
            </div>
        </div>
    `);

    var saveBtn = formHtml.find('.selector').first();
    var cancelBtn = formHtml.find('.selector').last();

    saveBtn.on('hover:enter', function () {
        var newName = formHtml.find('.edit-name').val().trim();
        var newUrl = formHtml.find('.edit-url').val().trim();

        if (!newName || !newUrl) {
            if (Lampa.Noty) Lampa.Noty.show('Заповніть всі поля');
            return;
        }

        sources[index] = { name: newName, url: newUrl };
        saveSourcestoStorage();
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
            if (parentModal && parentModal.onFocus) parentModal.onFocus();
            return true;
        },
        onClose: function () {
            if (parentModal && parentModal.onFocus) parentModal.onFocus();
        }
    });
}

function openAddModal(callback, parentModal) {
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
                <div class="selector" style="flex:1; padding:10px; background:#46b85a; text-align:center; border-radius:5px; cursor:pointer;">Додати</div>
                <div class="selector" style="flex:1; padding:10px; background:#555; text-align:center; border-radius:5px; cursor:pointer;">Скасувати</div>
            </div>
        </div>
    `);

    var addBtn = formHtml.find('.selector').first();
    var cancelBtn = formHtml.find('.selector').last();

    addBtn.on('hover:enter', function () {
        var newName = formHtml.find('.add-name').val().trim();
        var newUrl = formHtml.find('.add-url').val().trim();

        if (!newName || !newUrl) {
            if (Lampa.Noty) Lampa.Noty.show('Заповніть всі поля');
            return;
        }

        sources.push({ name: newName, url: newUrl });
        saveSourcestoStorage();
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
            if (parentModal && parentModal.onFocus) parentModal.onFocus();
            return true;
        },
        onClose: function () {
            if (parentModal && parentModal.onFocus) parentModal.onFocus();
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
                    <div class="multi-left">${src.name}</div>
                    <div class="multi-right">
                        <div class="multi-btn multi-toggle selector ${current?'enabled':'disabled'}" data-key="${key}">${current?'Увімкнено':'Вимкнено'}</div>
                        <div class="multi-btn multi-btn-edit selector" data-index="${index}">✏️</div>
                        <div class="multi-btn multi-btn-delete selector" data-index="${index}">🗑️</div>
                    </div>
                </div>
            `);

            item.find('.multi-toggle').on('hover:enter', function () {
                var key = $(this).data('key');
                tempState[key] = !tempState[key];
                $(this).removeClass('enabled disabled').addClass(tempState[key] ? 'enabled' : 'disabled')
                    .text(tempState[key] ? 'Увімкнено' : 'Вимкнено');
                hasChanges = true;
                applyBtn.show();
                updateTitle($('.modal__title'));
            });

            item.find('.multi-btn-edit').on('hover:enter', function () {
                openEditModal($(this).data('index'), renderSources, { onFocus: function () { Lampa.Modal.update(container); } });
            });

            item.find('.multi-btn-delete').on('hover:enter', function () {
                var idx = $(this).data('index');
                sources.splice(idx, 1);
                saveSourcestoStorage();
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
        openAddModal(renderSources, { onFocus: function () { Lampa.Modal.update(container); } });
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