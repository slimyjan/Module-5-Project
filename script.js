// Replace with your TMDb API Key
const API_KEY = '2b4db841def91e19f8157c25d4c4b43d';
const BASE_URL = 'https://api.themoviedb.org/3';
const IMAGE_BASE_URL = 'https://image.tmdb.org/t/p/w500';

// DOM Element Selectors
const searchForm = document.getElementById('search-form');
const searchInput = document.getElementById('search-input');
const typeFilter = document.getElementById('type-filter');
const resultsContainer = document.getElementById('results-container');
const loadingSpinner = document.getElementById('loading-spinner');

// 1. Event Listener: Form Submission
searchForm.addEventListener('submit', (e) => {
  e.preventDefault();
  executeSearch();
});

// 2. Event Listener: Filter Selection Change
typeFilter.addEventListener('change', () => {
  const query = searchInput.value.trim();
  if (query) {
    executeSearch();
  }
});

// Main Search Controller
async function executeSearch() {
  const query = searchInput.value.trim();
  const selectedType = typeFilter.value || 'multi';

  if (!query) return;

  showSpinner(true);
  resultsContainer.innerHTML = '';

  try {
    const data = await fetchSearchResults(query, selectedType);
    
    if (data && data.results && data.results.length > 0) {
      displayResults(data.results);
    } else {
      resultsContainer.innerHTML = '<p class="no-results">No results found matching your query.</p>';
    }
  } catch (error) {
    console.error('Search error:', error);
    resultsContainer.innerHTML = '<p class="error-msg">Failed to load results. Please try again.</p>';
  } finally {
    showSpinner(false);
  }
}

// Fetch Logic for TMDb API
async function fetchSearchResults(query, type) {
  let endpointType = 'multi';
  if (type === 'movie') endpointType = 'movie';
  if (type === 'tv' || type === 'series') endpointType = 'tv';

  const url = `${BASE_URL}/search/${endpointType}?api_key=${API_KEY}&query=${encodeURIComponent(query)}&include_adult=false`;

  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`HTTP Error ${response.status}`);
  }
  return await response.json();
}

// Render Movie / TV Cards to DOM
function displayResults(items) {
  resultsContainer.innerHTML = '';

  items.forEach(item => {
    // Skip non-movie/TV entries (e.g. actors/people in multi-search)
    if (item.media_type && item.media_type === 'person') return;

    const title = item.title || item.name || 'Untitled';
    const releaseDate = item.release_date || item.first_air_date || 'Unknown Date';
    const mediaType = item.media_type ? item.media_type.toUpperCase() : '';
    
    const posterSrc = item.poster_path 
      ? `${IMAGE_BASE_URL}${item.poster_path}` 
      : 'https://via.placeholder.com/500x750?text=No+Poster+Available';

    const card = document.createElement('div');
    card.classList.add('movie-card');

    card.innerHTML = `
      <div class="poster-wrapper">
        <img src="${posterSrc}" alt="${title}" loading="lazy">
      </div>
      <div class="card-info">
        <h3>${title}</h3>
        <p class="release-date">${releaseDate.substring(0, 4)} ${mediaType ? `• ${mediaType}` : ''}</p>
        <p class="rating">⭐ ${item.vote_average ? item.vote_average.toFixed(1) : 'N/A'}</p>
      </div>
    `;

    resultsContainer.appendChild(card);
  });
}

// Toggle Spinner State
function showSpinner(isVisible) {
  if (!loadingSpinner) return;
  if (isVisible) {
    loadingSpinner.classList.remove('hidden');
  } else {
    loadingSpinner.classList.add('hidden');
  }
}