var canvas = document.getElementById('canvas');
var ctx = canvas.getContext('2d');

function draw () {
  //ctx.
}

const CanvasITF = (  ) => {
  console.log( "ITF.init" )

  var result = {
    balls: [],
    walls: [],
    update: () => {
      ctx.clearRect(0,0,360,360);
      for( let wall of result.walls ) {
        wall.draw()
      }
      for( let ball of result.balls ) {
        ball.draw()
      }
    },
    addWall: ( wall ) => {
      //console.log( "addWall", ctx )
      wall.color = wall.color?wall.color:'#09f',
      wall.draw = function() {
        ctx.lineWidth = wall.w;
        ctx.strokeStyle = wall.color;
        ctx.beginPath()
        ctx.moveTo(wall.x1, wall.y1)
        ctx.lineTo(wall.x2, wall.y2)
        ctx.stroke()
      }
      wall.draw()
      result.walls.push(wall)
    },

    addCircle: ( unit ) => {
      //console.log( "addCircle", x, y, r, c )

      unit.color = unit.color?unit.color:'blue'
      unit.draw = function() {
        ctx.beginPath()
        ctx.arc(unit.x, unit.y, unit.r, 0, Math.PI*2, true )
        ctx.closePath()
        ctx.fillStyle = unit.color;
        ctx.fill();
      }

      result.balls.push( unit )
      unit.draw();
      return unit
    }
  }
  return result
}

export default CanvasITF
