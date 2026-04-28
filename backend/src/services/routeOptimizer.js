/**
 * Route Optimizer — Dijkstra's algorithm on a weighted city graph
 * Edge weights: { time, cost, risk }
 * Composite score = 0.5*time + 0.3*cost + 0.2*risk (normalized)
 */

const CITY_GRAPH = {
  'New York': {
    'Chicago': { time: 18, cost: 1200, risk: 0.2 },
    'Philadelphia': { time: 2, cost: 180, risk: 0.1 },
    'Boston': { time: 4, cost: 300, risk: 0.15 }
  },
  'Chicago': {
    'New York': { time: 18, cost: 1200, risk: 0.2 },
    'Detroit': { time: 5, cost: 350, risk: 0.2 },
    'St. Louis': { time: 6, cost: 400, risk: 0.25 },
    'Indianapolis': { time: 3, cost: 250, risk: 0.15 },
    'Milwaukee': { time: 1.5, cost: 120, risk: 0.1 }
  },
  'Los Angeles': {
    'San Francisco': { time: 6, cost: 450, risk: 0.2 },
    'Phoenix': { time: 6, cost: 420, risk: 0.35 },
    'Las Vegas': { time: 4, cost: 300, risk: 0.25 },
    'San Diego': { time: 2, cost: 180, risk: 0.1 }
  },
  'Houston': {
    'Dallas': { time: 4, cost: 280, risk: 0.2 },
    'New Orleans': { time: 6, cost: 400, risk: 0.3 },
    'San Antonio': { time: 3, cost: 220, risk: 0.15 },
    'Austin': { time: 2.5, cost: 180, risk: 0.12 }
  },
  'Dallas': {
    'Houston': { time: 4, cost: 280, risk: 0.2 },
    'Oklahoma City': { time: 3, cost: 210, risk: 0.2 },
    'St. Louis': { time: 10, cost: 700, risk: 0.25 },
    'Austin': { time: 3, cost: 220, risk: 0.15 }
  },
  'Phoenix': {
    'Los Angeles': { time: 6, cost: 420, risk: 0.35 },
    'Las Vegas': { time: 4.5, cost: 320, risk: 0.3 },
    'Albuquerque': { time: 5, cost: 350, risk: 0.28 }
  },
  'Philadelphia': {
    'New York': { time: 2, cost: 180, risk: 0.1 },
    'Baltimore': { time: 2, cost: 150, risk: 0.1 },
    'Washington DC': { time: 2.5, cost: 200, risk: 0.12 }
  },
  'San Antonio': {
    'Houston': { time: 3, cost: 220, risk: 0.15 },
    'Austin': { time: 1.5, cost: 100, risk: 0.1 },
    'Dallas': { time: 5, cost: 350, risk: 0.2 }
  },
  'San Diego': {
    'Los Angeles': { time: 2, cost: 180, risk: 0.1 },
    'Las Vegas': { time: 5, cost: 350, risk: 0.28 }
  },
  'Dallas': {
    'Houston': { time: 4, cost: 280, risk: 0.2 },
    'Oklahoma City': { time: 3, cost: 210, risk: 0.2 },
    'Austin': { time: 3, cost: 220, risk: 0.15 }
  },
  'San Francisco': {
    'Los Angeles': { time: 6, cost: 450, risk: 0.2 },
    'Sacramento': { time: 2, cost: 150, risk: 0.12 },
    'Portland': { time: 10, cost: 700, risk: 0.25 }
  },
  'Seattle': {
    'Portland': { time: 3, cost: 220, risk: 0.15 },
    'San Francisco': { time: 20, cost: 1400, risk: 0.3 }
  },
  'Portland': {
    'Seattle': { time: 3, cost: 220, risk: 0.15 },
    'San Francisco': { time: 10, cost: 700, risk: 0.25 }
  },
  'Miami': {
    'Atlanta': { time: 10, cost: 700, risk: 0.25 },
    'Tampa': { time: 4.5, cost: 320, risk: 0.18 },
    'Orlando': { time: 4, cost: 280, risk: 0.15 }
  },
  'Atlanta': {
    'Miami': { time: 10, cost: 700, risk: 0.25 },
    'Charlotte': { time: 4, cost: 280, risk: 0.18 },
    'Nashville': { time: 4, cost: 280, risk: 0.2 },
    'Birmingham': { time: 2.5, cost: 180, risk: 0.15 }
  },
  'Boston': {
    'New York': { time: 4, cost: 300, risk: 0.15 },
    'Providence': { time: 1, cost: 80, risk: 0.08 }
  },
  'Detroit': {
    'Chicago': { time: 5, cost: 350, risk: 0.2 },
    'Cleveland': { time: 2.5, cost: 180, risk: 0.15 },
    'Toledo': { time: 1, cost: 80, risk: 0.1 }
  },
  'Indianapolis': {
    'Chicago': { time: 3, cost: 250, risk: 0.15 },
    'Cincinnati': { time: 2, cost: 150, risk: 0.12 },
    'Louisville': { time: 2, cost: 150, risk: 0.12 }
  },
  'Washington DC': {
    'Philadelphia': { time: 2.5, cost: 200, risk: 0.12 },
    'Baltimore': { time: 1, cost: 80, risk: 0.08 },
    'Richmond': { time: 2, cost: 150, risk: 0.12 }
  },
  'Las Vegas': {
    'Los Angeles': { time: 4, cost: 300, risk: 0.25 },
    'Phoenix': { time: 4.5, cost: 320, risk: 0.3 },
    'Salt Lake City': { time: 5, cost: 350, risk: 0.22 }
  },
  'Denver': {
    'Albuquerque': { time: 7, cost: 490, risk: 0.3 },
    'Salt Lake City': { time: 8, cost: 560, risk: 0.28 },
    'Oklahoma City': { time: 10, cost: 700, risk: 0.32 }
  },
  'St. Louis': {
    'Chicago': { time: 6, cost: 400, risk: 0.25 },
    'Dallas': { time: 10, cost: 700, risk: 0.25 },
    'Indianapolis': { time: 4, cost: 280, risk: 0.2 },
    'Memphis': { time: 4, cost: 280, risk: 0.22 }
  },
  'Nashville': {
    'Atlanta': { time: 4, cost: 280, risk: 0.2 },
    'Memphis': { time: 3.5, cost: 250, risk: 0.18 },
    'Louisville': { time: 3, cost: 210, risk: 0.15 }
  }
};

