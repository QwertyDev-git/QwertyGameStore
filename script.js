const gameList = document.getElementById('gameList');
const searchInput = document.getElementById('searchInput');
const categoryButtons = document.querySelectorAll('.category-btn');
const modal = document.getElementById('modal');
const modalIcon = document.getElementById('modalIcon');
const modalTitle = document.getElementById('modalTitle');
const modalDesc = document.getElementById('modalDesc');
const modalDownload = document.getElementById('modalDownload');
const loader = document.getElementById('loader');

let allGames = [];
let activeCategory = 'All';

function fetchGames() {
  loader.classList.remove('hidden');
  fetch('https://gist.githubusercontent.com/QwertyDev-git/f93324787f47a096bd59d0d2b97e5b41/raw/games.txt?v=' + Date.now())
    .then(res => res.text())
    .then(data => {
      allGames = data.trim().split('\n').map(line => {
        const [title, desc, icon, category, link, preview] = line.split('|');
        return { title, desc, icon, category, link, preview};
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
    card.style.setProperty('--order', index);
    card.innerHTML = `
      <img src="${game.icon}" alt="${game.title}" />
      <div class="game-title">${game.title}</div>
      <div class="game-category">${game.category}</div>
    `;
    card.addEventListener('click', () => showModal(game));
    gameList.appendChild(card);
  });
}

function filterGames() {
  const keyword = searchInput.value.toLowerCase();
  const filtered = allGames.filter(game =>
    game.title.toLowerCase().includes(keyword) &&
    (activeCategory === 'All' || game.category === activeCategory)
  );
  renderGames(filtered);
}

function showModal(game) {
  modalIcon.src = game.icon;
  modalTitle.textContent = game.title;
  modalDesc.textContent = game.desc;
  if (game.link) {
    modalDownload.href = game.link;
    modalDownload.style.display = 'inline-block';
  } else {
    modalDownload.style.display = 'none';
  }
  if (game.preview) {
      modalPreview.src = game.preview;
      modalPreview.style.display = 'block';
  }else {
      modalPreview.src = '';
      modalPreview.style.display = 'none';
  }
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

modalPreview.addEventListener('click', () => {
  if (modalPreview.requestFullscreen) {
    modalPreview.requestFullscreen();
  } else if (modalPreview.webkitRequestFullscreen) { /* Safari */
    modalPreview.webkitRequestFullscreen();
  } else if (modalPreview.msRequestFullscreen) { /* IE11 */
    modalPreview.msRequestFullscreen();
  }
});
