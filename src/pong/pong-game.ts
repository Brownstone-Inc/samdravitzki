import p5 from "p5";
import Vector from "../Vector/Vector";
import World from "../ecs/World/World";
import {
  PrimitiveShape,
  Position,
  Velocity,
  BallComponent,
  BackboardComponent,
  Collision,
  Speed,
  PaddleComponent,
  TrajectoryLineSegmentComponent,
  Collider,
} from "./components";
import collisionSystem, {
  collisionCleanupSystem,
  collisionLoggingSystem,
} from "./collision/collision-system";
import castRay from "./collision/cast-ray";
import { EngineBuilder } from "./Engine";
import createBundle from "../ecs/Bundle/createBundle";
import minionBongUrl from "./sounds/minion-bong.mp3";
import setupBoundaries from "./setup-boundaries";
import setupBall from "./setup-ball";
import setupPaddles from "./setup-paddles";
import setupScoreboard from "./setup-scoreboard";
import { MousePosition } from "../ecs/System/System";
import State from "../ecs/State/State";
import Component from "../ecs/Component/Component";

/**
 * The main states of the applicaton
 */
type ApplicationState = "paused" | "main-menu" | "in-game" | "end";

const engine = EngineBuilder.create()
  .state("render-trajectory", false)
  .state<"score", [number, number]>("score", [0, 0])
  .state<"app-state", ApplicationState>("app-state", "main-menu")
  .build(document.getElementById("pong-sketch")!);

const ballHitAudio = new Audio(minionBongUrl);

const sound = false;

engine.system(
  "createGameMenu",
  {
    event: "start",
  },
  (_world, { p }, state) => {
    // Need to figure out how to remove having to request state from a map like this
    const appState = state["app-state"];
    const renderTrajectory = state["render-trajectory"];

    const gameMenu = p.createDiv();
    gameMenu.position(0, 250, "absolute");
    gameMenu.id("game-menu");

    const pauseButton = p.createButton("pause");
    pauseButton.parent(gameMenu);

    pauseButton.mousePressed(() => {
      if (appState.value === "in-game") {
        appState.setValue("paused");
        return;
      }

      if (appState.value === "paused") {
        appState.setValue("in-game");
        return;
      }
    });

    const trajectoryButton = p.createButton("trajectory");
    trajectoryButton.parent(gameMenu);

    trajectoryButton.mousePressed(() => {
      renderTrajectory.setValue(!renderTrajectory.value);
    });

    gameMenu.hide();
  }
);

engine.system(
  "showGameMenu",
  {
    state: "app-state",
    value: "in-game",
    trigger: "on-enter",
  },
  (_world, { p }, state) => {
    const gameMenu = p.select("#game-menu");
    gameMenu?.show();
  }
);

engine.system(
  "hideGameMenu",
  {
    state: "app-state",
    value: "main-menu",
    trigger: "on-enter",
  },
  (_world, { p }) => {
    const gameMenu = p.select("#game-menu");
    gameMenu?.hide();
  }
);

engine.system(
  "endConditionSystem",
  {
    state: "app-state",
    value: "in-game",
  },
  (_world, { p }, state) => {
    const [playerScore, aiScore] = state.score.value;

    if (playerScore >= 3 || aiScore >= 3) {
      state["app-state"].setValue("end");
    }
  }
);

engine.system("createEndMenu", { event: "start" }, (world, { p }, state) => {
  const appState = state["app-state"];
  const [playerScore, aiScore] = state.score.value;

  const winningMessage = "You won, Nice! 🔥";
  const loosingMessage = "You lost, to an ai 😔";

  const endMenu = p.createDiv(`
    <p>${playerScore > aiScore ? winningMessage : loosingMessage}</p>
  `);
  endMenu.position(0, 0, "absolute");
  endMenu.size(500, 250);
  endMenu.style("display", "flex");
  endMenu.style("flex-direction", "column");
  endMenu.style("place-content", "center");
  endMenu.style("align-items", "center");
  endMenu.style("color", "white");
  endMenu.id("end-menu");

  const resetButton = p.createButton("Okay, thanks for the game I guess...");
  resetButton.parent(endMenu);
  resetButton.mousePressed(() => {
    appState.setValue("main-menu");
    state.score.setValue([0, 0]);
  });

  // Hide menu by default and show when needed so it can be treated like a resueable component
  endMenu.hide();
});

