# 适配基础级数据增删改查模板的基于 Vue 的后台管理模板

本项目根据 vue-admin-template 后台管理模板项目改造而来，适配此前所做的基础级数据增删改查模板，只包含了 Element UI & axios & iconfont & permission control & lint 必要的后台搭建要素。

> 🔗 vue-admin-template 后台管理模板
>
> https://github.com/PanJiaChen/vue-admin-template
>
> 🔗 基础级数据增删改查模板
>
> https://github.com/dreature1328/springboot-mybatis-crud-template

## 安装启动

```bash
# 安装依赖
npm install

# 启动服务
npm run dev
```

## 页面注册

于 `src/views` 下增加包含 `index.vue` 的页面目录（若需要）

并在 `src/router/index.js` 中注册页面路由信息，如下所示

```javascript
  {
    path: '/data',
    component: Layout,
    children: [{
      path: 'index',
      name: 'Data',
      component: () => import('@/views/data/index'),
      meta: { title: '数据管理', icon: 'el-icon-document' }
    }]
  }
```

## API 注册

在 `src/main.js` 中赋值，如下所示

```javascript
import API from '@/api'
Vue.prototype.$API = API
```

其后在 `src/api` 添加 `<api name>.js`（若需要）

并在 `data.js` 中填写 API 端口
