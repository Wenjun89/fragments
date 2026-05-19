const { createSuccessResponse } = require('../../response');
const logger = require('../../logger');

module.exports = async (req, res) => {
  
  logger.info({ ownerId: req.user?.id }, 'Getting fragments');

  res.status(200).json(
    createSuccessResponse({
      fragments: [],
    })
  );
};