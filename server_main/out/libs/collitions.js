"use strict";
//import SAT from 'sat';
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.checkCollisions = void 0;
const default_config_1 = require("../data/default_config");
// Collision detection class
// Based on simple SAT.js library, 
// and Hyperplane separation theorem https://en.wikipedia.org/wiki/Hyperplane_separation_theorem
const offset = process.env.COLLISION_OFFSET || 10;
function checkCollisions() {
    return __awaiter(this, void 0, void 0, function* () {
        let lines = [];
        let circles = [];
        let items = [];
        default_config_1.currentItems.forEach((item) => {
            const bx = item.ball_position.x;
            const by = item.ball_position.y;
            const rx = item.rope_start_position.x;
            const ry = item.rope_start_position.y;
            let l = new SAT.Polygon(new SAT.Vector(bx, by), [
                new SAT.Vector(rx, ry),
                new SAT.Vector(rx - 2, ry - 2),
                new SAT.Vector(bx - 2, by - 2),
                new SAT.Vector(bx, by),
            ]);
            // @ts-ignore
            let c = new SAT.Circle(new SAT.Vector(bx, by), item.ball_radius, offset);
            items.push(item);
            lines.push(l);
            circles.push(c);
        });
        let response = new SAT.Response();
        const size = lines.length;
        for (let i = 0; i < size - 1; i++) {
            for (let j = i + 1; j < size; j++) {
                let collidedC2C = SAT.testCircleCircle(circles[i], circles[j], response);
                if (collidedC2C) {
                    console.log("Collision detected CxC between: ", items[i].name, ' and ', items[j].name);
                    console.log('Response obj: ', response);
                    let res = {
                        message: items[i].name + ' X ' + items[j].name,
                        data: response
                    };
                    return res;
                }
                response.clear();
                // Line collisions broken, so I disabled it
                /*
                let collidedC2L = SAT.testCirclePolygon(circles[i], lines[j], response);
                if (collidedC2L) {
                    console.log("Collision detected CxL between: ", items[i].name, ' and ', items[j].name);
                    console.log('Response obj: ', response);
                    let res = {
                        message: 'Ball x Line ' + items[i].name + ' X ' + items[j].name,
                        data: response
                    };
                    return res;
                }
                response.clear();
                */
            }
            /*
            let collidedC2L = SAT.testCirclePolygon(circles[i], lines[i+1], response);
            if (collidedC2L) {
                console.log("Collision detected CxL between: ", items[i].name, ' and ', items[i+1].name);
                console.log('Response obj: ', response);
                return response;
            }
            response.clear();
    
            let collidedL2C = SAT.testPolygonCircle(lines[i], circles[i+1], response);
            if (collidedL2C) {
                console.log("Collision detected LxC between: ", items[i].name, ' and ', items[i+1].name);
                console.log('Response obj: ', response);
                return response;
            }
            response.clear();
    
            let collidedL2L = SAT.testPolygonPolygon(lines[i], lines[i+1], response);
            if (collidedL2L) {
                console.log("Collision detected LxL between: ", items[i].name, ' and ', items[i+1].name);
                console.log('Response obj: ', response);
                return response;
            }*/
        }
        return false;
    });
}
exports.checkCollisions = checkCollisions;
//# sourceMappingURL=collitions.js.map