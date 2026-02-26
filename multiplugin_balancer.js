(function () {

    var plugin_version = '4.5.6';

    if (!window.Lampa) return;

    var SOURCES_KEY = 'multi_balancer_sources';
    var sources = Lampa.Storage.get(SOURCES_KEY, []);

    var hasChanges = false;
    var tempState = {};

    function saveSources() {
        Lampa.Storage.set(SOURCES_KEY, sources);
    }

    function openMainModal() {

        var container = $('<div class="multi-container"></div>');

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
                            <div class="multi-btn multi-edit selector">Редагувати</div>
                            <div class="multi-btn multi-delete selector">Видалити</div>
                        </div>
                    </div>
                `);

                row.find('.multi-toggle').on('hover:enter click', function () {

                    tempState[key] = !tempState[key];

                    $(this)
                        .removeClass('enabled disabled')
                        .addClass(tempState[key] ? 'enabled':'disabled')
                        .text(tempState[key] ? 'Увімкнено':'Вимкнено');

                    hasChanges = true;
                });

                row.find('.multi-edit').on('hover:enter click', function () {
                    openEditModal(index, renderSources);
                });

                row.find('.multi-delete').on('hover:enter click', function () {
                    sources.splice(index, 1);
                    saveSources();
                    renderSources();
                });

                container.append(row);
            });

            var addBtn = $('<div class="multi-btn multi-add selector">+ Додати джерело</div>');

            addBtn.on('hover:enter click', function () {
                openAddModal(renderSources);
            });

            container.append(addBtn);

            setTimeout(function () {
                Lampa.Controller.collectionSet(container);
                Lampa.Controller.collectionFocus(container.find('.selector').first());
            }, 50);
        }

        renderSources();

        Lampa.Modal.open({
            title: 'Multi Balancer',
            html: container,
            size: 'medium',
            onBack: function () {
                Lampa.Modal.close();
                Lampa.Controller.toggle('settings_component');
            }
        });
    }

    function openAddModal(callback) {

        var input = $('<input type="text" placeholder="Назва джерела" class="multi-input">');

        var wrapper = $('<div class="multi-form"></div>');
        wrapper.append(input);

        Lampa.Modal.open({
            title: 'Додати джерело',
            html: wrapper,
            size: 'small',
            onBack: function () {
                Lampa.Modal.close();
            },
            onSelect: function () {
                var value = input.val().trim();
                if (!value) return;

                sources.push({ name: value });
                saveSources();

                Lampa.Modal.close();
                callback();
            }
        });
    }

    function openEditModal(index, callback) {

        var input = $('<input type="text" class="multi-input">');
        input.val(sources[index].name);

        var wrapper = $('<div class="multi-form"></div>');
        wrapper.append(input);

        Lampa.Modal.open({
            title: 'Редагувати джерело',
            html: wrapper,
            size: 'small',
            onBack: function () {
                Lampa.Modal.close();
            },
            onSelect: function () {
                var value = input.val().trim();
                if (!value) return;

                sources[index].name = value;
                saveSources();

                Lampa.Modal.close();
                callback();
            }
        });
    }

    Lampa.SettingsApi.addComponent({
        component: 'multi_balancer',
        name: 'Multi Balancer',
        icon: '🧩'
    });

    Lampa.SettingsApi.addParam({
        component: 'multi_balancer',
        param: {
            name: 'multi_balancer_open',
            type: 'button'
        },
        field: {
            name: 'Налаштування балансерів'
        },
        onChange: function () {
            openMainModal();
        }
    });

    Lampa.CSS.add(`
        .multi-container{
            padding:20px;
        }

        .multi-item{
            display:flex;
            justify-content:space-between;
            align-items:center;
            margin-bottom:12px;
        }

        .multi-left{
            width:40%;
            font-size:18px;
            overflow:hidden;
            text-overflow:ellipsis;
        }

        .multi-right{
            width:60%;
            display:flex;
            justify-content:space-between;
            align-items:center;
        }

        .multi-btn{
            flex:1;
            margin:0 4px;
            height:38px;
            border-radius:8px;
            display:flex;
            justify-content:center;
            align-items:center;
            font-size:14px;
            cursor:pointer;
        }

        .multi-toggle.enabled{
            background:#2ecc71;
        }

        .multi-toggle.disabled{
            background:#e74c3c;
        }

        .multi-edit{
            background:#3498db;
        }

        .multi-delete{
            background:#9b59b6;
        }

        .multi-add{
            margin-top:20px;
            background:#f39c12;
        }

        .multi-input{
            width:100%;
            height:40px;
            padding:10px;
            font-size:16px;
        }
    `);

})();