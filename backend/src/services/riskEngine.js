/**
 * Risk Engine — computes risk_score and classification
 * Formula: risk_score = 0.4*traffic + 0.3*weather + 0.3*historical_delay
 */

const computeRisk = ({ traffic_factor, weather_factor, historical_delay }) => {
  const risk_score = parseFloat(
    (0.4 * traffic_factor + 0.3 * weather_factor + 0.3 * historical_delay).toFixed(3)
  );

  let classification, color, recommendation;
  if (risk_score < 0.4) {
    classification = 'on_track';
    color = 'green';
    recommendation = 'Shipment is proceeding normally. No action required.';
  } else if (risk_score <= 0.7) {
    classification = 'at_risk';
    color = 'yellow';
    recommendation = 'Monitor closely. Consider alternate routes or expedited handling.';
  } else {
    classification = 'delayed';
    color = 'red';
    recommendation = 'Immediate intervention required. Activate contingency plan and reroute.';
  }

  const breakdown = {
    traffic_contribution: parseFloat((0.4 * traffic_factor).toFixed(3)),
    weather_contribution: parseFloat((0.3 * weather_factor).toFixed(3)),
    historical_contribution: parseFloat((0.3 * historical_delay).toFixed(3))
  };

  return { risk_score, classification, color, recommendation, breakdown };
};

const simulateFactors = () => ({
  traffic_factor: parseFloat((Math.random()).toFixed(2)),
  weather_factor: parseFloat((Math.random()).toFixed(2)),
  historical_delay: parseFloat((Math.random() * 0.6).toFixed(2))
});

module.exports = { computeRisk, simulateFactors };
