const body = document.querySelector('body');
const btnTheme = document.querySelector('.btn-theme');
const btnNext = document.querySelector('.btn-next');
const btnPrev = document.querySelector('.btn-prev');

let currentTheme = localStorage.getItem('theme') ?? 'light';

function darkTheme() {
  currentTheme = 'dark';
  btnTheme.src = './assets/dark-mode.svg';
  btnPrev.src = './assets/seta-esquerda-branca.svg';
  btnNext.src = './assets/seta-direita-branca.svg';
  body.style.setProperty('--background-color', "#242424");
  body.style.setProperty('--color', "#FFF");
  body.style.setProperty('--input-background-color', "#FFF");
  body.style.setProperty('--shadow-color', "0px 4px 8px rgba(255, 255, 255, 0.15)");
  body.style.setProperty('--highlight-background', "#454545");
  body.style.setProperty('--highlight-color', "rgba(255, 255, 255, 0.7)");
  body.style.setProperty('--highlight-description', "#FFF");
  localStorage.setItem('theme', 'dark');
}

function lightTheme() {
  currentTheme = 'light';
  btnTheme.src = './assets/light-mode.svg';
  btnPrev.src = './assets/seta-esquerda-preta.svg';
  btnNext.src = './assets/seta-direita-preta.svg';
  body.style.setProperty('--background-color', "#FFF");
  body.style.setProperty('--color', "#000");
  body.style.setProperty('--input-background-color', "#979797");
  body.style.setProperty('--highlight-background', "#FFF");
  body.style.setProperty('--highlight-color', "rgba(0, 0, 0, 0.7)");
  body.style.setProperty('--highlight-description', "#000");
  localStorage.setItem('theme', 'light');
}

function toggleTheme() {
  if (currentTheme === 'light') {
    darkTheme();  
  } else {
   lightTheme();
  }  
}

function setTheme () {
  if (currentTheme === 'light') {
      lightTheme();  
    } else {
      darkTheme();
    }
}

setTheme();

btnTheme.addEventListener('click', () => {
  toggleTheme();
});

let moviesList = [];

async function watchMovies() {
  const { results } = await (
    await fetch('https://tmdb-proxy.cubos-academy.workers.dev/3/discover/movie?language=pt-BR&include_adult=false')
  ).json();
  let listResults = results;

  for (let i = 1; i < 5; i++) {
    let page = listResults.splice(0, 5);
    moviesList.push(page);
  }
  createMovies(moviesList[0]);
}

watchMovies();

btnNext.addEventListener('click', moveRigth);
btnPrev.addEventListener('click', moveLeft);

let currentPage = 0;

function moveRigth() {
  currentPage -= 1;
  if (currentPage < 0) {
    currentPage = moviesList.length - 1;
  }
  createMovies(moviesList[currentPage]);
}

function moveLeft() {
  currentPage += 1;
  if (currentPage >= moviesList.length) {
    currentPage = 0;
  }
  createMovies(moviesList[currentPage]);
}

function createMovies(moviesArray) {
  const movies = document.querySelector('.movies');
  movies.innerHTML = '';

  moviesArray.forEach((item) => {
    const movie = document.createElement('div');
    movie.classList.add('movie');
    movie.style.backgroundImage = `url('${item.poster_path}')`;
    movie.id = item.id;
    movie.addEventListener('click', (event) => {
      moviesModal(event.target.id);
    });

    const movieInfo = document.createElement('div');
    movieInfo.classList.add('movie__info');

    const movieTitle = document.createElement('span');
    movieTitle.classList.add('movie__title');
    movieTitle.innerText = item.title;

    const movieRating = document.createElement('span');
    movieRating.classList.add('movie__rating');
    movieRating.innerText = item.vote_average;

    const img = document.createElement('img');
    img.src = './assets/estrela.svg';
    img.alt = 'Estrela';

    movieRating.append(img);
    movieInfo.append(movieTitle, movieRating);
    movie.append(movieInfo);
    movies.append(movie);
  });
}

async function inputSearchMovies() {
  moviesList = [];
  if (!searchInput.value) {
    return watchMovies();
  }

  const search = await (
    await fetch(`https://tmdb-proxy.cubos-academy.workers.dev/3/search/movie?language=pt-BR&include_adult=false&query=${searchInput.value}`)
  ).json();
  let listResults = search.results;

  for (let i = 1; i < 5; i++) {
    let page = listResults.splice(0, 5);
    moviesList.push(page);
  }
  createMovies(moviesList[0]);
}

const searchInput = document.querySelector('.input');
searchInput.addEventListener('keydown', (key) => {
  if (key.key === 'Enter') {
    inputSearchMovies();
  }
});

async function movieOfTheDay() {
  const movie = await (await fetch('https://tmdb-proxy.cubos-academy.workers.dev/3/movie/436969?language=pt-BR')).json();
  const trailer = await (await fetch('https://tmdb-proxy.cubos-academy.workers.dev/3/movie/436969/videos?language=pt-BR')).json();

  const highlightVideo = document.querySelector('.highlight__video');
  highlightVideo.style.backgroundImage = `linear-gradient(rgba(0, 0, 0, 0.6) 100%, rgba(0, 0, 0, 0.6) 100%), url(${movie.backdrop_path})`;

  const highlightTitle = document.querySelector('.highlight__title');
  highlightTitle.innerText = movie.title;

  const highlightRating = document.querySelector('.highlight__rating');
  highlightRating.innerText = movie.vote_average.toFixed(1);

  const highlightGenres = document.querySelector('.highlight__genres');
  highlightGenres.innerText = movie.genres.map((genres) => genres.name).join(', ');

  const highlightLaunch = document.querySelector('.highlight__launch');
  highlightLaunch.innerText = new Date(movie.release_date).toLocaleDateString('pt-BR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    timeZone: 'UTC'
  });

  const highlightDescription = document.querySelector('.highlight__description');
  highlightDescription.innerText = movie.overview;

  const highlightVideoLink = document.querySelector('.highlight__video-link');
  highlightVideoLink.href = `https://www.youtube.com/watch?v=${trailer.results[0].key}`;
}

movieOfTheDay();

async function moviesModal(movieId) {
  const movie = await (await fetch(`https://tmdb-proxy.cubos-academy.workers.dev/3/movie/${movieId}?language=pt-BR`)).json();

  const openModal = document.querySelector('.modal');
  openModal.classList.remove('hidden');

  const title = document.querySelector('.modal__title');
  title.innerText = movie.title;

  const img = document.querySelector('.modal__img');
  img.src = movie.backdrop_path;

  const description = document.querySelector('.modal__description');
  description.innerText = movie.overview;

  const rating = document.querySelector('.modal__average');
  rating.innerText = movie.vote_average.toFixed(1);

  const modalClose = document.querySelector('.modal__close');
  modalClose.addEventListener('click', () => {
    document.querySelector('.modal').classList.add('hidden');
  });

  const modalGenres = document.querySelector('.modal__genres');
  modalGenres.innerText = '';
  movie.genres.forEach((genre) => {
    const modalGenre = document.createElement('span');
    modalGenre.innerText = genre.name;
    modalGenre.classList.add('modal__genre');

    modalGenres.append(modalGenre);
  });
}