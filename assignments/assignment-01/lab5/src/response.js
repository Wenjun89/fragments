/**
 * Express response helpers
 */

/**
 * Creates a standard error response object
 * @param {number} code - HTTP status code
 * @param {string} message - Error description
 * @returns {Object} Standardized error JSON structure
 */
function createErrorResponse(code, message) {
  return {
    status: 'error',
    error: {
      code,
      message,
    },
  };
}

/**
 * Creates a standard success response object
 * @param {Object} [data] - Dynamic data payload to return
 * @returns {Object} Standardized success JSON structure
 */
function createSuccessResponse(data = {}) {
  return {
    status: 'ok',
    ...data,
  };
}

module.exports.createErrorResponse = createErrorResponse;
module.exports.createSuccessResponse = createSuccessResponse;