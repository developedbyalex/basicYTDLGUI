document.getElementById('use-default-name').addEventListener('change', (e) => {
    const customNameInput = document.getElementById('custom-name');
    customNameInput.disabled = e.target.checked;
});

document.getElementById("download-form").addEventListener("submit", async (e) => {
    e.preventDefault();

    const formData = {
        url: document.getElementById("video-url").value,
        useDefaultName: document.getElementById("use-default-name").checked,
        includeMetadata: document.getElementById("include-metadata").checked,
        includeComments: document.getElementById("include-comments").checked,
        customName: document.getElementById("custom-name").value,
        format: document.getElementById("format-select").value
    };

    const statusMessage = document.getElementById("status-message");
    const progressContainer = document.querySelector(".progress-container");
    const progressFill = document.querySelector(".progress-fill");
    const progressText = document.querySelector(".progress-text");

    statusMessage.textContent = "Starting download...";
    progressContainer.style.display = "block";
    progressFill.style.width = "0%";
    progressText.textContent = "0%";

    try {
        const response = await fetch("/download", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(formData),
        });

        const reader = response.body.getReader();
        
        while (true) {
            const { value, done } = await reader.read();
            if (done) break;
            
            const text = new TextDecoder().decode(value);
            const chunks = text.split('\n').filter(chunk => chunk.trim());
            
            for (const chunk of chunks) {
                try {
                    const update = JSON.parse(chunk);
                    if (update.progress) {
                        progressFill.style.width = `${update.progress}%`;
                        progressText.textContent = `${Math.round(update.progress)}%`;
                    } else if (update.status === 'complete') {
                        statusMessage.textContent = update.message || "Download complete!";
                        progressContainer.style.display = "none";
                    } else if (update.error) {
                        statusMessage.textContent = `Error: ${update.error}`;
                        progressContainer.style.display = "none";
                    }
                } catch (parseError) {
                    console.log('Could not parse chunk:', chunk);
                    continue;
                }
            }
        }
    } catch (error) {
        console.error('Download error:', error);
        statusMessage.textContent = "An error occurred while downloading the video.";
        progressContainer.style.display = "none";
    }
});