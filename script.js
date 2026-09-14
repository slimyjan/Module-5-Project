// Replace with your TMDb API Key or Bearer Token
const API_KEY = '2b4db841def91e19f8157c25d4c4b43d';
const BASE_URL = 'https://api.themoviedb.org/3';
const IMAGE_BASE_URL = 'https://image.tmdb.org/t/p/w500';

// DOM Element Selectors
const searchForm = document.getElementById('search-form');
const searchInput = document.getElementById('search-input');
const typeFilter = document.getElementById('type-filter');
const resultsContainer = document.getElementById('results-container');
const loadingSpinner = document.getElementById('loading-spinner');

// Handle Form Submission
searchForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  
  const query = searchInput.value.trim();
  const selectedType = typeFilter.value; // 'multi', 'movie', or 'tv'

  if (!query) return;

  showSpinner(true);
  resultsContainer.innerHTML = '';

  try {
    const data = await fetchSearchResults(query, selectedType);
    displayResults(data.results);
  } catch (error) {
    console.error('Fetch error:', error);
    resultsContainer.innerHTML = `<p class="error-msg">Failed to load results. Please try again.</p>`;
  } finally {
    showSpinner(false);
  }
});

// Fetch Data from TMDb API
async function fetchSearchResults(query, type) {
  // 1. Sanitize the filter input to match valid TMDb endpoints
  let endpointType = 'movie'; // Default fallback

  if (type === 'tv' || type === 'series') {
    endpointType = 'tv';
  } else if (type === 'multi') {
    endpointType = 'multi';
  } else if (type === 'movie') {
    endpointType = 'movie';
  }

  const url = `${BASE_URL}/search/${endpointType}?api_key=${API_KEY}&query=${encodeURIComponent(query)}&include_adult=false`;

  console.log('Requesting URL:', url);

  const response = await fetch(url);
  
  if (!response.ok) {
    throw new Error(`HTTP Error ${response.status}: Failed to fetch from ${url}`);
  }

  return await response.json();
}
// Render Movie / TV Cards to DOM
function displayResults(items) {
  if (!items || items.length === 0) {
    resultsContainer.innerHTML = '<p class="no-results">No titles found matching your query.</p>';
    return;
  }

  items.forEach(item => {
    // Handle differences between Movies and TV shows in TMDb response payloads
    const title = item.title || item.name || 'Untitled';
    const releaseDate = item.release_date || item.first_air_date || 'Unknown Date';
    const mediaType = item.media_type ? item.media_type.toUpperCase() : '';
    
    // Construct Poster Image URL (or fallback placeholder if missing)
    const posterSrc = item.poster_path 
      ? `${IMAGE_BASE_URL}${item.poster_path}` 
      : 'https://via.placeholder.com/500x750?text=No+Poster+Available';

    // Create Card Container Element
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
  if (isVisible) {
    loadingSpinner.classList.remove('hidden');
  } else {
    loadingSpinner.classList.add('hidden');
  }
}