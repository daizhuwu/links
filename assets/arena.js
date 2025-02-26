// Load Markdown script for processing text descriptions
let markdownIt = document.createElement('script');
markdownIt.src = 'https://cdn.jsdelivr.net/npm/markdown-it@14.0.0/dist/markdown-it.min.js';
document.head.appendChild(markdownIt);

// Are.na channel slug
let channelSlug = 'rendered-realities';

// Function to render blocks from Are.na
let renderBlock = (block) => {
    let gridContainer = document.querySelector('#grid');
    let blockItem = '';

    // IMAGE BLOCK
    if (block.class === 'Image') {
        blockItem = `
        <div class="card" data-type="image" data-src="${block.image.original.url}" data-title="${block.title || 'Untitled Image'}" data-description="${block.description || ''}">
            <img src="${block.image.original.url}" alt="${block.title}">
            <div class="overlay">
                <h3>${block.title || "Untitled Image"}</h3>
            </div>
        </div>`;
    }
    // TEXT BLOCK
    else if (block.class === 'Text') {
        blockItem = `
        <div class="card" data-type="text" data-title="Text Block" data-description="${block.content_html}">
            <div class="overlay">
                <p>${block.content_html || "No text provided"}</p>
            </div>
        </div>`;
    }
    // LINK BLOCK
    else if (block.class === 'Link') {
        blockItem = `
        <div class="card" data-type="link" data-src="${block.source.url}" data-title="${block.title || 'Untitled Link'}" data-description="Click to open link" data-url="${block.source.url}">
            <img src="${block.image ? block.image.original.url : 'assets/placeholder.png'}" alt="Link Preview">
            <div class="overlay">
                <h3>${block.title || "Untitled Link"}</h3>
                <p><a href="${block.source.url}" target="_blank">Open Link ↗</a></p>
            </div>
        </div>`;
    }
    // VIDEO BLOCK
    else if (block.class === 'Attachment' && block.attachment.content_type.includes('video')) {
        blockItem = `
        <div class="card" data-type="video" data-src="${block.attachment.url}" data-title="${block.title || 'Uploaded Video'}" data-description="Click to play video">
            <img src="assets/video-thumbnail.png" alt="Video Preview">
            <div class="overlay">
                <h3>${block.title || "Uploaded Video"}</h3>
            </div>
        </div>`;
    }
    // AUDIO BLOCK
    else if (block.class === 'Attachment' && block.attachment.content_type.includes('audio')) {
        blockItem = `
        <div class="card" data-type="audio" data-src="${block.attachment.url}" data-title="Audio Block" data-description="Uploaded Audio">
            <audio controls>
                <source src="${block.attachment.url}" type="${block.attachment.content_type}">
                Your browser does not support the audio tag.
            </audio>
            <div class="overlay">
                <h3>Audio Block</h3>
            </div>
        </div>`;
    }
    // PDF BLOCK
    else if (block.class === 'Attachment' && block.attachment.content_type.includes('pdf')) {
        blockItem = `
        <div class="card" data-type="pdf" data-src="${block.attachment.url}" data-title="${block.title || 'PDF File'}" data-description="Click to view PDF">
            <div class="overlay">
                <h3>${block.title || "PDF File"}</h3>
                <p>Click to view PDF ↗</p>
            </div>
        </div>`;
    }
    // EMBEDDED MEDIA
    else if (block.class === 'Media' && block.embed) {
        blockItem = `
        <div class="card" data-type="embedded" data-src="${block.source.url}" data-title="${block.title || 'Embedded Media'}" data-description="Original source" data-url="${block.source.url}">
            ${block.embed.html}
            <div class="overlay">
                <h3>${block.title || "Embedded Media"}</h3>
            </div>
        </div>`;
    }

    if (blockItem) {
        gridContainer.insertAdjacentHTML('beforeend', blockItem);
    }
};

// Fetch Are.na data and populate the grid
fetch(`https://api.are.na/v2/channels/${channelSlug}?per=100`, { cache: 'no-store' })
    .then(response => response.json())
    .then(data => {
        console.log(data);
        document.querySelector('#grid').innerHTML = '';
        data.contents.reverse().forEach(block => {
            renderBlock(block);
        });

        // Attach event listeners for modal after content loads
        attachModalEvents();

        // Initialize Filtering after grid is populated
        const filterButtons = document.querySelectorAll(".filter-button");
        filterButtons.forEach(button => {
            button.addEventListener("click", function () {
                filterButtons.forEach(btn => btn.classList.remove("active"));
                this.classList.add("active");
                const filterType = this.getAttribute("data-filter");
                const cards = document.querySelectorAll(".card");
                cards.forEach(card => {
                    if (filterType === "all" || card.getAttribute("data-type") === filterType) {
                        card.style.display = "block";
                    } else {
                        card.style.display = "none";
                    }
                });
            });
        });
    })
    .catch(error => console.error('Error fetching Are.na data:', error));

