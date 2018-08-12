const width = 960,
    height = 960,
    padding = 1.5, // separation between same-color nodes
    clusterPadding = 6, // separation between different-color nodes
    maxRadius = 12;

const n = 200, // total number of nodes
    m = 10; // number of distinct clusters

const color = d3.scaleSequential(d3.interpolateRainbow)
    .domain(d3.range(m));

// The largest node for each cluster.
const clusters = new Array(m);

const nodes = d3.range(n).map(id => {
  const nodeCluster =  Math.floor(Math.random() * m);
  const node = {
    id,
    cluster: nodeCluster,
    radius: maxRadius,
    x: Math.cos(nodeCluster / m * 2 * Math.PI) * 200 + width / 2 + Math.random(),
    y: Math.sin(nodeCluster / m * 2 * Math.PI) * 200 + height / 2 + Math.random()
  };
  clusters[nodeCluster] = node;
  return node;
});

const links = [
  { source: 1, target: 150 },
];

// Move d to be adjacent to the cluster node.
// from: https://bl.ocks.org/mbostock/7881887
const cluster = () => {

  let nodes,
    strength = 0.1;
  function force (alpha) {

    // scale + curve alpha value
    alpha *= strength * alpha;

    nodes.forEach(function(d) {
      let cluster = clusters[d.cluster];
      if (cluster === d) return;
      
      let x = d.x - cluster.x,
        y = d.y - cluster.y,
        l = Math.sqrt(x * x + y * y),
        r = d.radius + cluster.radius;

      if (l != r) {
        l = (l - r) / l * alpha;
        d.x -= x *= l;
        d.y -= y *= l;
        cluster.x += x;
        cluster.y += y;
      }
    });

  }

  force.initialize = function (_) {
    nodes = _;
  }

  force.strength = _ => {
    strength = _ == null ? strength : _;
    return force;
  };

  return force;
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
  .force('center', d3.forceCenter(width / 2, height / 2))
  // cluster by section
  .force('cluster', cluster().strength(0.2))
  // apply collision with padding
  .force('collide', d3.forceCollide(d => d.radius + padding).strength(0.7))
  .force('link', d3.forceLink().id(d => d.id).strength(.5).distance(50))

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
  simulation.alpha(1.0);
  simulation.restart();
  simulation.nodes(nodes);
  simulation.force('link').links(links);
}

update();

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

simulation.on('tick', layoutTick)

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