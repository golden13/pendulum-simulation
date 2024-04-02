"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Pendulum = void 0;
const matter_js_1 = __importDefault(require("matter-js"));
;
/**
 * Main Pendulum class
 */
class Pendulum {
    constructor(props) {
        this.stopped = false;
        this.props = props;
    }
    /*
    * return Matter-js body
    */
    get body() {
        return this === null || this === void 0 ? void 0 : this._body;
    }
    /**
     * Build physical objects
     */
    build() {
        // create engine
        this.engine = matter_js_1.default.Engine.create();
        //this.engine.gravity.y = 2;
        this.world = this.engine.world;
        // create renderer
        /*this.render = this.MatterRender.create({
            //element: document.body,
            engine: this.engine,
            options: {
                width: 800,
                height: 600,
                showVelocity: true
            }
        });*/
        //if (this.render) this.MatterRender.run(this.render);
        /*const wrap = {
            min: { x: 0, y: 0 },
            max: { x: 1024, y: 768 }
        };*/
        //this.runner = this.MatterRunner.create();
        //this.MatterRunner.run(this.runner, this.engine);
        // see newtonsCradle function defined later in this file
        //var cradle = Example.newtonsCradle.newtonsCradle(280, 100, 5, 30, 200);
        //Composite.add(world, cradle);
        //Body.translate(cradle.bodies[0], { x: -180, y: -100 });
        //cradle = Example.newtonsCradle.newtonsCradle(280, 380, 7, 20, 140);
        //Composite.add(world, cradle);
        //Body.translate(cradle.bodies[0], { x: -140, y: -100 });
        // mouse
        // add mouse control
        /*this.mouse = this.MatterMouse.create(this.render.canvas);
        let mouseConstraint = this.MatterMouseConstraint.create(this.engine, {
        mouse: this.mouse,
            constraint: {
                stiffness: 0.2,
                render: {
                    visible: false
                }
            }
        });

        this.MatterComposite.add(this.world, mouseConstraint);

        // keep the mouse in sync with rendering
        this.render.mouse = this.mouse;
        */
        // fit the render viewport to the scene
        /*
        this.MatterRender.lookAt(this.render, {
            min: { x: 0, y: 50 },
            max: { x: 800, y: 600 }
        });*/
        let pendulumComposite = matter_js_1.default.Composite.create({ label: 'Pendulum' });
        let x = this.props.ball_position.x;
        let y = this.props.ball_position.y;
        let size = this.props.ball_radius;
        let rope_lenght = this.props.rope_length;
        let circle = matter_js_1.default.Bodies.circle(x, y, size, {
            inertia: 10, //Infinity, 
            restitution: 1,
            friction: 0,
            frictionAir: this.props.friction_air,
            //slop: size * 0.02,
            mass: this.props.ball_mass,
            //speed: 1000,
            //velocity: {x: 100, y:0},
            //velocity: {x: 0, y: -100},
            angularSpeed: this.props.angular_speed,
            angularVelocity: this.props.angular_velocity,
            render: {
                fillStyle: this.props.fill_color
            },
            isStatic: true,
        });
        //let rope_start_x = xx; // xx + i * (size * separation)
        //let rope_start_y = 0; // yy
        //let constraint = this.MatterConstraint.create({ pointA: { x: rope_start_x, y: rope_start_y }, bodyB: circle });
        this.circle = circle;
        //this.circle.position.x += 200;
        //this.circle.position.y += 200;
        //this.circle.positionPrev.x += offset.x;
        //this.circle.positionPrev.y += offset.y;
        //setMassCentre(circle, { x: x, y: y });
        let rope_start_x = this.props.rope_start_position.x; //xx+100; // xx + i * (size * separation)
        let rope_start_y = this.props.rope_start_position.y; //30; // yy
        let constraint = matter_js_1.default.Constraint.create({ pointA: { x: rope_start_x, y: rope_start_y }, bodyB: circle });
        this.rope = constraint;
        //this.props.position.x = xx + i * (size * separation);
        //this.props.position.y =  yy + length;
        // ad to pendulum composite
        //if (this.MatterComposite)
        matter_js_1.default.Composite.add(pendulumComposite, circle);
        matter_js_1.default.Composite.add(pendulumComposite, constraint);
        // ad to main composite
        matter_js_1.default.Composite.add(this.world, pendulumComposite);
        // create runner
        this.runner = matter_js_1.default.Runner.create();
        //this.runner.enabled = false; // by default it's paused
        matter_js_1.default.Runner.run(this.runner, this.engine);
        //this.runner.enabled = false;
        //this.MatterBody.translate(pendulumComposite.bodies[0], { x: -180, y: -100 });
        this._body = pendulumComposite.bodies[0];
        //Matter.Runner.run(this.engine);
        //this._body = pendulumComposite.bodies[0];
        //this.circle = circle;
        //this.rope = constraint;
        //this.Composite.add(world, cradle)
        //this.Body.translate(cradle.bodies[0], { x: -180, y: -100 });
        //}
    }
    /**
     * Run simulation
     */
    run() {
        console.log('Trying to run...');
        if (this.runner && this.engine) {
            if (this.runner.enabled === false) {
                this.runner.enabled = true;
            }
        }
        if (this.stopped && this.runner && this.engine) {
            this.stopped = false;
        }
        // change isStatic property
        if (this.circle) {
            matter_js_1.default.Body.setStatic(this.circle, false);
            matter_js_1.default.Body.setMass(this.circle, this.props.ball_mass);
        }
        if (this._body)
            matter_js_1.default.Body.setStatic(this._body, false);
        if (this.world) {
            this.world.bodies.forEach(b => {
                console.log(b);
                matter_js_1.default.Body.setStatic(b, false);
            });
        }
    }
    /**
     * Pause simulation, all data will be preserver
     */
    pause() {
        console.log('Trying to pause...');
        if (this.runner) {
            this.runner.enabled = false;
        }
    }
    /**
     * Stop simulation. Resetting all data
     */
    stop() {
        if (this.runner) {
            matter_js_1.default.Events.off(this.runner, '', () => { });
            matter_js_1.default.Events.off(this.engine, '', () => { });
            this.stopped = true;
            if (this.world)
                matter_js_1.default.World.clear(this.world, false);
            if (this.engine)
                matter_js_1.default.Engine.clear(this.engine);
            if (this.render)
                matter_js_1.default.Render.stop(this.render);
            matter_js_1.default.Runner.stop(this.runner);
            if (this.render) {
                this.render.canvas.remove();
                // @types/matter-js not really great and has some bugs, because it's not official, 
                // so we have to ignore TypeScript errors in some cases
                //@ts-ignore
                this.render.canvas = null;
                //@ts-ignore
                this.render.context = null;
                this.render.textures = {};
            }
            this.build(); // rebuild
        }
    }
    /**
     * Change engine status
     *
     * @param value new isStatic value
     * @param state
     */
    changeEngineStatus(value, state) {
        if (this.runner) {
            if (this.engine) {
                //Matter.Engine;
                if (this.world) {
                    console.log('set isStatic to ', value);
                    if (this.circle)
                        matter_js_1.default.Body.setStatic(this.circle, value);
                    if (this._body)
                        matter_js_1.default.Body.setStatic(this._body, value);
                    this.world.bodies.forEach(b => {
                        console.log(b);
                        matter_js_1.default.Body.setStatic(b, value);
                    });
                }
                console.log('setting runner to "start"...');
                if (state === "start") {
                    matter_js_1.default.Runner.start(this.runner, this.engine);
                }
                else {
                    console.log('setting runner to "stop"...');
                    matter_js_1.default.Runner.stop(this.runner);
                }
            }
            else
                console.log('Engine is null');
        }
        else {
            console.log('Runner is null');
        }
    }
    /**
     * Convert object properties to json, for reporting
     * @returns
     */
    toJson() {
        var _a, _b, _c, _d, _e, _f, _g, _h;
        let x = (_a = this.circle) === null || _a === void 0 ? void 0 : _a.position.x;
        let y = (_b = this.circle) === null || _b === void 0 ? void 0 : _b.position.y;
        let rx = (_c = this.rope) === null || _c === void 0 ? void 0 : _c.pointA.x;
        let ry = (_d = this.rope) === null || _d === void 0 ? void 0 : _d.pointA.y;
        //console.log('x=',x, 'y=', y);
        //console.log('rx=',rx, 'ry=', ry);
        return {
            type: 'pendulum',
            name: this.props.name,
            id: this.props.id,
            fill_color: this.props.fill_color,
            ball_radius: this.props.ball_radius,
            ball_position: { x: x, y: y },
            rope_start_position: { x: rx, y: ry },
            rope_length: this.props.rope_length,
            angle: this.props.angle,
            angular_velocity: (_e = this._body) === null || _e === void 0 ? void 0 : _e.angularVelocity,
            angular_speed: (_f = this._body) === null || _f === void 0 ? void 0 : _f.angularSpeed,
            damping: this.props.damping,
            gravity: ((_g = this.world) === null || _g === void 0 ? void 0 : _g.gravity) ? (_h = this.world) === null || _h === void 0 ? void 0 : _h.gravity : 0.4,
            ball_mass: this.props.ball_mass,
            fps: 0,
        };
    }
}
exports.Pendulum = Pendulum;
//# sourceMappingURL=pendulum.js.map