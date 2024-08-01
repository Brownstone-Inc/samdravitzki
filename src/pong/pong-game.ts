import p5 from 'p5';
import Bounds from '../Bounds/Bounds';
import Vector from '../Vector/Vector';
import Entity from '../ecs/Entity/Entity';
import World from '../ecs/World/World';
import { ScoreComponent, PrimitiveShape, Position, Velocity, Collider, BallComponent, PaddleComponent, PlayerComponent, AiComponent, BackboardComponent, Collision } from './components';
import { collisionLoggingSystem, collisionSystem } from './collision-system';


document.getElementById('pong-game')!.innerHTML = `
    <button id="exit-pong-button">❌</button>
    <div id="pong-sketch"></div>
`;

document.getElementById('exit-pong-button')?.addEventListener('click', () => {
    const snakeGame = document.getElementById('pong-game')!;
    const mainContent = document.getElementById('main-content')!;

    if (snakeGame.style.display === 'block') {
        snakeGame.style.display = 'none';
        mainContent.style.display = 'block';
    } else {
        snakeGame.style.display = 'block';
        mainContent.style.display = 'none';
    }
});

// It is already getting really difficult to manage all the logic so I want to introduce some design to make things easier to manange.
// To do this I am going to try using the ecs design pattern purely for the structure it provides
// Main resource: https://bevy-cheatbook.github.io/programming/ecs-intro.html





// Entities
const ball = new Entity();
const leftPaddle = new Entity();
const rightPaddle = new Entity();
const northWall = new Entity();
const southWall = new Entity();
const leftBackboard = new Entity();
const rightBackboard = new Entity();
const centerLine = new Entity();
const playerScore = new Entity();
const aiScore = new Entity();

const playerScoreComponent: ScoreComponent = {
    entityId: playerScore.id,
    name: 'score',
    value: 0,
}


const ballShape: PrimitiveShape = {
    entityId: ball.id,
    name: 'primitive',
    stroke: [240, 60, 100],
    strokeWeight: 2,
    fill: false,
    type: 'circle',
    radius: 5
};

const ballPosition: Position = {
    entityId: ball.id,
    name: 'position',
    position: new Vector(200, 40),
};

const ballVelocity: Velocity = {
    entityId: ball.id,
    name: 'velocity',
    velocity: new Vector(1, 0.15),
}

const ballCollider: Collider = {
    entityId: ball.id,
    name: 'collider',
    type: 'aabb',
    width: 10,
    height: 10
};

const ballComponent: BallComponent = {
    entityId: ball.id,
    name: 'ball',
}

const leftPaddleShape: PrimitiveShape = {
    entityId: leftPaddle.id,
    name: 'primitive',
    stroke: [240, 60, 100],
    strokeWeight: 4,
    fill: false,
    type: 'square',
    width: 5,
    height: 20
}

const leftPaddlePosition: Position = {
    entityId: leftPaddle.id,
    name: 'position',
    position: new Vector(10, 50),
}

const leftPaddleCollider: Collider = {
    entityId: leftPaddle.id,
    name: 'collider',
    type: 'aabb',
    width: 5,
    height: 20
};

const leftPaddleComponent: PaddleComponent = {
    entityId: leftPaddle.id,
    name: 'paddle',
}

const leftPaddlePlayerComponent: PlayerComponent = {
    entityId: leftPaddle.id,
    name: 'player',
}

const rightPaddleShape: PrimitiveShape = {
    entityId: rightPaddle.id,
    name: 'primitive',
    stroke: [240, 60, 100],
    strokeWeight: 4,
    fill: false,
    type: 'square',
    width: 5,
    height: 20
}

const rightPaddlePosition: Position = {
    entityId: rightPaddle.id,
    name: 'position',
    position: new Vector(490, 70),
}

const rightPaddleCollider: Collider = {
    entityId: rightPaddle.id,
    name: 'collider',
    type: 'aabb',
    width: 5,
    height: 20
};

