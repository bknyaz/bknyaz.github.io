function initWeightExplorer() {
  console.log('Weight Explorer Starting');

  const margin = {top: 50, right: 20, bottom: 60, left: 70};
  const width = 650 - margin.left - margin.right;
  const height = 450 - margin.top - margin.bottom;

  const svg = d3.select("#weight-plot")
    .append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .append("g")
    .attr("transform", `translate(${margin.left},${margin.top})`);

  // Add grid lines for better readability
  const gridGroup = svg.append("g").attr("class", "grid");

  const xScale = d3.scalePoint()
    .domain(['p0', 'p1', 'p2', 'p3', 'p4', 'p_meta'])
    .range([0, width])
    .padding(0.5);

  const yScale = d3.scaleLinear()
    .range([height, 0]);

  const xAxis = svg.append("g")
    .attr("transform", `translate(0,${height})`)
    .attr("class", "x-axis");

  const yAxis = svg.append("g")
    .attr("class", "y-axis");

  // X-axis label
  svg.append("text")
    .attr("class", "axis-label")
    .attr("transform", `translate(${width/2},${height + 45})`)
    .style("text-anchor", "middle")
    .text("Model");

  // Y-axis label
  svg.append("text")
    .attr("class", "axis-label")
    .attr("transform", "rotate(-90)")
    .attr("y", 0 - margin.left)
    .attr("x", 0 - (height / 2))
    .attr("dy", "1em")
    .style("text-anchor", "middle")
    .text("Weight Value");

  const title = svg.append("text")
    .attr("class", "chart-title")
    .attr("x", width / 2)
    .attr("y", -20)
    .attr("text-anchor", "middle");

  const line = d3.line()
    .x(d => xScale(d.key))
    .y(d => yScale(d.value))
    .curve(d3.curveMonotoneX);

  const path = svg.append("path")
    .attr("class", "main-line")
    .attr("fill", "none")
    .attr("stroke", "#1976D2")
    .attr("stroke-width", 7)
    .attr("stroke-linecap", "round")
    .attr("stroke-linejoin", "round");

  const dotsGroup = svg.append("g").attr("class", "dots");
  const linesGroup = svg.append("g").attr("class", "reference-lines");

  let allData = [];
  let currentSelection = {};
  let layers = [];
  let neurons = [];

  function initializeSliders() {
    const layerSlider = d3.select('#layer-slider');
    const neuronSlider = d3.select('#neuron-slider');

    layerSlider
      .attr('min', 0)
      .attr('max', Math.max(0, layers.length - 1))
      .attr('value', 0)
      .on('input', function() {
        currentSelection.layer = layers[+this.value];
        d3.select('#layer-value').text(currentSelection.layer);
        updatePlot(1);
      });

    neuronSlider
      .attr('min', 0)
      .attr('max', Math.max(0, neurons.length - 1))
      .attr('value', 0)
      .on('input', function() {
        currentSelection.neuron = neurons[+this.value];
        d3.select('#neuron-value').text(currentSelection.neuron);
        updatePlot(1);
      });

    if (layers.length > 0) {
      currentSelection.layer = layers[0];
      d3.select('#layer-value').text(layers[0]);
    }
    if (neurons.length > 0) {
      currentSelection.neuron = neurons[0];
      d3.select('#neuron-value').text(neurons[0]);
    }
  }

  function updatePlot(upd_y_range) {
    const row = allData.find(d =>
      d.layer === currentSelection.layer &&
      +d.neuron === currentSelection.neuron
    );

    if (!row) {
      console.warn('No data found for', currentSelection);
      return;
    }

    const yKeys = ['p0', 'p1', 'p2', 'p3', 'p4', 'p_meta'];
    const plotData = yKeys.map(key => ({ key: key, value: +row[key] }));

    const yAvg = +row.p_avg;

    const allValues = plotData.map(d => d.value).concat([yAvg]);
    const yExtent = d3.extent(allValues);
    if (upd_y_range) {
        const yPadding = (yExtent[1] - yExtent[0]) * 0.15;
        yScale.domain([yExtent[0] - yPadding, yExtent[1] + yPadding]);
    }

    // Update axes
    xAxis.transition().duration(500).call(
      d3.axisBottom(xScale)
        .tickFormat(d => {
          const labels = {
            'p0': 'pretrained',
            'p1': 'dtd',
            'p2': 'resisc45',
            'p3': 'mnist',
            'p4': 'svhn',
            'p_meta': 'meta-merge',
          };
          return labels[d] || d;
        })
    );

    yAxis.transition().duration(500).call(d3.axisLeft(yScale).ticks(6));

    // Add grid lines
    gridGroup.selectAll(".grid-line").remove();
    yScale.ticks(6).forEach(tick => {
      gridGroup.append("line")
        .attr("class", "grid-line")
        .attr("x1", 0)
        .attr("x2", width)
        .attr("y1", yScale(tick))
        .attr("y2", yScale(tick))
        .attr("stroke", "#f0f0f0")
        .attr("stroke-width", 0.5);
    });

    // Update title
    title.text(`Layer: ${currentSelection.layer} | Neuron: ${currentSelection.neuron}`);

    // Update main line
    path.datum(plotData).transition().duration(500).attr("d", line);

    // Update dots for y0-y4
    const dots = dotsGroup.selectAll("circle").data(plotData, d => d.key);

    dots.join(
      enter => enter.append("circle")
        .attr("class", "data-dot")
        .attr("r", 5)
        .attr("fill", "#1976D2")
        .attr("stroke", "white")
        .attr("stroke-width", 2.5)
        .attr("cx", d => xScale(d.key))
        .attr("cy", d => yScale(d.value))
        .call(enter => enter.transition().duration(500).attr("r", 5)),
      update => update.call(update => update.transition().duration(500)
        .attr("cx", d => xScale(d.key))
        .attr("cy", d => yScale(d.value))),
      exit => exit.call(exit => exit.transition().duration(300).attr("r", 0).remove())
    );

    dots.on("mouseenter", function(event, d) {
      d3.select(this).transition().duration(150).attr("r", 7);
      svg.selectAll(".tooltip").remove();
      svg.append("text")
        .attr("class", "tooltip")
        .attr("x", xScale(d.key))
        .attr("y", yScale(d.value) - 18)
        .attr("text-anchor", "middle")
        .style("font-size", "12px")
        .style("font-weight", "bold")
        .text(`${d.key.replace('p', 'model')}: ${d.value.toFixed(4)}`);
    }).on("mouseleave", function(event, d) {
      d3.select(this).transition().duration(150).attr("r", 5);
      svg.selectAll(".tooltip").remove();
    });

    // Update reference lines
    linesGroup.selectAll("*").remove();

    // p_avg line (dashed)
    linesGroup.append("line")
      .attr("class", "reference-line avg-line")
      .attr("x1", 0)
      .attr("x2", width)
      .attr("y1", yScale(yAvg))
      .attr("y2", yScale(yAvg))
      .attr("stroke", "#F57C00")
      .attr("stroke-width", 7)
      .attr("stroke-dasharray", "0");

  }

  function createLegend() {
    const legend = d3.select("#legend");
    legend.html("");

    const items = [
      { label: "params as a trajectory", color: "#1976D2", type: "solid" },
      { label: "p_avg", color: "#F57C00", type: "solid" },
    ];

    items.forEach(item => {
      const itemDiv = legend.append("div").attr("class", "legend-item");

      const svg = itemDiv.append("svg")
        .attr("width", 30)
        .attr("height", 20)
        .attr("viewBox", "0 0 30 20");

      if (item.type === "line") {
        // Dots and line
        svg.append("line")
          .attr("x1", 0).attr("y1", 10)
          .attr("x2", 30).attr("y2", 10)
          .attr("stroke", item.color)
          .attr("stroke-width", 7);
        svg.append("circle")
          .attr("cx", 8).attr("cy", 10)
          .attr("r", 3)
          .attr("fill", item.color)
          .attr("stroke", "white")
          .attr("stroke-width", 2.5);
        svg.append("circle")
          .attr("cx", 22).attr("cy", 10)
          .attr("r", 3)
          .attr("fill", item.color)
          .attr("stroke", "white")
          .attr("stroke-width", 2.5);
      } else if (item.type === "solid") {
        svg.append("line")
          .attr("x1", 0).attr("y1", 10)
          .attr("x2", 30).attr("y2", 10)
          .attr("stroke", item.color)
          .attr("stroke-width", 7);
      } else if (item.type === "dashed") {
        svg.append("line")
          .attr("x1", 0).attr("y1", 10)
          .attr("x2", 30).attr("y2", 10)
          .attr("stroke", item.color)
          .attr("stroke-width", 7)
          .attr("stroke-dasharray", "5,5");
      }

      itemDiv.append("span").text(item.label);
    });
  }

  console.log('Loading CSV...');

  var container = document.getElementById('weight-explorer');
  var weightsFile = container.getAttribute('data-weights-file');

  if (!weightsFile) {
      console.error('data-weights-file attribute not found');
      return;
  }

  d3.csv(weightsFile)
    .then(data => {
      console.log('Loaded rows:', data.length);
      console.log('First row:', data[0]);

      allData = data;

      layers = [...new Set(data.map(d => d.layer))];
      neurons = [...new Set(data.map(d => +d.neuron))].sort((a, b) => a - b);

      console.log('Layers:', layers);
      console.log('Neurons:', neurons);

      initializeSliders();
      createLegend();
      updatePlot(1);
    })
    .catch(error => {
      console.error('CSV error:', error);
      d3.select("#weight-plot").append("div")
        .style("color", "#D32F2F")
        .style("padding", "1rem")
        .html(`Error loading data: ${error.message}`);
    });
}

// Initialize when D3 is ready
if (typeof d3 !== 'undefined') {
    initWeightExplorer();
} else {
    setTimeout(function checkD3() {
        if (typeof d3 !== 'undefined') {
            initWeightExplorer();
        } else {
            setTimeout(checkD3, 100);
        }
    }, 100);
}