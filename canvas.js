const canvasContainer = document.getElementById('canvas-container');
const layoutMode = 'grid'; // Set the desired layout mode: 'mirror' or 'grid'
const gridItemsPerRow = 4; // Set the number of items per row for the grid layout
const gridHorizontalSpacing = 20; // Horizontal spacing between grid items
const gridVerticalSpacing = 20; // Vertical spacing between grid items
const gridBorderSize = 50; // Border size around the grid container

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

function mirrorCanvas(canvasData, canvasWidth, canvasHeight) {
  canvasData.nodes.forEach(async (node) => {
    const nodeDiv = document.createElement('div');
    const repoName = node.file.split('/')[0];

    const gifPath = `${repoName}/${repoName}.gif`;
    const pngPath = `${repoName}/${repoName}.png`;

    const mediaElement = document.createElement('div');
    mediaElement.style.width = `${node.width}px`;
    mediaElement.style.height = `${node.height}px`;
    mediaElement.style.transition = 'transform 0.3s ease';

    const adjustedX = node.x + canvasWidth / 2;
    const adjustedY = canvasHeight / 2 - node.y;

    nodeDiv.style.position = 'absolute';
    nodeDiv.style.left = `${adjustedX}px`;
    nodeDiv.style.top = `${adjustedY}px`;

    const gifExists = await fileExists(gifPath);
    const pngExists = await fileExists(pngPath);

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
    } else {
      const textElement = document.createElement('div');
      textElement.textContent = repoName;
      textElement.style.textAlign = 'center';
      textElement.style.fontSize = '50px';
      mediaElement.appendChild(textElement);
    }

    const labelElement = document.createElement('div');
    labelElement.textContent = repoName;
    labelElement.style.textAlign = 'center';
    labelElement.style.fontSize = '50px';
    labelElement.style.marginTop = '10px';

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
    if (gifExists || pngExists) {
      nodeDiv.appendChild(labelElement);
    }
    canvasContainer.appendChild(nodeDiv);
  });
}


async function gridLayout(canvasData) {
  const itemWidth = 400;
  const itemHeight = 400;
  const nodeCount = canvasData.nodes.length;
  const rows = Math.ceil(nodeCount / gridItemsPerRow);
  let currentRow = 0;
  let currentCol = 0;

  console.log('gridLayout called with', canvasData.nodes.length, 'nodes');

  const nodeDivs = [];

  // Create an array of file existence check promises
  const fileExistencePromises = canvasData.nodes.map(async (node) => {
    const repoName = node.file.split('/')[0];
    const gifPath = `${repoName}/${repoName}.gif`;
    const pngPath = `${repoName}/${repoName}.png`;

    const gifExists = await fileExists(gifPath);
    const pngExists = await fileExists(pngPath);

    return { repoName, gifExists, pngExists };
  });

  // Wait for all file existence checks to complete
  const fileExistenceResults = await Promise.all(fileExistencePromises);

  for (let i = 0; i < nodeCount; i++) {
    const node = canvasData.nodes[i];
    const { repoName, gifExists, pngExists } = fileExistenceResults[i];

    console.log(`Processing node ${repoName}, currentRow: ${currentRow}, currentCol: ${currentCol}`);

    const nodeDiv = document.createElement('div');
    const mediaElement = document.createElement('div');
    mediaElement.style.width = `${itemWidth}px`;
    mediaElement.style.height = `${itemHeight}px`;
    mediaElement.style.transition = 'transform 0.3s ease';
    const left = currentCol * (itemWidth + gridHorizontalSpacing) + gridBorderSize;
    const top = currentRow * (itemHeight + gridVerticalSpacing) + gridBorderSize;
    nodeDiv.style.position = 'absolute';
    nodeDiv.style.left = `${left}px`;
    nodeDiv.style.top = `${top}px`;

    if (gifExists) {
      const gifElement = document.createElement('img');
      gifElement.src = `${repoName}/${repoName}.gif`;
      gifElement.style.width = '100%';
      gifElement.style.height = '100%';
      gifElement.style.objectFit = 'contain';
      mediaElement.appendChild(gifElement);
    } else if (pngExists) {
      const pngElement = document.createElement('img');
      pngElement.src = `${repoName}/${repoName}.png`;
      pngElement.style.width = '100%';
      pngElement.style.height = '100%';
      pngElement.style.objectFit = 'contain';
      mediaElement.appendChild(pngElement);
    } else {
      const textElement = document.createElement('div');
      textElement.textContent = repoName;
      textElement.style.textAlign = 'center';
      textElement.style.fontSize = '50px';
      mediaElement.appendChild(textElement);
    }

    const labelElement = document.createElement('div');
    labelElement.textContent = repoName;
    labelElement.style.textAlign = 'center';
    labelElement.style.fontSize = '50px';
    labelElement.style.marginTop = '10px';

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
    if (gifExists || pngExists) {
      nodeDiv.appendChild(labelElement);
    }

    nodeDivs.push(nodeDiv);

    currentCol++;
    if (currentCol >= gridItemsPerRow) {
      currentCol = 0;
      currentRow++;
    }
  }

  // Add border to the grid container
  canvasContainer.style.padding = `${gridBorderSize}px`;
  canvasContainer.style.boxSizing = 'border-box';

  nodeDivs.forEach(nodeDiv => canvasContainer.appendChild(nodeDiv));
}

// Helper function to check if a file exists (you'll need to implement this)
async function fileExists(filePath) {
  try {
    const response = await fetch(filePath, { method: 'HEAD' });
    return response.ok;
  } catch (error) {
    if (error.message.includes('404')) {
      // If the error is a 404 (Not Found), don't log it
      return false;
    } else {
      console.error(`Error checking file existence: ${filePath}`, error);
      return false;
    }
  }
}

fetchCanvasData();