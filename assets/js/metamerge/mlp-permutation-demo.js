function initMLPDemo()  {
  const netWidth = 400;
  const netHeight = 350;
  const cellSize = 30;

  const inputNeurons = 3;
  const hiddenNeurons = 4;
  const outputNeurons = 2;

  const inputX = [0.5, -0.3, 0.8];

  // ── toggle state ───────────────────────────────────────────────────────────
  let correctPermutation = true;

  d3.select("#toggle-btn").on("click", function() {
    correctPermutation = !correctPermutation;
    d3.select(this)
      .classed("off", !correctPermutation)
      .text(correctPermutation ? "✓ Correct Permutation ON" : "✗ Correct Permutation OFF");
    d3.select("#toggle-label")
      .text(correctPermutation
        ? "W₂ columns follow the permutation → output stays the same"
        : "W₂ columns stay fixed → output changes after permutation");
    updateMatrices(null);
    const result = computeOutput();
    d3.select("#hidden-values").text(`[${result.hidden.map(h => h.toFixed(3)).join(', ')}]`).style("color", "#4CAF50");
    d3.select("#output-values").text(`[${result.output.join(', ')}]`).style("color", "#2196F3");
  });
  // ──────────────────────────────────────────────────────────────────────────

  let nodes = [];
  let nodeId = 0;

  for (let i = 0; i < inputNeurons; i++) {
    nodes.push({ id: nodeId++, layer: 0, x: 80, y: 100 + i * 80, originalY: 100 + i * 80, label: `x${i}`, index: i });
  }
  for (let i = 0; i < hiddenNeurons; i++) {
    nodes.push({ id: nodeId++, layer: 1, x: 200, y: 60 + i * 80, originalY: 60 + i * 80, label: `h${i}`, originalIndex: i });
  }
  for (let i = 0; i < outputNeurons; i++) {
    nodes.push({ id: nodeId++, layer: 2, x: 320, y: 140 + i * 80, originalY: 140 + i * 80, label: `y${i}`, index: i });
  }

  let edges = [];
  nodes.filter(n => n.layer === 0).forEach(input => {
    nodes.filter(n => n.layer === 1).forEach(hidden => {
      edges.push({ source: input.id, target: hidden.id, id: `${input.id}-${hidden.id}` });
    });
  });
  nodes.filter(n => n.layer === 1).forEach(hidden => {
    nodes.filter(n => n.layer === 2).forEach(output => {
      edges.push({ source: hidden.id, target: output.id, id: `${hidden.id}-${output.id}` });
    });
  });

  function createMatrix(rows, cols) {
    const matrix = [];
    for (let i = 0; i < rows; i++) {
      matrix[i] = [];
      for (let j = 0; j < cols; j++) {
        matrix[i][j] = parseFloat((Math.random() * 2 - 1).toFixed(2));
      }
    }
    return matrix;
  }

  let W1_original = createMatrix(hiddenNeurons, inputNeurons);
  let W2_original = createMatrix(outputNeurons, hiddenNeurons);

  function getCurrentPermutation() {
    const hiddenNodes = nodes.filter(n => n.layer === 1);
    const sorted = [...hiddenNodes].sort((a, b) => a.y - b.y);
    return sorted.map(n => n.originalIndex);
  }

  function computeOutput() {
    const perm = getCurrentPermutation();
    const hidden = [];
    for (let i = 0; i < hiddenNeurons; i++) {
      const originalIdx = perm[i];
      let sum = 0;
      for (let j = 0; j < inputNeurons; j++) {
        sum += W1_original[originalIdx][j] * inputX[j];
      }
      hidden[i] = sum;
    }

    const output = [];
    for (let i = 0; i < outputNeurons; i++) {
      let sum = 0;
      for (let j = 0; j < hiddenNeurons; j++) {
        // ── KEY CHANGE: when toggle OFF, W2 columns are NOT permuted ──────────
        const w2ColIdx = correctPermutation ? perm[j] : j;
        sum += W2_original[i][w2ColIdx] * hidden[j];
      }
      output[i] = sum.toFixed(3);
    }

    return { hidden, output };
  }

  const initialResult = computeOutput();
  d3.select("#input-values").text(`[${inputX.join(', ')}]`).style("color", "#333");
  d3.select("#hidden-values").text(`[${initialResult.hidden.map(h => h.toFixed(3)).join(', ')}]`).style("color", "#4CAF50");
  d3.select("#output-values").text(`[${initialResult.output.join(', ')}]`).style("color", "#2196F3");

  const networkSvg = d3.select("#network-viz")
    .append("svg")
    .attr("width", netWidth)
    .attr("height", netHeight)
    .style("border", "1px solid #ddd")
    .style("border-radius", "8px")
    .style("background", "#fafafa");

  networkSvg.append("text")
    .attr("x", netWidth / 2).attr("y", 20)
    .attr("text-anchor", "middle")
    .style("font-size", "14px").style("font-weight", "bold").style("fill", "#333")
    .text("Neural Network");

  const edgeGroup = networkSvg.append("g");

  function updateEdges(highlightOriginalIndices = null) {
    edgeGroup.selectAll("line")
      .data(edges)
      .join("line")
      .attr("x1", d => nodes[d.source].x).attr("y1", d => nodes[d.source].y)
      .attr("x2", d => nodes[d.target].x).attr("y2", d => nodes[d.target].y)
      .attr("stroke", d => {
        if (!highlightOriginalIndices) return "#999";
        const t = nodes[d.target], s = nodes[d.source];
        const isW2edge = s.layer === 1 && t.layer === 2;
        if (isW2edge && !correctPermutation) return "#999";
        if ((t.layer === 1 && highlightOriginalIndices.includes(t.originalIndex)) ||
            (s.layer === 1 && highlightOriginalIndices.includes(s.originalIndex))) return "#FF9800";
        return "#999";
      })
      .attr("stroke-width", d => {
        if (!highlightOriginalIndices) return 1.5;
        const t = nodes[d.target], s = nodes[d.source];
        const isW2edge = s.layer === 1 && t.layer === 2;
        if (isW2edge && !correctPermutation) return 1.5;
        return ((t.layer === 1 && highlightOriginalIndices.includes(t.originalIndex)) ||
                (s.layer === 1 && highlightOriginalIndices.includes(s.originalIndex))) ? 3 : 1.5;
      })
      .attr("opacity", d => {
        if (!highlightOriginalIndices) return 0.4;
        const t = nodes[d.target], s = nodes[d.source];
        const isW2edge = s.layer === 1 && t.layer === 2;
        if (isW2edge && !correctPermutation) return 0.4;
        return ((t.layer === 1 && highlightOriginalIndices.includes(t.originalIndex)) ||
                (s.layer === 1 && highlightOriginalIndices.includes(s.originalIndex))) ? 0.8 : 0.2;
      });
  }

  updateEdges();

  const nodeGroup = networkSvg.append("g");
  const nodeElements = nodeGroup.selectAll("g")
    .data(nodes).join("g")
    .attr("transform", d => `translate(${d.x},${d.y})`);

  nodeElements.append("circle")
    .attr("r", 18)
    .attr("fill", d => d.layer === 1 ? "#4CAF50" : "#2196F3")
    .attr("stroke", "#333").attr("stroke-width", 2);

  nodeElements.append("text")
    .attr("text-anchor", "middle").attr("dy", "0.35em")
    .attr("fill", "white").style("font-size", "11px").style("font-weight", "bold")
    .text(d => d.label);

  const matrixContainer = d3.select("#weight-matrices");

  function getPermutedMatrix(matrix, rowPerm = null, colPerm = null) {
    let result = matrix.map(row => [...row]);
    if (rowPerm) result = rowPerm.map(i => [...matrix[i]]);
    if (colPerm) result = result.map(row => colPerm.map(i => row[i]));
    return result;
  }

  function drawMatrix(container, matrix, title, rowLabels, colLabels, highlightRows = null, highlightCols = null) {
    container.html("");
    const rows = matrix.length, cols = matrix[0].length;
    const totalWidth = cols * cellSize + 60, totalHeight = rows * cellSize + 60;

    const svg = container.append("svg")
      .attr("width", totalWidth).attr("height", totalHeight)
      .style("border", "1px solid #ddd").style("border-radius", "8px").style("background", "white");

    svg.append("text")
      .attr("x", totalWidth / 2).attr("y", 15).attr("text-anchor", "middle")
      .style("font-size", "12px").style("font-weight", "bold").style("fill", "#333")
      .text(title);

    const g = svg.append("g").attr("transform", "translate(40, 30)");
    const colorScale = d3.scaleSequential(d3.interpolateRdBu).domain([1, -1]);

    matrix.forEach((row, i) => {
      row.forEach((val, j) => {
        const isHighlighted = (highlightRows && highlightRows.includes(i)) || (highlightCols && highlightCols.includes(j));
        g.append("rect")
          .attr("x", j * cellSize).attr("y", i * cellSize)
          .attr("width", cellSize - 1).attr("height", cellSize - 1)
          .attr("fill", colorScale(val))
          .attr("stroke", isHighlighted ? "#FF9800" : "#fff")
          .attr("stroke-width", isHighlighted ? 3 : 1)
          .attr("opacity", isHighlighted ? 1 : 0.8);
        g.append("text")
          .attr("x", j * cellSize + cellSize / 2).attr("y", i * cellSize + cellSize / 2)
          .attr("dy", "0.35em").attr("text-anchor", "middle")
          .style("font-size", "9px")
          .style("fill", Math.abs(val) > 0.5 ? "white" : "#333")
          .style("font-weight", isHighlighted ? "bold" : "normal")
          .text(val);
      });
    });

    rowLabels.forEach((label, i) => {
      const isHighlighted = highlightRows && highlightRows.includes(i);
      g.append("text").attr("x", -5).attr("y", i * cellSize + cellSize / 2)
        .attr("dy", "0.35em").attr("text-anchor", "end")
        .style("font-size", "10px").style("font-weight", "bold")
        .style("fill", isHighlighted ? "#FF9800" : "#333").text(label);
    });

    colLabels.forEach((label, j) => {
      const isHighlighted = highlightCols && highlightCols.includes(j);
      g.append("text").attr("x", j * cellSize + cellSize / 2).attr("y", -5)
        .attr("text-anchor", "middle")
        .style("font-size", "10px").style("font-weight", "bold")
        .style("fill", isHighlighted ? "#FF9800" : "#333").text(label);
    });
  }

  const w1Container = matrixContainer.append("div").style("margin-bottom", "1rem");
  const w2Container = matrixContainer.append("div");
  const inputLabels = nodes.filter(n => n.layer === 0).map(n => n.label);
  const originalHiddenLabels = ['h0', 'h1', 'h2', 'h3'];
  const outputLabels = nodes.filter(n => n.layer === 2).map(n => n.label);

  function updateMatrices(highlightOriginalIndices = null) {
    const perm = getCurrentPermutation();

    const W1_display = getPermutedMatrix(W1_original, perm, null);
    const permutedHiddenLabels = perm.map(i => originalHiddenLabels[i]);

    // ── KEY CHANGE: W2 display respects toggle ────────────────────────────────
    const W2_display = correctPermutation
      ? getPermutedMatrix(W2_original, null, perm)
      : getPermutedMatrix(W2_original, null, null); // no column permutation

    const w2ColLabels = correctPermutation
      ? permutedHiddenLabels
      : originalHiddenLabels;
    // ──────────────────────────────────────────────────────────────────────────

    let w1HighlightRows = null, w2HighlightCols = null;
    if (highlightOriginalIndices) {
      w1HighlightRows = highlightOriginalIndices.map(origIdx => perm.indexOf(origIdx));
      w2HighlightCols = correctPermutation ? w1HighlightRows : null;
    }

    drawMatrix(w1Container, W1_display, "W₁: Input → Hidden", permutedHiddenLabels, inputLabels, w1HighlightRows, null);
    drawMatrix(w2Container, W2_display, "W₂: Hidden → Output", outputLabels, w2ColLabels, null, w2HighlightCols);
  }

  updateMatrices();

  let isAnimating = false;

  function animatePermutation() {
    if (isAnimating) return;
    isAnimating = true;

    const hiddenNodes = nodes.filter(n => n.layer === 1);
    const idx1 = Math.floor(Math.random() * hiddenNeurons);
    let idx2 = Math.floor(Math.random() * hiddenNeurons);
    while (idx2 === idx1) idx2 = Math.floor(Math.random() * hiddenNeurons);

    const node1 = hiddenNodes.find(n => n.originalIndex === idx1);
    const node2 = hiddenNodes.find(n => n.originalIndex === idx2);
    const domPos1 = hiddenNodes.indexOf(node1);
    const domPos2 = hiddenNodes.indexOf(node2);

    updateEdges([idx1, idx2]);
    updateMatrices([idx1, idx2]);

    d3.select(nodeElements.nodes()[inputNeurons + domPos1]).select("circle")
      .transition().duration(300).attr("stroke", "#FF9800").attr("stroke-width", 4);
    d3.select(nodeElements.nodes()[inputNeurons + domPos2]).select("circle")
      .transition().duration(300).attr("stroke", "#FF9800").attr("stroke-width", 4);

    setTimeout(() => {
      const tempY = node1.y;

      d3.select(nodeElements.nodes()[inputNeurons + domPos1])
        .transition().duration(1000)
        .attr("transform", `translate(${node1.x},${node2.y})`);

      d3.select(nodeElements.nodes()[inputNeurons + domPos2])
        .transition().duration(1000)
        .attr("transform", `translate(${node2.x},${tempY})`)
        .on("end", () => {
          node1.y = node2.y;
          node2.y = tempY;

          updateEdgesAnimated();

          setTimeout(() => {
            updateMatrices([idx1, idx2]);

            const result = computeOutput();
            d3.select("#hidden-values").text(`[${result.hidden.map(h => h.toFixed(3)).join(', ')}]`).style("color", "#4CAF50");
            d3.select("#output-values").text(`[${result.output.join(', ')}]`).style("color", "#2196F3");

            setTimeout(() => {
              updateMatrices(null);
              d3.selectAll("circle").transition().duration(300).attr("stroke", "#333").attr("stroke-width", 2);
              updateEdges(null);
              isAnimating = false;
            }, 2000);
          }, 500);
        });
    }, 800);
  }

  function updateEdgesAnimated() {
    edgeGroup.selectAll("line")
      .transition().duration(500)
      .attr("x1", d => nodes[d.source].x).attr("y1", d => nodes[d.source].y)
      .attr("x2", d => nodes[d.target].x).attr("y2", d => nodes[d.target].y);
  }

  function reset() {
    if (isAnimating) return;
    const hiddenNodes = nodes.filter(n => n.layer === 1);
    hiddenNodes.forEach((node, i) => {
      const domIndex = nodes.indexOf(node);
      d3.select(nodeElements.nodes()[domIndex])
        .transition().duration(1000)
        .attr("transform", `translate(${node.x},${node.originalY})`)
        .on("end", function() {
          node.y = node.originalY;
          if (i === hiddenNodes.length - 1) {
            updateEdgesAnimated();
            setTimeout(() => {
              updateMatrices(null);
              updateEdges(null);
              const result = computeOutput();
              d3.select("#hidden-values").text(`[${result.hidden.map(h => h.toFixed(3)).join(', ')}]`).style("color", "#4CAF50");
              d3.select("#output-values").text(`[${result.output.join(', ')}]`).style("color", "#2196F3");
            }, 500);
          }
        });
    });
  }

  d3.select("#animate-btn").on("click", animatePermutation);
  d3.select("#reset-btn").on("click", reset);
}

if (typeof d3 !== 'undefined') {
    initMLPDemo();
} else {
    setTimeout(function checkD3() {
        if (typeof d3 !== 'undefined') {
            initMLPDemo();
        } else {
            setTimeout(checkD3, 100);
        }
    }, 100);
}