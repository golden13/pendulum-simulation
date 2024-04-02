import Matter from 'matter-js'

// ***
// Pendulum class
// ***


//Velocity of an Element
/*export interface Velocity {
  velocity: { x: number, y: number },
  angle: number
};*/

// Interface of one Pendulum Element
// Any additional properties can be added here
export interface IPendulumElem {
  type: string,
  name: string,
  id: string,
  fill_color: string,
  ball_radius: number,
  ball_position: {x: number, y: number},
  rope_start_position: {x: number, y: number},
  rope_length: number,
  angle: number,
  angular_velocity: number,
  angular_speed: number, 
  damping: number,
  gravity: {x: number, y: number, scale: number},
  ball_mass: number,
  friction_air: number,
  server_port: number,
  fps: number,
};

/**
 * Main Pendulum class
 */
export class Pendulum {
    _body?: Matter.Body;

    public props: IPendulumElem;

    engine?: Matter.Engine;
    world?: Matter.World;
    render?: Matter.Render;
    runner?: Matter.Runner;
    mouse?: Matter.Mouse;
    circle?: Matter.Body;
    rope?: Matter.Constraint;

    public stopped = false;

    constructor(props: IPendulumElem) {
        this.props = props;
    }
    
    /*
    * return Matter-js body
    */
    get body(): Matter.Body | undefined {
        return this?._body;
    }

    /**
     * Build physical objects
     */
    build() {
        // create engine
        this.engine = Matter.Engine.create();
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

        let pendulumComposite = Matter.Composite.create({ label: 'Pendulum' });

        let x = this.props.ball_position.x;
        let y = this.props.ball_position.y;
        let size = this.props.ball_radius;
        let rope_lenght = this.props.rope_length;
        
        let circle = Matter.Bodies.circle(x, y, size,
                    { 
                        inertia: 10,//Infinity, 
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

        let rope_start_x = this.props.rope_start_position.x;//xx+100; // xx + i * (size * separation)
        let rope_start_y = this.props.rope_start_position.y;//30; // yy
        let constraint = Matter.Constraint.create({ pointA: { x: rope_start_x, y: rope_start_y }, bodyB: circle });

        this.rope = constraint;
        //this.props.position.x = xx + i * (size * separation);
        //this.props.position.y =  yy + length;

        // ad to pendulum composite
        //if (this.MatterComposite)

        Matter.Composite.add(pendulumComposite, circle);
        Matter.Composite.add(pendulumComposite, constraint);
        
        // ad to main composite
        Matter.Composite.add(this.world, pendulumComposite);

        // create runner
        this.runner = Matter.Runner.create();
        //this.runner.enabled = false; // by default it's paused
        Matter.Runner.run(this.runner, this.engine);
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
            Matter.Body.setStatic(this.circle, false);
            Matter.Body.setMass(this.circle, this.props.ball_mass);
        }
        if (this._body) Matter.Body.setStatic(this._body, false);

        if (this.world) {
            this.world.bodies.forEach(b => {
                console.log(b);
                Matter.Body.setStatic(b, false);
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
            Matter.Events.off(this.runner, '', ()=>{});
            Matter.Events.off(this.engine, '', ()=>{});

            this.stopped = true;
            if (this.world) Matter.World.clear(this.world, false);
            if (this.engine) Matter.Engine.clear(this.engine);
            if (this.render) Matter.Render.stop(this.render);
            Matter.Runner.stop(this.runner);
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
    changeEngineStatus(value: boolean, state: "start" | "stop") {
        if (this.runner) {
            if (this.engine) {
                //Matter.Engine;
                if (this.world) {
                    console.log('set isStatic to ', value);

                    if (this.circle) Matter.Body.setStatic(this.circle, value);
                    if (this._body) Matter.Body.setStatic(this._body, value);
                    
                    this.world.bodies.forEach(b => {
                        console.log(b);
                        Matter.Body.setStatic(b, value);
                    });
                }
                console.log('setting runner to "start"...');
                if (state === "start") {
                    Matter.Runner.start(this.runner, this.engine);
                } else {
                    console.log('setting runner to "stop"...');
                    Matter.Runner.stop(this.runner);
                }
            }
            else console.log('Engine is null');
        } else {
            console.log('Runner is null');
        }
    }

    /**
     * Convert object properties to json, for reporting
     * @returns 
     */
    toJson() {
        let x = this.circle?.position.x
        let y = this.circle?.position.y;
        let rx = this.rope?.pointA.x;
        let ry = this.rope?.pointA.y;

        //console.log('x=',x, 'y=', y);
        //console.log('rx=',rx, 'ry=', ry);

        return {
            type: 'pendulum',
            name: this.props.name,
            id: this.props.id,
            fill_color: this.props.fill_color,
            ball_radius: this.props.ball_radius,
            ball_position: {x: x, y: y},
            rope_start_position: {x: rx, y: ry},
            rope_length: this.props.rope_length,
            angle: this.props.angle,
            angular_velocity: this._body?.angularVelocity,
            angular_speed: this._body?.angularSpeed, 
            damping: this.props.damping,
            gravity: this.world?.gravity? this.world?.gravity : 0.4,
            ball_mass: this.props.ball_mass,
            fps: 0,
        } as IPendulumElem
    }
}