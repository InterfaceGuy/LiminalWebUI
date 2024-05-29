const canvasContainer = document.getElementById('canvas-container');

async function fetchCanvasData() {
  try {
    const response = await fetch('dreamsong.canvas');
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

  canvasData.nodes.forEach(node => {
    const nodeDiv = document.createElement('div');
    const imgElement = document.createElement('img');
    const labelElement = document.createElement('div');

    const repoName = node.file.split('/')[0];
    const pngPath = `${repoName}/${repoName}.png`;
    imgElement.src = pngPath;

    const adjustedX = node.x + canvasWidth / 2;
    const adjustedY = canvasHeight / 2 - node.y;

    nodeDiv.style.position = 'absolute';
    nodeDiv.style.left = `${adjustedX}px`;
    nodeDiv.style.top = `${adjustedY}px`;
    nodeDiv.style.width = `${node.width}px`;
    nodeDiv.style.height = `${node.height}px`;

    imgElement.style.width = '100%';
    imgElement.style.height = '100%';
    imgElement.style.transition = 'transform 0.3s ease'; // Add transition for smooth scaling

    labelElement.textContent = repoName;
    labelElement.style.textAlign = 'center';
    labelElement.style.fontSize = '50px';
    labelElement.style.marginTop = '10px'; // Add some spacing between the image and label

    imgElement.addEventListener('mouseover', () => {
      imgElement.style.transform = 'scale(1.05)';
    });

    imgElement.addEventListener('mouseout', () => {
      imgElement.style.transform = 'scale(1)';
    });

    imgElement.addEventListener('click', () => {
      const repoUrl = `https://github.com/InterfaceGuy/${repoName}`;
      window.open(repoUrl, '_blank');
    });

    nodeDiv.appendChild(imgElement);
    nodeDiv.appendChild(labelElement); // Append the label to the node div
    canvasContainer.appendChild(nodeDiv);
  });
}

fetchCanvasData();