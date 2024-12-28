# basicYTDLGUI

**basicYTDLGUI** is a lightweight and user-friendly web application for downloading videos and audio files from various online platforms. It supports downloading in both MP4 (video) and MP3 (audio) formats.

## Features

- Download videos as MP4 or audio as MP3.
- Interactive progress bar to track download progress.
- Clean and responsive UI using modern CSS.
- Fully compatible with YouTube links and other popular media platforms.

## Installation

### Prerequisites

- [Node.js](https://nodejs.org/) installed on your machine.
- [yt-dlp](https://github.com/yt-dlp/yt-dlp) installed globally or accessible via PATH.

### Steps

1. Clone this repository:
   ```bash
   git clone https://github.com/https://github.com/developedbyalex/basicYTDLGUI.git
   cd media-downloader
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Run the server:
   ```bash
   node server.js
   ```

4. Open your browser and navigate to:
   ```
   http://localhost:3000
   ```

## Usage

1. Enter the URL of the video or audio you want to download in the input field.
2. Click on the "Download MP4" button for video or the "Download MP3" button for audio.
3. Track the download progress via the progress bar.
4. Once the download is complete, the file will automatically be served to your browser for saving.

## File Structure

```plaintext
project-folder/
├── public/
│   ├── index.html         # Front-end HTML
│   ├── style.css          # CSS for styling
│   ├── script.js          # Client-side JavaScript
├── server.js              # Backend server logic
├── package.json           # Project dependencies
└── README.md              # Project documentation
```

## Technology Stack

- **Frontend**: HTML5, CSS3, JavaScript (Vanilla JS)
- **Backend**: Node.js, Express.js
- **Download Tool**: yt-dlp

## Troubleshooting

- If `yt-dlp` is not recognized, ensure it is installed and added to your system's PATH.
- Check the console for detailed error messages in case of issues during the download process.

## License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.

---

### Contributing

Contributions are welcome! Feel free to fork this project, improve it, and submit a pull request.
