const gameList = document.getElementById('gameList');
const searchInput = document.getElementById('searchInput');
const categoryButtons = document.querySelectorAll('.category-btn');
const modal = document.getElementById('modal');
const modalIcon = document.getElementById('modalIcon');
const modalTitle = document.getElementById('modalTitle');
const modalDesc = document.getElementById('modalDesc');
const modalDownload = document.getElementById('modalDownload');
const loader = document.getElementById('loader');
const bookmarkToggle = document.getElementById('bookmarkToggle');

let bookmarkedGames = JSON.parse(localStorage.getItem('bookmarkedGames')) || [];

let allGames = [];
let activeCategory = 'All';

function fetchGames() {
  loader.classList.remove('hidden');
  fetch('https://gist.githubusercontent.com/QwertyDev-git/f93324787f47a096bd59d0d2b97e5b41/raw/games.txt?v=' + Date.now())
    .then(res => res.text())
    .then(data => {
      allGames = data.trim().split('\n').map(line => {
        const [title, desc, icon, category, link] = line.split('|');
        return { title, desc, icon, category, link};
      });
      renderGames(allGames);
    })
    .catch(err => {
      gameList.innerHTML = '<p>Failed to load games. Please try again later.</p>';
      console.error(err);
    })
    .finally(() => {
      loader.classList.add('hidden');
    });
}

function renderGames(games) {
  gameList.innerHTML = '';

  if (games.length === 0) {
    gameList.innerHTML = '<p style="text-align:center; font-weight:bold; grid-column: 1 / -1;">Game not found</p>';
    return;
  }

  games.forEach((game, index) => {
    const card = document.createElement('div');
    card.className = 'game-card';
    if (isBookmarked(game.title)){
        card.classList.add('bookmarked');
    }
    card.style.setProperty('--order', index);
    card.innerHTML = `
      <img src="${game.icon}" alt="${game.title}" />
      <div class="game-title">${game.title}</div>
      <div class="game-category">${game.category}</div>
    `;
    card.addEventListener('click', () => {
        card.classList.remove('pressed');
        void card.offsetWidth;
        card.classList.add('pressed');
        showModal(game)
    });
    gameList.appendChild(card);
  });
}

function filterGames() {
  const keyword = searchInput.value.toLowerCase();
  const activeCategories = activeCategory.split(',').map(c => c.trim());

  const filtered = allGames.filter(game => {
    const matchCategory = activeCategories.includes('All') ||
      (activeCategories.includes('Bookmarks') && isBookmarked(game.title)) ||
      activeCategories.includes(game.category);

    return game.title.toLowerCase().includes(keyword) && matchCategory;
  });

  renderGames(filtered);
}

function showModal(game) {
  modalIcon.src = game.icon;
  modalTitle.textContent = game.title;
  modalDesc.textContent = game.desc;

  modalDownload.href = game.link || '#';
  modalDownload.style.display = game.link ? 'inline-block' : 'none';

  // Update tombol bookmark
  bookmarkToggle.innerHTML = isBookmarked(game.title) ? '<i class="fas fa-bookmark"></i>' : '<i class="far fa-bookmark"></i>';
  bookmarkToggle.onclick = () => toggleBookmark(game.title);

  modal.classList.add('show');
  document.body.classList.add('modal-open');
}

function hideModal() {
  modal.classList.remove('show');
  document.body.classList.remove('modal-open');
}
searchInput.addEventListener('input', filterGames);

categoryButtons.forEach(btn => {
  btn.addEventListener('click', () => {
    activeCategory = btn.dataset.category;
    filterGames();
  });
});

modal.addEventListener('click', e => {
  if (e.target === modal) hideModal();
});

fetchGames();

document.querySelectorAll('.category-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    btn.classList.remove('pressed');
    void btn.offsetWidth; // force reflow untuk restart animasi
    btn.classList.add('pressed');
  });
});

const clearBtn = document.getElementById('clearSearch');
clearBtn.addEventListener('click', () => {
  searchInput.value = '';
  filterGames();
  searchInput.focus();
});

function toggleBookmark(title) {
  if (isBookmarked(title)) {
    bookmarkedGames = bookmarkedGames.filter(t => t !== title);
  } else {
    bookmarkedGames.push(title);
  }
  saveBookmarks();
  bookmarkToggle.innerHTML = isBookmarked(title) ? '<i class="fas fa-bookmark"></i>' : '<i class="far fa-bookmark"></i>';
  filterGames();
}

function saveBookmarks() {
  localStorage.setItem('bookmarkedGames', JSON.stringify(bookmarkedGames));
}

function isBookmarked(title) {
  return bookmarkedGames.includes(title);
}
