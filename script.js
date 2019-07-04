var URI = 'https://api.themoviedb.org/3/';
var URI_POSTER = 'https://image.tmdb.org/t/p/w500';
var API_KEY = '?api_key=640d0e8ad732da286513575093087225';
var LANGUAGE = '&language=ru';
var searchForm = document.getElementById('search-form');
var movie = document.getElementById('movies');
var trends = document.getElementById('trends');
var topFilms = document.getElementById('top-films');
var categoria;


topFilms.addEventListener('click', getTop);
searchForm.addEventListener('submit', getSearch);
document.addEventListener('DOMContentLoaded', getTrendLoad);

trends.onchange = function () {
    getTrendLoad();
};

//Повесить событие у которых есть data-id 
function addEventMedia() {
    var media = movie.querySelectorAll('img[data-id]');
    media.forEach(function (elem) {
        elem.style.cursor = 'pointer';
        elem.addEventListener('click', showFullInfo);
    });
}


//Функция поиска
function getSearch(event) {
    event.preventDefault();

    categoria = document.querySelector('#catergoria').value;
    var searchText = document.querySelector('.form-control').value;
    if (searchText.trim().length === 0) {
        movie.innerHTML = '<h2 class="col-12 text-center text-danger">Пустое поле</h2>';
        return;
    }

    spinner();

    $.ajax({
        url: URI + 'search/' + categoria + API_KEY + LANGUAGE + '&query=' + searchText,
        success: function (data) {
            renderSearch(data);
            addEventMedia();
        },
        error: function (error) {
            movie.innerHTML = 'Result: ' + error.status + ' ' + error.statusText;
        }
    });

}


//Получить полную информацию 
function showFullInfo() {
    $.ajax({
        url: URI + this.dataset.type + '/' + this.dataset.id + API_KEY + LANGUAGE,
        success: function (data) {

            if (this.dataset.type !== 'person') {
                renderFullInfo(data);
                getVideo(this.dataset.type, this.dataset.id);
                getCredits(this.dataset.type, this.dataset.id, '/credits', 'Актёры');
            } else {
                renderFullInfoPerson(data);
                getCredits(this.dataset.type, this.dataset.id, '/combined_credits', 'Фильмография');
            }
        }.bind(this),
        error: function (error) {
            movie.innerHTML = 'Result: ' + error.status + ' ' + error.statusText;
        }
    });
}

//Получить тренды за сутки/неделю 
function getTrendLoad() {
    categoria = document.querySelector('#catergoria').value;
    var trend = document.querySelector('[name=trends]:checked').value;

    $.ajax({
        url: URI + 'trending/' + categoria + '/' + trend + API_KEY + LANGUAGE,
        success: function (data) {

            renderTrend(data, trend);
            addEventMedia();
        },
        error: function (error) {
            movie.innerHTML = 'Result: ' + error.status + ' ' + error.statusText;
        }
    });
}

//Получить видео с Youtube
function getVideo(type, id) {
    $.ajax({
        url: URI + type + '/' + id + '/videos' + API_KEY + LANGUAGE,
        success: function (data) {
            renderVideo(data);
        },
        error: function (error) {
            console.error(error);
        }
    });
}

//Получить фильмы и сериалы для актёра или актерский состав для фильма
function getCredits(type, id, credits, title) {
    $.ajax({
        url: URI + type + '/' + id + credits + API_KEY + LANGUAGE,
        success: function (data) {

            renderCredits(data, title);
            addEventMedia();
        },
        error: function (error) {
            console.error(error);
        }
    });

}

//Получить лучшие по рейтингу фильмы на TMDb
function getTop() {
    var inner = '<h2 class="col-12 text-center text-info">Лучшие фильмы</h2>';
    $.ajax({
        url: URI + 'movie/top_rated' + API_KEY + LANGUAGE,
        success: function (output) {
            output.results.forEach(function (item) {
                var nameItem = item.title;
                var mediaType = 'movie';
                var dataInfo = 'data-id="' + item.id + '" data-type="' + mediaType + '"';

                inner += '<div class="col-6 col-md-4 col-xl-3 item">';
                inner += '<img src="' + URI_POSTER + item.poster_path + '" class="img_poster shadow rounded" alt="' + nameItem + '" ' + dataInfo + '>';
                inner += '<h5>' + nameItem + '</h5>';
                inner += '</div>';

            });

            movie.innerHTML = inner;

            addEventMedia();


        },
        error: function (error) {
            console.error(error);
        }
    });
}

//Вывод на страницу поиска
function renderSearch(output) {
    var inner = '';
    if (output.results.length === 0) {
        inner = '<h2 class="col-12 text-center text-info">Результатов не найдено</h2>';
    }

    output.results = output.results.sort(function (a, b) {
        return b.popularity - a.popularity;
    });

    output.results.forEach(function (item) {
        var nameItem = item.name || item.title;
        var dateItem = item.first_air_date || item.release_date;
        var posterItem = item.poster_path || item.profile_path ? URI_POSTER + (item.profile_path || item.poster_path) : '/poster.png';
        var dataInfo = 'data-id="' + item.id + '" data-type="' + (item.media_type || categoria) + '"';
        inner += '<div class="col-6 col-md-4 col-xl-3 item">';
        inner += '<img src="' + posterItem + '" class="img_poster shadow rounded" alt="' + nameItem + '" ' + dataInfo + '>';
        inner += '<p>' + nameItem + ' ' + (new Date(dateItem).getFullYear() || "") + '</p>';
        inner += '</div>';
    });
    movie.innerHTML = inner;
}

