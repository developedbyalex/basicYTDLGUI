const express = require("express");
const { spawn } = require("child_process");
const path = require("path");
const fs = require("fs");

const app = express();
const PORT = 3000;

app.use(express.static(path.join(__dirname, "public")));
app.use(express.json());

app.post("/download", (req, res) => {
    const videoUrl = req.body.url;

    if (!videoUrl) {
        return res.status(400).json({ error: "No URL provided" });
    }

    const uniqueFilename = `video_${Date.now()}.mp4`;
    const outputPath = path.join(__dirname, uniqueFilename);
    const cookiesPath = path.join(__dirname, 'cookies.txt');

    const ytDlp = spawn('yt-dlp', [
        '-o', outputPath,
        '-f', 'mp4',
        '--newline',
        '--progress',
        '--cookies', cookiesPath,
        '--no-warnings',
        videoUrl
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
        console.error(`stderr: ${data}`);
        res.write(JSON.stringify({ error: data.toString() }));
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
        res.write(JSON.stringify({ error: error.message }));
        res.end();
    });
});

app.get("/download/:filename", (req, res) => {
    const filePath = path.join(__dirname, req.params.filename);
    res.download(filePath, (err) => {
        if (!err) {
            fs.unlinkSync(filePath);
        }
    });
});

app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
});