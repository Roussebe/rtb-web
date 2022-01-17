
let UI = {}

class Unit {
  constructor(x, y, vx, vy) {
    var unit = {x: x, y: y, vx: vx, vy: vy, r: 10}
    this.ui = UI.addCircle( unit )
    this.data = unit
  }
}

class Wall {
  constructor(x1, y1, x2, y2) {
    var wall = {x1: x1, x2: x2, y1: y1, y2: y2, w: 10 }
    this.ui = UI.addWall( wall )
    this.data = wall
  }
}

const PointDistance = (x1, y1, x2, y2) => {
  return Math.sqrt( Math.pow( x2-x1, 2 ) + Math.pow( y2-y1, 2 ) )
}

const PointInRectangle = ( point, rectangle ) => {
  var x = point.x;
  var y = point.y;
  var inside = false;
  var vs = rectangle.map( p => [p.x, p.y] )
  for (var i = 0, j = vs.length - 1; i < vs.length; j = i++) {
    var xi = vs[i][0], yi = vs[i][1];
    var xj = vs[j][0], yj = vs[j][1];

    var intersect = ((yi > y) != (yj > y))
    && (x < (xj - xi) * (y - yi) / (yj - yi) + xi);
    if (intersect) inside = !inside;
  }

  if( inside ) {
    console.log( "Inside" , point )
    point.color="red"
  }
  return inside;
}

const ConvertToRectangle = ( wall ) => {
  let dist = PointDistance( wall.data.x1, wall.data.y1, wall.data.x2, wall.data.y2 )
  let distY = Math.abs( wall.data.y1 - wall.data.y2 )
  let angle = Math.acos(distY / dist) - Math.PI / 2
  let hypotenuse = wall.data.w / 2

  let diffY = hypotenuse * Math.cos( angle )
  let diffX = hypotenuse * Math.sin( angle )


  let A = {x: wall.data.x1 - diffX, y: wall.data.y1 - diffY}
  let B = {x: wall.data.x1 + diffX, y: wall.data.y1 + diffY}
  let C = {x: wall.data.x2 - diffX, y: wall.data.y2 - diffY}
  let D = {x: wall.data.x2 + diffX, y: wall.data.y2 + diffY}

  let rectangle = [ A, B, C, D ]
  wall.rectangle = rectangle ;
  return wall
}

const IntersectCircle = ( circle, A, B ) => {
  var a, b, c, d, u1, u2, ret, retP1, retP2, v1, v2;
  v1 = {};
  v2 = {};
  v1.x = B.x - A.x;
  v1.y = B.y - A.y;
  v2.x = A.x - circle.x;
  v2.y = A.y - circle.y;
  b = (v1.x * v2.x + v1.y * v2.y);
  c = 2 * (v1.x * v1.x + v1.y * v1.y);
  b *= -2;
  d = Math.sqrt(b * b - 2 * c * (v2.x * v2.x + v2.y * v2.y - circle.r * circle.r));
  if(isNaN(d)){ // no intercept
    return [];
  }
  u1 = (b - d) / c;  // these represent the unit distance of point one and two on the line
  u2 = (b + d) / c;
  retP1 = {};   // return points
  retP2 = {}
  ret = []; // return array
  if(u1 <= 1 && u1 >= 0){  // add point if on the line segment
    retP1.x = A.x + v1.x * u1;
    retP1.y = A.y + v1.y * u1;
    ret[0] = retP1;
  }
  if(u2 <= 1 && u2 >= 0){  // second add point if on the line segment
    retP2.x = A.x + v1.x * u2;
    retP2.y = A.y + v1.y * u2;
    ret[ret.length] = retP2;
  }
  return ret;
}



const IntersectWall = (ball, wall) => {

  return PointInRectangle( ball, wall.rectangle ) ||
  IntersectCircle( ball, wall.rectangle[0], wall.rectangle[1] ) ||
  IntersectCircle( ball, wall.rectangle[1], wall.rectangle[2] ) ||
  IntersectCircle( ball, wall.rectangle[2], wall.rectangle[3] ) ||
  IntersectCircle( ball, wall.rectangle[3], wall.rectangle[0] )


  /*  circleDistance.x = abs(ball.x - wall.x1)
  circleDistance.y = abs(ball.y - wall.y1)
  */
}

const Dynamics = ( walls, units ) => {
  for( let unit of units ) {
    let ball = unit.data

    ball.x += ball.vx;
    ball.y += ball.vy;

    if (ball.y + ball.vy > canvas.height || ball.y + ball.vy < 0) {
      ball.vy = -ball.vy;
    }
    if (ball.x + ball.vx > canvas.width || ball.x + ball.vx < 0) {
      ball.vx = -ball.vx;
    }

    for( let other_unit of units ) {
      if( other_unit != unit ) {
        let dist = PointDistance (ball.x, ball.y, other_unit.data.x, other_unit.data.y )


        if( dist < ball.r + other_unit.data.r ) {

          console.log( "Collision" )
          if(ball.x + ball.vx + ball.r > other_unit.data.x + other_unit.data.w
            || ball.x - ball.r + ball.vx < other_unit.data.x){
            ball.vx = -ball.vx;
          }
          if(ball.y + ball.vy + ball.r > other_unit.data.y + other_unit.data.h
            || ball.y - ball.r + ball.vy < other_unit.data.y){
            ball.vy = -ball.vy;
          }

        }
        //console.log( "Distance: " , dist )
      }
    }

    for( let wall of walls ) {
      let intersect = IntersectWall( ball, wall )
      //console.log( intersect )
      if(  intersect.length > 0 ) {
        console.log( "Intersect" , intersect )
        let contact = intersect[0]
        let distX = contact.x - ball.x ;
        let distY = contact.y - ball.y ;

        //ball.x -= ball.vx
        //ball.y -= ball.vy
        ball.vy = -ball.vy
        ball.vx = -ball.vx
      }
    }

  }
}

const buildField = () => {
  return [
    new Wall(50,50,250,50)
  ]
}


const NG = {
  init: (itf) => {
    UI = itf
    console.log( itf )
    let walls = buildField().map( w => ConvertToRectangle(w) )

    let unit1 = new Unit(Math.random() * 320, Math.random() * 160,
                        Math.random() * 5, Math.random() * 5)
    let unit2 = new Unit(Math.random() * 320, Math.random() * 160,
                        Math.random() * 5, Math.random() * 5)

    setInterval(() => {
      Dynamics( walls, [unit1, unit2] )
      //console.log( "Tick" )
      itf.update()
    }, 50);

  }
}

export default NG
