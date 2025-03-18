# basicYTDLGUI 🎥

<div align="center">

[![GitHub stars](https://img.shields.io/github/stars/developedbyalex/basicYTDLGUI?style=for-the-badge)](https://github.com/developedbyalex/basicYTDLGUI/stargazers)
[![GitHub forks](https://img.shields.io/github/forks/developedbyalex/basicYTDLGUI?style=for-the-badge)](https://github.com/developedbyalex/basicYTDLGUI/network)
[![GitHub issues](https://img.shields.io/github/issues/developedbyalex/basicYTDLGUI?style=for-the-badge)](https://github.com/developedbyalex/basicYTDLGUI/issues)
[![Docker Build](https://img.shields.io/github/actions/workflow/status/developedbyalex/basicYTDLGUI/docker-build.yml?style=for-the-badge&logo=docker)](https://github.com/developedbyalex/basicYTDLGUI/actions)
[![License](https://img.shields.io/github/license/developedbyalex/basicYTDLGUI?style=for-the-badge)](https://github.com/developedbyalex/basicYTDLGUI/blob/main/LICENSE)

A modern, user-friendly web interface for downloading videos and audio from various platforms using yt-dlp.

[Features](#features) • [Installation](#installation) • [Usage](#usage) • [Docker](#docker) • [Contributing](#contributing)

![image](https://github.com/user-attachments/assets/4c173410-da6c-4c59-b5a6-35becd2611de)

</div>

## ✨ Features

- 🎯 **Simple Interface**: Clean, modern design with dark glass theme
- 🎬 **Multiple Formats**: Download as MP4 (video) or MP3 (audio)
- 📥 **Batch Downloads**: Process multiple URLs simultaneously
- 📊 **Progress Tracking**: Real-time progress bars and status updates
- 🎨 **Metadata Support**: Include video metadata, thumbnails, and comments
- 🌐 **Platform Support**: Works with YouTube and many other platforms
- 📱 **Responsive Design**: Fully functional on mobile devices
- 🐳 **Docker Support**: Easy deployment with Docker

## 🚀 Installation

### Prerequisites

- [Node.js](https://nodejs.org/) (v14 or higher)
- [yt-dlp](https://github.com/yt-dlp/yt-dlp)
- [FFmpeg](https://ffmpeg.org/) (for audio conversion)

### Quick Start

```bash
# Clone the repository
git clone https://github.com/developedbyalex/basicYTDLGUI.git

# Navigate to project directory
cd basicYTDLGUI

# Install dependencies
npm install

# Start the server
npm start
```

Then open http://localhost:3000 in your browser.

## 🐳 Docker

### Using Docker Compose (Recommended)

```bash
# Build and start containers
docker-compose up -d

# Stop containers
docker-compose down
```

### Manual Docker Build

```bash
# Build the image
docker build -t basicytdlgui .

# Run the container
docker run -p 3000:3000 -v $(pwd)/downloads:/usr/src/app/downloads basicytdlgui
```

## 📖 Usage

1. Enter one or more video URLs (one per line)
2. Choose your preferred format (MP4/MP3)
3. Configure download options:
   - Use video's title as filename
   - Include metadata (thumbnails, description)
   - Include comments
4. Click Download and monitor progress

## 🔧 Configuration

### Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `PORT` | Server port | `3000` |
| `DOWNLOAD_DIR` | Download directory | `./downloads` |

### Instagram Support

To download from Instagram:

1. Install "[Get cookies.txt](https://chromewebstore.google.com/detail/get-cookiestxt-locally/cclelndahbckbenkjhflpdbgdldlbecc)" extension
2. Log into Instagram
3. Export cookies to `cookies.txt`
4. Place in project root

## 🤝 Contributing

Contributions are welcome! Here's how you can help:

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to your branch
5. Open a pull request

Please ensure your PR adheres to the following:
- Follow existing code style
- Add tests if applicable
- Update documentation as needed

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- [yt-dlp](https://github.com/yt-dlp/yt-dlp) for the amazing downloader
- [Express.js](https://expressjs.com/) for the web framework
- All our [contributors](https://github.com/developedbyalex/basicYTDLGUI/graphs/contributors)

---

<div align="center">

Made with ❤️ by [developedbyalex](https://github.com/developedbyalex)

⭐ Star us on GitHub — it motivates us a lot!

</div>
