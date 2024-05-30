const canvasContainer = document.getElementById('canvas-container');

async function fetchCanvasData() {
  try {
    const response = await fetch('DreamSong.canvas');
    const canvasData = await response.json();
    renderCanvas(canvasData);
  } catch (error) {
    console.error('Error fetching canvas data:', error);
  }
}

function renderCanvas(canvasData) {
  canvasContainer.innerHTML = '';

  const canvasWidth = canvasContainer.offsetWidth;
  const canvasHeight = canvasContainer.offsetHeight;

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
      gifElement.style.objectFit = 'cover';
      mediaElement.appendChild(gifElement);
    } else if (pngExists) {
      const pngElement = document.createElement('img');
      pngElement.src = pngPath;
      pngElement.style.width = '100%';
      pngElement.style.height = '100%';
      pngElement.style.objectFit = 'cover';
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
      mediaElement.style.transform = 'scale(1.05)';
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