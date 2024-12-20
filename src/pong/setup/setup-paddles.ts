import createBundle from "../../ecs/core/Bundle/createBundle";
import Vector from "../../ecs/core/Vector/Vector";
import Engine from "../../ecs/core/Engine/Engine";

function setupPaddlesPart<T extends Record<string, unknown>>(
  engine: Engine<T>
) {
  engine.system(
    "setupPaddles",
    { event: "start" },
    (world, { canvasBounds }) => {
      const paddleSize = 40;
      const paddleWallOffset = 10;

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
          position: new Vector(
            canvasBounds.min.x + paddleWallOffset,
            canvasBounds.max.y / 2
          ),
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
          position: new Vector(
            canvasBounds.max.x - paddleWallOffset,
            canvasBounds.max.y / 2
          ),
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
  );
}

export default setupPaddlesPart;
