const express = require("express");
const { spawn } = require("child_process");
const path = require("path");
const fs = require("fs");

const app = express();
const PORT = 3000;

app.use(express.static(path.join(__dirname, "public")));
app.use(express.json());

app.post("/download", (req, res) => {
    const { url, format } = req.body;

    if (!url) {
        return res.status(400).json({ error: "No URL provided" });
    }

    const uniqueFilename = `media_${Date.now()}.${format}`;
    const outputPath = path.join(__dirname, uniqueFilename);

    const formatFlag = format === 'mp3' ? '-x --audio-format mp3' : '-f mp4';
    
    const ytDlp = spawn('yt-dlp', [
        '-o', outputPath,
        ...formatFlag.split(' '),
        '--newline',
        '--progress',
        url
    ]);

    ytDlp.stdout.on('data', (data) => {
        const output = data.toString();
        const progressMatch = output.match(/(\d+\.?\d*)%/);
        if (progressMatch) {
            const progress = parseFloat(progressMatch[1]);
            res.write(JSON.stringify({ progress }));
        }
    });

    ytDlp.stderr.on('data', (data) => {
        console.error(`Error: ${data}`);
    });

    ytDlp.on('close', (code) => {
        if (code === 0) {
            res.write(JSON.stringify({ 
                status: 'complete', 
                filePath: uniqueFilename 
            }));
            res.end();
        } else {
            res.write(JSON.stringify({ error: 'Download failed' }));
            res.end();
        }
    });

    ytDlp.on('error', (error) => {
        console.error(`Failed to start process: ${error}`);
        res.write(JSON.stringify({ error: error.message }));
        res.end();
    });
});

app.get("/download/:filename", (req, res) => {
    const filePath = path.join(__dirname, req.params.filename);
    
    // Check if file exists
    if (!fs.existsSync(filePath)) {
        return res.status(404).send("File not found");
    }

    res.download(filePath, (err) => {
        if (err) {
            console.error(`Download error: ${err}`);
            return res.status(500).send("Error downloading file");
        }

        // Clean up file after successful download
        fs.unlink(filePath, (unlinkErr) => {
            if (unlinkErr) {
                console.error(`Error deleting file: ${unlinkErr}`);
            }
        });
    });
});

// Error handling middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).send('Something broke!');
});

app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
});