// Select DOM elements
const pokemonList = document.getElementById('pokemon-list');
const loadMoreButton = document.getElementById('load-more');
const pokemonDetailModal = document.getElementById('pokemon-detail-modal');
const pokemonNameElement = document.getElementById('pokemon-name');
const pokemonImage = document.getElementById('pokemon-image');
const pokemonDescription = document.getElementById('pokemon-description');
const catchButton = document.getElementById('catch-button');
const releaseButton = document.getElementById('release-button');
const closeModalButton = document.querySelector('.close');

// API URL for fetching Pokémon data
const baseUrl = 'https://pokeapi.co/api/v2/pokemon/';
let offset = 0;  // Starting point for pagination
const limit = 20; // Number of Pokémon to fetch per request

// Load the first set of Pokémon
async function loadPokemons() {
    const response = await fetch(`${baseUrl}?offset=${offset}&limit=${limit}`);
    const data = await response.json();
    displayPokemons(data.results);
    offset += limit;
}

// Display Pokémon thumbnails and names
function displayPokemons(pokemons) {
    pokemons.forEach(pokemon => {
        const pokemonCard = document.createElement('div');
        pokemonCard.classList.add('pokemon-card');
        
        const pokemonThumbnail = document.createElement('img');
        pokemonThumbnail.classList.add('pokemon-thumbnail');
        pokemonThumbnail.src = `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${pokemon.url.split('/')[6]}.png`;
        pokemonThumbnail.alt = pokemon.name;
        pokemonThumbnail.addEventListener('click', () => showPokemonDetail(pokemon.name));
        
        const pokemonName = document.createElement('p');
        pokemonName.classList.add('pokemon-name');
        pokemonName.textContent = pokemon.name;
        
        pokemonCard.appendChild(pokemonThumbnail);
        pokemonCard.appendChild(pokemonName);
        
        pokemonList.appendChild(pokemonCard);
    });
}

// Show Pokémon details in the modal
async function showPokemonDetail(pokemonName) {
    const response = await fetch(`${baseUrl}${pokemonName}`);
    const data = await response.json();
    
    pokemonNameElement.innerText = data.name;
    pokemonImage.src = data.sprites.other['official-artwork'].front_default;
    pokemonDescription.innerText = `Height: ${data.height}, Weight: ${data.weight}`;

    pokemonDetailModal.style.display = 'flex';
    
    // Check if the Pokémon is already caught
    const caughtPokemons = JSON.parse(localStorage.getItem('caughtPokemons')) || [];
    const isCaught = caughtPokemons.some(pokemon => pokemon.name === data.name);

    // Show or hide the "Catch" and "Release" buttons based on whether the Pokémon is caught
    if (isCaught) {
        catchButton.style.display = 'none';
        releaseButton.style.display = 'inline-block'; // Show the "Release" button
    } else {
        catchButton.style.display = 'inline-block';
        releaseButton.style.display = 'none'; // Hide the "Release" button
    }

    // Handle "catch" button
    catchButton.addEventListener('click', () => catchPokemon(data));

    // Handle "release" button
    releaseButton.addEventListener('click', () => releasePokemon(data));
}

// Mark Pokémon as caught and store in local storage
function catchPokemon(pokemon) {
    let caughtPokemons = JSON.parse(localStorage.getItem('caughtPokemons')) || [];
    caughtPokemons.push(pokemon);
    localStorage.setItem('caughtPokemons', JSON.stringify(caughtPokemons));

    // Hide "Catch" button and show "Release" button
    catchButton.style.display = 'none';
    releaseButton.style.display = 'inline-block';
}

// Release or remove a Pokémon from the caught list
function releasePokemon(pokemon) {
    let caughtPokemons = JSON.parse(localStorage.getItem('caughtPokemons')) || [];
    caughtPokemons = caughtPokemons.filter(caughtPokemon => caughtPokemon.name !== pokemon.name);
    localStorage.setItem('caughtPokemons', JSON.stringify(caughtPokemons));

    // Hide "Release" button and show "Catch" button again
    releaseButton.style.display = 'none';
    catchButton.style.display = 'inline-block';
}

// Close the modal
function closeModal() {
    pokemonDetailModal.style.display = 'none';
}

// Load more Pokémon on button click
loadMoreButton.addEventListener('click', loadPokemons);

// Close the modal when the "close" button is clicked
closeModalButton.addEventListener('click', closeModal);

// Initialize the app
loadPokemons();
