(function () {

    'use strict';

    var plugin_version = '4.5.6';
    var sources = Lampa.Storage.get('multi_sources', []);
    var tempState = {};
    var hasChanges = false;

    function saveSourcestoStorage() {
        Lampa.Storage.set('multi_sources', sources);
    }

    function openAddModal(callback) {

        var input = $('<input type="text" class="settings-input" placeholder="Назва джерела">');

        Lampa.Modal.open({
            title: 'Додати джерело',
            html: $('<div>').append(input),
            size: 'small',
            onBack: function () {
                Lampa.Modal.close();
            },
            buttons: [
                {
                    name: 'Додати',
                    onSelect: function () {
                        var value = input.val().trim();
                        if (!value) return;

                        sources.push({ name: value });
                        saveSourcestoStorage();
                        Lampa.Modal.close();
                        callback();
                    }
                }
            ]
        });
    }

    function openEditModal(index, callback) {

        var input = $('<input type="text" class="settings-input">');
        input.val(sources[index].name);

        Lampa.Modal.open({
            title: 'Редагувати джерело',
            html: $('<div>').append(input),
            size: 'small',
            onBack: function () {
                Lampa.Modal.close();
            },
            buttons: [
                {
                    name: 'Зберегти',
                    onSelect: function () {
                        var value = input.val().trim();
                        if (!value) return;

                        sources[index].name = value;
                        saveSourcestoStorage();
                        Lampa.Modal.close();
                        callback();
                    }
                }
            ]
        });
    }

    function openMainModal() {

        var container = $('<div class="multi-container"></div>');
        var applyBtn = $('<div class="multi-btn multi-btn-apply selector">Застосувати</div>');
        applyBtn.hide();

        function updateTitle(titleElement) {
            if (!titleElement) return;
            titleElement.text('Балансери v' + plugin_version + (hasChanges ? ' *' : ''));
        }

        function renderSources() {

            container.empty();

            sources.forEach(function (src, index) {

                var key = 'multi_' + src.name;
                var current = Lampa.Storage.get(key, false);
                tempState[key] = current;

                var row = $(`
                    <div class="multi-item selector">
                        <div class="multi-left">${src.name}</div>
                        <div class="multi-right">
                            <div class="multi-btn multi-toggle ${current ? 'enabled':'disabled'} selector">
                                ${current ? 'Увімкнено':'Вимкнено'}
                            </div>
                            <div class="multi-btn multi-edit selector">✏️</div>
                            <div class="multi-btn multi-delete selector">🗑️</div>
                        </div>
                    </div>
                `);

                // Toggle
                row.find('.multi-toggle').on('hover:enter click', function () {

                    tempState[key] = !tempState[key];

                    $(this)
                        .removeClass('enabled disabled')
                        .addClass(tempState[key] ? 'enabled':'disabled')
                        .text(tempState[key] ? 'Увімкнено':'Вимкнено');

                    hasChanges = true;
                    applyBtn.show();
                    updateTitle($('.modal__title'));
                });

                // Edit
                row.find('.multi-edit').on('hover:enter click', function () {
                    openEditModal(index, renderSources);
                });

                // Delete
                row.find('.multi-delete').on('hover:enter click', function () {
                    sources.splice(index, 1);
                    saveSourcestoStorage();
                    hasChanges = true;
                    renderSources();
                    updateTitle($('.modal__title'));
                });

                container.append(row);
            });

            var addBtn = $('<div class="multi-btn multi-btn-add selector">+ Додати джерело</div>');
            addBtn.on('hover:enter click', function () {
                openAddModal(renderSources);
            });

            container.append(addBtn);

            // 🔥 КЛЮЧОВЕ ВИПРАВЛЕННЯ 4.5.6
            setTimeout(function () {
                Lampa.Controller.collectionSet(container);
                Lampa.Controller.collectionFocus(
                    container.find('.selector').first()
                );
            }, 50);
        }

        applyBtn.on('hover:enter click', function () {

            Object.keys(tempState).forEach(function (key) {
                Lampa.Storage.set(key, tempState[key]);
            });

            hasChanges = false;
            applyBtn.hide();
            updateTitle($('.modal__title'));

            Lampa.Noty.show('Зміни збережено');
        });

        renderSources();

        Lampa.Modal.open({
            title: 'Балансери v' + plugin_version,
            html: $('<div>').append(container).append(applyBtn),
            size: 'medium',
            onBack: function () {
                Lampa.Modal.close();
                Lampa.Controller.toggle('settings_component');
            }
        });
    }

    function init() {

        Lampa.SettingsApi.addComponent({
            component: 'multi_balancer',
            name: 'Multi Balancer',
            icon: '<svg viewBox="0 0 24 24" fill="currentColor"><circle cx="12" cy="12" r="10"/></svg>'
        });

        Lampa.SettingsApi.addParam({
            component: 'multi_balancer',
            param: {
                name: 'multi_balancer_open',
                type: 'button'
            },
            field: {
                name: 'Відкрити балансери'
            },
            onChange: function () {
                openMainModal();
            }
        });
    }

    if (window.appready) init();
    else Lampa.Listener.follow('app', function (e) {
        if (e.type === 'ready') init();
    });

})();