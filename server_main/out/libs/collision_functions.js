"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.circle2circle = exports.line2line = exports.circle2line = exports.line2circle = exports.Line = exports.Circle = void 0;
/**
 * Circle object for collision calculation
 */
class Circle {
    constructor(x, y, r) {
        this.x = x;
        this.y = y;
        this.r = r;
    }
}
exports.Circle = Circle;
/**
 * Line object for collision calculation
 */
class Line {
    constructor(x1, y1, x2, y2) {
        this.x1 = x1;
        this.y1 = y1;
        this.x2 = x2;
        this.y2 = y2;
    }
}
exports.Line = Line;
/**
 * line to circle collision
 *
 * @param line
 * @param circle
 * @returns boolean
 */
function line2circle(line, circle) {
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
exports.line2circle = line2circle;
/**
 * Helper function
 * @param v1
 * @param v2
 * @returns
 */
function dot(v1, v2) {
    return (v1[0] * v2[0]) + (v1[1] * v2[1]);
}
/**
 * Circle to Line collision detection
 * @param circle
 * @param line
 * @returns
 */
function circle2line(circle, line) {
    return line2circle(line, circle);
}
exports.circle2line = circle2line;
/**
 * Lite to Line collision detection
 *
 * @param line1
 * @param line2
 * @returns boolean
 */
function line2line(line1, line2) {
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
exports.line2line = line2line;
/**
 * Check collision for 2 Circles
 * @param circle1
 * @param circle2
 * @returns boolean
 */
function circle2circle(circle1, circle2) {
    let x = circle1.x - circle2.x;
    let y = circle2.y - circle1.y;
    let radii = circle1.r + circle2.r;
    return x * x + y * y <= radii * radii;
}
exports.circle2circle = circle2circle;
//# sourceMappingURL=collision_functions.js.map