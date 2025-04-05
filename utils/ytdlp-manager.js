const fs = require('fs');
const path = require('path');
const https = require('https');
const { spawn } = require('child_process');
const settings = require('./settings');
const logger = require('./logger').logger;

class YtdlpManager {
    constructor() {
        this.nightlyUrl = 'https://github.com/yt-dlp/yt-dlp/releases/download/nightly/yt-dlp';
        this.stableUrl = 'https://github.com/yt-dlp/yt-dlp/releases/latest/download/yt-dlp';
    }

    async downloadBinary(url, outputPath) {
        return new Promise((resolve, reject) => {
            https.get(url, response => {
                if (response.statusCode !== 200) {
                    reject(new Error(`Failed to download: ${response.statusCode}`));
                    return;
                }

                const fileStream = fs.createWriteStream(outputPath);
                response.pipe(fileStream);

                fileStream.on('finish', () => {
                    fs.chmodSync(outputPath, '755'); // Make executable
                    resolve();
                });

                fileStream.on('error', reject);
            }).on('error', reject);
        });
    }

    async updateNightly() {
        const nightlyPath = settings.settings.ytdlp.binaryPath.nightly;
        logger.info('Updating yt-dlp nightly build...');
        
        try {
            await this.downloadBinary(this.nightlyUrl, nightlyPath);
            logger.info('Successfully updated yt-dlp nightly build');
        } catch (error) {
            logger.error('Failed to update yt-dlp nightly build:', error);
            throw error;
        }
    }

    async checkForUpdates() {
        if (!settings.settings.ytdlp.autoUpdate) {
            return;
        }

        try {
            if (settings.settings.ytdlp.version === 'nightly') {
                await this.updateNightly();
            } else {
                // For stable version, use the built-in update mechanism
                const ytdlp = spawn('yt-dlp', ['--update']);
                ytdlp.on('close', (code) => {
                    if (code === 0) {
                        logger.info('Successfully checked for yt-dlp updates');
                    } else {
                        logger.warn('yt-dlp update check failed with code:', code);
                    }
                });
            }
        } catch (error) {
            logger.error('Error checking for updates:', error);
        }
    }

    async initialize() {
        // Ensure nightly build exists if selected
        if (settings.settings.ytdlp.version === 'nightly' && 
            !fs.existsSync(settings.settings.ytdlp.binaryPath.nightly)) {
            await this.updateNightly();
        }

        // Set up periodic update checks
        if (settings.settings.ytdlp.autoUpdate) {
            setInterval(() => this.checkForUpdates(), 24 * 60 * 60 * 1000); // Check daily
            this.checkForUpdates(); // Initial check
        }
    }

    getBinaryPath() {
        return settings.getYtdlpPath();
    }
}

module.exports = new YtdlpManager(); 