// Config
const config = {
  layoutMode: 'grid', // Available modes: 'mirror', 'grid', 'glossary'
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
    renderCanvas(container, canvasData, layoutMode);
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
    const nodeDiv = await renderNode(node, null, null, false, true);
    nodeDivs.push(nodeDiv);
  }

  container.style.padding = '50px';
  container.style.boxSizing = 'border-box';

  nodeDivs.forEach(nodeDiv => container.appendChild(nodeDiv));
}

// Nodes
async function renderNode(node, canvasWidth, canvasHeight, isGridLayout, isGlossaryLayout, currentRow, currentCol) {
  const repoName = node.file.split('/')[0];
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
  } else {
    mediaElement.style.width = `${node.width}px`;
    mediaElement.style.height = `${node.height}px`;
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
    definitionElement.textContent = definitionText;
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
  } else if (!isGlossaryLayout) {
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
    const plainText = markdownText
      .replace(/!?\[.*?\]\(.*?\)/g, '') // Remove images/links
      .replace(/#+\s/g, '') // Remove markdown headers
      .replace(new RegExp(`^${repoName}\\s*`, 'i'), ''); // Remove the main title if it matches repoName
    return plainText.trim();
  } catch (error) {
    console.error(`Error fetching definition text for ${repoName}:`, error);
    return 'Definition not available.';
  }
}

// Main initialization
const canvasContainer = document.getElementById('canvas-container');

async function initialize() {
  await loadDirectoryListing();
  fetchCanvasData(canvasContainer, config.layoutMode);
}

initialize();