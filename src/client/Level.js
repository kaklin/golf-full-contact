const Matter = require('matter-js')

// matter-js aliases
let Engine = Matter.Engine,
    World = Matter.World,
    Body = Matter.Body,
    Mouse = Matter.Mouse,
    Events = Matter.Events,
    Composite = Matter.Composite,
    MouseConstraint = Matter.MouseConstraint,
    Vertices = Matter.Vertices,
    Bodies = Matter.Bodies;

let Level = {};

module.exports = Level;

(function () {
	let level_segments = []
	let bounds = {
		minx: 0,
		maxx: 0
	}

	Level.create_level = function() {
		Level.add_segments(10);
		Level.add_segment('start');
		Level.add_segments(10);
		Level.add_segment('hole');
	}

	Level.getSegmentBodies = function() {
		return level_segments.map(seg => {return seg.comp})
	}

	Level.getStartSeg = function() {
		return Level.getSpecialSeg('start');
	}

	Level.getSpecialSeg = function(name) {
		return level_segments.find(seg => seg.type === name)
	}

	Level.getBounds = function() {
		return bounds
	}

	Level.add_segments = function(num) {
		for (var i = 0; i < num; i++) {
			console.log('Adding segment!')
			Level.add_segment();
		}
	}

	Level.add_segment = function(special=null) {
		let points = null;
		if (special) {
			points = atoms.special[special]
		} else {
			points = atoms.normal[getRandomInt(atoms.normal.length)]
		}

		if (level_segments.length == 0) {
			seg = new Segment(points, {x:0, y:1000+getRandomInt(20)*100});
		} else {
			let previous = level_segments[level_segments.length-1]
			seg = new Segment(points, previous.endPoint, special);
		}
		level_segments.push(seg)
		bounds.maxx += (seg.endPoint.x - seg.startPoint.x)
		return seg
	}

	Level.addStartSeg = function() {
		let previous = level_segments[level_segments.length-1]
		seg = new Segment(special_atoms.start, previous.endPoint, 'start');
		level_segments.push(seg)
	}


})();

let atoms = {
	normal: 
		[
			[
				{ x: 0, y: 0 }, 
			    { x: 300, y: 0 }
			],
			[
				{ x: 0, y: 0 }, 
			    { x: 500, y: 0 }
			],
			[
				{ x: 0, y: 0 }, 
			    { x: 800, y: 0 }
			],
			[
				{ x: 0, y: 0 }, 
			    { x: 100, y: 0 },
			    { x: 100, y: 300 }
			],
			[
				{ x: 0, y: 0 }, 
			    { x: 100, y: 0 },
			    { x: 100, y: 100 }
			],
			[
				{ x: 0, y: 0 }, 
			    { x: 300, y: 0 },
			    { x: 300, y: -300 },
			    { x: 400, y: -300 }
			],
			[
				{ x: 0, y: 0 }, 
			    { x: 300, y: 300 },
			],
			[
				{ x: 0, y: 0 }, 
			    { x: 300, y: 100 },
			],
			[
				{ x: 0, y: 0 }, 
			    { x: 300, y: -100 },
			],
			[
				{ x: 0, y: 0 }, 
			    { x: 300, y: -300 },
			],
			[
				{ x: 0, y: 0 }, 
			    { x: 100, y: -300 },
			],
			[
				{ x: 0, y: 0 }, 
			    { x: 100, y: 300 },
			],
			[
				{ x: 0, y: 0 }, 
			    { x: 300, y: 0 },
			    { x: 200, y: 100 },
			    { x: 200, y: 400 },
			    { x: 400, y: 400 },
			],
			[
				{ x: 0, y: 0 }, 
			    { x: 200, y: 0 },
			    { x: 200, y: -400 },
			    { x: 100, y: -500 },
			    { x: 400, y: -500 },
			],
		],
	special: {
		hole: [
			{ x: 0, y: 0 }, 
			{ x: 115, y: 0 }, 
			{ x: 115, y: 60 }, 
		    { x: 160, y: 80 },
		    { x: 205, y: 60 },
		    { x: 205, y: 0 },
		    { x: 300, y: 0 }
		],
		start: 	[
			{ x: 0, y: 0 }, 
		    { x: 300, y: 0 }
		],
	}
}

class Segment {
	constructor(points, translate={x:0,y:0}, special=null) {

		this.type = special;
		// console.log(`Bounds: ${minx} ${maxx}`)
		let translated = this.translate(translate.x, translate.y, points)
		// console.log(translate)

		this.startPoint = translated[0]
		this.endPoint = translated[translated.length-1]
		// console.log(this.startPoint, this.endPoint)

		let transCopy = translated.slice()
		let minx = this.sortx(transCopy)[0].x
		let maxx = this.sortx(transCopy).slice(-1)[0].x

		let extended = this.extend(minx, maxx, translated, translate.y)

		let ground = Bodies.fromVertices(0,0, extended, {
			// friction: 1,
			render: {
				lineWidth: 1,
				// strokeStyle: '#96ccb5',
			    strokeStyle: '#b1efd5',
			    fillStyle: '#b1efd5',
			}
		});
		Body.setStatic(ground, true)

		this.comp = Composite.create({bodies: [ground]})
		if (special === 'tee' || special === 'start') {
			let rect = Bodies.fromVertices(0, 0, 
				[
					{ x: 0, y: 0 }, 
					{ x: 150, y: 0 }, 
					{ x: 150, y: 24 }, 
					{ x: 0, y: 24 }, 
				], 
				{
					isStatic: true,
					render: 
					{
					    fillStyle: '#C0B6B6'
					}
				}
			);
			// level platform with ground
			Body.translate(rect, ground.bounds.min)
			// translate relative to size of platform to make it 'undergound'
			Body.translate(rect, {x:150,y:12})

			this.comp = Composite.add(this.comp, rect)
		} 

		Composite.translate(this.comp, Vertices.centre(extended))

		return this
	}

	extend(x1, x2, points, ext) {
		// let EXT = 4000;
		const np = [{x:x2,y:ext+4000},{x:x1,y:ext+4000}]
		return points.concat(np)
	}

	translate(x, y, points) {
		// console.log('translating', points)
		return points.map((p) => {return {x: p.x+x, y: p.y+y}})
	}

	// maxx(points) {
	// 	console.log(points.sort((a, b) => {return a.x - b.x}))
	// 	return points.sort((a, b) => {return a.x - b.x})[-1]
	// }

	// minx(points) {
	// 	console.log(points.sort((a, b) => {return a.x - b.x}))

	// 	return points.sort((a, b) => {return a.x - b.x})[0]
	// }

	sortx(points) {
		return points.sort((a, b) => {return a.x - b.x})
	}
}

function getRandomInt(max) {
  return Math.floor(Math.random() * max);
}