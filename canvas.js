// Config
const config = {
  layoutMode: 'glossary', // Available modes: 'mirror', 'grid', 'glossary', 'linear'
  gridItemsPerRow: 4,
  gridHorizontalSpacing: 50,
  gridVerticalSpacing: 50,
  gridBorderSize: 50
};

// Utils
let directoryListing = {};

async function loadDirectoryListing() {
  try {
    const response = await fetch('directory-listing.json');
    directoryListing = await response.json();
  } catch (error) {
    console.error('Error loading directory listing:', error);
  }
}

function fileExists(path, file) {
  const parts = path.split('/');
  let current = directoryListing;

  for (const part of parts) {
    if (current[part]) {
      current = current[part];
    } else {
      return false;
    }
  }
  return current && current[file] !== undefined;
}

async function fetchCanvasData(container, layoutMode) {
  try {
    const response = await fetch('DreamSong.canvas');
    const canvasData = await response.json();
    const sortedNodes = sortNodesByEdges(canvasData);
    renderCanvas(container, { ...canvasData, nodes: sortedNodes }, layoutMode);
  } catch (error) {
    console.error('Error fetching canvas data:', error);
  }
}

// Render
function renderCanvas(container, canvasData, layoutMode) {
  container.innerHTML = '';
  const canvasWidth = container.offsetWidth;
  const canvasHeight = container.offsetHeight;

  if (layoutMode === 'mirror') {
    mirrorCanvas(container, canvasData, canvasWidth, canvasHeight);
  } else if (layoutMode === 'grid') {
    gridLayout(container, canvasData);
  } else if (layoutMode === 'glossary') {
    glossaryLayout(container, canvasData);
  }
}

function mirrorCanvas(container, canvasData, canvasWidth, canvasHeight) {
  const nodeDivs = [];
  canvasData.nodes.forEach(async (node) => {
    const nodeDiv = await renderNode(node, canvasWidth, canvasHeight, false, false);
    nodeDivs.push(nodeDiv);
    container.appendChild(nodeDiv);
  });
}

async function gridLayout(container, canvasData) {
  const nodeDivs = [];
  let currentRow = 0;
  let currentCol = 0;

  for (const node of canvasData.nodes) {
    const nodeDiv = await renderNode(node, null, null, true, false, currentRow, currentCol);
    nodeDivs.push(nodeDiv);
    
    currentCol++;
    if (currentCol >= config.gridItemsPerRow) {
      currentCol = 0;
      currentRow++;
    }
  }

  container.style.padding = `${config.gridBorderSize}px`;
  container.style.boxSizing = 'border-box';

  nodeDivs.forEach(nodeDiv => container.appendChild(nodeDiv));
}

async function glossaryLayout(container, canvasData) {
  const nodeDivs = [];
  for (const node of canvasData.nodes) {
    if (Array.isArray(node)) {
      const combinedDiv = document.createElement('div');
      combinedDiv.style.display = 'flex';
      combinedDiv.style.flexDirection = 'row';
      combinedDiv.style.marginBottom = '20px';

      for (const subNode of node) {
        const nodeDiv = await renderNode(subNode, null, null, false, true);
        combinedDiv.appendChild(nodeDiv);
      }
      nodeDivs.push(combinedDiv);
    } else {
      const nodeDiv = await renderNode(node, null, null, false, true);
      nodeDivs.push(nodeDiv);
    }
  }

  container.style.padding = '50px';
  container.style.boxSizing = 'border-box';

  nodeDivs.forEach(nodeDiv => container.appendChild(nodeDiv));
}

// New function for linear layout
async function renderLinearFlow(container, sortedNodes) {
  container.innerHTML = '';
  container.style.display = 'flex';
  container.style.flexDirection = 'column';
  container.style.alignItems = 'center';

  let flipFlop = true;

  for (const node of sortedNodes) {
    if (Array.isArray(node)) {
      const combinedDiv = document.createElement('div');
      combinedDiv.className = 'container';
      combinedDiv.style.display = 'flex';
      combinedDiv.style.flexDirection = flipFlop ? 'row' : 'row-reverse';
      combinedDiv.style.alignItems = 'center';
      combinedDiv.style.marginBottom = '20px';

      for (const subNode of node) {
        const nodeDiv = await renderNode(subNode, null, null, false, false);
        combinedDiv.appendChild(nodeDiv);
      }

      container.appendChild(combinedDiv);
      flipFlop = !flipFlop;
    } else {
      const nodeDiv = await renderNode(node, null, null, false, false);
      container.appendChild(nodeDiv);
    }
  }
}

