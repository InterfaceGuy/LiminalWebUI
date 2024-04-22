// Get the repository name from the URL
const repoName = window.location.pathname.split('/').pop();

// Set the title based on the repository name
document.getElementById('title').textContent = repoName;

// Function to fetch and display images
async function displayImages() {
    const imageContainer = document.getElementById('image-container');

    try {
        const pngResponse = await fetch(`${repoName}/master/`, { method: 'HEAD' });
        const gifResponse = await fetch(`${repoName}/master/`, { method: 'HEAD' });

        if (pngResponse.ok) {
            const pngImage = document.createElement('img');
            pngImage.src = `https://raw.githubusercontent.com/${repoName}/master/${repoName}.png`;
            imageContainer.appendChild(pngImage);
        }

        if (gifResponse.ok) {
            const gifImage = document.createElement('img');
            gifImage.src = `https://raw.githubusercontent.com/${repoName}/master/${repoName}.gif`;
            imageContainer.appendChild(gifImage);
        }
    } catch (error) {
        console.error('Error fetching images:', error);
    }
}

// Function to fetch and display text content
async function displayText() {
    const textContainer = document.getElementById('text-container');

    try {
        const readmeResponse = await fetch(`https://raw.githubusercontent.com/${repoName}/master/README.md`);
        if (readmeResponse.ok) {
            const readmeText = await readmeResponse.text();
            const lines = readmeText.split('\n');

            // Skip the title and media file links
            let textStartIndex = 0;
            for (let i = 0; i < lines.length; i++) {
                if (!lines[i].startsWith('#') && !lines[i].startsWith('!')) {
                    textStartIndex = i;
                    break;
                }
            }

            // Extract text content and create paragraphs
            for (let i = textStartIndex; i < lines.length; i++) {
                const line = lines[i].trim();
                if (line) {
                    const paragraph = document.createElement('p');
                    paragraph.textContent = line;
                    textContainer.appendChild(paragraph);
                }
            }
        }
    } catch (error) {
        console.error('Error fetching README:', error);
    }
}

// Call the functions to display images and text
displayImages();
displayText();

// Function to fetch and display submodule information
async function displaySubmoduleInfo() {
    const textContainer = document.getElementById('text-container');

    try {
        const response = await fetch(`https://api.github.com/repos/${repoName}/submodule_stats`, {
            headers: {
                'Accept': 'application/vnd.github+json'
            }
        });

        if (response.ok) {
            const data = await response.json();

            const inputRepos = data.submodule_stats.map(submodule => submodule.url);
            const outputRepos = data.submodule_stats.map(submodule => submodule.parent_url);

            const inputReposElement = document.createElement('p');
            inputReposElement.textContent = `Input Repositories: ${inputRepos.join(', ')}`;
            textContainer.appendChild(inputReposElement);

            const outputReposElement = document.createElement('p');
            outputReposElement.textContent = `Output Repositories: ${outputRepos.join(', ')}`;
            textContainer.appendChild(outputReposElement);
        } else {
            const inputReposElement = document.createElement('p');
            inputReposElement.textContent = `API Fetch Error`;
            textContainer.appendChild(inputReposElement);

            //console.error(`Error fetching submodule information: ${response.status}`);
        }
    } catch (error) {
        console.error('Error fetching submodule information:', error);
    }
}

// Call the function to display submodule information
displaySubmoduleInfo();