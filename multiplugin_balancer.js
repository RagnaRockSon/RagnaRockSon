function openSourcesModal() {

    var changes = false;

    var container = $('<div class="multi-container"></div>');
    var applyButton = $('<div class="multi-apply selector" style="display:none;">Застосувати зміни</div>');

    sources.forEach(function(src, index){

        var storageKey = 'multi_' + src.name;
        var enabled = Lampa.Storage.get(storageKey, false);

        var item = $(`
            <div class="multi-item selector">
                <div class="multi-title">${src.name}</div>
                <div class="multi-toggle ${enabled ? 'enabled' : 'disabled'}">
                    <span>${enabled ? 'Увімкнено' : 'Вимкнено'}</span>
                </div>
            </div>
        `);

        item.on('hover:enter', function(){

            enabled = !enabled;
            Lampa.Storage.set(storageKey, enabled);

            item.find('.multi-toggle')
                .removeClass('enabled disabled')
                .addClass(enabled ? 'enabled' : 'disabled')
                .find('span')
                .text(enabled ? 'Увімкнено' : 'Вимкнено');

            changes = true;
            applyButton.show();

        });

        container.append(item);
    });

    applyButton.on('hover:enter', function(){

        Lampa.Modal.open({
            title: 'Перезапуск потрібен',
            text: 'Застосувати зміни зараз?',
            buttons: [
                {
                    name: 'Так',
                    onSelect: function(){
                        location.reload();
                    }
                },
                {
                    name: 'Ні',
                    onSelect: function(){
                        Lampa.Modal.close();
                    }
                }
            ]
        });

    });

    container.append(applyButton);

    Lampa.Modal.open({
        title: 'Балансери',
        html: container
    });

    Lampa.Controller.collectionSet(container);
    Lampa.Controller.collectionFocus(container.find('.selector').first());
}
