const express = require("express");
const { spawn } = require("child_process");
const path = require("path");
const fs = require("fs");

const app = express();
const PORT = 3000;

app.use(express.static(path.join(__dirname, "public")));
app.use(express.json());

app.post("/download", (req, res) => {
    const { url: videoUrl, useDefaultName, includeMetadata, includeComments, customName } = req.body;

    if (!videoUrl) {
        return res.status(400).json({ error: "No URL provided" });
    }

    // Create a downloads directory if it doesn't exist
    const downloadsDir = path.join(__dirname, 'downloads');
    if (!fs.existsSync(downloadsDir)) {
        fs.mkdirSync(downloadsDir);
    }

    // Base arguments for best video+audio quality
    const args = [
        '-f', 'bestvideo[ext=mp4]+bestaudio[ext=m4a]/best[ext=mp4]/best',
        '--merge-output-format', 'mp4',
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
        outputFileName = customName ? `${customName}.mp4` : `video_${Date.now()}.mp4`;
        outputPath = path.join(downloadsDir, outputFileName);
    }

    args.push('-o', outputPath);
    args.push(videoUrl);

    const ytDlp = spawn('yt-dlp', args);

    ytDlp.stdout.on('data', (data) => {
        const output = data.toString();
        console.log('yt-dlp output:', output);

        const progressMatch = output.match(/(\d+\.?\d*)%/);
        if (progressMatch) {
            const progress = parseFloat(progressMatch[1]);
            res.write(JSON.stringify({ progress }) + '\n');
        }
    });

    ytDlp.stderr.on('data', (data) => {
        console.error('yt-dlp error:', data.toString());
    });

    ytDlp.on('close', (code) => {
        if (code === 0) {
            res.write(JSON.stringify({ 
                status: 'complete', 
                message: 'Download complete!'
            }));
            res.end();
        } else {
            res.write(JSON.stringify({ error: 'Download failed' }));
            res.end();
        }
    });

    ytDlp.on('error', (error) => {
        console.error('Spawn error:', error);
        res.write(JSON.stringify({ error: error.message }));
        res.end();
    });
});

app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
});