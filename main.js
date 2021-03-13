const PIXI = require('pixi.js');//for rendering
window.PIXI = PIXI;//global pixi
const PixiTween = require('pixi-tween');//for animation
import * as _ from "lodash"//for random ans shuffle
import { Howl} from 'howler';
import bg_sound from "./sounds/bg_sound.mp3"
import mouseover_sound from  './sounds/mouseover.mp3'
import timer_sound from './sounds/timer.wav'
import correct_sound from './sounds/correct.wav'
import wrong_sound from './sounds/wrong.wav'
import new_correct_sound from './sounds/new_correct.wav'
import victory_sound from './sounds/victory.wav'
import { GlowFilter } from '@pixi/filter-glow';
//import * as particles from 'pixi-particles'
import background from './images/background.jpg'
import tank from './images/tank.png'
import cursor from './images/cursor.png'
import circle from './images/circle.png'
import play from './images/play.png'
import restart from './images/restart.png'
import { Renderer } from "pixi.js";
import { compact, fill } from "lodash";
//import smoke from './images/smoke.png'
let thatApp = null;//to access app globally
let misclick = 0;//counts misclick


////////////////////--------------------------SOUNDS------------------------------------------//////////////////////////////
const background_sound = new Howl({
    src: [bg_sound]
});
background_sound.play();

const iswrong_sound = new Howl({
    src: [wrong_sound]
});
const iscorrect_sound = new Howl({
    src: [correct_sound]

});
const isnewcorrect_sound = new Howl({
    src: [new_correct_sound]
});
const isvictory_sound = new Howl({
    src: [victory_sound]
});

const timertick_sound = new Howl({
    src: [timer_sound]
});

const ismouseover_sound = new Howl({
    src: [mouseover_sound],
});


const nextletter = new PIXI.Text();
const nextletter_container = new PIXI.Container();
class Goti extends PIXI.Sprite {
    /**
     * @type {PIXI.Graphics}
     */
    background = null;//the circle graphics object
    /**
     * @type {PIXI.Text}
     */
    textField = null;//textfield of the circle
    letter = '';//defining variable to compare if the correct circle is pressed
    original_letter_array = game.letter_array;//stores the original letter array 
    /**
     * 
     * @param {string} letter 
     * @param {number} x 
     * @param {number} y 
     */
    init(letter, app) {
        this.mycircles("0xc11a5d", letter, app);//creating a graphics with color

        const style = new PIXI.TextStyle({
            fontFamily: "Comic Sans MS",
            fontSize: 200,
            fontWeight: "bold",
            fill: "#DDDDDD"
        });
        nextletter.text = "A"
        nextletter.style = style;
        nextletter.position.x = 1100;
        nextletter.position.y = 150;
        nextletter_container.addChild(nextletter);
        this.interactive = true;//is the graphics interactive?
        if (this.interactive == true) {//if interactive
            this.on('pointerdown', () => {//then on click do myclick(letter_array) it takes letter_array parameter to check if the correct circle is pressed.
                this.myclick(game.letter_array, app)
            })
        }
    }
    new_correct(letter_array) {//returns the next correct letter to be pressed "HINT" 
        let required_index = this.original_letter_array.length - letter_array.length;//the required index of the new correct letter is always equal to the difference b/w the original array  and the changed letter array.
        for (let loop = 0; loop < game.gotis.length; loop++) {//loops through and checks the value that satisfies.
            if (this.original_letter_array[required_index] == game.gotis[loop].letter) {//check the correct one
                const correct_goti = game.gotis[loop];//for returning
                return correct_goti;//returns
            };
        }
    }
    showcorrect() {
        const temp = this.new_correct(game.letter_array)
        const tween = PIXI.tweenManager.createTween(nextletter_container);
        tween.from({ alpha: 1 }).to({ alpha: 0 });
        tween.time = 1000;
        tween.start();
        nextletter_container.addChild(nextletter);
        tween.on("end", () => {
            if (temp == undefined) {
                tween.stop()
            }
            else {
                nextletter.text = `${temp.letter}`;
                const tween2 = PIXI.tweenManager.createTween(nextletter_container);
                tween2.from({ alpha: 0 }).to({ alpha: 1 });
                tween2.time = 1000;
                tween2.start();
            }
        })
    }
    myclick(letter_array, app) {//function that works when mouse is pressed
        if (this.letter == letter_array[0]) {//the letter_array contains the correct order for clicks so this is condition to check if correct circle is pressed.
            this.interactive = false;//after pressing the circle it is no longer interactive
            letter_array.shift()//removes the clicked cirlce so as to maintain correct order for next iteration.
            misclick = 0;
            this.showcorrect()
            this.myanimation(letter_array, app);//calls myanimation that is responsible for tweens of the correct circle (after click).
            this.checkwinner(letter_array,app);

        }
        else {//if wrong circle is clicked.
            const wrongclick_tween = PIXI.tweenManager.createTween(this);//shakes the wrong click.
            wrongclick_tween.from({ x: this.x, y: this.y }).to({ x: this.x + 10, y: this.y });
            wrongclick_tween.pingPong = true;//pingpong motion.
            wrongclick_tween.time = 100;//time for tween.
            wrongclick_tween.repeat = 1;//no of times tween is repeated.
            iswrong_sound.play()//played sound linked with wrong click.
            wrongclick_tween.start()//starts tween.

            misclick++//counts no of misclick by user
            if (misclick == 3) {//is more than 3 misclick it gives hint.
                let correct_goti = this.new_correct(letter_array);//accepts correct circle from new_correct function and adds a Glowfilter in it.
                isnewcorrect_sound.play();//plays sound linked with the hints.
                correct_goti.filters = [new GlowFilter({
                    innerStrength: 4,
                    color: 0x00ff00

                })];
                misclick = 0;//resets misclick
            }
        }
    }
    myanimation(letter_array, app) {//animation for correct clicks.
        const store_tween = PIXI.tweenManager.createTween(this);//storing in the tank animation.
        this.filters=false;
        store_tween.from({ x: this.x, y: this.y }).to({ x: _.random(1100, 1200), y: 615 })//tweens from and to
        store_tween.time = 600;//tween time
        iscorrect_sound.play();//plays sound linked with correct click.
        store_tween.start();//starts tween.
    }

