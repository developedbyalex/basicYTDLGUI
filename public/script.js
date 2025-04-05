// Settings functionality
const settingsBtn = document.getElementById('settings-btn');
const settingsModal = document.getElementById('settings-modal');
const closeSettings = document.getElementById('close-settings');
const saveSettings = document.getElementById('save-settings');
const settingsForm = document.getElementById('settings-form');

// Load settings when the page loads
async function loadSettings() {
    try {
        const response = await fetch('/api/settings');
        const settings = await response.json();
        
        // Update form values
        document.getElementById('logging-enabled').value = settings.logging.enabled.toString();
        document.getElementById('log-level').value = settings.logging.level;
        document.getElementById('log-file').value = settings.logging.file;
        document.getElementById('max-log-size').value = Math.floor(settings.logging.rotation.maxSize / 1024 / 1024);
        document.getElementById('max-log-files').value = settings.logging.rotation.maxFiles;
        document.getElementById('download-dir').value = settings.storage.downloadDir;
        document.getElementById('ytdlp-version').value = settings.ytdlp.version;
        document.getElementById('ytdlp-auto-update').value = settings.ytdlp.autoUpdate.toString();
        document.getElementById('theme').value = settings.ui.theme;

        // Apply theme
        document.documentElement.setAttribute('data-theme', settings.ui.theme);
    } catch (error) {
        console.error('Error loading settings:', error);
    }
}

// Save settings
async function saveSettingsToServer() {
    const settings = {
        logging: {
            enabled: document.getElementById('logging-enabled').value === 'true',
            level: document.getElementById('log-level').value,
            file: document.getElementById('log-file').value,
            rotation: {
                maxSize: document.getElementById('max-log-size').value * 1024 * 1024,
                maxFiles: parseInt(document.getElementById('max-log-files').value)
            }
        },
        storage: {
            downloadDir: document.getElementById('download-dir').value
        },
        ytdlp: {
            version: document.getElementById('ytdlp-version').value,
            autoUpdate: document.getElementById('ytdlp-auto-update').value === 'true'
        },
        ui: {
            theme: document.getElementById('theme').value
        }
    };

    try {
        const response = await fetch('/api/settings', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(settings)
        });

        if (response.ok) {
            const result = await response.json();
            // Apply theme immediately
            document.documentElement.setAttribute('data-theme', settings.ui.theme);
            settingsModal.style.display = 'none';
        } else {
            throw new Error('Failed to save settings');
        }
    } catch (error) {
        console.error('Error saving settings:', error);
        alert('Failed to save settings. Please try again.');
    }
}

// Event listeners for settings modal
settingsBtn.addEventListener('click', () => {
    settingsModal.style.display = 'flex';
});

closeSettings.addEventListener('click', () => {
    settingsModal.style.display = 'none';
});

settingsModal.addEventListener('click', (e) => {
    if (e.target === settingsModal) {
        settingsModal.style.display = 'none';
    }
});

saveSettings.addEventListener('click', saveSettingsToServer);

// Load settings when the page loads
document.addEventListener('DOMContentLoaded', loadSettings);

document.getElementById('use-default-name').addEventListener('change', (e) => {
    const customNameInput = document.getElementById('custom-name');
    customNameInput.disabled = e.target.checked;
});

// Add event listener for the "Use video's original title" checkbox
document.getElementById("use-default-name").addEventListener("change", function() {
    const customNameInput = document.getElementById("custom-name");
    customNameInput.disabled = this.checked;
    if (!this.checked) {
        customNameInput.focus();
    }
});

// Initialize the custom name input state
document.addEventListener("DOMContentLoaded", function() {
    const useDefaultName = document.getElementById("use-default-name");
    const customNameInput = document.getElementById("custom-name");
    customNameInput.disabled = useDefaultName.checked;
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