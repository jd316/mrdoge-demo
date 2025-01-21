const LOG_LEVELS = {
  DEBUG: 0,
  INFO: 1,
  WARN: 2,
  ERROR: 3
};

const currentLogLevel = process.env.NODE_ENV === 'production' ? LOG_LEVELS.INFO : LOG_LEVELS.DEBUG;

const formatMessage = (level, message, data = null) => {
  const timestamp = new Date().toISOString();
  const formattedData = data ? JSON.stringify(data, null, 2) : '';
  return `[${timestamp}] [${level}] ${message} ${formattedData}`;
};

export const logger = {
  debug: (message, data = null) => {
    if (currentLogLevel <= LOG_LEVELS.DEBUG) {
      console.debug(formatMessage('DEBUG', message, data));
    }
  },

  info: (message, data = null) => {
    if (currentLogLevel <= LOG_LEVELS.INFO) {
      console.info(formatMessage('INFO', message, data));
    }
  },

  warn: (message, data = null) => {
    if (currentLogLevel <= LOG_LEVELS.WARN) {
      console.warn(formatMessage('WARN', message, data));
    }
  },

  error: (message, error = null, context = null) => {
    if (currentLogLevel <= LOG_LEVELS.ERROR) {
      console.error(formatMessage('ERROR', message, {
        error: error?.message || error,
        stack: error?.stack,
        context
      }));
    }
  },

  // Specific contract interaction logging
  contract: {
    call: (contractName, methodName, args = null) => {
      logger.debug(`Contract Call: ${contractName}.${methodName}`, { args });
    },

    success: (contractName, methodName, result = null) => {
      logger.info(`Contract Success: ${contractName}.${methodName}`, { result });
    },

    error: (contractName, methodName, error, context = null) => {
      logger.error(`Contract Error: ${contractName}.${methodName}`, error, context);
    },

    transaction: {
      sent: (contractName, methodName, hash) => {
        logger.info(`Transaction Sent: ${contractName}.${methodName}`, { hash });
      },

      confirmed: (contractName, methodName, hash, receipt) => {
        logger.info(`Transaction Confirmed: ${contractName}.${methodName}`, {
          hash,
          blockNumber: receipt.blockNumber,
          gasUsed: receipt.gasUsed.toString()
        });
      },

      failed: (contractName, methodName, hash, error) => {
        logger.error(`Transaction Failed: ${contractName}.${methodName}`, error, { hash });
      }
    }
  }
};