    mycircles(colour, letter, app) {//creating graphics object.
        let texture = new PIXI.Texture.from(circle);
        let circle_sprite = new PIXI.Sprite(texture);
        circle_sprite.width = app.view.width / 14;
        circle_sprite.height = app.view.height / 9;
        circle_sprite.anchor.set(0.5, 0.5)
        this.addChild(circle_sprite);//adds as a child of single goti which is an object of GOTI i.e Pixi sprite
        this.mytext(letter);
    }


    mytext(letter) {//function that adds textfield as a child of single goti which is an object of GOTI i.e Pixi sprite
        let style = new PIXI.TextStyle({
            dropShadow: true,
            dropShadowAngle: 45,
            dropShadowDistance: 2,
            dropShadowColor: "0xffffff",
            fill: "0x000000",
            fontSize: 30,
            fontWeight: "bold"
        });
        this.textField = new PIXI.Text(letter);
        this.textField.style = style
        this.textField.y = -15;
        this.textField.x = -10;
        this.letter = letter;
        this.addChild(this.textField);
    }



    //////////////////------------Collision_Check----------------
    /**
     * 
     * @param {Board} board 
     */
    placeme(board) {//it takes the board class as a parameter. THIS IS RESPONSIBLE FOR COLLISION CHECK     
        while (true) {
            let ranx = _.random(50, 800);
            let rany = _.random(50, 800);
            const neighbours = this.getMyNeighbours(board, ranx, rany);
            if (neighbours.length == 0) {
                const spread_tween = PIXI.tweenManager.createTween(this);
                spread_tween.from({ x: _.random(300, 310), y: _.random(300, 310) }).to({ x: ranx, y: rany });//spreading anim
                spread_tween.time = 1000;//time taken to spread 
                spread_tween.start();
                if (spread_tween.active == true) {//buttons arent interactive during tween
                    this.interactive = false;
                }
                spread_tween.on("end", () => this.interactive = true)//user's click only work after tween is ended.
                this.laterx = ranx;
                this.latery = rany;
                this.on("mouseover",()=>
                {
                    this.filters=[new GlowFilter({
                        innerStrength:2,
                        color:0xD3D3D3
                    })];
                    const scale_tween=PIXI.tweenManager.createTween(this.scale);
                    ismouseover_sound.play();
                    scale_tween.from({x:1,y:1}).to({x:1.1,y:1.1})
                    scale_tween.time=100;
                    scale_tween.start()
                    
                });
                this.on("mouseout",()=>{
                    this.filters=false;
                    const scale_tween=PIXI.tweenManager.createTween(this.scale);
                    ismouseover_sound.play();
                    scale_tween.from({x:1.1,y:1.1}).to({x:1,y:1})
                    scale_tween.time=100;
                    scale_tween.start()
                })
                break;
            }
        }
    }
    getMyNeighbours(board, randx, randy) {//checks neighbours
        const neighbours = board.gotis.filter(a => {
            let bool = this.checkBound(a.laterx, a.latery, randx, randy);
            return bool;
        });
        return neighbours;
    }
    checkBound(p, q, r, s) {//checks if every point on rectangles collides
        const length = 100;
        const rect1 = { x1: p, y1: q, x2: p + length, y2: q, x3: p + length, y3: q + length, x4: p, y4: q + length };
        const rect2 = { x1: r, y1: s, x2: r + length, y2: s, x3: r + length, y3: s + length, x4: r, y4: s + length };
        if (this.checkPoint(rect1, rect2.x1, rect2.y1) || this.checkPoint(rect1, rect2.x2, rect2.y2) || this.checkPoint(rect1, rect2.x3, rect2.y3) || this.checkPoint(rect1, rect2.x4, rect2.y4)) {
            return true;
        }
        return false;
    }
    checkPoint(rect1, x1, y1) {//main condition for checking collison.
        if ((x1 >= rect1.x1 && x1 <= rect1.x3) && (y1 >= rect1.y1 && y1 <= rect1.y3)) {
            return true;
        }
        return false;
    }


