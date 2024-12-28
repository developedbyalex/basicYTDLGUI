document.addEventListener("DOMContentLoaded", () => {
    const downloadButtons = document.querySelectorAll(".download-btn");
    const statusMessage = document.getElementById("status-message");
    const progressContainer = document.querySelector(".progress-container");
    const progressFill = document.querySelector(".progress-fill");
    const progressText = document.querySelector(".progress-text");

    downloadButtons.forEach(button => {
        button.addEventListener("click", async () => {
            const videoUrl = document.getElementById("video-url").value;
            if (!videoUrl) {
                statusMessage.textContent = "Please enter a valid URL";
                return;
            }

            const format = button.dataset.format;
            
            statusMessage.textContent = `Starting ${format.toUpperCase()} download...`;
            progressContainer.style.display = "block";
            progressFill.style.width = "0%";
            progressText.textContent = "0%";

            try {
                const response = await fetch("/download", {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({ 
                        url: videoUrl,
                        format: format
                    }),
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
                                window.location.href = `/download/${update.filePath}`;
                                statusMessage.textContent = "Download complete!";
                            } else if (update.error) {
                                statusMessage.textContent = `Error: ${update.error}`;
                            }
                        } catch (parseError) {
                            console.log('Could not parse chunk:', chunk);
                            continue;
                        }
                    }
                }
            } catch (error) {
                console.error('Download error:', error);
                statusMessage.textContent = "An error occurred while downloading.";
            }
        });
    });
});