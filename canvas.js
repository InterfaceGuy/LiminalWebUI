const canvasContainer = document.getElementById('canvas-container');
const layoutMode = 'grid'; // Set the desired layout mode: 'mirror' or 'grid'
const gridItemsPerRow = 4; // Set the number of items per row for the grid layout
const gridHorizontalSpacing = 50; // Horizontal spacing between grid items
const gridVerticalSpacing = 50; // Vertical spacing between grid items
const gridBorderSize = 50; // Border size around the grid container

let currentRow = 0; // Track the current row for grid layout
let currentCol = 0; // Track the current column for grid layout

let directoryListing = {};

// Function to load the JSON content dynamically
async function loadDirectoryListing() {
  try {
    const response = await fetch('directory-listing.json');
    directoryListing = await response.json();
  } catch (error) {
    console.error('Error loading directory listing:', error);
  }
}

// Function to check if a file exists in the directory listing
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

async function fetchCanvasData() {
  try {
    const response = await fetch('DreamSong.canvas');
    const canvasData = await response.json();
    renderCanvas(canvasData, layoutMode);
  } catch (error) {
    console.error('Error fetching canvas data:', error);
  }
}

function renderCanvas(canvasData, layoutMode) {
  canvasContainer.innerHTML = '';
  const canvasWidth = canvasContainer.offsetWidth;
  const canvasHeight = canvasContainer.offsetHeight;

  if (layoutMode === 'mirror') {
    mirrorCanvas(canvasData, canvasWidth, canvasHeight);
  } else if (layoutMode === 'grid') {
    gridLayout(canvasData);
  }
}

async function renderNode(node, canvasWidth, canvasHeight, isGridLayout) {
  const repoName = node.file.split('/')[0];
  const gifPath = `${repoName}/${repoName}.gif`;
  const pngPath = `${repoName}/${repoName}.png`;
  const pdfPath = `${repoName}/${repoName}.pdf`;

  const gifExists = fileExists(repoName, `${repoName}.gif`);
  const pngExists = fileExists(repoName, `${repoName}.png`);
  const pdfExists = fileExists(repoName, `${repoName}.pdf`);

  const nodeDiv = document.createElement('div');
  nodeDiv.style.display = 'flex';
  nodeDiv.style.flexDirection = 'column';
  nodeDiv.style.alignItems = 'center';
  nodeDiv.style.justifyContent = 'center';

  const mediaElement = document.createElement('div');
  mediaElement.style.transition = 'transform 0.3s ease';
  mediaElement.style.display = 'flex';
  mediaElement.style.justifyContent = 'center';
  mediaElement.style.alignItems = 'center';

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
    gifElement.style.width = '100%';
    gifElement.style.height = '100%';
    gifElement.style.objectFit = 'contain';
    mediaElement.appendChild(gifElement);
  } else if (pngExists) {
    const pngElement = document.createElement('img');
    pngElement.src = pngPath;
    pngElement.style.width = '100%';
    pngElement.style.height = '100%';
    pngElement.style.objectFit = 'contain';
    mediaElement.appendChild(pngElement);
  } else if (pdfExists) {
    const pdfElement = document.createElement('embed');
    pdfElement.src = pdfPath;
    pdfElement.type = 'application/pdf';
    pdfElement.style.width = '100%';
    pdfElement.style.height = '100%';
    pdfElement.style.filter = 'invert(1)'; // Invert colors for PDF
    mediaElement.appendChild(pdfElement);
  } else {
    const textElement = document.createElement('div');
    textElement.textContent = repoName;
    textElement.style.display = 'flex';
    textElement.style.alignItems = 'center';
    textElement.style.justifyContent = 'center';
    textElement.style.fontSize = '30px';
    textElement.style.objectFit = 'contain'; // Scale text to fit container
    textElement.style.width = '100%';
    textElement.style.height = '100%';
    mediaElement.appendChild(textElement);
  }

  const labelElement = document.createElement('div');
  labelElement.textContent = repoName;
  labelElement.style.textAlign = 'center'; // Center the label text
  labelElement.style.fontSize = 'clamp(12px, 2vw, 20px)'; // Adjust font size based on container width
  labelElement.style.marginTop = '10px';
  labelElement.style.maxWidth = mediaElement.style.width; // Limit label width to container width

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

  nodeDiv.appendChild(mediaElement);
  if (gifExists || pngExists || pdfExists) {
    nodeDiv.appendChild(labelElement);
  }

  if (isGridLayout) {
    const itemWidth = 400;
    const itemHeight = 400;
    const left = currentCol * (itemWidth + gridHorizontalSpacing) + gridBorderSize;
    const top = currentRow * (itemHeight + gridVerticalSpacing) + gridBorderSize;
    nodeDiv.style.position = 'absolute';
    nodeDiv.style.left = `${left}px`;
    nodeDiv.style.top = `${top}px`;
    currentCol++;
    if (currentCol >= gridItemsPerRow) {
      currentCol = 0;
      currentRow++;
    }
  } else {
    const adjustedX = node.x + canvasWidth / 2;
    const adjustedY = canvasHeight / 2 - node.y;
    nodeDiv.style.position = 'absolute';
    nodeDiv.style.left = `${adjustedX}px`;
    nodeDiv.style.top = `${adjustedY}px`;
  }

  return nodeDiv;
}

function mirrorCanvas(canvasData, canvasWidth, canvasHeight) {
  const nodeDivs = [];
  canvasData.nodes.forEach(async (node) => {
    const nodeDiv = await renderNode(node, canvasWidth, canvasHeight, false);
    nodeDivs.push(nodeDiv);
    canvasContainer.appendChild(nodeDiv);
  });
}

async function gridLayout(canvasData) {
  const nodeDivs = [];
  currentRow = 0; // Reset current row
  currentCol = 0; // Reset current column

  for (const node of canvasData.nodes) {
    const nodeDiv = await renderNode(node, null, null, true);
    nodeDivs.push(nodeDiv);
  }

  // Add border to the grid container
  canvasContainer.style.padding = `${gridBorderSize}px`;
  canvasContainer.style.boxSizing = 'border-box';

  nodeDivs.forEach(nodeDiv => canvasContainer.appendChild(nodeDiv));
}

async function initialize() {
  await loadDirectoryListing();
  fetchCanvasData();
}

initialize();
