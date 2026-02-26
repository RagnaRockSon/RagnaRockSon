(function(){

if(!window.Lampa) return;

console.log('FilmHub+ loaded');

var component = {};

component.create = function(){
    var movie = this.activity.movie;

    this.activity.render(`
        <div style="padding:50px">
            <h1>🎬 FilmHub+</h1>
            <h2>${movie.title || movie.name}</h2>
        </div>
    `);
};

component.destroy = function(){};

Lampa.Component.add('filmhub_plus', component);

function insertButton(){

    var buttons = document.querySelector('.full-start__buttons');

    if(!buttons) return;
    if(buttons.querySelector('.filmhub-btn')) return;

    var btn = document.createElement('div');
    btn.className = 'full-start__button selector filmhub-btn';
    btn.innerHTML = `
        <svg width="26" height="26" viewBox="0 0 24 24" fill="currentColor">
            <path d="M4 4h16v16H4z"/>
            <path d="M10 8l6 4-6 4z" fill="#000"/>
        </svg>
        <span>FilmHub+</span>
    `;

    btn.addEventListener('click', function(){

        var movie = Lampa.Activity.active().movie;

        Lampa.Activity.push({
            component: 'filmhub_plus',
            movie: movie
        });

    });

    buttons.prepend(btn); // 🔥 ВСТАВЛЯЄМО ЗЛІВА
}

Lampa.Listener.follow('activity', function(e){

    if(e.component === 'full'){
        setTimeout(insertButton, 300);
    }

});

})();