const rightPaddleComponent: PaddleComponent = {
    entityId: rightPaddle.id,
    name: 'paddle',
}

const rightPaddleAiComponent: AiComponent = {
    entityId: rightPaddle.id,
    name: 'ai',
}

const northWallShape: PrimitiveShape = {
    entityId: northWall.id,
    name: 'primitive',
    stroke: [240, 60, 100],
    strokeWeight: 2,
    fill:  [240, 60, 100],
    type: 'square',
    width: 500,
    height: 10
};

const northWallPosition: Position = {
    entityId: northWall.id,
    name: 'position',
    position: new Vector(250, 5),
};

const northWallCollider: Collider = {
    entityId: northWall.id,
    name: 'collider',
    type: 'aabb',
    width: 500,
    height: 10
};

const southWallShape: PrimitiveShape = {
    entityId: southWall.id,
    name: 'primitive',
    stroke: [240, 60, 100],
    strokeWeight: 2,
    fill:  [240, 60, 100],
    type: 'square',
    width: 500,
    height: 10
};

const southWallPosition: Position = {
    entityId: southWall.id,
    name: 'position',
    position: new Vector(250, 245),
};

const southWallCollider: Collider = {
    entityId: southWall.id,
    name: 'collider',
    type: 'aabb',
    width: 500,
    height: 10
};

const centerLineShape: PrimitiveShape = {
    entityId: centerLine.id,
    name: 'primitive',
    stroke: [240, 60, 100],
    strokeWeight: 2,
    fill:  [240, 60, 100],
    type: 'line',
    start: new Vector(0, -125),
    end: new Vector(0, 125)
};

const centerLinePosition: Position = {
    entityId: centerLine.id,
    name: 'position',
    position: new Vector(250, 125),
};

const leftBackboardShape: PrimitiveShape = {
    entityId: leftBackboard.id,
    name: 'primitive',
    stroke: [352, 94, 100],
    strokeWeight: 2,
    fill:  [352, 94, 100],
    type: 'square',
    width: 5,
    height: 250
};

const leftBackboardPosition: Position = {
    entityId: leftBackboard.id,
    name: 'position',
    position: new Vector(2.5, 125),
};

const leftBackboardCollider: Collider = {
    entityId: leftBackboard.id,
    name: 'collider',
    type: 'aabb',
    width: 5,
    height: 230
};

const leftBackboardComponent: BackboardComponent = {
    entityId: leftBackboard.id,
    name: 'backboard',
    owner: 'player',
}

const rightBackboardShape: PrimitiveShape = {
    entityId: rightBackboard.id,
    name: 'primitive',
    stroke: [352, 94, 100],
    strokeWeight: 2,
    fill:  [352, 94, 100],
    type: 'square',
    width: 5,
    height: 250
};

const rightBackboardPosition: Position = {
    entityId: rightBackboard.id,
    name: 'position',
    position: new Vector(497.5, 125),
};

const rightBackboardCollider: Collider = {
    entityId: rightBackboard.id,
    name: 'collider',
    type: 'aabb',
    width: 5,
    height: 230
};

const rightBackboardComponent: BackboardComponent = {
    entityId: rightBackboard.id,
    name: 'backboard',
    owner: 'ai'
}



const playerScoreText: PrimitiveShape = {
    entityId: playerScore.id,
    name: 'primitive',
    stroke: [240, 60, 100],
    strokeWeight: 2,
    fill: [240, 60, 100],
    type: 'text',
    text: '0',
    align: 'right',
    size: 25,
}

const playerScorePosition: Position = {
    entityId: playerScore.id,
    name: 'position',
    position: new Vector(245, 35),
}

const aiScoreComponent: ScoreComponent = {
    entityId: aiScore.id,
    name: 'score',
    value: 0,
}

