# 天天基金网 API

[![npm version](https://img.shields.io/npm/v/tiantian-fund-api.svg)](https://www.npmjs.com/package/tiantian-fund-api)
[![License](https://img.shields.io/badge/license-ISC-blue.svg)](LICENSE)
[![Docker](https://img.shields.io/docker/pulls/WangXiZhu/tiantian_fund_api)](https://hub.docker.com/r/WangXiZhu/tiantian_fund_api)

> 天天基金网 Node.js API Service - 提供基金、股票等金融数据接口

## ✨ 功能特性

- 🔍 **基金搜索** - 支持按关键字、字母、基金经理等多维度搜索
- 📊 **基金详情** - 获取基金净值、涨幅、评级、历史数据等
- 👨‍💼 **基金经理** - 查询基金经理信息、业绩、持仓风格等
- 🏢 **基金公司** - 获取基金公司基础信息、旗下基金列表
- 📈 **股票数据** - 获取股票K线、趋势、交易明细等
- 🔴 **实时推送** - 通过 SSE 获取实时行情数据
- 🐳 **Docker 支持** - 支持 Docker 一键部署
- ☁️ **Vercel 部署** - 提供 Vercel 在线示例

## 📖 文档

阅读完整文档 👇

> [https://WangXiZhu.github.io/TiantianFundApi/](https://WangXiZhu.github.io/TiantianFundApi/)

## 🚀 快速开始

### 作为 npm 包使用

```bash
npm install tiantian-fund-api
```

```javascript
const { fundSearch, fundMNDetailInformation } = require('tiantian-fund-api')

// 搜索基金
const funds = await fundSearch({ m: '1', key: '华夏' })

// 获取基金详情
const detail = await fundMNDetailInformation({ FCODE: '003834' })
```

### 启动本地服务

```bash
# 克隆项目
git clone https://github.com/WangXiZhu/TiantianFundApi.git
cd TiantianFundApi

# 安装依赖
pnpm install

# 启动服务
pnpm start
```

访问 `http://localhost:3000/fundSearch?m=1&key=华夏` 测试接口。

### Docker 部署

```bash
docker run -d -p 3000:3000 WangXiZhu/tiantian_fund_api
```

## 📋 接口列表

| 接口 | 说明 |
|------|------|
| `/fundSearch` | 基金搜索 |
| `/fundMNDetailInformation` | 获取基金详情 |
| `/fundMNHisNetList` | 获取基金历史净值 |
| `/fundMNRank` | 获取基金排行 |
| `/fundMSNMangerInfo` | 获取基金经理信息 |
| `/stockGet` | 获取股票详情 |
| `/stockKline` | 获取股票K线 |
| `/sse` | SSE 实时行情推送 |
| ... | 更多接口请查看[文档](https://WangXiZhu.github.io/TiantianFundApi/apis/) |

## 🔧 开发

### 安装依赖

```bash
pnpm install
```

### 启动开发服务

```bash
pnpm start
```

### 运行测试

```bash
pnpm test
```

### 启动文档开发

```bash
pnpm docs:dev
```

### 构建文档

```bash
pnpm docs:build
```

## 📝 路由注册方式

- 在 `src/module/` 目录下创建 API 模块文件
- 文件名即为路由名，例如 `fundSearch.js` → `/fundSearch`

## 🗺️ TODO

- [ ] 接口持续更新
- [ ] 提高字段可读性
- [x] 文档完善
- [x] 测试用例
- [x] Docker 部署
- [x] Vercel 示例

> 天天基金网数据的结构和命名太过混乱，导致返回结果不易读。计划在接口写完之后再做命名规范和结构调整。

## 📄 许可证

[ISC](LICENSE)

## 🤝 贡献

欢迎提交 Issue 和 Pull Request！

## ⚠️ 免责声明

本项目仅供学习研究使用，请勿用于商业用途。数据来源于天天基金网，如有侵权请联系删除。