//Вывод на страницу описания фильма или сериала
function renderFullInfo(output) {
    var posterItem = output.poster_path ? URI_POSTER + output.poster_path : '/poster.png';
    var inner = '';

    inner += '<h4 class="col-12 text-center text-info">' + (output.name || output.title) + '</h4>';
    inner += '<div class="col-4">';
    inner += '<img src="' + posterItem + '" class="shadow rounded" alt="' + (output.name || output.title) + '">';
    inner += output.homepage ? '<p class="text-center"><a href="' + output.homepage + '" target="_blank">Официальная страница</a></p>' : '';
    inner += output.imdb_id ? '<p class="text-center"><a href="https://imdb.com/title/' + output.imdb_id + '" target="_blank">IMDB</a></p>' : '';
    inner += '</div><div class="col-8">';
    inner += '<p>Рейтинг: ' + output.vote_average + ' (' + output.vote_count + ')' + '</p>';
    inner += '<p>Премьера: ' + getDate(output.first_air_date || output.release_date) + '</p>';
    inner += '<p>Статус: ' + output.status + '</p>';
    inner += output.last_episode_to_air ? '<p>' + output.number_of_seasons + ' сезон ' + output.last_episode_to_air.episode_number + ' серий вышло</p>' : '';
    inner += output.genres ? 'Жанры: ' + output.genres.map(function (item) {
        return ' ' + item.name;
    }) + '</p>' : '';
    inner += '<p>Описание: ' + output.overview + '</p><br>';
    inner += '<div class="youtube"></div><div class="credits"></div>';
    inner += '</div>';

    movie.innerHTML = inner;
}

//Вывод на страницу описания актёра
function renderFullInfoPerson(output) {
    var posterItem = output.profile_path ? URI_POSTER + output.profile_path : '/poster.png';
    var inner = '';

    inner += '<h4 class="col-12 text-center text-info">' + output.name + '</h4>';
    inner += '<div class="col-4">';
    inner += '<img src="' + posterItem + '" class="shadow rounded" alt="' + output.name + '">';
    inner += output.homepage ? '<p class="text-center"><a href="' + output.homepage + '" target="_blank">Официальная страница</a></p>' : '';
    inner += output.imdb_id ? '<p class="text-center"><a href="https://imdb.com/title/' + output.imdb_id + '" target="_blank">IMDB</a></p>' : '';
    inner += '</div><div class="col-8">';
    inner += '<p>Дата рождения: ' + getDate(output.birthday) + '</p>';
    inner += output.deathday ? '<p>Дата смерти: ' + getDate(output.deathday) + '</p>' : '';
    inner += '<p>Место рождения: ' + output.place_of_birth + '</p>';
    inner += '<p>Биография: ' + output.biography + '</p><br>';
    inner += '<div class="credits"></div>';
    inner += '</div>';

    movie.innerHTML = inner;
}
//Вывод на страницу трендов
function renderTrend(output, trend) {
    var inner = '<h2 class="col-12 text-center text-info">Популярные за ' + (trend === 'day' ? 'сутки' : 'неделю') + '!</h2>';

    output.results.forEach(function (item) {
        var nameItem = item.name || item.title;
        var mediaType = item.title ? 'movie' : 'tv';
        var posterItem = item.poster_path || item.profile_path ? URI_POSTER + (item.profile_path || item.poster_path) : '/poster.png';
        var dataInfo = 'data-id="' + item.id + '" data-type="' + (categoria !== 'multi' ? categoria : mediaType) + '"';

        inner += '<div class="col-6 col-md-4 col-xl-3 item">';
        inner += '<img src="' + posterItem + '" class="img_poster shadow rounded" alt="' + nameItem + '" ' + dataInfo + '>';
        inner += '<h5>' + nameItem + '</h5>';
        inner += '</div>';
    });

    movie.innerHTML = inner;
}

//Вывод видео Youtube в полном описании
function renderVideo(output) {
    var youtube = movie.querySelector('.youtube');
    if (output.results[0]) {
        var videoframe = '<h5 class="text-info">Трейлер</h5>';
        videoframe += '<iframe width="100%" height="315" src="https://www.youtube.com/embed/' + output.results[0].key + '" frameborder="0" allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>';
        youtube.innerHTML = videoframe;
    } else {
        youtube.innerHTML = 'Трейлер отсутствует!';
    }
}

//Вывод актёров или фильмографии в полном описании
function renderCredits(output, title) {
    var credits = movie.querySelector('.credits');
    var creditsframe = '';
    output.cast.forEach(function (item) {
        var nameItem = item.name || item.title;
        var posterItem = item.poster_path || item.profile_path ? URI_POSTER + (item.profile_path || item.poster_path) : '/poster.png';
        var dataInfo = 'data-id="' + item.id + '" data-type="' + (item.media_type ? item.media_type : 'person') + '"';

        creditsframe += '<div class="col-6 col-md-4 col-xl-3">';
        creditsframe += '<img src="' + posterItem + '" class="poster_credits shadow rounded" alt="' + nameItem + '" ' + dataInfo + '>';
        creditsframe += '<h6>' + nameItem + '</h6>';
        creditsframe += '</div>';

    });

    credits.innerHTML = '<h5 class="text-info">' + title + '</h5><div class="row">' + creditsframe + '</div>';
}

//Спиннер
function spinner() {
    movie.innerHTML = '<div class="spinner-grow" role="status"></div>';
}

//Локализация даты
function getDate(date) {
    var localdate = new Date(date);
    var options = {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    };
    return localdate.toLocaleString('ru-RU', options);
}