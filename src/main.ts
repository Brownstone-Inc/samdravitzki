import p5 from 'p5';
import './style.css'

document.querySelector<HTMLDivElement>('#app')!.innerHTML = `
  <div>
    <h1>dravitzki.com</h1>
    <div id="sketch"></div>
  </div>
`

/**
 * The % operator in Javascript is called the remainder operator and you can use this to create
 * a modulo operator. I was confused by this as I orignally thought that % was a modulo operation
 * as I was no aware there was a difference
 * 
 * More infomation can be found at https://stackoverflow.com/questions/4467539/javascript-modulo-gives-a-negative-result-for-negative-numbers
 */
function mod(n: number, m: number) {
  return ((n % m) + m) % m;
}

type Direction = 'north' | 'east' | 'south' | 'west';
type Position = { x: number, y: number };

class SnakeChunk {
  position: Position;

  constructor(position: Position) {
    this.position = position;
  }
}

function range(length: number) {
  return [...Array(length).keys()];
}

function randomInt(max: number, interval: number) {
  return Math.ceil(Math.floor(Math.random() * max) / interval) * interval;
}

function createSnake(length: number, start: Position) {
  return range(length).map((i) => new SnakeChunk({ x: start.x + i * 10, y: start.y }))
}

function randomPosition(boundsX: number, boundsY: number) {
  return { x: randomInt(boundsX, 10), y: randomInt(boundsY, 10)};
}

new p5(sketch => {
  const p = sketch as unknown as p5;

  const playBoundsX = 500;
  const playBoundsY = 500;
  
  let snake = createSnake(1, {x: 100, y: 100 })
  let slitheringDirection: Direction = 'south';

  let snackPosition: Position = randomPosition(playBoundsX, playBoundsY);


  p.setup = function setup() {
    p.createCanvas(playBoundsX, playBoundsY);

    setInterval(onSlitherInterval, 100);
  };

  p.draw = function draw() {
    p.background(0);
    p.fill(205);

    for (const chunk of snake) {
      p.rect(chunk.position.x, chunk.position.y, 10, 10);
    }

    p.fill(100, 200, 100);
    p.rect(snackPosition.x, snackPosition.y, 10, 10);

  };

  function onSlitherInterval() {
    const stepSize = 10;

    const [head] = snake;

    let nextHeadPosition: Position = { x: head.position.x, y: head.position.y };

    switch (slitheringDirection) {
      case 'north':
        nextHeadPosition.y = mod((nextHeadPosition.y - stepSize), playBoundsY);
        break;
      case 'east':
        nextHeadPosition.x = mod((nextHeadPosition.x + stepSize), playBoundsX);
        break;
      case 'south':
        nextHeadPosition.y = mod((nextHeadPosition.y + stepSize), playBoundsY);
        break;
      case 'west':
        nextHeadPosition.x = mod((nextHeadPosition.x - stepSize), playBoundsX);
        break;
    }

    const newHead = new SnakeChunk(nextHeadPosition);

    snake.unshift(newHead);

    if (newHead.position.x === snackPosition.x && newHead.position.y === snackPosition.y) {
      snackPosition = randomPosition(playBoundsX, playBoundsY);
    } else {
      snake.pop();
    }
  }

  p.keyPressed = function keyPressed() {
    switch (p.key) {
      case 'w':
        slitheringDirection = 'north';
        break;
      case 'd':
        slitheringDirection = 'east';
        break;
      case 's':
        slitheringDirection = 'south';
        break;
      case 'a':
        slitheringDirection = 'west';
        break;
    }
  }

}, document.getElementById('sketch')!)
