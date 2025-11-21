const fs = require('fs');
const path = require('path');

const logsDir = path.join(__dirname, '../logs');

if (!fs.existsSync(logsDir)) {
  fs.mkdirSync(logsDir, { recursive: true });
}

const getTimestamp = () => new Date().toISOString();

const logToFile = (level, message, data = null) => {
  const date = new Date();
  const dateStr = date.toISOString().split('T')[0];
  const logFile = path.join(logsDir, `${level}-${dateStr}.log`);

  let logMessage = `[${getTimestamp()}] ${level.toUpperCase()}: ${message}`;
  if (data) {
    logMessage += `\nData: ${JSON.stringify(data, null, 2)}`;
  }
  logMessage += '\n' + '='.repeat(80) + '\n';

  fs.appendFileSync(logFile, logMessage, 'utf8');
};

const logger = {
  info: (message, data = null) => {
    console.log(`[INFO] ${getTimestamp()}: ${message}`);
    logToFile('info', message, data);
  },

  error: (message, error = null) => {
    console.error(`[ERROR] ${getTimestamp()}: ${message}`);
    if (error) {
      console.error('Stack:', error.stack);
      logToFile('error', message, {
        message: error.message,
        stack: error.stack,
      });
    } else {
      logToFile('error', message);
    }
  },

  warn: (message, data = null) => {
    console.warn(`[WARN] ${getTimestamp()}: ${message}`);
    logToFile('warn', message, data);
  },

  debug: (message, data = null) => {
    if (process.env.NODE_ENV === 'development') {
      console.debug(`[DEBUG] ${getTimestamp()}: ${message}`);
      logToFile('debug', message, data);
    }
  },

  request: (method, path, statusCode, responseTime) => {
    const message = `${method} ${path} - ${statusCode} (${responseTime}ms)`;
    console.log(`[REQUEST] ${getTimestamp()}: ${message}`);
  },
};

module.exports = logger;
