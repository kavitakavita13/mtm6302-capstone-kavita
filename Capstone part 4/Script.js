document.addEventListener('DOMContentLoaded', () => {
    const apiUrl = 'https://pokeapi.co/api/v2/pokemon/';
    let offset = 0;
    const limit = 20;

    const pokemonList = document.getElementById('pokemon-list');
    const loadMoreBtn = document.getElementById('load-more');
    const searchInput = document.getElementById('search-input');
    const searchBtn = document.getElementById('search-btn');
    const modal = document.getElementById('pokemon-details');
    const caughtList = document.getElementById('caught-list');
    const caughtPokemon = JSON.parse(localStorage.getItem('caughtPokemon')) || [];
    let allPokemon = []; // To store all Pokémon data for search functionality.

    // Update Caught Pokémon List
    const updateCaughtList = () => {
        caughtList.innerHTML = '';
        caughtPokemon.forEach((name) => {
            const li = document.createElement('li');
            li.textContent = name;
            const releaseBtn = document.createElement('button');
            releaseBtn.textContent = 'Release';
            releaseBtn.addEventListener('click', () => releasePokemon(name));
            li.appendChild(releaseBtn);
            caughtList.appendChild(li);
        });
    };

    const releasePokemon = (name) => {
        const index = caughtPokemon.indexOf(name);
        if (index > -1) caughtPokemon.splice(index, 1);
        localStorage.setItem('caughtPokemon', JSON.stringify(caughtPokemon));
        updateCaughtList();
    };

    const fetchPokemon = async () => {
        try {
            const response = await fetch(`${apiUrl}?offset=${offset}&limit=${limit}`);
            const data = await response.json();
            displayPokemon(data.results);
        } catch (error) {
            console.error('Error fetching Pokémon:', error);
        }
    };

    const displayPokemon = async (pokemon) => {
        for (const p of pokemon) {
            const response = await fetch(p.url);
            const details = await response.json();
            allPokemon.push(details); // Store in allPokemon array for searching.

            const card = document.createElement('div');
            card.className = 'pokemon-card';
            card.innerHTML = `
                <img src="${details.sprites.front_default}" alt="${details.name}">
                <p>${details.name}</p>
            `;
            card.addEventListener('click', () => displayDetails(details));
            pokemonList.appendChild(card);
        }
    };

    const displayDetails = (details) => {
        modal.innerHTML = `
            <h2>${details.name}</h2>
            <img src="${details.sprites.other['official-artwork'].front_default}" alt="${details.name}">
            <p><strong>Height:</strong> ${details.height}</p>
            <p><strong>Weight:</strong> ${details.weight}</p>
            <button class="catch-btn">${caughtPokemon.includes(details.name) ? 'Release' : 'Catch'}</button>
            <button onclick="closeModal()">Close</button>
        `;
        modal.querySelector('.catch-btn').addEventListener('click', () => toggleCaught(details.name));
        modal.classList.add('active');
    };

    const toggleCaught = (name) => {
        if (caughtPokemon.includes(name)) {
            releasePokemon(name);
        } else {
            caughtPokemon.push(name);
            localStorage.setItem('caughtPokemon', JSON.stringify(caughtPokemon));
            updateCaughtList();
        }
        closeModal();
    };

    const closeModal = () => {
        modal.classList.remove('active');
    };

    const searchPokemon = () => {
        const query = searchInput.value.trim().toLowerCase();
        const filteredPokemon = allPokemon.filter((pokemon) =>
            pokemon.name.toLowerCase().includes(query)
        );

        pokemonList.innerHTML = ''; // Clear existing Pokémon cards.
        if (filteredPokemon.length) {
            filteredPokemon.forEach((pokemon) => {
                const card = document.createElement('div');
                card.className = 'pokemon-card';
                card.innerHTML = `
                    <img src="${pokemon.sprites.front_default}" alt="${pokemon.name}">
                    <p>${pokemon.name}</p>
                `;
                card.addEventListener('click', () => displayDetails(pokemon));
                pokemonList.appendChild(card);
            });
        } else {
            pokemonList.innerHTML = '<p>No Pokémon found.</p>';
        }
    };

    loadMoreBtn.addEventListener('click', () => {
        offset += limit;
        fetchPokemon();
    });

    searchBtn.addEventListener('click', searchPokemon);

    // Initial Load
    fetchPokemon();
    updateCaughtList();
});