    /////////////-------------------Checks Winner and Resets-----------
    checkwinner(letter_array, app) {
        if (letter_array.length == 0) {//if letter_array is empty.
            setTimeout(()=>{
            isvictory_sound.play();//plays sound of victory
            game.reset(app);//resets game
            },500);
        }
    }
}
//let that_cursor = null;
//////----global variables of timer----
let hours = 0;
let minutes = 0;
let seconds = -1;
let timer = new PIXI.Text();
let timeinterval;


class Board {
    spot_container = new PIXI.Container();//all the single gotis are here
    //particle_cont=new ParticleContainer();
    letter_array = [];//correct order letter_array
    gotis = [];//array of all gotis.
    timetext_container = new PIXI.Container();//timer container
    tank_texture = PIXI.Texture.from(tank);//tank sprite texture
    tank_sprite = new PIXI.Sprite(this.tank_texture);

    init() {
        const app = new PIXI.Application({//Main Application
            width: 1400,
            height: 900,
            backgroundColor: 0x006400,
            antialias: true//smoothens graphics.
        });

        window.onresize = function (event){
            var w = window.innerWidth;
            var h = window.innerHeight;
        
            //this part resizes the canvas but keeps ratio the same     
            app.view.style.width = w + "px";
            app.view.style.height = h + "px";
        
            //this part adjusts the ratio:
            app.resize(w,h);
        }

        let back_texture = PIXI.Texture.from(background);
        let back_img = new PIXI.Sprite(back_texture);
        back_img.zIndex = -1;
        back_img.width = app.view.width;
        back_img.height = app.view.height;
        app.stage.addChild(back_img);
        //console.log(app.view.width)

        document.getElementById("mydiv").appendChild(app.view);
        app.view.style.width = "100%";
        app.view.style.height = "100vh";
        app.view.style.maxHeight = 600;
        app.view.style.maxWidth = 900;


        const play_texture = PIXI.Texture.from(play);
        const play_button = new PIXI.Sprite(play_texture);
        play_button.width=app.view.width*0.5;
        play_button.height=app.view.height*0.3;
        play_button.anchor.set(0.5, 0.5)
        play_button.x = app.view.width / 2;
        play_button.y = app.view.height / 2
        play_button.interactive = true;
        app.stage.addChild(play_button);
        play_button.on("mouseover",()=>{
            ismouseover_sound.play();
            play_button.filters=[new GlowFilter({
            innerStrength: 1,
            color: 0xD3D3D3

        })]});
        play_button.on("mouseout",()=>{play_button.filters=false})
        play_button.on("pointerdown", () => {
            play_button.filters=false;
            const fade_tween = PIXI.tweenManager.createTween(play_button);
            fade_tween.from({ alpha: 1 }).to({ alpha: 0 });
            fade_tween.time = 500;
            fade_tween.start();
            fade_tween.on("end", () => { app.stage.removeChild(play_button); })
            timeinterval = setInterval(() => { this.mytimer(app) }, 1000);//called every 1 sec and increases seconds by 1.
            //document.getElementById("mydiv").style.cursor = 'none';//hide cursor
            app.stage.addChild(this.timetext_container);//add timer on canvas
            app.stage.addChild(nextletter_container);//displays correct one
            thatApp = app;//declare globally.
            this.draw(app);//draw gotis.
            app.stage.addChild(this.spot_container);//add gotis on canvas

            this.tank_sprite.x = 1000;
            this.tank_sprite.y = 600;
            this.tank_sprite.width = 300;
            this.tank_sprite.height = 300;
            app.stage.addChild(this.tank_sprite);//add tank sprite on canvas
            /*
            let texture2 = PIXI.Texture.from(cursor)//cursor sprite texture
            let cursor_img = new PIXI.Sprite(texture2);
            cursor_img.width = 50;
            cursor_img.height = 50;
            app.stage.addChild(cursor_img);//add cursor sprite on canvas
            that_cursor = cursor_img;//access globally.
            //app.stage.interactive = true;//the app is interactive with the cursor
            //app.stage.on("pointermove", this.movePlayer); //when cursor pointer moves.
            */
            app.ticker.add((delta) => {//This runs throughout the game.
                PIXI.tweenManager.update();//updates all required tweens.

            })
        })

    }
    /*
    movePlayer(e) {//when cursor is moved.
        let pos = e.data.global;
        that_cursor.x = pos.x;
        that_cursor.y = pos.y;
    }
    */

