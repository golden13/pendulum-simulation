/**
 * Circle interface
 */
interface ICircle {
    x: number;
    y: number;
    r: number;
}

/**
 * Circle object for collision calculation
 */
export class Circle implements ICircle {
    public x: number;
    public y: number;
    public r: number;
    constructor(x: number, y: number, r: number) {
        this.x = x;
        this.y = y;
        this.r = r;
    }
}

/**
 * Line interface
 */
interface ILine {
    x1: number;
    y1: number;
    x2: number;
    y2: number;
}

/**
 * Line object for collision calculation
 */
export class Line implements ILine {
    public x1: number;
    public y1: number;
    public x2: number;
    public y2: number;
    constructor(x1: number, y1: number, x2: number, y2: number) {
        this.x1 = x1;
        this.y1 = y1;
        this.x2 = x2;
        this.y2 = y2;
    }
}


/**
 * line to circle collision
 * 
 * @param line 
 * @param circle 
 * @returns boolean
 */
export function line2circle(line: ILine, circle: ICircle) {
    let ac = [circle.x - line.x1, circle.y - line.y1];
    let ab = [line.x2 - line.x1, line.y2 - line.y1];
    let ab2 = dot(ab, ab);
    let acab = dot(ac, ab);
    let t = acab / ab2;
    t = (t < 0) ? 0 : t;
    t = (t > 1) ? 1 : t;
    let h = [(ab[0] * t + line.x1) - circle.x, (ab[1] * t + line.y1) - circle.y];
    let h2 = dot(h, h);
    return h2 <= circle.r * circle.r;
}

/**
 * Helper function
 * @param v1 
 * @param v2 
 * @returns 
 */
function dot(v1: number[], v2: number[]) {
    return (v1[0] * v2[0]) + (v1[1] * v2[1])
}


/**
 * Circle to Line collision detection
 * @param circle 
 * @param line 
 * @returns 
 */
export function circle2line(circle: ICircle, line: ILine) {
    return line2circle(line, circle);
}


/**
 * Lite to Line collision detection
 * 
 * @param line1 
 * @param line2 
 * @returns boolean
 */
export function line2line(line1: ILine, line2: ILine) {
    //var s1_x = x2 - x1;
    let s1_x = line1.x2 - line1.x1;

    //var s1_y = y2 - y1
    let s1_y = line1.y2 - line1.y1;

    //var s2_x = x4 - x3
    let s2_x = line2.x2 - line2.x1;

    //var s2_y = y4 - y3
    let s2_y = line2.y2 - line2.y1;

    //var s = (-s1_y * (x1 - x3) + s1_x * (y1 - y3)) / (-s2_x * s1_y + s1_x * s2_y)
    let s = (-s1_y * (line1.x1 - line2.x1) + s1_x * (line1.y1 - line2.y1)) / (-s2_x * s1_y + s1_x * s2_y);

    //var t = (s2_x * (y1 - y3) - s2_y * (x1 - x3)) / (-s2_x * s1_y + s1_x * s2_y)
    let t = (s2_x * (line1.y1 - line2.y1) - s2_y * (line1.x1 - line2.x1)) / (-s2_x * s1_y + s1_x * s2_y);

    return s >= 0 && s <= 1 && t >= 0 && t <= 1;
}


/**
 * Check collision for 2 Circles
 * @param circle1 
 * @param circle2 
 * @returns boolean
 */
export function circle2circle(circle1: ICircle, circle2: ICircle) {
    let x = circle1.x - circle2.x;
    let y = circle2.y - circle1.y;
    let radii = circle1.r + circle2.r;
    return x * x + y * y <= radii * radii;
}