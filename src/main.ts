import './style.css'

document.querySelector<HTMLDivElement>('#app')!.innerHTML = `
  <div>
    <div id="main-content">
      <h1>dravitzki.com</h1>
      <button id="snake-button">🐍</button>
      <button id="pong-button">🎾</button>
    </div>
    <div id="snake-game" style="display:none;"></div>
    <div id="pong-game"></div>
  </div>
`

import('./snake/snake-game');
import('./pong/pong-game');

document.getElementById('snake-button')?.addEventListener('click', () => {
  const snakeGame = document.getElementById('snake-game')!;
  const mainContent = document.getElementById('main-content')!;

  if (snakeGame.style.display === 'block') {
    snakeGame.style.display = 'none';
    mainContent.style.display = 'block';
  } else {
    snakeGame.style.display = 'block';
    mainContent.style.display = 'none';
  }
});

document.getElementById('pong-button')?.addEventListener('click', () => {
  const pongGame = document.getElementById('pong-game')!;
  const mainContent = document.getElementById('main-content')!;

  if (pongGame.style.display === 'block') {
    pongGame.style.display = 'none';
    mainContent.style.display = 'block';
  } else {
    pongGame.style.display = 'block';
    mainContent.style.display = 'none';
  }
});


