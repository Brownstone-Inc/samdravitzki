import Vector from "../Vector/Vector";
import boundedMod from "../../../lib/bounded-mod/bounded-mod";
import randomInt from "../../../lib/randomInt/randomInt";

/**
 * Describes a square boudary in two-dimentional space
 *
 * Where min is the top-left most point and max is the bottom-right
 * most point of the square
 */
export default class Bounds {
  readonly min: Vector;
  readonly max: Vector;

  /**
   * Shorthand to get the vectors at the top-left
   * and top-right of bounds
   */
  get top() {
    return {
      left: this.min,
      right: Vector.create(this.max.x, this.min.y),
    };
  }

  /**
   * Shorthand to get the vectors at the bottom-left
   * and bottom-right of bounds
   */
  get bottom() {
    return {
      left: Vector.create(this.min.x, this.max.y),
      right: this.max,
    };
  }

  get center() {
    const centerX = (this.max.x - this.min.x) / 2 + this.min.x;
    const centerY = (this.max.y - this.min.y) / 2 + this.min.y;

    return {
      left: Vector.create(this.min.y, centerY),
      top: Vector.create(centerX, this.min.y),
      right: Vector.create(this.max.x, centerY),
      bottom: Vector.create(centerX, this.max.y),
      center: this.max.minus(this.min).times(0.5).plus(this.min),
    };
  }

  constructor(min: Vector, max: Vector) {
    this.min = min;
    this.max = max;
  }

  static create(min: Vector, max: Vector) {
    return new Bounds(min, max);
  }

  /**
   * The size of the bounds
   * @returns tuple of two numbers where the first is the  length of the x axis the second is the length of the y axis
   */
  get size(): [number, number] {
    return [this.max.x - this.min.x, this.max.y - this.min.y];
  }

  /**
   * Generates a random position in the bounds
   * @param increment only generate a random position that is a multiple of the supplied increment
   * @returns
   */
  randomPosition(increment: number = 1): Vector {
    const randomXPosition = randomInt(this.max.x, this.min.x, increment);
    const randomYPosition = randomInt(this.max.y, this.min.y, increment);

    return Vector.create(randomXPosition, randomYPosition);
  }

  /**
   * Transform given position to bounded mod within these bounds
   * @param position
   * @returns position within bounds
   */
  boundedMod(position: Vector): Vector {
    return Vector.create(
      boundedMod(position.x, this.max.x, this.min.x),
      boundedMod(position.y, this.max.y, this.min.y)
    );
  }

  inBounds(vector: Vector): boolean {
    return (
      vector.x >= this.min.x &&
      vector.x <= this.max.x &&
      vector.y >= this.min.y &&
      vector.y <= this.max.y
    );
  }

  /**
   * Return a new bounds object shrunken by the amount supplied
   * @param amount
   * @returns new bounds object
   */
  shrink(amount: number) {
    return Bounds.create(
      Vector.create(this.min.x + amount, this.min.y + amount),
      Vector.create(this.max.x - amount, this.max.y - amount)
    );
  }
}
