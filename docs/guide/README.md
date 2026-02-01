# 使用指南

> 本指南将帮助你快速上手使用天天基金网 API。

## 📦 安装

### npm 安装

```bash
npm install tiantian-fund-api
```

### pnpm 安装

```bash
pnpm add tiantian-fund-api
```

## 🚀 运行服务

### Node.js 中启动

本地开发时，克隆仓库后执行：

```bash
# 安装依赖
npm install

# 启动服务
npm run start
```

服务将在 `http://localhost:3000` 启动。

### Docker 中启动

使用 Docker 可以一键部署：

```bash
docker run -d -p 3000:3000 WangXiZhu/tiantian_fund_api
```

## 💻 在代码中使用

### 基础使用

```javascript
const { fundSearch } = require('tiantian-fund-api')

async function main() {
  // 搜索基金
  const res = await fundSearch({
    m: '1',
    key: '华夏'
  })
  console.log(res)
}

main()
```

### 常用接口示例

#### 基金搜索

```javascript
const { fundSearch } = require('tiantian-fund-api')

// 按关键字搜索基金
const funds = await fundSearch({ m: '1', key: '科技' })

// 按字母搜索基金公司
const companies = await fundSearch({ m: '3', key: 'h' })

// 搜索基金经理
const managers = await fundSearch({ m: '7', key: '张' })
```

#### 获取基金详情

```javascript
const { fundMNDetailInformation } = require('tiantian-fund-api')

const detail = await fundMNDetailInformation({ FCODE: '003834' })
console.log(detail.Datas.SHORTNAME) // 华夏能源革新股票A
```

#### 获取基金历史净值

```javascript
const { fundMNHisNetList } = require('tiantian-fund-api')

const history = await fundMNHisNetList({
  FCODE: '003834',
  pageIndex: 1,
  pagesize: 10
})
console.log(history.Datas)
```

## 🌐 HTTP 请求方式

所有接口均支持 GET 请求，参数通过 Query String 传递。

```bash
# 示例：搜索基金
curl "http://localhost:3000/fundSearch?m=1&key=华夏"

# 示例：获取基金详情
curl "http://localhost:3000/fundMNDetailInformation?FCODE=003834"
```

## ☁️ Vercel 部署

支持在 Vercel 中调用 API。由于 Vercel 个人版限制，通过 `action_name` 参数指定接口名称：

**格式**

```
https://tiantian-fund-api.vercel.app/api/action?action_name={路由名}&{请求参数}
```

**示例**

本地接口 `/fundSearch?m=1&key=11`

在 Vercel 中使用：

[https://tiantian-fund-api.vercel.app/api/action?action_name=fundSearch&m=1&key=11](https://tiantian-fund-api.vercel.app/api/action?action_name=fundSearch&m=1&key=11)

## ⚠️ 注意事项

1. **请求频率限制**：请合理控制请求频率，避免对服务造成压力
2. **数据仅供参考**：接口返回数据来源于天天基金网，仅供学习研究使用
3. **字段可能变化**：由于数据源更新，返回字段可能会有所变化

## 🔗 相关链接

- [API 接口文档](/apis/)
- [GitHub 仓库](https://github.com/WangXiZhu/TiantianFundApi)
- [问题反馈](https://github.com/WangXiZhu/TiantianFundApi/issues)
