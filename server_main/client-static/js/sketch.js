/**
 * UI Library
 */

let run = false;
let initialConfig = [];
let selectedObject = null;
let preSelectedObject = null;

let objectsList = [];
let objectsMap = new Map();
let initialDraw = true;
let stopData = null;
let settingsChanges = false;
let pause = false;
let collision = false;

/**
 * If you run it on a different host name, change this value
 */
let serverUrl = "http://localhost:8080"; 

/**
 * Load initial Pendulum settings from REST api
 * @param {*} callback 
 */
function loadSettings(callback) {
    fetch(serverUrl + "/settings", {
        headers: {
            "Accept": "application/json"
        }
    })
        .then((response) => response.json())
        .then((data) => {
            // remove everything, just in case
            initialConfig = [];
            objectsMap = new Map();
            if (data) {
                data.forEach(item => {
                    initialConfig.push(item);
                });
                //console.log('Received ', data.length, ' items');
                //console.log('Items=', initialConfig);
                //console.log('Calling callback');
                callback();
            }
        })
        .catch(err => {
            console.error(err);
        });
}

/**
 * Send new Pendulum settings to the server via REST api
 * @param {*} props 
 * @returns response object
 */
async function sendNewSettings(props) {
    //console.log(JSON.stringify(props));
    const response = await fetch(serverUrl + '/settings', {
        method: "POST",
        mode: "cors",
        cache: "no-cache",
        credentials: "same-origin",
        headers: {
            "Content-Type": "application/json",
        },
        redirect: "follow",
        referrerPolicy: "no-referrer",
        body: JSON.stringify(props),
    });
    return response.json();
}


/**
 * P5JS Sketch
 * @param {*} sketch 
 */