engine.system(
  "showEndMenu",
  {
    state: "app-state",
    value: "end",
    trigger: "on-enter",
  },
  (_world, { p }, state) => {
    const endMenu = p.select("#end-menu");
    endMenu?.show();
  }
);

engine.system(
  "hideEndMenu",
  {
    state: "app-state",
    value: "end",
    trigger: "on-exit",
  },
  (_world, { p }) => {
    const endMenu = p.select("#end-menu");
    endMenu?.hide();
  }
);

engine.system("createMainMenu", { event: "start" }, (_world, { p }, state) => {
  const appState = state["app-state"];

  const mainMenu = p.createDiv();
  mainMenu.position(0, 0, "absolute");
  mainMenu.size(500, 250);
  mainMenu.style("display", "flex");
  mainMenu.style("place-content", "center");
  mainMenu.style("align-items", "center");
  mainMenu.id("main-menu");

  const startGameButton = p.createButton("Start a game!");
  startGameButton.parent(mainMenu);
  startGameButton.mousePressed(() => {
    appState.setValue("in-game");
  });

  // Hide menu by default and show when needed so it can be treated like a resueable component
  mainMenu.hide();
});

engine.system(
  "showMainMenu",
  {
    state: "app-state",
    value: "main-menu",
    trigger: "on-enter",
  },
  (_world, { p }) => {
    const mainMenu = p.select("#main-menu");
    mainMenu?.show();
  }
);

engine.system(
  "hideMainMenu",
  {
    state: "app-state",
    value: "in-game",
    trigger: "on-enter",
  },
  (_world, { p }) => {
    const mainMenu = p.select("#main-menu");
    mainMenu?.hide();
  }
);

// Need a way to factor out and organise these systems and state as they're already getting hard to manage

engine.system("setupBall", { event: "start" }, setupBall);
engine.system("setupPaddles", { event: "start" }, setupPaddles);
engine.system("setupBoundaries", { event: "start" }, setupBoundaries);
engine.system("setupScoreboard", { event: "start" }, setupScoreboard);
// engine.system(
//   "collisionRender",
//   { event: "update" },

//   function collisionRenderSystem(world: World, { p }: { p: p5 }) {
//     for (const [col, pos] of world.query(["collider", "position"]) as [
//       Collider,
//       Position,
//     ][]) {
//       if (col.type === "aabb") {
//         p.stroke(111, 100, 100);
//         p.strokeWeight(0.5);
//         p.noFill();
//         p.rect(pos.position.x, pos.position.y, col.width, col.height);
//       }
//     }
//   }
// );
engine.system(
  "renderSystem",
  { event: "update" },
  function renderSystem(world: World, { p }: { p: p5 }) {
    for (const [position, primitive] of world.query<[Position, PrimitiveShape]>(
      ["position", "primitive"]
    )) {
      if (!primitive.strokeWeight) {
        p.strokeWeight(0);
      } else {
        p.strokeWeight(primitive.strokeWeight);
      }

      if (!primitive.stroke) {
        p.noStroke();
      } else {
        p.stroke(primitive.stroke);
      }

      if (!primitive.fill) {
        p.noFill();
      } else {
        p.fill(primitive.fill);
      }

      if (primitive.type === "circle") {
        p.circle(
          position.position.x,
          position.position.y,
          primitive.radius * 2
        );
      }

      if (primitive.type === "line") {
        if (primitive.dash) {
          p.drawingContext.setLineDash(primitive.dash);
        }

        if (primitive.dashOffset) {
          p.drawingContext.lineDashOffset = primitive.dashOffset;
        }

        p.line(
          primitive.start.x + position.position.x,
          primitive.start.y + position.position.y,
          primitive.end.x + position.position.x,
          primitive.end.y + position.position.y
        );

        if (primitive.dash) {
          p.drawingContext.setLineDash([]);
        }

        if (primitive.dashOffset) {
          p.drawingContext.lineDashOffset = 0.0;
        }
      }

      if (primitive.type === "square") {
        p.rect(
          position.position.x,
          position.position.y,
          primitive.width,
          primitive.height
        );
      }

      if (primitive.type === "text") {
        p.textSize(primitive.size);

        if (primitive.align === "left") p.textAlign(p.LEFT);
        if (primitive.align === "right") p.textAlign(p.RIGHT);

        p.text(primitive.text, position.position.x, position.position.y);
      }
    }
  }
);
engine.system(
  "collisionSystem",
  { state: "app-state", value: "in-game" },
  collisionSystem
);
engine.system(
  "collisionLoggingSystem",
  { state: "app-state", value: "in-game" },
  collisionLoggingSystem
);
engine.system(
  "ballCollisionHandlingSystem",
  { state: "app-state", value: "in-game" },
  function ballCollisionHandlingSystem(world: World) {
    for (const [velocity, collision, position] of world.query<
      [Velocity, Collision, Position, BallComponent]
    >(["velocity", "collision", "position", "ball"])) {
      const collidee = world.entity(collision.entityId);

      velocity.velocity = velocity.velocity.reflect(collision.normal);

      if (collidee.components.find((c) => c.name === "paddle")) {
        const paddlePosition = collidee.getComponent("position") as Position;

        const yDistanceFromPaddleCenter = paddlePosition.position.minus(
          position.position
        ).y;

        velocity.velocity = Vector.create(
          velocity.velocity.x,
          -yDistanceFromPaddleCenter / 25
        );
      }
    }
  }
);

