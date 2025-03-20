document.addEventListener('DOMContentLoaded', () => {
    let currentWatchlist = localStorage.getItem('watchlist')?.split(',') || []
    const searchInput = document.querySelector('.header__search-input')
    const searchBtn = document.querySelector('.header__search-btn')
    const messageContainer = document.querySelector('.main__message')
    const moviesList = document.querySelector('.movies')
    const watchlistEl = document.querySelector('.watchlist')
    const loader = document.querySelector('.loader')

    document.addEventListener('click', async (e) => {
        if (e.target === searchBtn) {
            if (searchInput.value) {
                const movieTitle = searchInput.value
                    .toLowerCase()
                    .split(' ')
                    .join('-')

                const response = await fetch(
                    `https://www.omdbapi.com/?s=${movieTitle}&apikey=686d9997`
                )

                const data = await response.json()

                if (data.Search) {
                    messageContainer.style.display = 'none'

                    renderMovies(data.Search, moviesList)
                } else {
                    messageContainer.style.display = 'block'
                    messageContainer.innerHTML = `<p class="main__message-text">Unable to find what you’re looking for. Please try another search.</p>`

                    moviesList.style.display = 'none'
                }
            }
        } else if (
            e.target.classList.contains('movies__item-btn') ||
            e.target.classList.contains('movies__item-btn-icon') ||
            e.target.classList.contains('movies__item-btn-text')
        ) {
            // Add or remove movie from watchlist
            const button = e.target.closest('.movies__item-btn')
            const buttonText = button.querySelector('.movies__item-btn-text')
            const plusIcon = button.querySelector('.movies__plus-icon')
            const minusIcon = button.querySelector('.movies__minus-icon')

            const movieId = button.dataset.id

            // Change icons and button text
            if (buttonText.textContent === 'Watchlist') {
                plusIcon.style.display = 'none'
                minusIcon.style.display = 'block'
                buttonText.textContent = 'Remove'

                // Add movie id to localStorage
                currentWatchlist.push(movieId)
                localStorage.setItem('watchlist', currentWatchlist)
            } else {
                plusIcon.style.display = 'block'
                minusIcon.style.display = 'none'
                buttonText.textContent = 'Watchlist'

                // Remove movie from localStorage
                currentWatchlist = currentWatchlist.filter(
                    (id) => id != movieId
                )

                if (watchlistEl) {
                    if (currentWatchlist.length === 0) {
                        localStorage.removeItem('watchlist')
                        messageContainer.style.display = 'block'
                    } else {
                        localStorage.setItem('watchlist', currentWatchlist)
                    }
                    renderMovies(currentWatchlist, watchlistEl)
                }
            }
        }
    })

    // Render watchlist movies
    if (watchlistEl) {
        if (currentWatchlist.length !== 0) {
            messageContainer.style.display = 'none'
            renderMovies(currentWatchlist, watchlistEl)
        }
    }

    async function renderMovies(arr, container) {
        container.style.display = 'none'
        loader.style.display = 'block'

        let listHtml = ''

        for (let item of arr) {
            const response = await fetch(
                `https://www.omdbapi.com/?i=${
                    watchlistEl ? item : item.imdbID
                }&apikey=686d9997`
            )

            const movie = await response.json()

            const { Poster, Title, imdbRating, Runtime, Genre, Plot, imdbID } =
                movie

            // Check if movie already in watchlist
            const isExists = currentWatchlist.includes(imdbID)

            listHtml += `
                <li class="movies__item">
                    <div class="movies__item-cover">
                        <img class="movies__item-img" src="${Poster}" alt="${Title}" />
                    </div>
                    <div class="movies__item-content">
                        <div class="movies__item-head">
                            <p class="movies__item-title">${Title}</p>
                            <img class="movies__item-star" src="./images/star-icon.svg" alt="star icon" />
                            <span class="movies__item-rate">${imdbRating}</span>
                        </div>
                        <div class="movies__item-info">
                            <span class="movies__item-duration">${Runtime}</span>
                            <span class="movies__item-genres">${Genre}</span>
                            <button class="movies__item-btn" data-id=${imdbID}>
                                <img class="movies__item-btn-icon movies__plus-icon" style="display: ${
                                    isExists ? 'none' : 'block'
                                };" src="./images/plus-icon.svg" alt="plus icon" />
                                <img class="movies__item-btn-icon movies__minus-icon" style="display: ${
                                    isExists ? 'block' : 'none'
                                };" src="./images/minus-icon.svg" alt="minus icon" />
                                <p class="movies__item-btn-text">${
                                    isExists ? 'Remove' : 'Watchlist'
                                }</p>
                            </button>
                        </div>
                        <p class="movies__item-desc">
                            ${Plot}
                        </p>
                        <button class="read-more">Read more</button>
                    </div>
                </li>
                `
        }

        container.innerHTML = listHtml
        container.style.display = 'block'

        loader.style.display = 'none'
    }

    // Large text expand logic
    const descContainers = document.querySelectorAll('.movies__item-desc')

    if (descContainers) {
        descContainers.forEach((container) => {
            const parent = container.closest('.movies__item-content')
            const readMoreBtn = parent.querySelector('.read-more')

            const lineHeight = parseFloat(
                window.getComputedStyle(container).lineHeight
            )
            const maxHeight = lineHeight * 3

            if (container.scrollHeight > maxHeight) {
                readMoreBtn.style.display = 'block'

                readMoreBtn.addEventListener('click', () => {
                    if (container.classList.contains('expanded')) {
                        container.classList.remove('expanded')
                        container.style.display = '-webkit-box'
                        readMoreBtn.textContent = 'Read More'
                    } else {
                        container.classList.add('expanded')
                        container.style.display = 'block'
                        readMoreBtn.textContent = 'Read Less'
                    }
                })
            }
        })
    }

    // localStorage.clear()
})
