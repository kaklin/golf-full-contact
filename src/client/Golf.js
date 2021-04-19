const Matter = require('matter-js')
const Level = require('./Level')

const {magnitude, normalize, scale, capForce, distance, Vec}  = require('./utils')

let Golf = {};

module.exports = Golf;

// matter-js aliases
let Engine = Matter.Engine,
    World = Matter.World,
    Body = Matter.Body,
    Mouse = Matter.Mouse,
    Events = Matter.Events,
    Composite = Matter.Composite,
    MouseConstraint = Matter.MouseConstraint,
    Vector = Matter.Vector,
    Vertices = Matter.Vertices,
    Bodies = Matter.Bodies;

(function () {

	var mp = {};
	var ball;
	var ballOnGround;

	var viewport = {
			w: Math.max(document.documentElement.clientWidth || 0, window.innerWidth || 0),
			h: Math.max(document.documentElement.clientHeight || 0, window.innerHeight || 0),
			offset: {
				x: 0,
				y: 0
			}
		}

	var _requestAnimationFrame,
	    _cancelAnimationFrame;

	if (typeof window !== 'undefined') {
	    _requestAnimationFrame = window.requestAnimationFrame || window.webkitRequestAnimationFrame
	                                  || window.mozRequestAnimationFrame || window.msRequestAnimationFrame
	                                  || function(callback){ window.setTimeout(function() { callback(Common.now()); }, 1000 / 60); };

	    _cancelAnimationFrame = window.cancelAnimationFrame || window.mozCancelAnimationFrame
	                                  || window.webkitCancelAnimationFrame || window.msCancelAnimationFrame;
	}

	Golf.create = function(canvas, ctx) {
		let game = {};
		game.engine = Engine.create();
		game.canvas = canvas;
		game.ctx = ctx;

		Level.create_level();

		// create a ball
		let ballBody = Bodies.circle(0, 0, 22, {
			restitution: 0.6,
			// friction: 0.5,
			frictionAir: 0.00001,
		    // mass: 0.2,
			render: {
				fillStyle: '#edefdc',
				strokeStyle: '#96ccb5',
				lineWidth: 3
			}
		});
		let ballGroundSensor = Bodies.circle(0,0,80,
		    {render: {
		    	visible: false,
				fillStyle: '#ff000005',
		    	strokeStyle: '#96ccb5',
		    	lineWidth: 3
		    },
		    density:0, isSensor: true});

		ball = Body.create(	{parts: [ballBody, ballGroundSensor],
			restitution: 0.6,
			// friction: 1,
			frictionAir: 0.00001,
			render: {
				fillStyle: '#edefdc',
				strokeStyle: '#96ccb5',
				lineWidth: 3
			}}
		);

		console.log(ball)

		let startSeg = Level.getStartSeg();
		let bds = Composite.bounds(startSeg.comp);
		let ballPos = {
			x: (bds.max.x + bds.min.x) / 2,
			y: bds.min.y -10
		}
		Body.setPosition(ball, ballPos);

		// add all of the bodies to the world
		World.add(game.engine.world, [...Level.getSegmentBodies(), ball]);

		var	mouseConstraint = MouseConstraint.create(game.engine, {
		    	element: game.canvas,
			});

		Events.on(mouseConstraint, 'mousedown', Golf.mousedown)
		Events.on(mouseConstraint, 'mouseup', Golf.mouseup)


		Events.on(game.engine, 'collisionStart', function(event) {
		    var pairs = event.pairs;
		    
		    for (var i = 0, j = pairs.length; i != j; ++i) {
		        var pair = pairs[i];

		        if (pair.bodyA === ballGroundSensor) {
		            // ballBody.render.fillStyle = '#ddddFF';
		        } else if (pair.bodyB === ballGroundSensor) {
		            // ballBody.render.fillStyle = '#ddddFF';
		        }
		    }
		})

		Events.on(game.engine, 'collisionEnd', function(event) {
		    var pairs = event.pairs;
		    
		    for (var i = 0, j = pairs.length; i != j; ++i) {
		        var pair = pairs[i];

		        if (pair.bodyA === ballGroundSensor) {
		            // ballBody.render.fillStyle = '#FFdddd';
		            ballOnGround = false;  
		        } else if (pair.bodyB === ballGroundSensor) {
		            // ballBody.render.fillStyle = '#FFdddd';
		            ballOnGround = false;  
		        }
		    }
		})

		Events.on(game.engine, 'collisionActive', function(event) {
		    var pairs = event.pairs;
		    
		    for (var i = 0, j = pairs.length; i != j; ++i) {
		        var pair = pairs[i];

		        if (pair.bodyA === ballGroundSensor) {
		        	if (Vector.magnitude(ball.velocity) < 2) {
			            ballOnGround = true;
		        	}
		            // console.log(`ballOnGround: ${ballOnGround}`)
		        } else if (pair.bodyB === ballGroundSensor) {
		        	if (Vector.magnitude(ball.velocity) < 2) {
			            ballOnGround = true;
		        	}
		            // console.log(`ballOnGround: ${ballOnGround}`)
		        }
		    }
		});

		return game
	}

	Golf.mousedown = function(event) {
		var mousePosition = event.mouse.position;
		mp.position = mousePosition;
		mp.mouseIsDown = true;
	    mp.start = event.mouse.mousedownPosition;
	    mp.end = event.mouse.mouseupPosition;
	};

	Golf.mouseup = function(event) {
		var mousePosition = event.mouse.position;
		mp.position = mousePosition;
		mp.mouseIsDown = false;
	    mp.end = event.mouse.mouseupPosition;
	    let f = capForce(mp.start, mp.end, 150)
	    let scale = 2
	    if (ballOnGround) {
		    Body.applyForce(ball,ball.position,{x:f.x*scale,y:f.y*scale});
	    }
	}

	Golf.run = function(game) {
	    (function loop(time){
	        Golf.simulate_world(game);
	        Golf.draw_world(game);
	        game.frameRequestId = _requestAnimationFrame(loop);
	    })();
	};

	Golf.simulate_world = function(game) {
		Engine.update(game.engine, 1000 / 60);
	}

	Golf.view_offset = function(offset) {
		viewport.offset.x = viewport.offset.x + offset.x
		viewport.offset.y = viewport.offset.y + offset.y
	}

	Golf.draw_world = function(game) {

		// react to key commands and apply force as needed
		// if (keys[KEY_SPACE]) {
		// 	console.log('Space PRESSED')
		// }

		// if((keys[KEY_SPACE] || keys[KEY_W]) && playerOnFloor){
		//     let force = (-0.013 * player.mass) ;
		//     Body.applyForce(player,player.position,{x:0,y:force});
		// }
		
		// if(keys[KEY_D]){
		//     let force = (0.0004 * player.mass) ;
		//     Body.applyForce(player,player.position,{x:force,y:0});
		// }
		// if(keys[KEY_A]){
		//     let force = (-0.0004 * player.mass) ;
		//     Body.applyForce(player,player.position,{x:force,y:0});
		// }

		viewport.offset.x = Math.floor(-ball.position.x+1000)

		// console.log(Level.getBounds().maxx, Math.floor(ball.position.x))
		if(ball.position.x > Level.getBounds().maxx - viewport.w*4) {
			Level.add_segments(9);
			Level.add_segment('hole');
			let allComps = Level.getSegmentBodies();
			let newComps = allComps.slice(allComps.length-10)
			World.add(game.engine.world, [...newComps])
		}

	    var bodies = Composite.allBodies(game.engine.world);
	    let ctx = game.ctx,
	    	canvas = game.canvas;

		// empty canvas
		ctx.clearRect(0, 0, canvas.width, canvas.height);

	    let SCALE = 4;

	    //start drawing objects
	    for (var i = 0; i < bodies.length; i++) {
	        let body = bodies[i];
	        if (!body.render.visible)
	            continue;

	        for (var k = body.parts.length > 1 ? 1 : 0; k < body.parts.length; k++) {
	            let part = body.parts[k];

	            if (!part.render.visible) 
	                continue;

	            ctx.beginPath();
	            var vertices = part.vertices.map(p => {
	            	return {x: p.x+viewport.offset.x, y: p.y+viewport.offset.y};
	            });
	            ctx.moveTo(Math.floor(vertices[0].x/SCALE), Math.floor(vertices[0].y/SCALE));
	            for (var j = 1; j < vertices.length; j += 1) {
	                ctx.lineTo(Math.floor(vertices[j].x/SCALE), Math.floor(vertices[j].y/SCALE));
	            }
	            ctx.lineTo(Math.floor(vertices[0].x/SCALE), Math.floor(vertices[0].y/SCALE));
	            ctx.closePath();

	            if (part.render.lineWidth) {
	                ctx.lineWidth = bodies[i].render.lineWidth;
	                ctx.strokeStyle = bodies[i].render.strokeStyle;
	                ctx.stroke();
	            }

	            ctx.fillStyle = part.render.fillStyle;
	            ctx.fill();
	        }
	    }

		// Drawing on mouse down
	    if(mp.mouseIsDown){
	        // World.add(engine.world, Bodies.rectangle(mp.x, mp.y, 20, 20, {isStatic: false}));
	        ctx.beginPath();
	        ctx.lineWidth = 2;
	        if (ballOnGround) {
		        ctx.strokeStyle = 'gray';
	        } else {
		        ctx.strokeStyle = '#dddddd';
	        }
	        ctx.setLineDash([10, 4]);
	        ctx.arc(mp.start.x, mp.start.y, 20, 0, 2 * Math.PI);
	        ctx.stroke();
	        ctx.setLineDash([0]);

	        let d = distance(mp.start, mp.position);
	        let norm = normalize(new Vec(mp.position.x-mp.start.x, mp.position.y-mp.start.y))
	        let scaled = 0;
	        if (d > 20) {
	            ctx.beginPath();
	            ctx.lineTo(mp.start.x, mp.start.y);
	            if (d < 150) {
	                scaled = scale(norm, d);
	            } else {
	                scaled = scale(norm, 150);
	            }
	            ctx.lineTo(mp.start.x+scaled.x, mp.start.y+scaled.y);
	            ctx.closePath();
	            ctx.stroke();
	        }
	    } 

	};

})();


