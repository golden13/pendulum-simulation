"use strict";
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
const collision_functions_1 = require("./collision_functions");
// Collision detection class
// Offset for collision
let offset = process.env.COLLISION_OFFSET || 10;
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
            let l = new collision_functions_1.Line(bx, by, rx, ry);
            let r = item.ball_radius + +offset;
            let c = new collision_functions_1.Circle(bx, by, r);
            items.push(item);
            lines.push(l);
            circles.push(c);
        });
        const size = lines.length;
        for (let i = 0; i < size - 1; i++) {
            for (let j = i + 1; j < size; j++) {
                let collidedC2C = (0, collision_functions_1.circle2circle)(circles[i], circles[j]);
                if (collidedC2C) {
                    console.log("Collision CxC between: Ball ", items[i].name, ' and Ball ', items[j].name, ' offset=', offset);
                    let res = {
                        message: "Ball " + items[i].id + ' x Ball ' + items[j].id + ' offset=' + offset,
                        data: {}
                    };
                    return res;
                }
                let collidedC2L = (0, collision_functions_1.circle2line)(circles[i], lines[j]);
                if (collidedC2L) {
                    console.log("Collision CxL between: Ball ", items[i].id, ' and Line ', items[j].id, ' offset=', offset);
                    console.log(items[i], items[j]);
                    let res = {
                        message: "Ball " + items[i].id + ' x Line ' + items[j].id + ' offset=' + offset,
                        data: {},
                    };
                    return res;
                }
                let collidedL2C = (0, collision_functions_1.line2circle)(lines[i], circles[j]);
                if (collidedL2C) {
                    console.log("Collision LxC between: Line ", items[i].id, ' and Ball ', items[j].id, ' offset=', offset);
                    console.log(items[i], items[j]);
                    let res = {
                        message: "Line " + items[i].id + ' x Ball ' + items[j].id + ' offset=' + offset,
                        data: {}
                    };
                    return res;
                }
                // should not happens, but let it keep here
                let collidedL2L = (0, collision_functions_1.line2line)(lines[i], lines[j]);
                if (collidedL2L) {
                    console.log("Collision LxL between: Line ", items[i].id, ' and Line ', items[j].id, ' offset=', offset);
                    console.log(items[i], items[j]);
                    let res = {
                        message: "Line " + items[i].id + ' x Line ' + items[j].id + ' offset=' + offset,
                        data: {}
                    };
                    return res;
                }
            }
        }
        return false;
    });
}
exports.checkCollisions = checkCollisions;
//# sourceMappingURL=collisions.js.map