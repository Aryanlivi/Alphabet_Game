import * as PIXI from 'pixi.js'
import * as _ from "lodash"
window['PIXI']=PIXI;
import {GlowFilter} from '@pixi/filter-glow';
import * as particles from 'pixi-particles'
const PIXItween = require('pixi-tween')
import tank from './images/tank.png'
import cursor from './images/cursor.png'
import smoke from './images/smoke.png'
import { ParticleContainer } from 'pixi.js';

document.body.style.cursor = 'none';//hide cursor
let thatApp=null;//to access app globally
let misclick=0;
class Goti extends PIXI.Sprite {
    /**
     * @type {PIXI.Graphics}
     */
    background = null;
    /**
     * @type {PIXI.Text}
     */
    textField = null;
    /**
     *@type {string} 
     */
    letter = '';
    iscorrect=false;
    correct_val=null;
    original_letter_array=game.letter_array;
    /**
     * 
     * @param {string} letter 
     * @param {number} x 
     * @param {number} y 
     */
    init(letter) {
        this.anchor = new PIXI.Point(0.5, 0.5);
        this.mycircles("0xff0000");
        this.mytext(letter);
        this.interactive = true;
        if (this.interactive == true) {
            this.on('click', () => {
            this.myclick(game.letter_array)
            })
        }
    }
    new_correct(letter_array){
        let required_index=this.original_letter_array.length-letter_array.length;
        for(let loop=0;loop<game.gotis.length;loop++){
            if(this.original_letter_array[required_index]==game.gotis[loop].letter){
                console.log("yes")
                const correct_goti=game.gotis[loop];
                return correct_goti;
            };
        }
    }
    myclick(letter_array){
        if (this.letter == letter_array[0]) {
            this.iscorrect=true;
            console.log("correct!");
            console.log(this.letter);
            this.interactive = false;
            letter_array.shift()
            this.myanimation();
            this.checkwinner(letter_array);
        }
        else {
            const wrongclick_tween=PIXI.tweenManager.createTween(this);
            wrongclick_tween.from({x:this.x,y:this.y}).to({x:this.x+10,y:this.y});
            wrongclick_tween.pingPong=true;
            wrongclick_tween.time=100;
            wrongclick_tween.repeat=1;
            wrongclick_tween.start()
            misclick++
            if(misclick>=3){
                let correct_goti=this.new_correct(letter_array);
                correct_goti.filters=[new GlowFilter({
                    innerStrength:4,
                    color:0x00ff00
                    
                })];
            }
        }
    }
    myanimation(){
        this.filters=[new GlowFilter({
            innerStrength:1,
            color:0x000000,
            knockout:true
            
        })];
        const store_tween=PIXI.tweenManager.createTween(this);
        store_tween.from({x:this.x,y:this.y}).to({x:_.random(1100,1200),y:615})
        store_tween.time=1200;
        store_tween.start();
    }
    mycircles(colour,letter) {
        this.colour = colour;
        this.background = new PIXI.Graphics();
        this.background.lineStyle(3, 0x000000);
        this.background.beginFill(this.colour);
        this.background.drawCircle(0, 0, 30);
        this.background.endFill();
        this.addChild(this.background);
        this.mytext(letter);
    }
    mytext(letter) {
        this.textField = new PIXI.Text(letter);
        this.textField.y = -15;
        this.textField.x = -10;
        this.letter = letter;
        this.addChild(this.textField);
    }

    /**
     * 
     * @param {Board} board 
     */
    placeme(board) {
        while (true) {
            let ranx = _.random(50, 800);
            let rany = _.random(50, 800);
            const neighbours = this.getMyNeighbours(board, ranx, rany);
            if (neighbours.length == 0) {
                const spread_tween=PIXI.tweenManager.createTween(this);
                /*
                const path=new PIXI.tween.TweenPath();
                path.moveTo(20,100);
                path.drawCircle(0,0,30);
                tween.path=path;
                */
                spread_tween.from({x:_.random(300,310),y:_.random(300,310)}).to({x:ranx,y:rany});
                spread_tween.time=1000;
                spread_tween.start();
                if(spread_tween.active==true){
                    this.interactive=false;
                }
                spread_tween.on("end",()=>this.interactive=true)//user's click only work after tween is ended.
                this.laterx = ranx;
                this.latery = rany;
                break;
            }
        }
    }
    getMyNeighbours(board, randx, randy) {
        const neighbours = board.gotis.filter(a => {
            let bool = this.checkBound(a.laterx, a.latery, randx, randy);
            return bool;
        });
        return neighbours;
    }
    checkBound(p, q, r, s) {
        const length = 100;
        const rect1 = { x1: p, y1: q, x2: p + length, y2: q, x3: p + length, y3: q + length, x4: p, y4: q + length };
        const rect2 = { x1: r, y1: s, x2: r + length, y2: s, x3: r + length, y3: s + length, x4: r, y4: s + length };
        if (this.checkPoint(rect1, rect2.x1, rect2.y1) || this.checkPoint(rect1, rect2.x2, rect2.y2) || this.checkPoint(rect1, rect2.x3, rect2.y3) || this.checkPoint(rect1, rect2.x4, rect2.y4)) {
            return true;
        }
        return false;
    }
    checkPoint(rect1, x1, y1) {
        if ((x1 >= rect1.x1 && x1 <= rect1.x3) && (y1 >= rect1.y1 && y1 <= rect1.y3)) {
            return true;
        }
        return false;
    }
    checkwinner(letter_array) {
        if (letter_array.length == 0) {
            alert("YOU WON!");
            setTimeout(game.reset,1000)
        }
    }
}
let that_cursor=null;
class Board {
    spot_container = new PIXI.Container();
    particle_cont=new ParticleContainer();
    alphabet_container=new PIXI.Container();
    letter_array = [];
    value_array = [];
    gotis = [];

