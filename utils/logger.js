const winston = require('winston');
const path = require('path');
const fs = require('fs');

// Create logs directory if it doesn't exist
const logsDir = path.join(__dirname, '..', 'logs');
if (!fs.existsSync(logsDir)) {
    fs.mkdirSync(logsDir);
}

// Define log format
const logFormat = winston.format.combine(
    winston.format.timestamp(),
    winston.format.json()
);

// Create the logger
const logger = winston.createLogger({
    level: 'info', // Default log level
    format: logFormat,
    transports: [
        // Console transport
        new winston.transports.Console({
            format: winston.format.combine(
                winston.format.colorize(),
                winston.format.simple()
            )
        }),
        // File transport for all logs
        new winston.transports.File({
            filename: path.join(logsDir, 'app.log'),
            maxsize: 5242880, // 5MB
            maxFiles: 5,
            tailable: true
        }),
        // Separate file for error logs
        new winston.transports.File({
            filename: path.join(logsDir, 'error.log'),
            level: 'error',
            maxsize: 5242880, // 5MB
            maxFiles: 5,
            tailable: true
        })
    ]
});

// Export logger configuration functions
const setLogLevel = (level) => {
    logger.level = level;
};

const setLogFile = (filename) => {
    // Remove existing file transports
    logger.transports = logger.transports.filter(t => t.constructor.name !== 'File');
    
    // Add new file transport
    logger.add(new winston.transports.File({
        filename: path.join(logsDir, filename),
        maxsize: 5242880, // 5MB
        maxFiles: 5,
        tailable: true
    }));
};

module.exports = {
    logger,
    setLogLevel,
    setLogFile
}; 