const PIXI = require('pixi.js');//for rendering
window.PIXI = PIXI;//global pixi
const PixiTween = require('pixi-tween');//for animation
import * as _ from "lodash"//for random ans shuffle
import {Howl} from 'howler';
import  correct_sound from './sounds/correct.wav'
import wrong_sound from './sounds/wrong.wav'
import  new_correct_sound from './sounds/new_correct.wav'
import victory_sound from './sounds/victory.wav'
import {GlowFilter} from '@pixi/filter-glow';
//import * as particles from 'pixi-particles'
import tank from './images/tank.png'
import cursor from './images/cursor.png'
//import smoke from './images/smoke.png'


document.body.style.cursor = 'none';//hide cursor
let thatApp=null;//to access app globally
let misclick=0;//counts misclick


////////////////////--------------------------SOUNDS------------------------------------------//////////////////////////////
const iswrong_sound=new Howl({
    src: [wrong_sound]
});
const iscorrect_sound=new Howl({
    src: [correct_sound]
    
});
const isnewcorrect_sound=new Howl({
    src: [new_correct_sound]
});
const isvictory_sound=new Howl({
    src: [victory_sound]
});

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
    original_letter_array=game.letter_array;//stores the original letter array 
    /**
     * 
     * @param {string} letter 
     * @param {number} x 
     * @param {number} y 
     */
    init(letter) {
        this.mycircles("0xc11a5d");//creating a graphics with color----> mycircles(color)
        this.mytext(letter);//creating textfield-----mytext(letter)
        this.interactive = true;//is the graphics interactive?
        if (this.interactive == true) {//if interactive
            this.on('click', () => {//then on click do myclick(letter_array) it takes letter_array parameter to check if the correct circle is pressed.
            this.myclick(game.letter_array)
            })
        }
    }
    new_correct(letter_array){//returns the next correct letter to be pressed "HINT" 
        let required_index=this.original_letter_array.length-letter_array.length;//the required index of the new correct letter is always equal to the difference b/w the original array  and the changed letter array.
        for(let loop=0;loop<game.gotis.length;loop++){//loops through and checks the value that satisfies.
            if(this.original_letter_array[required_index]==game.gotis[loop].letter){//check the correct one
                const correct_goti=game.gotis[loop];//for returning
                return correct_goti;//returns
            };
        }
    }
    myclick(letter_array){//function that works when mouse is pressed
        if (this.letter == letter_array[0]) {//the letter_array contains the correct order for clicks so this is condition to check if correct circle is pressed.
            console.log(this.letter);
            this.interactive = false;//after pressing the circle it is no longer interactive
            letter_array.shift()//removes the clicked cirlce so as to maintain correct order for next iteration.
            this.myanimation();//calls myanimation that is responsible for tweens of the correct circle (after click).
            this.checkwinner(letter_array);//checks if game has been won. --> the checkwinner function takes letter_array as to find out if any letter is yet to be pressed in the correct order.
        }
        else {//if wrong circle is clicked.
            const wrongclick_tween=PIXI.tweenManager.createTween(this);//shakes the wrong click.
            wrongclick_tween.from({x:this.x,y:this.y}).to({x:this.x+10,y:this.y});
            wrongclick_tween.pingPong=true;//pingpong motion.
            wrongclick_tween.time=100;//time for tween.
            wrongclick_tween.repeat=1;//no of times tween is repeated.
            iswrong_sound.play()//played sound linked with wrong click.
            wrongclick_tween.start()//starts tween.
            misclick++//counts no of misclick by user
            if(misclick==3){//is more than 3 misclick it gives hint.
                let correct_goti=this.new_correct(letter_array);//accepts correct circle from new_correct function and adds a Glowfilter in it.
                isnewcorrect_sound.play();//plays sound linked with the hint.
                correct_goti.filters=[new GlowFilter({//adding filters. needs to be in array!.
                    innerStrength:4,//inner strength of glow.
                    color:0x00ff00//color of glow
                    
                })];
                misclick=0;//resets misclick
            }
        }
    }
    myanimation(){//animation for correct clicks.
        /*
        this.filters=[new GlowFilter({
            innerStrength:1,
            color:0x000000,
            knockout:true
            
        })];
        */
        const store_tween=PIXI.tweenManager.createTween(this);//storing in the tank animation.
        store_tween.from({x:this.x,y:this.y}).to({x:_.random(1100,1200),y:615})//tweens from and to
        store_tween.time=1200;//tween time
        iscorrect_sound.play();//plays sound linked with correct click.
        store_tween.start();//starts tween.
    }
    mycircles(colour,letter) {//creating graphics object.
        this.colour = colour;
        this.background = new PIXI.Graphics();
        this.background.lineStyle(3, 0x000000);
        this.background.beginFill(this.colour);
        this.background.drawCircle(0, 0, 30);//circle with center(0,0) VVIP. and radius=30 units.
        this.background.endFill();
        this.background.buttonMode=true;//is a button
        this.addChild(this.background);//adds as a child of single goti which is an object of GOTI i.e Pixi sprite
        this.mytext(letter);//adds text as child function
    }
    mytext(letter) {//function that adds textfield as a child of single goti which is an object of GOTI i.e Pixi sprite
        this.textField = new PIXI.Text(letter);
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
                const spread_tween=PIXI.tweenManager.createTween(this);
                spread_tween.from({x:_.random(300,310),y:_.random(300,310)}).to({x:ranx,y:rany});//spreading anim
                spread_tween.time=1000;//time taken to spread 
                spread_tween.start();
                if(spread_tween.active==true){//buttons arent interactive during tween
                    this.interactive=false;
                }
                spread_tween.on("end",()=>this.interactive=true)//user's click only work after tween is ended.
                this.laterx = ranx;
                this.latery = rany;
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
    checkwinner(letter_array) {
        if (letter_array.length == 0) {//if letter_array is empty.
            isvictory_sound.play();//plays sound of victory.
            alert("YOU WON!");
            game.reset();//resets game
            
        }
    }
} 
let that_cursor=null;
//////----global variables of timer----
let hours=0;
let minutes=0;
let seconds=0;
let timer=new PIXI.Text();
let timeinterval=setInterval(()=>{game.mytimer(thatApp)}, 1000);//called every 1 sec and increases seconds by 1.
class Board {
    spot_container = new PIXI.Container();//all the single gotis are here
    //particle_cont=new ParticleContainer();
    letter_array = [];//correct order letter_array
    gotis = [];//array of all gotis.
    timer_container=new PIXI.Container();//timer container
    
