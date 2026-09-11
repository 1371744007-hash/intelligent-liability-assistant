const { bootstrapData } = require('../lib/api');

module.exports = (req, res) => {
  if (req.method !== 'GET') return res.status(405).json({error:'Method not allowed'});
  res.setHeader('Cache-Control','no-store');
  return res.status(200).json(bootstrapData());
};
