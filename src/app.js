const koa = require('koa');
const Router = require('@koa/router');
const serve = require('koa-static');
const path = require('path');
const { log } = require('./utils/log');
const { getModules } = require('./utils');

function startServe() {
  return new Promise((resolve) => {
    const app = new koa();

    const router = new Router();

    // CORS 中间件
    app.use(async (ctx, next) => {
      ctx.set('Access-Control-Allow-Origin', '*');
      ctx.set('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
      ctx.set('Access-Control-Allow-Headers', 'Content-Type');
      
      if (ctx.method === 'OPTIONS') {
        ctx.status = 200;
        return;
      }
      
      await next();
    });

    // 静态文件服务
    app.use(serve(path.join(__dirname, '../public')));

    getModules().forEach(({ fileName, path: modulePath }) => {
      const routerPath = `/${fileName}`;
      const api = require(modulePath);

      app[fileName] = api;

      log(`✅ 生成路由 ${routerPath}`);

      router.get(routerPath, async (ctx, next) => {
        ctx.status = 200;
        ctx.body = await api(ctx.request.query, ctx);
        next();
      });
    });

    app.use(router.routes()).use(router.allowedMethods());

    const server = app.listen(3000, () => {
      log('🚀 server is running at port 3000');
      log('📱 前端页面: http://localhost:3000');
      resolve(server);
    });
  });
}

module.exports = {
  startServe,
};
