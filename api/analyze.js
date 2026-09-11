const { ApiError, analyzeRequest } = require('../lib/api');

module.exports = async (req, res) => {
  if (req.method !== 'POST') return res.status(405).json({error:'Method not allowed'});
  try {
    const body = typeof req.body === 'string' ? JSON.parse(req.body) : (req.body || {});
    return res.status(200).json({result:await analyzeRequest(body)});
  } catch (error) {
    const status = error instanceof ApiError ? error.status : 500;
    console.error(error);
    return res.status(status).json({error:error.message||'服务端错误'});
  }
};
