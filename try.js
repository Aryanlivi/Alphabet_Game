import * as PIXI from 'pixi.js'
import smoke from './images/smoke.png'
import * as particles from 'pixi-particles'
import { ParticleContainer } from 'pixi.js';
const mycanvas = document.getElementById("mycanvas");
mycanvas.style.marginLeft = window.innerWidth / 6;
const app = new PIXI.Application({
    view: mycanvas,
    width: 1400,
    height: 920,
    backgroundColor: 0xAAAAAA,
    antialias: true,
});
let particle_cont=new ParticleContainer();
let texture3=PIXI.Texture.from(smoke);
let emitter=new particles.Emitter(
    particle_cont,
    [texture3],
    {
        "alpha": {
            "start": 0.8,
            "end": 0.1
        },
        "scale": {
            "start": 1,
            "end": 0.3
        },
        "color": {
            "start": "fd1111",
            "end": "f7a134"
        },
        "speed": {
            "start": 200,
            "end": 200
        },
        "startRotation": {
            "min": 0,
            "max": 0
        },
        "rotationSpeed": {
            "min": 0,
            "max": 0
        },
        "lifetime": {
            "min": 0.5,
            "max": 0.5
        },
        "frequency": 0.1,
        "emitterLifetime": 0.31,
        "maxParticles": 1000,
        "pos": {
            "x": 0,
            "y": 0
        },
        "addAtBack": false,
        "spawnType": "burst",
        "particlesPerWave": 10,
        "particleSpacing": 0,
        "angleStart": 0
    }
);
particle_cont.addChild(emitter);
app.stage.addChild(particle_cont);
console.log(particle_cont);
app.ticker.add((delta)=>{
    emitter.update();
})
emitter.emit=true;

