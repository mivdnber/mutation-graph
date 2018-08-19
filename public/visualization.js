const width = 960,
    height = 960,
    padding = 1.5, // separation between same-color nodes
    clusterPadding = 6, // separation between different-color nodes
    maxRadius = 12;

const m = 4; // number of distinct clusters

const color = d3.scaleSequential(d3.interpolateRainbow)
    .domain(d3.range(m));


const initializeNode = node => ({
  ...node,
  x: Math.cos(node.cluster / m * 2 * Math.PI) * 200 + width / 2 + Math.random(),
  y: Math.sin(node.cluster / m * 2 * Math.PI) * 200 + height / 2 + Math.random(),
  radius: maxRadius,
});

let nodes = [];
let links = [];


const connectivity = nodeId => {
  return links.filter(n => n.source.id == nodeId || n.target.id == nodeId).length;
}

let svg = d3
  .select("body")
  .append("svg")
  .attr("width", width)
  .attr("height", height);

let linkGroup = svg.append("g")
  .attr("class", "links");

let nodeGroup = svg.append('g')
  .attr('class', 'nodes');

const simulation = d3.forceSimulation()
  // keep entire simulation balanced around screen center
  .force('center', d3.forceCenter(width / 2, height / 2, .1))
  // make connected nodes repulse other nodes
  .force('gravity', d3.forceManyBody().strength(n => -100*connectivity(n.id)).distanceMax(60))
  .force('collide', d3.forceCollide(d => d.radius + padding).strength(0.3))
  .force('link', d3.forceLink().id(d => d.id).strength(.3).distance(100))
  .alphaDecay(0)
  .alpha(.5);

const update = () => {
  const link = linkGroup
    .selectAll("line")
    .data(links);
  
  link
    .enter()
      .append("line")
      .attr("stroke-width", 4)
      .attr('stroke', 'red');

  // link = link.merge(addedLink);

  const node = nodeGroup
    .selectAll("circle")
    .data(nodes)
  
  node
    .enter()
      .append("circle")
      .style("fill", d => color(d.cluster / 10))
      .attr("cx", d => d.x)
        .attr("cy", d => d.y)
        .attr("r", d => d.radius);
  
  // node = node.merge(addedNode);
  // simulation.alpha(1.0);
  // simulation.restart();
  simulation.nodes(nodes);
  simulation.force('link').links(links);
}

const layoutTick = e => {
  linkGroup
    .selectAll('line')
    .attr("x1", d => d.source.x)
    .attr("y1", d =>  d.source.y)
    .attr("x2", d =>  d.target.x)
    .attr("y2", d =>  d.target.y);
  nodeGroup
    .selectAll('circle')
    .attr("cx", d => d.x)
    .attr("cy", d => d.y)
    .attr("r", d => d.radius);
};

const init = async () => {
  const response = await fetch('/viz/data');
  const data = await response.json();
  nodes = data.nodes.map(initializeNode);
  links = data.links;
  update();
  simulation.on('tick', layoutTick)
};

init();

const addLink = link => {
  links.push({ ...link, id: links.length });
  // simulation.force('link').links(links);
  // simulation.tick()
  update();
}

const addRandomLink = () => {
  const source = Math.floor(Math.random() * n);
  const target = Math.floor(Math.random() * n);
  links.push({ source, target, id: links.length });
  update();
}
// setInterval(addRandomLink, 1000);

// Create WebSocket connection.
const protocol = window.location.protocol.replace('http', 'ws');
const socket = new WebSocket(`${protocol}//${window.location.host}/feed`);

// Connection opened
socket.addEventListener('open', function (event) {
    // socket.send('Hello Server!');
});

// Listen for messages
socket.addEventListener('message', function (event) {
    const message = JSON.parse(event.data);
    addLink(message);
});