engine.system(
  "backboardCollisionHandlingSystem",
  { state: "app-state", value: "in-game" },
  (world: World, {}, state) => {
    for (const [backboard] of world.query<[BackboardComponent, Collision]>([
      "backboard",
      "collision",
    ])) {
      const [ballPosition, ballVelocity, ballSpeed] = world.query<
        [Position, Velocity, Speed, BallComponent]
      >(["position", "velocity", "speed", "ball"])[0];

      // Reset ball position
      ballPosition.position = Vector.create(200, 40);

      const [playerScore, aiScore] = state.score.value;

      if (backboard.owner == "player") {
        state.score.setValue([playerScore + 1, aiScore]);
        // Reset ball directed towards player
        ballVelocity.velocity = new Vector(-0.5, -0.5);
      }

      if (backboard.owner == "ai") {
        state.score.setValue([playerScore, aiScore + 1]);

        // Reset ball directed towards ai
        ballVelocity.velocity = new Vector(0.5, -0.5);
      }

      // Reset ball speed
      ballSpeed.value = 3;
    }
  }
);

engine.system(
  "updateScoreBoard",
  { event: "update" },
  (world: World, {}, state) => {
    const [playerScore, aiScore] = state.score.value;

    const [playerScoreText] = world.query<[PrimitiveShape]>([
      "primitive",
      "player-score",
    ])[0];

    // Its pretty weird the type has to be narrowed after you receive it from a query
    // Seems like the query should be responsible for this
    if (playerScoreText.type === "text") {
      playerScoreText.text = playerScore.toString();
    }

    const [aiScoreText] = world.query<[PrimitiveShape]>([
      "primitive",
      "ai-score",
    ])[0];

    if (aiScoreText.type === "text") {
      aiScoreText.text = aiScore.toString();
    }
  }
);

