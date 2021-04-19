import Golf from './Golf'
const {magnitude, normalize, scale, capForce, distance, Vec}  = require('./utils')

import css from './css/main.css'

const canvasContainer = document.getElementById('canvas-container')
const canvas = document.getElementById("cvs")
const ctx = canvas.getContext("2d")

const KEY_W = 87;
const KEY_A = 65;
const KEY_S = 83;
const KEY_D = 68;
const KEY_SPACE = 32;
const KEY_SHIFT = 16;
 
var playerOnFloor = false;
 
var keys = [];

document.body.addEventListener("keyup", function(e) {
  keys[e.keyCode] = false;
});

document.body.addEventListener("keydown", function(e) {
  keys[e.keyCode] = true;
  if (keys[84]) { //t = testing mode
    if (game.testing) {
      game.testing = false;
    } else {
      game.testing = true;
    }
  }

  if (keys[KEY_A]) {
    Golf.view_offset({x:-10, y:0});
  } 

  if (keys[KEY_D]) {
    Golf.view_offset({x:10, y:0});
  } 

});


function expandCanvas() {
    canvas.width = canvasContainer.clientWidth;
    canvas.height = canvasContainer.clientHeight;
}

window.addEventListener('resize', expandCanvas, false);

window.onload = () => {
	//Variables
	var mousex = 0;
	var mousey = 0;
	var mousedown = false;

	var last_mousey = 0;
	var last_mousex = 0;
    // document.getElementById('output').innerHTML = 'x: '+mousex+', y:'+mousey;

	//Mousemove
	canvas.addEventListener('mousemove', function(e) {
	    mousex = parseInt(e.offsetX);
  		mousey = parseInt(e.offsetY);
	    //Output
	    // document.getElementById('output').innerHTML = 'x: '+mousex+', y:'+mousey;
	});

    expandCanvas();

    let game = Golf.create(canvas, ctx);
    Golf.run(game);

}