    init() {
        const mycanvas = document.getElementById("mycanvas");//the canvas where application is.
        mycanvas.style.marginLeft = window.innerWidth / 6;//margin for canvas
        const app = new PIXI.Application({//Main Application
            view: mycanvas,
            width: 1400,
            height: 920,
            backgroundColor: 0xAAAAAA,
            antialias: true//smothens graphics.
        });
        app.stage.addChild(this.timer_container);//add timer on canvas
        thatApp=app;//declare globally.
        this.draw(app);//draw gotis.
        app.stage.addChild(this.spot_container);//add gotis on canvas

        let texture=PIXI.Texture.from(tank);//tank sprite texture
        let img=new PIXI.Sprite(texture);
        img.x=1000; 
        img.y=600;
        img.width=300;
        img.height=300;
        app.stage.addChild(img);//add tank sprite on canvas
        
        let texture2=PIXI.Texture.from(cursor)//cursor sprite texture
        let cursor_img=new PIXI.Sprite(texture2);
        cursor_img.width=50;
        cursor_img.height=50;
        app.stage.addChild(cursor_img);//add cursor sprite on canvas
        that_cursor=cursor_img;//access globally.
        app.stage.interactive=true;//the app is interactive with the cursor
        app.stage.on("pointermove",this.movePlayer); //when cursor pointer moves.

        app.ticker.add((delta)=>{//This runs throughout the game.
            PIXI.tweenManager.update();//updates all required tweens.
        })
    }
    movePlayer(e){//when cursor is moved.
        let pos=e.data.global;
        that_cursor.x=pos.x;
        that_cursor.y=pos.y;
    }

////////////////------draws gotis objects------------
    draw() {
        const start = 'A'.charCodeAt(0);//starting letter code
        const end = 'C'.charCodeAt(0);//ending letter code
        for (let counter = start; counter <= end; counter++) {
            this.letter_array.push(String.fromCharCode(counter));//extracts letter from Character code with use of loop.
        }
        
        let shuffled = _.shuffle(this.letter_array);//shuffles the whole letter_array for randomness. using lodash i.e _.
        
        for (let loop = 0; loop < shuffled.length; loop++) {//creates same no of goti object as shuffled array lengh. 
            const singleGoti = new Goti();//create goti object
            this.gotis.push(singleGoti);//append goti in an array named gotis
            singleGoti.init(shuffled[loop]);//initialization.
            this.spot_container.addChild(singleGoti);//adds in spot_container
            singleGoti.placeme(this);//checks for collison
        }

    }
//////-----this is the timer-------------
    mytimer(app){//called through setInterval every second.
        seconds++//increases second by 1 every second
        if(seconds==60){
            minutes++;//increases min if seconds is 60;
            seconds=0;//reset seconds
        }
        if(minutes==60){
            hours++;//increases hours if minutes is 60;
            minutes=0;//reset minutes
        }
        const style = new PIXI.TextStyle({
            fontFamily: "\"Palatino Linotype\", \"Book Antiqua\", Palatino, serif",
            fontSize: 26,
            fontWeight: "bold",
            stroke: "#14c853",
            strokeThickness: 40
        });        
        timer.text=`Time Elapsed: ${hours}:${minutes}:${seconds}`;
        timer.style=style;
        timer.position.x=1000;
        timer.position.y=50;
        this.timer_container.addChild(timer);//adds timer in timer_container

    }
    reset(){//resets game
        clearInterval(timeinterval);//stops timer.
    }
}
const game = new Board();//game object
game.init();//start game.

           
           