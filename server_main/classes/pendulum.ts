// Interface for one Pendulum Element
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
