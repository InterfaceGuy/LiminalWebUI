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
//displayText();