const aiScoreText: PrimitiveShape = {
    entityId: aiScore.id,
    name: 'primitive',
    stroke: [240, 60, 100],
    strokeWeight: 2,
    fill: [240, 60, 100],
    type: 'text',
    text: '0',
    align: 'left',
    size: 25,
}

const aiScorePosition: Position = {
    entityId: aiScore.id,
    name: 'position',
    position: new Vector(255, 35),
}



const world = new World();

world.addEntity(ball);
world.addComponent(ballShape);
world.addComponent(ballPosition);
world.addComponent(ballCollider);
world.addComponent(ballVelocity);
world.addComponent(ballComponent);

world.addEntity(leftPaddle);
world.addComponent(leftPaddleShape);
world.addComponent(leftPaddlePosition);
world.addComponent(leftPaddleCollider);
world.addComponent(leftPaddleComponent);
world.addComponent(leftPaddlePlayerComponent);

world.addEntity(rightPaddle);
world.addComponent(rightPaddleShape);
world.addComponent(rightPaddlePosition);
world.addComponent(rightPaddleCollider);
world.addComponent(rightPaddleComponent);
world.addComponent(rightPaddleAiComponent);

world.addEntity(northWall);
world.addComponent(northWallShape);
world.addComponent(northWallPosition);
world.addComponent(northWallCollider);

world.addEntity(southWall);
world.addComponent(southWallShape);
world.addComponent(southWallPosition);
world.addComponent(southWallCollider);

world.addEntity(centerLine);
world.addComponent(centerLinePosition);
world.addComponent(centerLineShape);

world.addEntity(leftBackboard);
world.addComponent(leftBackboardShape);
world.addComponent(leftBackboardPosition);
world.addComponent(leftBackboardCollider);
world.addComponent(leftBackboardComponent);

world.addEntity(rightBackboard);
world.addComponent(rightBackboardShape);
world.addComponent(rightBackboardPosition);
world.addComponent(rightBackboardCollider);
world.addComponent(rightBackboardComponent);

world.addEntity(playerScore);
world.addComponent(playerScoreComponent);
world.addComponent(playerScorePosition);
world.addComponent(playerScoreText);
world.addComponent({
    entityId: playerScore.id,
    name: 'player-score'
})

world.addEntity(aiScore);
world.addComponent(aiScoreComponent);
world.addComponent(aiScorePosition);
world.addComponent(aiScoreText);
world.addComponent({
    entityId: aiScore.id,
    name: 'ai-score'
})


world.addEntity(rightBackboard);

function ballCollisionHandlingSystem(world: World) {
    for (const res of world.query(['velocity', 'collision', 'ball']) as [Velocity, Collision, BallComponent][]) {

        const [ballV, ballCol] = res;
        if (ballCol.normal) {
            // From https://math.stackexchange.com/questions/13261/how-to-get-a-reflection-vector
            // I do not understand how this maths works
            ballV.velocity = ballV.velocity.reflect(ballCol.normal);
        }
    }
}

function backboardCollisionHandlingSystem(world: World) {
    for (const [backboard] of world.query(['backboard', 'collision']) as [BackboardComponent, Collision][]) {
        const [ballPosi] = world.query(['position', 'ball'])[0] as [Position, BallComponent];

        ballPosi.position = new Vector(200, 40);

        if (backboard.owner == 'player') {
            const [score, primitive] = world.query(['score', 'primitive', 'player-score'])[0] as [ScoreComponent, PrimitiveShape];
            score.value += 1;
            if (primitive.type === 'text') {
                primitive.text = String(score.value);
            }
        }

        if (backboard.owner == 'ai') {
            const [score, primitive] = world.query(['score', 'primitive', 'ai-score'])[0] as [ScoreComponent, PrimitiveShape];
            score.value += 1;
            if (primitive.type === 'text') {
                primitive.text = String(score.value);
            }
        }
    }
}

function aiPaddleSystem(world: World) {
    for (const [pos] of world.query(['position', 'paddle', 'ai']) as [Position][]) {
        const [ballPosi] = world.query(['position', 'ball'])[0] as [Position, BallComponent];

        pos.position = new Vector(pos.position.x, ballPosi.position.y)
    }
}