const s = (sketch) => {

    buttons = new Map();

    /**
     * Init (get all needed settings)
     */
    init = async (callback) => {
        loadSettings(callback);
    }

    /**
     * Convert settings json to the list of Pendulum objects
     */
    convertJsonToObjects = () => {
        if (initialConfig.length) {
            initialConfig.forEach(item => {
                let pendulum = new Pendulum(item);
                pendulum.addForm(buildForm(pendulum));
                objectsMap.set(item.id, pendulum);
            });
        }
        initialDraw = true;
    }

    /**
     * Setup P5JS Sketch
     */
    sketch.setup = () => {
        // Hardcoded width and height for the sketch
        cw = 1024;
        ch = 768;

        //console.log('Starting setup process...');

        let canvas = sketch.createCanvas(cw, ch);
        canvas.position(250, 0);
        canvas.parent('playground');

        // When mouse is pressed, on the Circle object
        canvas.mousePressed(() => {
            if (!run && !pause) {
                objectsMap.forEach(item => {
                    if (item.clicked(sketch.mouseX, sketch.mouseY)) {
                        selectedObject = item;
                        //console.log('Clicked on :', item);

                        toggleButtons({ run: false, pause: false, stop: false, restart: false });
                        showItemProperties(selectedObject);
                    }
                });
            }

            if (pause) {
                // show alert, "Please Strop simulation before changing parameters"
                window.alert('Please Strop simulation before changing parameters');
            }
        });

        /**
         * Mouse Release hook
         */
        canvas.mouseReleased(() => {
            if (!run && !pause) {
                if (selectedObject) {
                    selectedObject.stopDragging(sketch.mouseX, sketch.mouseY);

                    // send new parameters to server
                    sendNewSettings(selectedObject.props).then((data) => {
                        console.log('Send new settings');
                    }).catch((e) => { console.error('Error updating settings', e) });

                    preSelectedObject = selectedObject;
                    selectedObject = null;
                }
            }
        });

        sketch.ellipseMode(sketch.CORNERS);

        //console.log('Init...');
        // do init
        init(convertJsonToObjects);

        // Init Websockets client (socket.io)
        socket = io();

        /**
         * Collision detected message received from server
         */
        socket.on('collision_detected', (data) => {
            // pause everything, and show reset button
            // hide form if exist
            if (preSelectedObject) preSelectedObject.hideForm();

            socket.emit("pause", {});
            run = false;
            pause = true;
            updateAll();
            collision = data;
            console.log('Collision Detected: ', data);
            toggleButtons({ run: false, pause: false, stop: false, restart: true });
        });

        /**
         * restart simulation command received
         */ 
        socket.on('restart_simulation', (data) => {
            console.log('restart_simulation received');
            pause = false;
            run = false;
            // hide form if exist
            if (preSelectedObject) preSelectedObject.hideForm();
            reinitAll(data);
            initialDraw = true;
            sketch.redraw();
        });

        /**
         * Received updated pendulum items from the server
         * @items IPendulumElem[]
         */
        socket.on('items', (data) => {
            data.forEach(d => {
                //console.log('new values=', d);
                let p = new Pendulum(d);
                objectsMap.set(d.id, p);
            });
        }
        );

        /**
         * Stop event
         */
        socket.on('stop', (data) => {
            run = false;
            reinitAll(data);
            initialDraw = true;
            sketch.redraw();
        });

        // Creating all buttons
        // Run
        buttonRun = sketch.createButton("⏵ Run");
        buttonRun.addClass('outline');
        buttonRun.position(10, 10);
        buttonRun.mousePressed(() => {
            if (!run) {
                // hide form if exist
                if (preSelectedObject) preSelectedObject.hideForm();

                pause = false;
                settingsChanges = false;
                toggleButtons({ pause: true, stop: true});
                ///buttonPause.show();
                //buttonStop.show();

                socket.emit("run", {});
                run = true;
                // update all pendulums
                updateAll();
                return false;
            } else {
                console.log('Already started');
            }
        });
        buttons.set('run', buttonRun); // add button to the map

        // Pause
        buttonPause = sketch.createButton("⏸ Pause");
        buttonPause.addClass('outline secondary');
        buttonPause.position(70, 10);
        buttonPause.mousePressed(() => {
            if (run) {
                // hide form if exist
                if (preSelectedObject) preSelectedObject.hideForm();

                socket.emit("pause", {});
                run = false;
                pause = true;
                // update all pendulums
                updateAll();
                return false;
            } else {
                console.log('Not running');
            }
        });
        buttonPause.hide();
        buttons.set('pause', buttonPause);

        // Stop
        buttonStop = sketch.createButton("⏹ Stop");
        buttonStop.addClass('outline secondary');
        buttonStop.position(150, 10);
        buttonStop.mousePressed(() => {
            if (run || pause) {
                pause = false;
                run = false;
                // hide form if exist
                if (preSelectedObject) preSelectedObject.hideForm();

                socket.emit("stop", {});
                toggleButtons({run: true, pause: false, stop: false});
                return false;
            } else {
                console.log('Not running');
            }
        });
        buttonStop.hide();
        buttons.set('stop', buttonStop);

        // Restart
        buttonRestart = sketch.createButton("Restart");
        buttonRestart.addClass('outline contrast');
        buttonRestart.position(170, 10);
        buttonRestart.mousePressed(() => {
            if (collision) {
                toggleButtons({ run: true, restart: false });
                collision = false;
                pause = false;
                run = false;

                // hide form if exist
                if (preSelectedObject) preSelectedObject.hideForm();

                socket.emit("stop", {});
                return false;
            }
        });
        buttonRestart.hide();
        buttons.set('restart', buttonRestart);
    }

    /**
     * Draw loop
     */
    sketch.draw = () => {
        if (run || initialDraw || settingsChanges) {
            if (initialDraw) {
                console.log('initialDraw');
            }
            sketch.background(255);
            updateAll(true);
            sketch.line(0, 0, 0, 768);
            sketch.fill('grey');
            sketch.rect(0, 0, 1024, 30);
            initialDraw = false;

            if (collision) {
                // show collision message if data have been received from the server
                sketch.fill('red');
                sketch.noStroke();
                sketch.text('Collision: ' + collision.message, 50, 500);
            }
            
            let fps = Math.round(sketch.frameRate());
            sketch.noStroke();
            sketch.fill('black');
            sketch.text("UI FPS: " + fps, 800, 700);

            getServerFPS();
        }
    }

    function getServerFPS() {
        let fps = 0;
        let size = objectsMap.size;
        objectsMap.forEach(item => {
            fps = fps + +item.props.fps;
        });

        if (fps === 0) fps = 300;
        console.log('fps=', fps, 'size=', size);
        let avgFps = Math.round(fps / size);
        sketch.noStroke();
        sketch.fill('black');
        sketch.text("SERVER FPS: " + avgFps, 800, 730);
    }

    /**
     * Reinitialize all items
     * @param {*} stopData IPendulumElem[]
     */
    function reinitAll(stopData) {
        if (stopData) {
            run = false;
            settingsChanges = false;
            initialConfig = [];
            selectedObject = null;
            preSelectedObject = null;
            objectsMap = new Map();
            //console.log('stopData=', stopData);
            
            stopData.forEach(item => {
                initialConfig.push(item);
            });
            
            //console.log('initialConfig=', initialConfig);
            initialConfig.forEach(item => {
                let pendulum = new Pendulum(item);
                pendulum.addForm(buildForm(pendulum));
                objectsMap.set(item.id, pendulum);
            });
            stopData = null;
            initialDraw = true;
        } else {
            console.log('No data for reinit');
        }
    }

    /**
     * Toggle buttons, if specified in array set specified value (true = show, false = hide)
     * @param {*} opt {run: boolean, pause: boolean, stop: boolean, restart: boolean} 
     */ 
    function toggleButtons(opt) {
        // hide all buttons
        if (opt.run !== undefined) {
            if (opt.run) buttons.get('run').show();
            else buttons.get('run').hide();
        }

        if (opt.pause !== undefined) {
            if (opt.pause) buttons.get('pause').show();
            else buttons.get('pause').hide();
        }

        if (opt.stop !== undefined) {
            if (opt.stop) buttons.get('stop').show();
            else buttons.get('stop').hide();
        }

        if (opt.restart !== undefined) {
            if (opt.restart) buttons.get('restart').show();
            else buttons.get('restart').hide();
        }
    }

    /**
     * Prebuild all Pendulum properties forms
     * @param {*} pendulum Pendulum
     * @returns HTMLDiv element
     */
    function buildForm(pendulum) {
        // main container
        let containerDiv = sketch.createDiv();
        containerDiv.addClass('form');
        containerDiv.id('f_' + pendulum.props.id);

        let titleDiv = sketch.createDiv('Pendulum properties:').parent(containerDiv);
        titleDiv.addClass('title');

        let txt = sketch.createDiv('Ball size:').parent(containerDiv);
        txt.position(11, 70);

        let sizeSlider = sketch.createSlider(20, 60, pendulum.props.ball_radius).parent(containerDiv);
        sizeSlider.size(150);
        sizeSlider.position(10, 100);
        sizeSlider.input(() => {
            //console.log(sizeSlider.value());
            pendulum.props.ball_radius = sizeSlider.value();
            //console.log('bl_rad', pendulum.props.ball_radius);
        });

        let txt2 = sketch.createDiv('Friction Air (0 -> 1)').parent(containerDiv);
        txt2.position(11, 120);
        let airSlider = sketch.createSlider(0, 100, pendulum.props.friction_air * 100).parent(containerDiv);
        airSlider.size(150);
        airSlider.position(10, 140);
        airSlider.input(() => {
            //console.log(airSlider.value());
            pendulum.props.friction_air = airSlider.value() / 100;
            //console.log('fa_rad', pendulum.props.friction_air);
        });


        // Save button
        let buttonSave = sketch.createButton("✓ Save").parent(containerDiv);
        buttonSave.position(10, 220);
        buttonSave.addClass('outline saveb');
        buttonSave.mouseReleased(() => {
            // send new parameters to server
            //console.log('Updating settings');
            sendNewSettings(pendulum.props).then((data) => {
                console.log(data);
            }).catch((e) => { console.error('Error updating settings', e) });

            // hide form
            pendulum.hideForm();
            settingsChanges = false;

            // update backup properties with new values
            pendulum.props_backup = { ...pendulum.props };
            toggleButtons({ run: true, stop: false, pause: false, restart: false });
        });

        // Cancel button
        let buttonCancel = sketch.createButton("Cancel").parent(containerDiv);
        buttonCancel.position(180, 220);
        buttonCancel.addClass('outline pico-background-fuchsia-450 cancelb');
        buttonCancel.mousePressed(() => {
            // reset properties, clone object just in case
            pendulum.props = { ...pendulum.props_backup };

            // hide form
            pendulum.hideForm();
            settingsChanges = false;
            initialDraw = true;
            toggleButtons({ run: true });
            return false;
        });

        containerDiv.style("display", "none");
        return containerDiv;
    }

    /**
     * Show Properties DIV for selected ELement
     * @param {*} item Pendulum
     */
    function showItemProperties(item) {
        if (item) {
            //console.log('prev selected=', preSelectedObject);
            // hide previous
            if (preSelectedObject) preSelectedObject.hideForm();
            item.showForm();
            settingsChanges = true;
        } else {
            sketch.background(255);
        }
    }

    /**
     * redraw all Pendulum items
     * @param {*} andDraw boolean
     */
    function updateAll(andDraw = false) {
        objectsMap.forEach(item => {
            if (andDraw) {
                item.show();
            }
        });
    }

    // if the mouse pressed when on the image 
    /*sketch.mouseDragged = () => {
        if (selectedObject) {
            //selectedObject.drag();
        }
    }*/

    /**
     * Main Class for Pendulum
     */
    class Pendulum {
        /**
         * Properties
         * @typeof IPendulumElem 
         */
        props = {};

        /**
         * Copy of properties, before changes. Needed to implement Cancel button for properties
         */
        props_backup = {};

        dragging = false;
        form = null;

        constructor(props) {
            this.props = props;
            this.props_backup = { ...props };
        }

        /**
         * Add properties Form to the Pendulum
         * @param {*} form 
         */
        addForm(form) {
            this.form = form;
        }

        /**
         * Get properties Form
         * @returns 
         */
        getForm() {
            return this.form;
        }

        /**
         * Hide properties Form
         */
        hideForm() {
            this.form.style("display", "none");
        }

        /**
         * Show properties Form
         */
        showForm() {
            this.form.style("display", "block");
        }

        /**
         * Show Pendulum
         */
        show() {
            let x, y;
            if (this.dragging) {
                x = sketch.mouseX;
                y = sketch.mouseY;
            } else {
                x = this.props.ball_position.x;
                y = this.props.ball_position.y;
            }

            sketch.stroke(0);
            sketch.strokeWeight(2);

            // Draw the arm
            sketch.line(x, y, this.props.rope_start_position.x, this.props.rope_start_position.y);
            sketch.ellipseMode(sketch.CENTER);
            sketch.fill(this.props.fill_color);

            // Draw the ball
            sketch.ellipse(x, y, this.props.ball_radius * 2, this.props.ball_radius * 2);

            sketch.fill(255);
            sketch.strokeWeight(1);
            sketch.stroke(0);
            sketch.text(this.props.id, x-4, y+3);

        }

        // Method checks to see if we clicked on the Pendulum Ball
        clicked(mx, my) {
            //console.log('Clicked: ', mx, my);

            let d = sketch.dist(mx, my, this.props.ball_position.x, this.props.ball_position.y);
            if (d < (this.props.ball_radius)) {
                //console.log('dragging start');
                //console.log(`Item position: item_pos.x=${this.props.ball_position.x}, item_pos.y=${this.props.ball_position.y}, mousex=${mx}, mousey=${my}`);
                //console.log(this.props);
                this.dragging = true;
                run = false;
                return true;
            } else {
                this.dragging = false;
                return false;
            }
        }

        /**
         * No more Ball dragging
         * @param {*} nx 
         * @param {*} ny 
         */
        stopDragging(nx, ny) {
            this.props.ball_position.x = nx;
            this.props.ball_position.y = ny;
            this.props_backup = { ...this.props };
            this.dragging = false;
        }
    }
};

// Connect P5 to DOM
let myp5 = new p5(s, document.getElementById('playground'));