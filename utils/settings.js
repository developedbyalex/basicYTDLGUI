const fs = require('fs');
const path = require('path');

const defaultSettings = {
    logging: {
        enabled: true,
        level: 'info',
        file: 'app.log',
        rotation: {
            maxSize: 5242880, // 5MB
            maxFiles: 5
        }
    },
    storage: {
        downloadDir: path.join(__dirname, '..', 'downloads')
    },
    ui: {
        theme: 'dark'
    }
};

class Settings {
    constructor() {
        this.settingsPath = path.join(__dirname, '..', 'config', 'settings.json');
        this.settings = this.loadSettings();
    }

    loadSettings() {
        try {
            // Create config directory if it doesn't exist
            const configDir = path.dirname(this.settingsPath);
            if (!fs.existsSync(configDir)) {
                fs.mkdirSync(configDir, { recursive: true });
            }

            // Load settings from file or create default
            if (fs.existsSync(this.settingsPath)) {
                const settings = JSON.parse(fs.readFileSync(this.settingsPath, 'utf8'));
                return { ...defaultSettings, ...settings };
            }

            // If no settings file exists, create one with defaults
            fs.writeFileSync(this.settingsPath, JSON.stringify(defaultSettings, null, 2));
            return { ...defaultSettings };
        } catch (error) {
            console.error('Error loading settings:', error);
            return { ...defaultSettings };
        }
    }

    saveSettings() {
        try {
            fs.writeFileSync(this.settingsPath, JSON.stringify(this.settings, null, 2));
        } catch (error) {
            console.error('Error saving settings:', error);
        }
    }

    // Logging settings
    setLoggingEnabled(enabled) {
        this.settings.logging.enabled = enabled;
        this.saveSettings();
    }

    setLogLevel(level) {
        this.settings.logging.level = level;
        this.saveSettings();
    }

    setLogFile(filename) {
        this.settings.logging.file = filename;
        this.saveSettings();
    }

    setLogRotation(maxSize, maxFiles) {
        this.settings.logging.rotation = { maxSize, maxFiles };
        this.saveSettings();
    }

    // Storage settings
    setDownloadDirectory(dir) {
        this.settings.storage.downloadDir = dir;
        this.saveSettings();
    }

    // UI settings
    setTheme(theme) {
        this.settings.ui.theme = theme;
        this.saveSettings();
    }

    // Get all settings
    getSettings() {
        return this.settings;
    }
}

module.exports = new Settings(); 