// Function to attach modal event listeners
function attachModalEvents() {
    const grid = document.getElementById("grid");
    const modal = document.getElementById("modal");
    const modalImage = document.getElementById("modal-image");
    const modalVideo = document.getElementById("modal-video");
    const modalTitle = document.getElementById("modal-title");
    const modalDescription = document.getElementById("modal-description");
    const modalTag = document.getElementById("modal-tag");
    const modalLinkContainer = document.createElement("p"); // New element for the link
    modalDescription.parentNode.appendChild(modalLinkContainer); // Add it below description
    const closeModal = document.querySelector(".close");

    grid.addEventListener("click", function(event) {
        const card = event.target.closest(".card");
        if (!card) return;

        const title = card.dataset.title;
        const description = card.dataset.description;
        const mediaType = card.dataset.type;
        const mediaSrc = card.dataset.src;
        const mediaUrl = card.dataset.url; // New: Get the original source URL

        modalTitle.textContent = title;
        modalDescription.textContent = description;
        modalTag.textContent = mediaType.toUpperCase();

        // Reset modal link container
        modalLinkContainer.innerHTML = "";

        if (mediaType === "video") {
            modalImage.style.display = "none";
            modalVideo.style.display = "block";
            modalVideo.src = mediaSrc;
        } else {
            modalVideo.style.display = "none";
            modalImage.style.display = "block";
            modalImage.src = mediaSrc;
        }

        // If it's a link or embedded media, show the source link
        if (mediaType === "link" || mediaType === "embedded") {
            const sourceLink = document.createElement("a");
            sourceLink.href = mediaUrl;
            sourceLink.target = "_blank";
            sourceLink.textContent = "View Original Source ↗";
            sourceLink.style.display = "block";
            sourceLink.style.marginTop = "10px";
            sourceLink.style.color = "#007BFF";
            sourceLink.style.textDecoration = "none";
            modalLinkContainer.appendChild(sourceLink);
        }

        modal.style.display = "flex";
    });

    closeModal.addEventListener("click", function () {
        modal.style.display = "none";
        modalVideo.src = "";
    });

    window.addEventListener("click", function (event) {
        if (event.target === modal) {
            modal.style.display = "none";
            modalVideo.src = "";
        }
    });
}


// sticky 3D
// document.addEventListener("DOMContentLoaded", function () {
//     const grid = document.getElementById("grid");
//     const images = document.querySelectorAll("#third, #fourth");

//     function handleScroll() {
//         const rect = grid.getBoundingClientRect();
        
//         // Check if #grid is visible in the viewport
//         if (rect.top < window.innerHeight && rect.bottom > 0) { 
//             images.forEach(img => img.classList.add("sticky"));
//         } else {
//             images.forEach(img => img.classList.remove("sticky"));
//         }
//     }

//     window.addEventListener("scroll", handleScroll);
//     handleScroll(); // Run on load in case #grid is already in view
// });

document.addEventListener("DOMContentLoaded", function () {
    const overview = document.getElementById("overview");
    const images = document.querySelectorAll("#third, #fourth");

    function handleScroll() {
        const rect = overview.getBoundingClientRect();
        
        // Check if #overview is visible in the viewport
        if (rect.top < window.innerHeight && rect.bottom > 0) { 
            images.forEach(img => img.classList.add("sticky"));
        } else {
            images.forEach(img => img.classList.remove("sticky"));
        }
    }

    window.addEventListener("scroll", handleScroll);
    handleScroll(); // Run on load in case #overview is already in view
});



// document.addEventListener("DOMContentLoaded", function () {
//     const grid = document.getElementById("grid");
//     const images = document.querySelectorAll("#third, #fourth");

//     function handleScroll() {
//         const rect = grid.getBoundingClientRect();

//         // If grid is visible in viewport, make images sticky
//         if (rect.top < window.innerHeight && rect.bottom > 0) { 
//             images.forEach(img => img.classList.add("sticky"));
//         }
//         // Remove the else condition so they stay sticky once activated
//     }

//     window.addEventListener("scroll", handleScroll);
//     handleScroll(); // Run on load in case grid is already in view
// });



