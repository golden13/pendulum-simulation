import { currentItems } from '../data/default_config';
import { IPendulumElem } from '../classes/pendulum';
import { Circle, Line, circle2circle, circle2line, line2circle, line2line } from './collision_functions';

// Collision detection class

// Offset for collision
let offset = process.env.COLLISION_OFFSET || 10;


export async function checkCollisions() {
    let lines: any[] = [];
    let circles: any[] = [];
    let items: IPendulumElem[] = [];
    
    currentItems.forEach((item: IPendulumElem) => {
        const bx = item.ball_position.x;
        const by = item.ball_position.y;
        const rx = item.rope_start_position.x;
        const ry = item.rope_start_position.y;
        
        let l = new Line(bx, by, rx, ry);

        let r = item.ball_radius + +offset;
        let c = new Circle(bx, by, r);

        items.push(item);
        lines.push(l);
        circles.push(c);
    });
    
    const size = lines.length;
    for(let i = 0; i < size - 1; i++) {
        for (let j = i + 1; j < size; j++) {
            let collidedC2C = circle2circle(circles[i], circles[j]);
            if (collidedC2C) {
                console.log("Collision CxC between: Ball ", items[i].name, ' and Ball ', items[j].name, ' offset=', offset);
                let res = {
                    message: "Ball " + items[i].id + ' x Ball ' + items[j].id + ' offset='+ offset,
                    data: {}
                };
                return res;
            }

            let collidedC2L = circle2line(circles[i], lines[j]);
            if (collidedC2L) {
                console.log("Collision CxL between: Ball ", items[i].id, ' and Line ', items[j].id, ' offset=', offset);
                console.log(items[i], items[j]);
                let res = {
                    message: "Ball " + items[i].id + ' x Line ' + items[j].id + ' offset='+ offset,
                    data: {},
                };
                return res;
            }
         
            let collidedL2C = line2circle(lines[i], circles[j]);
            if (collidedL2C) {
                console.log("Collision LxC between: Line ", items[i].id, ' and Ball ', items[j].id, ' offset=', offset);
                console.log(items[i], items[j]);
                let res = {
                    message: "Line " + items[i].id + ' x Ball ' + items[j].id + ' offset='+ offset,
                    data: {}
                };
                return res;
            }

            // should not happens, but let it keep here
            let collidedL2L = line2line(lines[i], lines[j]);
            if (collidedL2L) {
                console.log("Collision LxL between: Line ", items[i].id, ' and Line ', items[j].id, ' offset=', offset);
                console.log(items[i], items[j]);
                let res = {
                    message: "Line " + items[i].id + ' x Line ' + items[j].id + ' offset='+ offset,
                    data: {}
                };
                return res;
            }
            
        }
        
    }
    
    return false;
}