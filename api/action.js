/**
 * Vercel Serverless Function Handler
 * 统一处理所有 API 请求
 */

module.exports = async function handler(request, response) {
  // CORS 头
  response.setHeader('Access-Control-Allow-Origin', '*');
  response.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  response.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  // 处理 OPTIONS 请求
  if (request.method === 'OPTIONS') {
    response.status(200).end();
    return;
  }

  const action = request.query.action_name;

  // 验证 action 参数
  if (!action) {
    response.status(400).json({ 
      error: 'Missing action_name parameter',
      message: '请提供 action_name 参数'
    });
    return;
  }

  try {
    // 动态加载对应的模块
    const api = require(`../src/module/${action}.js`);
    
    // 复制 query 参数，移除 action_name
    const params = { ...request.query };
    delete params.action_name;
    
    const data = await api(params);
    
    response.status(200).json(data);
  } catch (error) {
    console.error(`API Error [${action}]:`, error.message);
    
    // 处理模块未找到的错误
    if (error.code === 'MODULE_NOT_FOUND') {
      response.status(404).json({
        error: 'API not found',
        message: `未找到 API: ${action}`,
        availableAPIs: [
          'fundSearch', 'fundNetList', 'fundMNRank', 'fundMNDetailInformation',
          'fundMNHisNetList', 'fundVPageAcc', 'fundVPageDiagram', 'fundGradeDetail',
          'fundMNStopWatch', 'bigDataList', 'bigDataDetail', 'stockGet', 
          'stockDetails', 'stockKline', 'stockTrends2'
        ]
      });
      return;
    }

    // 其他错误
    response.status(500).json({
      error: 'Internal Server Error',
      message: error.message
    });
  }
};