// Nodes
async function renderNode(node, canvasWidth, canvasHeight, isGridLayout, isGlossaryLayout, currentRow, currentCol) {
  const repoName = node.file ? node.file.split('/')[0] : node.id;
  const gifPath = `${repoName}/${repoName}.gif`;
  const pngPath = `${repoName}/${repoName}.png`;
  const pdfPath = `${repoName}/${repoName}.pdf`;

  const gifExists = fileExists(repoName, `${repoName}.gif`);
  const pngExists = fileExists(repoName, `${repoName}.png`);
  const pdfExists = fileExists(repoName, `${repoName}.pdf`);

  // Create the main container for this node
  const nodeDiv = document.createElement('div');
  nodeDiv.style.display = 'flex';
  nodeDiv.style.flexDirection = 'row';
  nodeDiv.style.alignItems = 'center';
  nodeDiv.style.justifyContent = 'center';
  nodeDiv.style.marginBottom = '20px';

  // Create a container for the media element and label
  const mediaLabelContainer = document.createElement('div');
  mediaLabelContainer.style.display = 'flex';
  mediaLabelContainer.style.flexDirection = 'column';
  mediaLabelContainer.style.alignItems = 'center';

  const mediaElement = document.createElement('div');
  mediaElement.className = 'media-element';

  if (isGridLayout) {
    const itemWidth = 400;
    const itemHeight = 400;
    mediaElement.style.width = `${itemWidth}px`;
    mediaElement.style.height = `${itemHeight}px`;
  } else if (node.width && node.height) {
    mediaElement.style.width = `${node.width}px`;
    mediaElement.style.height = `${node.height}px`;
  } else {
    mediaElement.style.width = '200px';
    mediaElement.style.height = '200px';
  }

  if (gifExists) {
    const gifElement = document.createElement('img');
    gifElement.src = gifPath;
    mediaElement.appendChild(gifElement);
  } else if (pngExists) {
    const pngElement = document.createElement('img');
    pngElement.src = pngPath;
    mediaElement.appendChild(pngElement);
  } else if (pdfExists) {
    const pdfElement = document.createElement('embed');
    pdfElement.src = pdfPath;
    pdfElement.type = 'application/pdf';
    mediaElement.appendChild(pdfElement);
  } else if (node.type === 'text') {
    const textElement = document.createElement('div');
    textElement.innerHTML = convertMarkdownToHTML(node.text);
    textElement.style.fontSize = '16px';
    mediaElement.appendChild(textElement);
  } else {
    const textElement = document.createElement('div');
    textElement.textContent = repoName;
    textElement.style.fontSize = '30px';
    mediaElement.appendChild(textElement);
  }

  const labelElement = document.createElement('div');
  labelElement.textContent = repoName;
  labelElement.className = 'clamp-text';

  mediaElement.addEventListener('mouseover', () => {
    mediaElement.style.transform = 'scale(1.1)';
  });

  mediaElement.addEventListener('mouseout', () => {
    mediaElement.style.transform = 'scale(1)';
  });

  mediaElement.addEventListener('click', () => {
    const repoUrl = `https://github.com/InterfaceGuy/${repoName}`;
    window.open(repoUrl, '_blank');
  });

  // Append mediaElement and labelElement to mediaLabelContainer
  mediaLabelContainer.appendChild(mediaElement);
  mediaLabelContainer.appendChild(labelElement);

  // Append mediaLabelContainer to nodeDiv
  nodeDiv.appendChild(mediaLabelContainer);

  if (isGlossaryLayout) {
    const definitionText = await fetchDefinitionText(repoName);
    const definitionElement = document.createElement('div');
    definitionElement.className = 'definition-element';
    definitionElement.innerHTML = definitionText;
    // Append definitionElement to nodeDiv
    nodeDiv.appendChild(definitionElement);
  }

  if (isGridLayout) {
    const itemWidth = 400;
    const itemHeight = 400;
    const left = currentCol * (itemWidth + config.gridHorizontalSpacing) + config.gridBorderSize;
    const top = currentRow * (itemHeight + config.gridVerticalSpacing) + config.gridBorderSize;
    nodeDiv.style.position = 'absolute';
    nodeDiv.style.left = `${left}px`;
    nodeDiv.style.top = `${top}px`;
  } else if (canvasWidth && canvasHeight) {
    const adjustedX = node.x + canvasWidth / 2;
    const adjustedY = canvasHeight / 2 - node.y;
    nodeDiv.style.position = 'absolute';
    nodeDiv.style.left = `${adjustedX}px`;
    nodeDiv.style.top = `${adjustedY}px`;
  }

  return nodeDiv;
}

async function fetchDefinitionText(repoName) {
  try {
    const response = await fetch(`${repoName}/README.md`);
    const markdownText = await response.text();
    const htmlContent = convertMarkdownToHTML(markdownText);
    return htmlContent;
  } catch (error) {
    console.error(`Error fetching definition text for ${repoName}:`, error);
    return 'Definition not available.';
  }
}

