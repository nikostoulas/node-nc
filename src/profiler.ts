import * as now from 'performance-now';

export default async function profiler(...fns) {
  for (let fn of fns) {
    let timesInASecond = 1;
    let time = 0;
    while (Math.abs(1000 - time) > 300 / Math.log10(1 + timesInASecond)) {
      time = await run(fn, timesInASecond);
      timesInASecond = Math.round(timesInASecond * 1000 / time);
    }
    console.log(`Run function ${fn} ${timesInASecond.toLocaleString()} times in ${time.toFixed(2)} ms`);
  }
}

function run(fn, times) {
  var result = fn();
  const isPromise = result && result.then;
  const start = now();
  if (isPromise) {
    for (let i = 0; i < times; i++) {
      result = result.then(fn);
    }
    return result.then(() => now() - start);
  } else {
    for (let i = 0; i < times; i++) {
      fn();
    }
  }
  return now() - start;
}
