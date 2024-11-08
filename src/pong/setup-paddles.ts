import createBundle from "../ecs/Bundle/createBundle";
import World from "../ecs/World/World";
import Vector from "../Vector/Vector";

function setupPaddles(world: World) {
  const paddleSize = 40;

  const playerPaddleBundle = createBundle([
    "player",
    "paddle",
    {
      name: "primitive",
      fill: [240, 60, 100],
      type: "square",
      width: 5,
      height: paddleSize,
    },
    {
      name: "position",
      position: new Vector(10, 50),
    },
    {
      name: "collider",
      type: "aabb",
      layer: "wall",
      width: 5,
      height: paddleSize,
    },
  ]);

  // The position the ai paddle is aiming to end up in
  const aiPaddleTarget = createBundle([
    "ai-paddle-target",
    {
      name: "position",
      position: new Vector(0, 0),
    },
  ]);

  const aiPaddleBundle = createBundle([
    "ai",
    "paddle",
    {
      name: "primitive",
      fill: [240, 60, 100],
      type: "square",
      width: 5,
      height: paddleSize,
    },
    {
      name: "position",
      position: new Vector(490, 70),
    },
    {
      name: "speed",
      value: 0.01,
    },
    {
      name: "collider",
      type: "aabb",
      width: 5,
      height: paddleSize,
    },
  ]);

  world.addBundle(aiPaddleTarget);
  world.addBundle(playerPaddleBundle);
  world.addBundle(aiPaddleBundle);
}

export default setupPaddles;