function ballMovementSystem(world: World) {
    const [ballVel, ballPos] = world.query(['velocity', 'position', 'ball'])[0] as [Velocity, Position, BallComponent];
    ballPos.position = ballPos.position.plus(ballVel.velocity);
}

/**
 * Remove all the collisions that exist in the world
 * 
 * Designed to be used to cleanup the collisions at the end of tick so that collisions
 * are not left over after they have completed
 * @param world 
 */
export function collisionCleanupSystem(world: World) {
    for (const [col] of world.query(['collision']) as [Collision][]) {
        world.removeComponent(col);
    }
}

type System = (world: World) => void;

/**
 * Built based bevy ecs api for rust https://bevy-cheatbook.github.io/programming/app-builder.html
 */
class App {
    private _world: World = new World();
    private _systems: System[] = [];

    private _element: HTMLElement;

    constructor(element: HTMLElement) {
        this._element = element;
    }

    setWorld(world: World): App {
        this._world = world;
        return this;
    }

    addSystem(system: System): App {
        this._systems.push(system);
        return this;
    }


    run() {
        const sys = this._systems;
        const wor = this._world;
        new p5(sketch => {
            const p = sketch as unknown as p5;
            const playBounds = Bounds.create(Vector.create(0, 0), Vector.create(500, 250));

            p.setup = function setup() {
                p.createCanvas(...playBounds.size);
                p.colorMode(p.HSB, 360, 100, 100, 100);
                p.noStroke();
                p.rectMode(p.CENTER);
            }

            p.draw = function draw() {
                p.background(240, 90, 60);

                sys.forEach((system) => system(wor));

                // Move player paddle system
                for (const [pos] of world.query(['position', 'paddle', 'player']) as [Position][]) {
                    pos.position = new Vector(pos.position.x, p.mouseY)
                }

                // Render system
                for (const [position, primitive] of world.query(['position', 'primitive']) as [Position, PrimitiveShape][]) {
                    p.strokeWeight(primitive.strokeWeight);
                    p.stroke(primitive.stroke)

                    if (!primitive.fill) {
                        p.noFill()
                    } else {
                        p.fill(primitive.fill)
                    }

                    if (primitive.type === 'circle') {
                        p.circle(position.position.x, position.position.y, primitive.radius * 2);
                    }

                    if (primitive.type === 'line') {
                        p.line(
                            primitive.start.x + position.position.x, primitive.start.y + position.position.y,
                            primitive.end.x + position.position.x, primitive.end.y + position.position.y
                        )
                    }

                    if (primitive.type === 'square') {
                        p.rect(position.position.x, position.position.y, primitive.width, primitive.height)
                    }

                    if (primitive.type === 'text') {
                        p.textSize(primitive.size);

                        if (primitive.align === 'left') p.textAlign(p.LEFT);
                        if (primitive.align === 'right') p.textAlign(p.RIGHT);

                        p.text(primitive.text, position.position.x, position.position.y);
                    }
                }

                // Collider rendering system
                for (const [col, pos] of world.query(['collider', 'position']) as [Collider, Position][]) {
                    if (col.type === 'aabb') {
                        p.stroke(111, 100, 100);
                        p.strokeWeight(0.5)
                        p.noFill()
                        p.rect(pos.position.x, pos.position.y, col.width, col.height);
                    }
                }
            }
        }, this._element);
    }
}

new App(document.getElementById('pong-sketch')!)
    .setWorld(world)
    .addSystem(collisionSystem)
    .addSystem(collisionLoggingSystem)
    .addSystem(ballCollisionHandlingSystem)
    .addSystem(backboardCollisionHandlingSystem)
    .addSystem(aiPaddleSystem)
    .addSystem(ballMovementSystem)
    .addSystem(collisionCleanupSystem)
    .run()
