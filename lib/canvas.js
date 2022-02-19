"use strict";

let bestPath;
let bestDistance = Infinity;
let vShaderSrc = document.getElementById("vertex-shader").innerHTML;
let fShaderSrc = document.getElementById("fragment-shader").innerHTML;

let init = function (num) {
  let canvas = document.getElementById("canvas");
  let gl = checkContext(canvas);

  let vertexShader = getShader(gl, gl.VERTEX_SHADER, vShaderSrc);
  let fragmentShader = getShader(gl, gl.FRAGMENT_SHADER, fShaderSrc);
  let program = createProgram(gl, vertexShader, fragmentShader);

  gl.useProgram(program);

  let cities;

  cities = createCities(num, canvas.clientWidth, canvas.clientHeight);
  drawPoint(
    gl,
    program,
    num,
    new Float32Array(cities),
    new Float32Array([1, 0, 0, 1])
  );

  return cities;
};