    init() {
        const mycanvas = document.getElementById("mycanvas");
        mycanvas.style.marginLeft = window.innerWidth / 6;
        const app = new PIXI.Application({
            view: mycanvas,
            width: 1400,
            height: 920,
            backgroundColor: 0xAAAAAA,
            antialias: true,
        });
        thatApp=app;
        this.draw(app);
        app.stage.addChild(this.spot_container);
        
        let texture=PIXI.Texture.from(tank);
        let img=new PIXI.Sprite(texture);
        img.x=1000; 
        img.y=600;
        img.width=300;
        img.height=300;
        app.stage.addChild(img);
        let texture2=PIXI.Texture.from(cursor)
        let cursor_img=new PIXI.Sprite(texture2);
        cursor_img.width=50;
        cursor_img.height=50;
        app.stage.addChild(cursor_img);
        that_cursor=cursor_img;
        app.stage.interactive=true;
        app.stage.on("pointermove",this.movePlayer);    
        
        let texture3=PIXI.Texture.from(smoke);
        let emitter=new particles.Emitter(
            this.particle_cont,
            [texture3],
            {
                alpha: {
                    list: [
                        {
                            value: 0.8,
                            time: 0
                        },
                        {
                            value: 0.1,
                            time: 1
                        }
                    ],
                    isStepped: false
                },
                scale: {
                    list: [
                        {
                            value: 100,
                            time: 0
                        },
                        {
                            value: 0.3,
                            time: 1
                        }
                    ],
                    isStepped: false
                },
                color: {
                    list: [
                        {
                            value: "#fd1111",
                            time: 0
                        },
                        {
                            value: "f7a134",
                            time: 1
                        }
                    ],
                    isStepped: false
                },
                speed: {
                    list: [
                        {
                            value: 200,
                            time: 0
                        },
                        {
                            value: 100,
                            time: 1
                        }
                    ],
                    isStepped: false
                },
                startRotation: {
                    min: 0,
                    max: 360
                },
                rotationSpeed: {
                    min: 0,
                    max: 0
                },
                lifetime: {
                    min: 0.5,
                    max: 1
                },
                frequency: 0.008,
                spawnChance: 1,
                particlesPerWave: 1,
                emitterLifetime:122,
                maxParticles: 1000,
                pos: {
                    x: 0,
                    y: 0
                },
                addAtBack: false,
                spawnType: "circle",
                spawnCircle: {
                    x: 0,
                    y: 0,
                    r: 100
                }
            }
        );
        app.stage.addChild(this.particle_cont);
        console.log(this.particle_cont);
        app.ticker.add((delta)=>{
            PIXI.tweenManager.update();
            emitter.update();
        })
        emitter.emit=true;
        
    }
    movePlayer(e){
        let pos=e.data.global;
        that_cursor.x=pos.x;
        that_cursor.y=pos.y;
    }
    draw() {
        const start = 'A'.charCodeAt(0);
        const end = 'Z'.charCodeAt(0);
        for (let counter = start; counter <= end; counter++) {
            this.letter_array.push(String.fromCharCode(counter));
        }
        let shuffled = _.shuffle(this.letter_array);
        for (let loop = 0; loop < shuffled.length; loop++) {
            const singleGoti = new Goti();
            this.gotis.push(singleGoti);
            singleGoti.init(shuffled[loop]);
            this.spot_container.addChild(singleGoti);
            singleGoti.placeme(this);
        }

    }
}
const game = new Board();
game.init()