    ////////////////------draws gotis objects------------
    draw(app) {
        const start = 'A'.charCodeAt(0);//starting letter code
        const end = 'C'.charCodeAt(0);//ending letter code
        for (let counter = start; counter <= end; counter++) {
            this.letter_array.push(String.fromCharCode(counter));//extracts letter from Character code with use of loop.
        }

        let shuffled = _.shuffle(this.letter_array);//shuffles the whole letter_array for randomness. using lodash i.e _.

        for (let loop = 0; loop < shuffled.length; loop++) {//creates same no of goti object as shuffled array lengh. 
            const singleGoti = new Goti();//create goti object
            this.gotis.push(singleGoti);//append goti in an array named gotis
            singleGoti.init(shuffled[loop], app);//initialization.
            this.spot_container.addChild(singleGoti);//adds in spot_container
            singleGoti.placeme(this);//checks for collison
        }

    }
    //////-----this is the timer-------------
    mytimer(app) {//called through setInterval every second.
        const style = new PIXI.TextStyle({
            fontFamily: "Comic Sans MS",
            fontSize: 36,
            fontWeight: "bold",
            fill: "#DDDDDD"
            //stroke: "#b5651d",
            //strokeThickness: 40
        });
        timertick_sound.play();
        seconds++//increases second by 1 every second
        
        if(seconds==10 || seconds==30 ||seconds==50){ style.fill="#ff0000"};
        if (seconds == 60) {
            minutes++;//increases min if seconds is 60;
            style.fill="#ff0000";
            seconds = 0;//reset seconds
        }
        if (minutes == 60) {
            hours++;//increases hours if minutes is 60;
            style.fill="#ff0000";
            minutes = 0;//reset minutes
        }
        timer.text = `Time Elapsed: ${hours}:${minutes}:${seconds}`;
        timer.style = style;
        timer.position.x =app.view.width-400;
        timer.position.y = 50;
        this.timetext_container.addChild(timer);//adds timer in timetext_container

    }
    showscore(app){
        clearInterval(timeinterval);//stops timer.
        const style = new PIXI.TextStyle({
            fontFamily: "Comic Sans MS",
            fontSize: 80,
            fontWeight: "bold",
            fill: "#DDDDDD"
        });
        const score_text = new PIXI.Text();
        if (minutes == 0) {
            score_text.text = `You finished in \n \t \t ${seconds} secs!`;
        }
        else if (hours == 0) {
            score_text.text = `\t You finished in \n ${minutes} mins & ${seconds} secs!`;
        }
        else {
            score_text.text = `\t \t You finished in \n ${hours} hr ${minutes} mins ${seconds} secs!`;
        }
        score_text.style = style;
        score_text.position.x = app.view.width / 4;
        score_text.position.y = app.view.width / 6;
        this.timetext_container.alpha=0;
        this.timetext_container.addChild(score_text);
    }
    reset(app) {//resets game
        this.showscore(app);
        const restart_texture=PIXI.Texture.from(restart);
        const restart_button=new PIXI.Sprite(restart_texture);
        restart_button.width=app.view.width*0.2;
        restart_button.height=app.view.height*0.2;
        restart_button.x=app.view.width*0.4;
        restart_button.y=app.view.height*0.65;
        restart_button.anchor.set(0.5,0.5);
        restart_button.interactive=true;

        const fade_tween = PIXI.tweenManager.createTween(this.timetext_container);
        fade_tween.from({ alpha: 0 }).to({ alpha: 1 });
        fade_tween.time = 900;
        fade_tween.start();
        fade_tween.on("start",()=>{ app.stage.removeChild(nextletter_container);})//removes display of  correct one})
        fade_tween.on("end", () => {
            app.stage.addChild(restart_button);
        });
        
        restart_button.on("mouseover",()=>{
            ismouseover_sound.play();
            restart_button.filters=[new GlowFilter({
            innerStrength: 1,
            color: 0xD3D3D3

        })]});
        restart_button.on("mouseout",()=>{restart_button.filters=false})

        restart_button.on("pointerdown",()=>{
            restart_button.filters=false;
            this.gotis.splice(0,this.gotis.length); 
            this.letter_array.splice(0,this.letter_array.length);
            this.spot_container.removeChildren();
            this.timetext_container.removeChildren();
            app.stage.removeChild(this.tank_sprite);
            app.stage.removeChild(this.timetext_container);//add timer on canvas
            const fade_tween = PIXI.tweenManager.createTween(restart_button);
            fade_tween.from({ alpha: 1 }).to({ alpha: 0 });
            fade_tween.time = 500;
            fade_tween.start();
            fade_tween.on("end", () => { app.stage.removeChild(restart_button); 
                hours=0;
                minutes=0;
                seconds=-1;
                this.timetext_container.removeChildren();})
            

            
            timeinterval = setInterval(() => {
                this.mytimer(app);}, 1000);//called every 1 sec and increases seconds by 1.
            app.stage.addChild(this.timetext_container);
            const style = new PIXI.TextStyle({
                fontFamily: "Comic Sans MS",
                fontSize: 200,
                fontWeight: "bold",
                fill: "#DDDDDD"
            });
            nextletter.text = "A"
            nextletter.style = style;
            nextletter.position.x = 1100;
            nextletter.position.y = 150;
            app.stage.addChild(nextletter_container)
            this.draw(app);
            app.stage.addChild(this.spot_container);
            app.stage.addChild(this.tank_sprite);
        });
    }
}
const game = new Board();//game object
game.init();//start game application.