// Describes bow the collision handling worked in the orginial pong game
// https://www.vbforums.com/showthread.php?634246-RESOLVED-How-did-collision-in-the-original-Pong-happen
engine.system(
  "paddleCollisionHandlingSystem",
  { state: "app-state", value: "in-game" },
  function paddleCollisionHandlingSystem(world: World) {
    const [, ballSpeed] = world.query<[Velocity, Speed, BallComponent]>([
      "velocity",
      "speed",
      "ball",
    ])[0];

    for (const [collision] of world.query<[Collision, PaddleComponent]>([
      "collision",
      "paddle",
    ])) {
      if (
        world
          .entity(collision.entityId)
          .components.find((c) => c.name === "ball")
      ) {
        ballSpeed.value += ballSpeed.value * 0.1;
      }

      if (sound) {
        ballHitAudio.play();
      }
    }
  }
);
engine.system(
  "playerPaddleSystem",
  { state: "app-state", value: "in-game" },

  function playerPaddleSystem(
    world: World,
    { mousePosition }: { mousePosition: MousePosition }
  ) {
    for (const [position] of world.query<[Position]>([
      "position",
      "paddle",
      "player",
    ])) {
      const positionChange = mousePosition.y - position.position.y;
      position.position = position.position.plus(
        Vector.create(0, positionChange)
      );

      if (position.position.y < 40) {
        position.position = Vector.create(position.position.x, 40);
      }

      if (position.position.y > 210) {
        position.position = Vector.create(position.position.x, 210);
      }
    }
  }
);
engine.system(
  "aiPaddleSystem",
  { state: "app-state", value: "in-game" },

  function aiPaddleSystem(world: World) {
    const [targetPosition] = world.query<[Position]>([
      "position",
      "ai-paddle-target",
    ])[0];
    for (const [position, speed] of world.query<[Position, Speed]>([
      "position",
      "speed",
      "paddle",
      "ai",
    ])) {
      // Cant just move it to where the ball is, need to move it to where the ball is going to be when it hits on the ai side
      position.position = position.position.plus(
        Vector.create(
          0,
          (targetPosition.position.y - position.position.y) * speed.value
        )
      );

      if (position.position.y < 40) {
        position.position = Vector.create(position.position.x, 40);
      }

      if (position.position.y > 210) {
        position.position = Vector.create(position.position.x, 210);
      }
    }
  }
);
engine.system(
  "ballMovementSystem",
  { state: "app-state", value: "in-game" },
  function ballMovementSystem(world: World) {
    const [velocity, position, speed] = world.query<
      [Velocity, Position, Speed, BallComponent]
    >(["velocity", "position", "speed", "ball"])[0];

    position.position = position.position.plus(
      velocity.velocity.times(speed.value)
    );
  }
);

engine.system(
  "ballTrajectorySystem",
  { state: "app-state", value: "in-game" },
  (world: World, {}, state: Record<string, State<unknown>>) => {
    const renderTrajectory = state["render-trajectory"];
    const [targetPosition] = world.query<[Position]>([
      "position",
      "ai-paddle-target",
    ])[0];

    const [ballPosition, ballVelocity] = world.query<
      [Position, Velocity, BallComponent]
    >(["position", "velocity", "ball"])[0];

    for (const [entityId] of world.query<
      [string, TrajectoryLineSegmentComponent]
    >(["entity-id", "trajectory-line"])) {
      world.removeEntity(entityId);
    }

    const bounces = 20;
    let linesAdded = 0;

    // Start the ray a little back from the start of the center of the ball to mitigate issues with tunneling
    let start = ballPosition.position.minus(
      ballVelocity.velocity.normalised().times(10)
    );
    let direction = ballVelocity.velocity;

    // render trajectory line of each collision
    while (linesAdded < bounces) {
      const hit = castRay(
        world,
        {
          position: start,
          direction,
          length: 1000,
        },
        { layer: "wall" }
      )[0];

      if (!hit) {
        break;
      }

      const end = hit.position;

      const trajectoryLineComponents: (string | Component)[] = [
        "trajectory-line",
        {
          name: "position",
          position: start,
        } as Position,
      ];

      if (renderTrajectory.value) {
        trajectoryLineComponents.push({
          name: "primitive",
          stroke: [240, 60, 100],
          dash: linesAdded === 0 ? 0 : [5, 5],
          strokeWeight: 2,
          type: "line",
          start: Vector.create(0, 0),
          end: end.minus(start),
        } as PrimitiveShape);
      }

      world.addBundle(createBundle(trajectoryLineComponents));

      const hitEntity = world.entity(hit.entityId);

      const backBoardComponent = hitEntity.components.find(
        (comp) => comp.name === "backboard"
      ) as BackboardComponent | undefined;

      if (backBoardComponent && backBoardComponent.owner === "ai") {
        targetPosition.position = hit.position;
        break;
      }

      start = end;
      direction = direction.reflect(hit.normal).normalised();

      linesAdded += 1;
    }
  }
);
engine.system(
  "collisionCleanupSystem",
  { state: "app-state", value: "in-game" },
  collisionCleanupSystem
);

engine.run();
