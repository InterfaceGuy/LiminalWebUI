// Function to load the contents of a file
function loadFile(filePath) {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open('GET', filePath, true);
    xhr.onreadystatechange = function() {
      if (xhr.readyState === XMLHttpRequest.DONE) {
        if (xhr.status === 200) {
          resolve(xhr.responseText);
        } else {
          reject(xhr.statusText);
        }
      }
    };
    xhr.send(null);
  });
}

// Load the .gitmodules file
loadFile('/../.gitmodules')
  .then(gitmodulesContent => {
    // Parse the .gitmodules file content
    const submodules = gitmodulesContent.split('[submodule')
      .slice(1)
      .map(submoduleEntry => {
        const lines = submoduleEntry.split('\n');
        const path = lines.find(line => line.startsWith('path')).split('=')[1].trim();
        const url = lines.find(line => line.startsWith('url')).split('=')[1].trim();
        return { path, url };
      });

    // Get the submodules container element
    const submodulesContainer = document.getElementById('submodules');

    // Loop through the submodules and create a paragraph for each one
    submodules.forEach(submodule => {
      const paragraph = document.createElement('p');
      paragraph.textContent = `${submodule.path} (${submodule.url})`;
      submodulesContainer.appendChild(paragraph);
    });
  })
  .catch(error => {
    console.error('Error loading .gitmodules file:', error);
  });