// Topological sorting function
function sortNodesByEdges(canvasData) {
  const nodes = canvasData.nodes;
  const edges = canvasData.edges;

  const nodeMap = new Map();
  nodes.forEach(node => nodeMap.set(node.id, node));

  const unidirectionalEdges = edges.filter(edge => !('toEnd' in edge));
  const nonDirectionalEdges = edges.filter(edge => 'toEnd' in edge);

  const adjList = new Map();
  unidirectionalEdges.forEach(edge => {
    if (!adjList.has(edge.fromNode)) {
      adjList.set(edge.fromNode, []);
    }
    adjList.get(edge.fromNode).push(edge.toNode);
  });

  const unidirectionalNodes = new Set();
  unidirectionalEdges.forEach(edge => {
    unidirectionalNodes.add(edge.fromNode);
    unidirectionalNodes.add(edge.toNode);
  });

  const sortedNodes = [];
  const visited = new Set();

  function dfs(nodeId) {
    if (visited.has(nodeId) || !unidirectionalNodes.has(nodeId)) return;
    visited.add(nodeId);

    const neighbors = adjList.get(nodeId) || [];
    neighbors.forEach(neighborId => dfs(neighborId));

    sortedNodes.unshift(nodeMap.get(nodeId));
  }

  const incomingEdges = new Set(unidirectionalEdges.map(edge => edge.toNode));
  nodes.forEach(node => {
    if (unidirectionalNodes.has(node.id) && !incomingEdges.has(node.id)) {
      dfs(node.id);
    }
  });

  unidirectionalNodes.forEach(nodeId => {
    if (!visited.has(nodeId)) {
      sortedNodes.push(nodeMap.get(nodeId));
    }
  });

  nonDirectionalEdges.forEach(edge => {
    const node1 = nodeMap.get(edge.fromNode);
    const node2 = nodeMap.get(edge.toNode);

    if (node1 && node2) {
      sortedNodes.forEach((node, index) => {
        if (Array.isArray(node)) {
          const [mediaNode, textNode] = node;
          if (mediaNode.id === node1.id || mediaNode.id === node2.id) {
            sortedNodes[index] = [mediaNode, textNode, node1.id === mediaNode.id ? node2 : node1];
            visited.add(node1.id);
            visited.add(node2.id);
          }
        } else if (node.id === node1.id || node.id === node2.id) {
          const combinedNode = node.id === node1.id ? node2 : node1;
          sortedNodes[index] = [node, combinedNode];
          visited.add(node.id);
          visited.add(combinedNode.id);
        }
      });
    }
  });

  nodes.forEach(node => {
    if (!visited.has(node.id) && !unidirectionalNodes.has(node.id)) {
      sortedNodes.push(node);
    }
  });

  return sortedNodes;
}

// Convert markdown to HTML
function convertMarkdownToHTML(markdown) {
  if (!markdown) return ''; // Return an empty string if markdown is undefined

  // Remove the primary header (first occurrence of # at the start of a line)
  markdown = markdown.replace(/^# .+\n/, '');

  // Helper function to wrap list items in <ul> tags
  const wrapListItems = (html) => {
    const listRegex = /<li>[\s\S]+?<\/li>/g;
    return html.replace(listRegex, match => `<ul>${match}</ul>`);
  };

  return wrapListItems(markdown
    // Convert headers (excluding the primary header)
    .replace(/^##### (.*$)/gim, '<h5>$1</h5>')
    .replace(/^#### (.*$)/gim, '<h4>$1</h4>')
    .replace(/^### (.*$)/gim, '<h3>$1</h3>')
    .replace(/^## (.*$)/gim, '<h2>$1</h2>')
    // Convert bold text
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    // Convert italic text
    .replace(/\*(.*?)\*/g, '<em>$1</em>')
    // Convert unordered lists
    .replace(/^\s*-\s(.*)$/gim, '<li>$1</li>')
    // Convert ordered lists
    .replace(/^\s*\d+\.\s(.*)$/gim, '<li>$1</li>')
    // Convert links (including YouTube links), making them clickable
    .replace(/!?\[(.*?)\]\((.*?)\)/g, '<a href="$2" target="_blank">$1</a>')
    // Convert line breaks
    .replace(/\n\n/g, '</p><p>')
    .replace(/\n/g, '<br>')
    // Wrap content in paragraphs
    .replace(/^(.+)$/gim, '<p>$1</p>')
    // Remove empty paragraphs
    .replace(/<p>\s*<\/p>/g, '')
  );
}

// Main initialization
const canvasContainer = document.getElementById('canvas-container');

async function initialize() {
  await loadDirectoryListing();
  fetchCanvasData(canvasContainer, config.layoutMode);
}

initialize();