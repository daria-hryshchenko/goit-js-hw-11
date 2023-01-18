import {
  FetchImagesAPI
} from './fetchImagesAPI.js';
import Notiflix from 'notiflix';
import SimpleLightbox from 'simplelightbox';
import 'simplelightbox/dist/simple-lightbox.min.css';
import './../css/styles.css';


const form = document.querySelector('.search-form');
const galleryEl = document.querySelector('.gallery');
const loading = document.querySelector('.loading');



const lightBox = new SimpleLightbox('.gallery a', {
  captions: true,
  captionsData: 'alt',
  captionDelay: 250,
});


const fetchImages = new FetchImagesAPI();

form.addEventListener('submit', onSubmitSearchForm);

async function onSubmitSearchForm(event) {
  event.preventDefault();
  galleryEl.innerHTML = '';
  fetchImages.query = event.currentTarget.elements.searchQuery.value;
  fetchImages.page = 1;
  event.currentTarget.reset();
  try {
    const response = await fetchImages.getPhotos();

    if (response.totalHits === 0 || fetchImages.query.length === 0) {
      Notiflix.Notify.failure(
        'Sorry, there are no images matching your search query. Please try again.'
      );
      galleryEl.innerHTML = '';
      return;
    }
    if (response.totalHits > 0) {
      Notiflix.Notify.info(`Hooray! We found ${response.totalHits} images.`);
    }
    galleryEl.innerHTML = createImageList(response.hits);
    lightBox.refresh();
  } catch (error) {
    console.error(error);
  }
}


async function loadMoreImages() {
  fetchImages.page += 1;
  try {
    const data = await fetchImages.getPhotos();

    if (data.hits.length < fetchImages.elementsPerPage) {

      Notiflix.Notify.failure(
        "We're sorry, but you've reached the end of search results."
      );
    }
    galleryEl.insertAdjacentHTML('beforeend', createImageList(data.hits));
    lightBox.refresh();

  } catch (error) {
    console.error(error);
  }
}

function createImageList(array) {
  return array.map(el =>
    `<div> 
    <a href = "${el.largeImageURL}">    
        <img class="image" src="${el.webformatURL}" alt="${el.tags}" loading="lazy" /> 
        </a>
        <div class = "img-info">
          <p class="info-item">
            <b>Likes</b> ${el.likes}
          </p>
          <p class="info-item">
            <b>Views</b>
            ${el.views}
          </p>
          <p class="info-item">
            <b>Comments</b>
            ${el.comments}
          </p>
          <p class="info-item">
            <b>Downloads</b>
            ${el.downloads}
          </p>
        </div>
      </div>
      `
  ).join('')
}


window.addEventListener('scroll', showLoading);

async function showLoading() {
  try {
    const {
      scrollTop,
      scrollHeight,
      clientHeight
    } = document.documentElement;

    if (clientHeight + scrollTop >= scrollHeight - 5) {
      await new Promise(resolve => {
        setTimeout(loadMoreImages(resolve), 1000)
      })
      loading.classList.add('show');
    }
  } catch (error) {
    console.error(error);
  }
}