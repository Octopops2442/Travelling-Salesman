"use strict";

let paths;
let cities;
let numCities = 100;
let numPaths = 200;
let mutationRate = 0.1;

console.time("Execution Time");

cities = init(numCities);
paths = createPath(numCities, numPaths);

for (let i = 0; i < 1000; i++) {
  let fitness = calculateFitness(paths, cities);
  paths = crossOver(fitness, paths, numCities);
  paths = mutate(paths, mutationRate);
  drawBestPath(bestPath, cities);
}

console.timeEnd("Execution Time");