const CITY_COORDS = {
  'New York': [40.7128, -74.0060],
  'Chicago': [41.8781, -87.6298],
  'Los Angeles': [34.0522, -118.2437],
  'Houston': [29.7604, -95.3698],
  'Dallas': [32.7767, -96.7970],
  'Phoenix': [33.4484, -112.0740],
  'Philadelphia': [39.9526, -75.1652],
  'San Antonio': [29.4241, -98.4936],
  'San Diego': [32.7157, -117.1611],
  'San Francisco': [37.7749, -122.4194],
  'Seattle': [47.6062, -122.3321],
  'Portland': [45.5051, -122.6750],
  'Miami': [25.7617, -80.1918],
  'Atlanta': [33.7490, -84.3880],
  'Boston': [42.3601, -71.0589],
  'Detroit': [42.3314, -83.0458],
  'Indianapolis': [39.7684, -86.1581],
  'Washington DC': [38.9072, -77.0369],
  'Las Vegas': [36.1699, -115.1398],
  'Denver': [39.7392, -104.9903],
  'St. Louis': [38.6270, -90.1994],
  'Nashville': [36.1627, -86.7816],
  'Austin': [30.2672, -97.7431],
  'Oklahoma City': [35.4676, -97.5164],
  'Milwaukee': [43.0389, -87.9065],
  'Baltimore': [39.2904, -76.6122],
  'Albuquerque': [35.0844, -106.6504],
  'Memphis': [35.1495, -90.0490],
  'Louisville': [38.2527, -85.7585],
  'Salt Lake City': [40.7608, -111.8910],
  'Sacramento': [38.5816, -121.4944],
  'Charlotte': [35.2271, -80.8431],
  'New Orleans': [29.9511, -90.0715],
  'Tampa': [27.9506, -82.4572],
  'Orlando': [28.5383, -81.3792],
  'Cincinnati': [39.1031, -84.5120],
  'Cleveland': [41.4993, -81.6944],
  'Richmond': [37.5407, -77.4360],
  'Toledo': [41.6639, -83.5552],
  'Providence': [41.8240, -71.4128],
  'Birmingham': [33.5186, -86.8104]
};

