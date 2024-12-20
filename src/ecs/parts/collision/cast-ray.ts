import World from "../../core/World/World";
import Vector from "../../core/Vector/Vector";
import { Aabb, Line } from "./intersection/intersection-shapes";
import lineAabbIntersection from "./intersection/line-aabb-intersection";
import { Position } from "../../components/Position";
import { Collider } from "./components/Collider";

type Ray = {
  position: Vector;
  direction: Vector;
  length: number; // Prob should have infinitly long rays by default, not sure how to do this tho
};

type Hit = {
  position: Vector;
  normal: Vector;
  entityId: string;
};

type CastRayOptions = {
  layer?: string; // The collision layer that ray will collide with
};

/**
 * Given the world and a ray return the components of entities in which the ray intersects and the
 * points in which the ray intersects with them
 *
 * Acts like a specialised form of query on the world
 * @param world the world to cast ray within
 * @param ray the ray that is cast within the world
 * @returns the position and normal in which the ray collided
 */
function castRay(world: World, ray: Ray, options?: CastRayOptions): Hit[] {
  const colliders = world.query<[Position, Collider, string]>([
    "position",
    "collider",
    "entity-id",
  ]);

  const filteredColliders =
    options?.layer === undefined
      ? colliders
      : colliders.filter(([, c]) => c.layer === options.layer);

  const hits: Hit[] = [];

  for (const [position, collider, entityId] of filteredColliders) {
    if (collider.type === "aabb") {
      const line: Line = {
        start: ray.position,
        end: ray.position.plus(ray.direction.times(ray.length)),
      };

      const rectangle: Aabb = {
        position: position.position,
        width: collider.width,
        height: collider.height,
      };

      const intersections = lineAabbIntersection(line, rectangle);

      // Sort is a mutating method so it cannot be chained
      intersections.sort(
        (intersectionA, intersectionB) =>
          intersectionA.contactPoint.distance(ray.position) -
          intersectionB.contactPoint.distance(ray.position)
      );

      const closestIntersection = intersections[0];

      if (closestIntersection) {
        hits.push({
          position: closestIntersection.contactPoint,
          normal: closestIntersection.normal,
          entityId,
        });
      }
    }
  }

  return hits;
}

export default castRay;
export type { Ray, CastRayOptions, Hit };