// create player body parts
// var playerBody = Bodies.rectangle(500,225,20,20,
//     {density:0.002, friction:0.5});
// var playerFloorSensor = Bodies.circle(500,245,2,
//     {render: {visible: false},
//     density:0, friction:0.3, isSensor: true});
 
// // join body parts into one
// var player = Body.create({
//             parts: [playerBody, playerFloorSensor],
//             friction:0
// });
// playerBody.col = '#FF00DD';


// Events.on(engine, 'collisionStart', function(event) {
//     var pairs = event.pairs;
    
//     for (var i = 0, j = pairs.length; i != j; ++i) {
//         var pair = pairs[i];

//         if (pair.bodyA === playerFloorSensor) {
//             playerBody.col = '#ddddFF';
//         } else if (pair.bodyB === playerFloorSensor) {
//             playerBody.col = '#ddddFF';
//         }
//     }
// })

// Events.on(engine, 'collisionEnd', function(event) {
//     var pairs = event.pairs;
    
//     for (var i = 0, j = pairs.length; i != j; ++i) {
//         var pair = pairs[i];

//         if (pair.bodyA === playerFloorSensor) {
//             playerBody.col = '#FFdddd';
//             playerOnFloor = false;  
//         } else if (pair.bodyB === playerFloorSensor) {
//             playerBody.col = '#FFdddd';
//             playerOnFloor = false;  
//         }
//     }
// })

// Events.on(engine, 'collisionActive', function(event) {
//     var pairs = event.pairs;
    
//     for (var i = 0, j = pairs.length; i != j; ++i) {
//         var pair = pairs[i];

//         if (pair.bodyA === playerFloorSensor) {
//             playerBody.col = '#DDFFDD';
//             playerOnFloor = true;
//             // console.log(`playerOnFloor: ${playerOnFloor}`)
//         } else if (pair.bodyB === playerFloorSensor) {
//             playerBody.col = '#DDFFDD';
//             playerOnFloor = true;
//             // console.log(`playerOnFloor: ${playerOnFloor}`)
//         }
//     }
// });