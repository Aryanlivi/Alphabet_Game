import * as PIXI from 'pixi.js'
import * as _ from "lodash"
window['PIXI']=PIXI;
const PixiTween = require('pixi-tween');

import tank from './images/tank.png'

let thatApp=null;
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
    myclick(letter_array) {
        if (this.letter == letter_array[0]) {
            this.iscorrect=true;
            console.log("correct!");
            console.log(this.letter);
            this.interactive = false;
            letter_array.shift()
            this.myanimation();
            this.checkwinner(letter_array)
            zincrease++

        }
        else {
            alert("WRONG TRY AGAIN!");
        }
    }
    myanimation(){
        this.background.clear();
        this.background.lineStyle(3,"0x000000")
        this.background.beginFill("0x00ff00");
        this.background.drawCircle(0,0,20);
        this.background.endFill();
        const tween=PIXI.tweenManager.createTween(this);
        const path=new PIXI.tween.TweenPath();
        path.moveTo(this.x,this.y)
        path.bezierCurveTo(20,100,200,100,200,20);
        tween.path=path;
        tween.time=1000;
        tween.start();
       
    
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
                const tween=PIXI.tweenManager.createTween(this);
                tween.from({x:_.random(300,310),y:_.random(300,310)}).to({x:ranx,y:rany});
                tween.time=3000;
                tween.start();
                if(tween.active==true){
                    this.interactive=false;
                }
                tween.on("end",()=>this.interactive=true)//user's click only work after tween is ended.
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
        }
    }
}
class Board {
    spot_container = new PIXI.Container();
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
        app.ticker.add((delta)=>{
          
            PIXI.tweenManager.update();
        })
        
    }
    draw() {
        const start = 'A'.charCodeAt(0);
        const end = 'Z'.charCodeAt(0);
        for (let counter = start; counter <= end; counter++) {
            this.letter_array.push(String.fromCharCode(counter));
        }
        let shuffled = _.shuffle(this.letter_array)
        //let shuffled=(this.letter_array)
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
