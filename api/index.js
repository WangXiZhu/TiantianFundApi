/**
 * Vercel Serverless Function - Index Handler
 * 直接返回静态首页
 */
const fs = require('fs');
const path = require('path');

module.exports = async function handler(request, response) {
  const indexPath = path.join(__dirname, '../public/index.html');
  
  try {
    const html = fs.readFileSync(indexPath, 'utf-8');
    response.setHeader('Content-Type', 'text/html; charset=utf-8');
    response.status(200).send(html);
  } catch (error) {
    response.status(500).send('Failed to load page');
  }
};
