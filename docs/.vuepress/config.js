import {defineUserConfig} from 'vuepress'
import { defaultTheme } from '@vuepress/theme-default'
import { viteBundler } from '@vuepress/bundler-vite'
export default defineUserConfig({
  base: '/TiantianFundApi/',
  lang: 'zh-CN',
  title: '天天基金网 API',
  description: '天天基金网 NodeJS 版 API 文档',
  theme: defaultTheme({
    navbar: [
      {
        text: '首页',
        link: '/',
      },
      {
        text: '指南',
        link: '/guide/',
      },
      {
        text: 'Api 列表',
        link: '/apis/',
      },
      {
        text: 'Github',
        link: 'https://github.com/WangXiZhu/TiantianFundApi',
      },
    ],
    sidebar: {
      '/guide/': [
        {
          text: '使用指南',
          children: ['/guide/README.md'],
        },
      ],
      '/apis/': [
        {
          text: 'API 接口',
          collapsible: false,
          children: [
            '/apis/README.md',
          ],
        },
      ],
    },
    sidebarDepth: 3,
    lastUpdated: true,
    lastUpdatedText: '最后更新时间',
    contributors: true,
    contributorsText: '贡献者',
    editLink: true,
    editLinkText: '在 GitHub 上编辑此页',
    docsRepo: 'https://github.com/WangXiZhu/TiantianFundApi',
    docsBranch: 'master',
    docsDir: 'docs',
  }),
  bundler: viteBundler(),
})
