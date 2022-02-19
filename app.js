"use strict";

let paths;
let cities;
let numCities = 12;
let numPaths = 200;
let mutationRate = 0.1;
const { performance } = require("perf_hooks");

let start = performance.now();

cities = init(numCities);
paths = createPath(numCities, numPaths);

for (let i = 0; i < 1000; i++) {
  let fitness = calculateFitness(paths, cities);
  paths = crossOver(fitness, paths, numCities);
  paths = mutate(paths, mutationRate);
  drawBestPath(bestPath, cities);
}

let end = performance.now();
console.log(`Execution time: ${end - start} ms`);
