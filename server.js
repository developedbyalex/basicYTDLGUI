const express = require("express");
const { spawn } = require("child_process");
const path = require("path");
const fs = require("fs");
const { logger } = require('./utils/logger');
const settings = require('./utils/settings');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.static(path.join(__dirname, "public")));
app.use(express.json());

// API endpoint for settings
app.get('/api/settings', (req, res) => {
    res.json(settings.getSettings());
});

app.post('/api/settings', (req, res) => {
    const { logging, storage, ui } = req.body;

    try {
        // Update logging settings
        if (logging) {
            if (logging.enabled !== undefined) settings.setLoggingEnabled(logging.enabled);
            if (logging.level) settings.setLogLevel(logging.level);
            if (logging.file) settings.setLogFile(logging.file);
            if (logging.rotation) settings.setLogRotation(logging.rotation.maxSize, logging.rotation.maxFiles);
        }

        // Update storage settings
        if (storage && storage.downloadDir) {
            settings.setDownloadDirectory(storage.downloadDir);
        }

        // Update UI settings
        if (ui && ui.theme) {
            settings.setTheme(ui.theme);
        }

        res.json({ success: true, settings: settings.getSettings() });
    } catch (error) {
        logger.error('Error updating settings:', error);
        res.status(500).json({ error: 'Failed to update settings' });
    }
});

app.post("/download", (req, res) => {
    const { url: videoUrl, useDefaultName, includeMetadata, includeComments, customName, format } = req.body;

    if (!videoUrl) {
        logger.error('No URL provided');
        return res.status(400).json({ error: "No URL provided" });
    }

    // Create a downloads directory if it doesn't exist
    const downloadsDir = settings.getSettings().storage.downloadDir;
    if (!fs.existsSync(downloadsDir)) {
        fs.mkdirSync(downloadsDir, { recursive: true });
    }

    // Set format-specific arguments
    let formatArgs;
    if (format === 'mp3') {
        formatArgs = [
            '-f', 'bestaudio',
            '-x',  // Extract audio
            '--audio-format', 'mp3',
            '--audio-quality', '0'  // Best quality
        ];
    } else {
        formatArgs = [
            '-f', 'bestvideo[ext=mp4]+bestaudio[ext=m4a]/best[ext=mp4]/best',
            '--merge-output-format', 'mp4'
        ];
    }

    // Combine all arguments
    const args = [
        ...formatArgs,
        '--newline',
        '--progress'
    ];

    // Add metadata flags if selected
    if (includeMetadata) {
        args.push(
            '--write-description',
            '--write-thumbnail',
            '--embed-thumbnail',
            '--embed-metadata',
            '--embed-chapters'
        );
    }

    // Add comments if selected
    if (includeComments) {
        args.push(
            '--write-comments',
            '--write-info-json',
            '--extractor-args',
            'youtube:max_comments=2000,500,500,25;comment_sort=top'
        );
    }

    let outputFileName;
    let outputPath;

    if (useDefaultName) {
        outputFileName = '%(title)s.%(ext)s';
        outputPath = path.join(downloadsDir, outputFileName);
    } else {
        const extension = format === 'mp3' ? 'mp3' : 'mp4';
        outputFileName = customName ? `${customName}.${extension}` : `video_${Date.now()}.${extension}`;
        outputPath = path.join(downloadsDir, outputFileName);
    }

    args.push('-o', outputPath);
    args.push(videoUrl);

    logger.info('Starting download', { videoUrl, format, outputPath });

    const ytDlp = spawn('yt-dlp', args);

    ytDlp.stdout.on('data', (data) => {
        const output = data.toString();
        logger.debug('yt-dlp output:', output);

        const progressMatch = output.match(/(\d+\.?\d*)%/);
        if (progressMatch) {
            const progress = parseFloat(progressMatch[1]);
            res.write(JSON.stringify({ progress }) + '\n');
        }
    });

    ytDlp.stderr.on('data', (data) => {
        const error = data.toString();
        logger.error('yt-dlp error:', error);
    });

    ytDlp.on('close', (code) => {
        if (code === 0) {
            logger.info('Download completed successfully', { videoUrl, outputPath });
            res.write(JSON.stringify({ 
                status: 'complete', 
                message: 'Download complete!'
            }));
            res.end();
        } else {
            logger.error('Download failed', { videoUrl, code });
            res.write(JSON.stringify({ error: 'Download failed' }));
            res.end();
        }
    });

    ytDlp.on('error', (error) => {
        logger.error('Spawn error:', error);
        res.write(JSON.stringify({ error: error.message }));
        res.end();
    });
});

app.listen(PORT, () => {
    logger.info(`Server running at http://localhost:${PORT}`);
});