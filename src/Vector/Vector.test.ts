import { describe, expect, test } from 'vitest';
import Vector from './Vector';

describe('factory method', () => {

    test('should create an instance of vector with supplied x and y values', () => {
        const x = 2;
        const y = 3;
    
        const result = Vector.create(x, y);
    
        expect(result.x).toEqual(x);
        expect(result.y).toEqual(y);
    });

});

describe('equals method', () => {

    test('should return two when two Vector objects have the same x and y values', () => {
        const vector1 = new Vector(10, 10);
        const vector2 = new Vector(10, 10);
    
        const result = vector1.equals(vector2);
    
        expect(result).toEqual(true);
    });

    test('should return two when two Vector objects have the different x and y values', () => {
        const vector1 = new Vector(6, 12);
        const vector2 = new Vector(2, 5);
    
        const result = vector1.equals(vector2);
    
        expect(result).toEqual(false);
    });

});

describe('plus method', () => {

    test('should a vector with x values and y values of each vector added together', () => {
        const vector1 = new Vector(20, 3);
        const vector2 = new Vector(12, 6 );
    
        const result = vector1.plus(vector2);
    
        expect(result.x).toEqual(32);
        expect(result.y).toEqual(9);
    });
    
});

describe('minus method', () => {

    test('should a vector with x values and y values of each vector subtracted from each other', () => {
        const vector1 = new Vector(20, 3);
        const vector2 = new Vector(12, 6 );
    
        const result = vector1.minus(vector2);
    
        expect(result.x).toEqual(8);
        expect(result.y).toEqual(-3);
    });
    
});

describe('times method', () => {

    test('should a vector with x values and y values multiplied by the supplied scalar', () => {
        const vector = new Vector(20, 3);
        const scalar = 10;
    
        const result = vector.times(scalar);
    
        expect(result.x).toEqual(200);
        expect(result.y).toEqual(30);
    });
    
});