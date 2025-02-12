// This allows us to process/render the descriptions, which are in Markdown!
// More about Markdown: https://en.wikipedia.org/wiki/Markdown
let markdownIt = document.createElement('script');
markdownIt.src = 'https://cdn.jsdelivr.net/npm/markdown-it@14.0.0/dist/markdown-it.min.js';
document.head.appendChild(markdownIt);

// Set up the Are.na channel slug
let channelSlug = 'rendered-realities'; 

// Function to render a single block
let renderBlock = (block) => {
    let gridContainer = document.querySelector('#grid');

    let blockItem = '';

    // IMAGE BLOCK
    if (block.class === 'Image') {
        blockItem = `
        <div class="card">
            <img src="${block.image.original.url}" alt="${block.title}">
            <div class="overlay">
                <h3>${block.title || "Untitled Image"}</h3>
            </div>
        </div>`;
    }
    // TEXT BLOCK
    else if (block.class === 'Text') {
        blockItem = `
        <div class="card">
            <div class="overlay">
                <p>${block.content_html || "No text provided"}</p>
            </div>
        </div>`;
    }
    // LINK BLOCK
    else if (block.class === 'Link') {
        blockItem = `
        <div class="card">
            <img src="${block.image ? block.image.original.url : 'assets/placeholder.png'}" alt="Link Preview">
            <div class="overlay">
                <h3>${block.title || "Untitled Link"}</h3>
                <p><a href="${block.source.url}" target="_blank">Open Link ↗</a></p>
            </div>
        </div>`;
    }

	// VIDEO BLOCK (Uploaded Video on Are.na)
	else if (block.class === 'Attachment' && block.attachment.content_type.includes('video')) {
		blockItem = `
		<div class="card">
			<a href="${block.attachment.url}" target="_blank">
				<video controls>
					<source src="${block.attachment.url}" type="${block.attachment.content_type}">
					Your browser does not support the video tag.
				</video>
				<div class="overlay">
					<h3>${block.title || "Uploaded Video"}</h3>
					<p>Click to download full video ↗</p>
				</div>
			</a>
		</div>`;
	}

    // AUDIO BLOCK
    else if (block.class === 'Attachment' && block.attachment.content_type.includes('audio')) {
        blockItem = `
        <div class="card">
            <audio controls>
                <source src="${block.attachment.url}" type="${block.attachment.content_type}">
                Your browser does not support the audio tag.
            </audio>
            <div class="overlay">
                <h3>Audio Block</h3>
                <p>Uploaded Audio</p>
            </div>
        </div>`;
    }
	// PDF BLOCK (Attachment)
	else if (block.class === 'Attachment' && block.attachment.content_type.includes('pdf')) {
		blockItem = `
		<div class="card">
			<a href="${block.attachment.url}" target="_blank">
				<div class="overlay">
					<h3>${block.title || "PDF File"}</h3>
					<p>Click to view PDF ↗</p>
				</div>
			</a>
		</div>`;
	}

	// EMBEDDED MEDIA (YouTube, Behance)
	else if (block.class === 'Media' && block.embed) {
		blockItem = `
		<div class="card">
			<a href="${block.source.url}" target="_blank">
				${block.embed.html}
				<div class="overlay">
					<h3>${block.title || "Embedded Media"}</h3>
					<p>Original source ↗</p>
				</div>
			</a>
		</div>`;
	}

    // Append only if blockItem is not empty
    if (blockItem) {
        gridContainer.insertAdjacentHTML('beforeend', blockItem);
    }
};

// Fetch the Are.na channel data and populate the grid
fetch(`https://api.are.na/v2/channels/${channelSlug}?per=100`, { cache: 'no-store' })
    .then(response => response.json())
    .then(data => {
        console.log(data); // Debugging: Log the API response
        document.querySelector('#grid').innerHTML = ''; // Clear any static content

        data.contents.reverse().forEach(block => {
            renderBlock(block); // Render each block dynamically
        });
    })
    .catch(error => console.error('Error fetching Are.na data:', error));
