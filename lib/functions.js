"use strict";

let createPath = function (numCities, numPaths) {
  let paths = [];

  for (let i = 0; i < numPaths; i++) {
    let count = 0;
    let temp = numCities - 1;
    let includedCities = [];
    let result = [];

    for (let j = 0; j < numCities; j++) {
      includedCities[j] = j;
    }

    while (includedCities.length != 0) {
      let index = includedCities[Math.floor(Math.random() * temp)];
      let pos = includedCities.indexOf(index);

      result[count++] = index;
      includedCities.splice(pos, 1);
      temp--;
    }
    paths[i] = result;
  }

  return paths;
};

let createCities = function (num, width, height) {
  let cities = [];
  let count = 0;

  for (let i = 0; i < num; i++) {
    let x = Math.random() * 2 - 1;
    let y = Math.random() * 2 - 1;

    cities[count++] = x;
    cities[count++] = y;
  }

  return cities;
};

let checkContext = function (canvas) {
  const context = ["webgl", "experimental-webgl", "webkit-3d", "moz-webgl"];
  let gl;

  for (let i = 0; i < context.length; i++) {
    try {
      gl = canvas.getContext(context[i]);
    } catch (e) {}

    if (gl) {
      break;
    }
  }

  if (!gl) {
    alert("Webgl is not available in your browser!");
    console.log("Webgl is not available in your browser!");
  }

  return gl;
};

let initBuffer = function (gl, program, n, vertices, colors) {
  let vertexBuffer = gl.createBuffer();

  if (!vertexBuffer) {
    console.log("Error occured while creating buffer!");
    return -1;
  }
  gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STATIC_DRAW);

  let position = gl.getAttribLocation(program, "position");
  let uFragColor = gl.getUniformLocation(program, "uFragColor");

  if (position < 0) {
    console.log("Error accessing 'position' attribute!");
    return;
  }
  gl.vertexAttribPointer(position, 2, gl.FLOAT, false, 0, 0);
  gl.uniform4f(uFragColor, colors[0], colors[1], colors[2], colors[3]);
  gl.enableVertexAttribArray(position);

  return n;
};

let drawLines = function (gl, program, n, vertices, colors) {
  initBuffer(gl, program, n, vertices, colors);

  if (n < 0) {
    console.log("Error while creating buffers!");
    return;
  }
  gl.drawArrays(gl.LINES, 0, n);
};

let getShader = function (gl, type, source) {
  let shader = gl.createShader(type);
  gl.shaderSource(shader, source);
  gl.compileShader(shader);

  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    console.log(
      "Error has occured when compiling the shader: " +
        gl.getShaderInfoLog(shader)
    );
    gl.deleteShader(shader);
    return null;
  }
  return shader;
};

let createProgram = function (gl, vShader, fShader) {
  let program = gl.createProgram();

  gl.attachShader(program, vShader);
  gl.attachShader(program, fShader);
  gl.linkProgram(program);

  if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
    console.log("Error has occured: " + gl.getProgramInfoLog(program));
    gl.deleteProgram(program);
    gl.deleteShader(vShader);
    gl.deleteShader(fShader);

    return null;
  }

  return program;
};

let drawPoint = function (gl, program, n, vertices, colors) {
  initBuffer(gl, program, n, vertices, colors);

  if (n < 0) {
    console.log("Error while creating buffers!");
    return;
  }

  gl.drawArrays(gl.POINTS, 0, n);
};

let calculateFitness = function (Path, cities) {
  let n = Path.length;
  let fitness = [];

  for (let i = 0; i < n; i++) {
    let d = 0;

    for (let j = 1; j < Path[0].length; j++) {
      let point1Index = Path[i][j];
      let point2Index = Path[i][j - 1];

      d += calculateDistance(point1Index, point2Index);
    }
    let point1Index = Path[i][0];
    let point2Index = Path[i][Path[0].length - 1];

    d += calculateDistance(point1Index, point2Index);

    if (d < bestDistance) {
      bestDistance = d;
      bestPath = Path[i];
      console.log(bestPath);
    }

    fitness[i] = Math.floor(d);
  }

  return fitness;
};

let calculateDistance = function (point1Index, point2Index) {
  let x0 = cities[2 * point1Index];
  let y0 = cities[2 * point1Index + 1];
  let x1 = cities[2 * point2Index];
  let y1 = cities[2 * point2Index + 1];

  return Math.sqrt((x0 - x1) * (x0 - x1) + (y0 - y1) * (y0 - y1));
};

let crossOver = function (fitness, paths, numCities) {
  let newPaths = [];
  let box = createBox(fitness);

  for (let i = 0; i < fitness.length; i++) {
    let parentA = box[Math.floor(Math.random() * (box.length - 1))];
    let parentB = box[Math.floor(Math.random() * (box.length - 1))];

    let startA = Math.floor(Math.random() * (numCities - 1));
    let endA = Math.floor(Math.random() * (numCities - 1)) + startA + 1;
    let newOrder = paths[parentA].slice(startA, endA);
    let count = newOrder.length;

    for (let j = 0; j < numCities; j++) {
      if (!newOrder.includes(paths[parentB][j])) {
        newOrder[count++] = paths[parentB][j];
      }
    }
    newPaths[i] = newOrder;
  }

  return newPaths;
};

let createBox = function (fitness) {
  let box = [];
  let count = 0;
  let n = fitness.length;

  for (let i = 0; i < n; i++) {
    for (let j = 0; j < fitness[i]; j++) {
      box[count++] = i;
    }
  }

  return box;
};

let mutate = function (paths, mutationRate) {
  for (let i = 0; i < paths.length; i++) {
    if (Math.random() < mutationRate) {
      let indexA = Math.floor(Math.random() * (paths[0].length - 1));
      let indexB = indexA + 1;

      if (indexA == paths[0].length - 1) {
        indexB = indexA - 1;
      }

      let temp = paths[i][indexA];
      paths[i][indexA] = paths[i][indexB];
      paths[i][indexB] = temp;
    }
  }

  return paths;
};

let drawBestPath = function (path, cities) {
  let count = 0;
  let array = [];
  let canvas = document.getElementById("canvas");
  let gl = checkContext(canvas);

  let vertexShader = getShader(gl, gl.VERTEX_SHADER, vShaderSrc);
  let fragmentShader = getShader(gl, gl.FRAGMENT_SHADER, fShaderSrc);
  let program = createProgram(gl, vertexShader, fragmentShader);

  gl.useProgram(program);

  for (let i = 0; i < path.length; i++) {
    array[count++] = cities[2 * path[i]];
    array[count++] = cities[2 * path[i] + 1];
  }
  array[count++] = cities[2 * path[0]];
  array[count++] = cities[2 * path[0] + 1];

  drawLineStrips(
    gl,
    program,
    path.length + 1,
    new Float32Array(array),
    new Float32Array([0, 1, 0, 1])
  );
};

let drawLineStrips = function (gl, program, n, vertices, colors) {
  initBuffer(gl, program, n, vertices, colors);

  if (n < 0) {
    console.log("Error while creating buffers!");
    return;
  }

  gl.drawArrays(gl.LINE_STRIP, 0, n);
};