function score(edge) {
  return 0.5 * edge.time + 0.3 * (edge.cost / 1000) + 0.2 * edge.risk * 100;
}

function dijkstra(graph, start, end) {
  const dist = {};
  const prev = {};
  const visited = new Set();
  const pq = [];

  Object.keys(graph).forEach(n => { dist[n] = Infinity; prev[n] = null; });
  dist[start] = 0;
  pq.push({ node: start, cost: 0 });

  while (pq.length > 0) {
    pq.sort((a, b) => a.cost - b.cost);
    const { node } = pq.shift();
    if (visited.has(node)) continue;
    visited.add(node);
    if (node === end) break;

    const neighbors = graph[node] || {};
    for (const [neighbor, edge] of Object.entries(neighbors)) {
      const newCost = dist[node] + score(edge);
      if (newCost < dist[neighbor]) {
        dist[neighbor] = newCost;
        prev[neighbor] = { from: node, edge };
        pq.push({ node: neighbor, cost: newCost });
      }
    }
  }

  // Reconstruct path
  const path = [];
  let cur = end;
  while (cur) {
    path.unshift(cur);
    cur = prev[cur]?.from;
  }

  if (path[0] !== start) return null; // No path

  let totalTime = 0, totalCost = 0, totalRisk = 0;
  for (let i = 0; i < path.length - 1; i++) {
    const e = graph[path[i]]?.[path[i + 1]];
    if (e) { totalTime += e.time; totalCost += e.cost; totalRisk += e.risk; }
  }

  return {
    path,
    total_time_hrs: totalTime,
    total_cost_usd: totalCost,
    avg_risk: parseFloat((totalRisk / (path.length - 1 || 1)).toFixed(3)),
    coords: path.map(city => CITY_COORDS[city] || null).filter(Boolean)
  };
}

function optimizeRoute(origin, destination) {
  const graph = CITY_GRAPH;

  // Ensure both cities exist
  if (!graph[origin] || !graph[destination]) {
    return {
      optimal_route: null,
      alternative_routes: [],
      message: `Route data not available for ${!graph[origin] ? origin : destination}`
    };
  }

  const optimal = dijkstra(graph, origin, destination);

  // Generate 2 alternative routes by penalizing certain edges
  const alternatives = [];
  if (optimal) {
    // Alternative 1: avoid first intermediate node
    const altGraph1 = JSON.parse(JSON.stringify(graph));
    if (optimal.path.length > 2) {
      const blocker = optimal.path[1];
      Object.keys(altGraph1).forEach(n => {
        if (altGraph1[n][blocker]) altGraph1[n][blocker].time *= 99;
      });
    }
    const alt1 = dijkstra(altGraph1, origin, destination);
    if (alt1 && alt1.path.join() !== optimal.path.join()) alternatives.push({ label: 'Alternative Route A', ...alt1 });

    // Alternative 2: favor low risk
    const altGraph2 = JSON.parse(JSON.stringify(graph));
    Object.keys(altGraph2).forEach(n => {
      Object.keys(altGraph2[n]).forEach(m => {
        altGraph2[n][m] = {
          ...altGraph2[n][m],
          time: altGraph2[n][m].time * 0.5,
          risk: altGraph2[n][m].risk * 3
        };
      });
    });
    const alt2 = dijkstra(altGraph2, origin, destination);
    if (alt2 && alt2.path.join() !== optimal.path.join()) alternatives.push({ label: 'Low-Risk Route', ...alt2 });
  }

  return { optimal_route: optimal, alternative_routes: alternatives };
}

module.exports = { optimizeRoute, CITY_COORDS, CITY_GRAPH };
