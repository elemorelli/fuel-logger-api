const ss = require("simple-statistics");

const filterOutliers = (list) => {
  if (list.length < 4) return list;

  let values, q1, q3, iqr, maxValue, minValue;

  values = list.slice().sort((a, b) => a - b);

  if ((values.length / 4) % 1 === 0) {
    q1 = (1 / 2) * (values[values.length / 4] + values[values.length / 4 + 1]);
    q3 = (1 / 2) * (values[values.length * (3 / 4)] + values[values.length * (3 / 4) + 1]);
  } else {
    q1 = values[Math.floor(values.length / 4 + 1)];
    q3 = values[Math.ceil(values.length * (3 / 4) + 1)];
  }

  iqr = q3 - q1;
  maxValue = q3 + iqr * 1.5;
  minValue = q1 - iqr * 1.5;

  return values.filter((x) => x >= minValue && x <= maxValue);
};

const calculateVehicleStats = (vehicle, removeOutliers) => {
  let distancesBetweenFillUps = [];
  let distancePerLiters = [];
  const odometerValues = [];

  for (let i = 0; i < vehicle.fillUps.length; i++) {
    const fillUp = vehicle.fillUps[i];
    const previousFillUp = vehicle.fillUps[i - 1];

    odometerValues.push(fillUp.odometer);

    if (previousFillUp) {
      const distanceBetweenFillUps = fillUp.odometer - previousFillUp.odometer;
      const distancePerLiter = distanceBetweenFillUps / fillUp.fuel;
      distancesBetweenFillUps.push(distanceBetweenFillUps);
      distancePerLiters.push(distancePerLiter);
    }
  }

  if (removeOutliers) {
    distancesBetweenFillUps = filterOutliers(distancesBetweenFillUps);
    distancePerLiters = filterOutliers(distancePerLiters);
  }

  const maxOdometerValue = odometerValues[odometerValues.length - 1];

  const averageDistanceBetweenFillUps = distancesBetweenFillUps.length ? ss.mean(distancesBetweenFillUps) : 0;
  const maxDistanceBetweenFillUps = distancesBetweenFillUps.length ? ss.max(distancesBetweenFillUps) : 0;
  const nextFillUp = averageDistanceBetweenFillUps ? maxOdometerValue + averageDistanceBetweenFillUps : 0;
  const maxDistanceToFillUp = maxDistanceBetweenFillUps ? maxOdometerValue + maxDistanceBetweenFillUps : 0;

  const averageFuelConsumption = distancePerLiters.length ? ss.mean(distancePerLiters) : 0;
  const maxFuelConsumption = distancePerLiters.length ? ss.max(distancePerLiters) : 0;
  const minFuelConsumption = distancePerLiters.length ? ss.min(distancePerLiters) : 0;

  const stats = {
    averageDistanceBetweenFillUps: averageDistanceBetweenFillUps.toFixed(2),
    maxDistanceBetweenFillUps: maxDistanceBetweenFillUps.toFixed(2),
    nextFillUp: nextFillUp.toFixed(2),
    maxDistanceToFillUp: maxDistanceToFillUp.toFixed(2),
    averageFuelConsumption: averageFuelConsumption.toFixed(2),
    maxFuelConsumption: maxFuelConsumption.toFixed(2),
    minFuelConsumption: minFuelConsumption.toFixed(2),
  };

  return stats;
};

module.exports = { calculateVehicleStats };
