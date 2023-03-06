const routes = [
  {
    path: '/',
    component: () => import('src/layouts/Main.vue'),
    children: [
      {
        path: '',
        component: () => import('src/pages/sylvia-router/SysInfo.vue'),
      },
      { path: 'settings', component: () => import('src/pages/Settings.vue') },
      { path: 'about', component: () => import('src/pages/About.vue') },
      {
        path: 'sylvia-core',
        component: () => import('src/layouts/Children.vue'),
        children: [
          {
            path: 'application',
            component: () => import('src/pages/sylvia-core/Application.vue'),
          },
          {
            path: 'client',
            component: () => import('src/pages/sylvia-core/Client.vue'),
          },
          {
            path: 'device',
            component: () => import('src/pages/sylvia-core/Device.vue'),
          },
          {
            path: 'device-route',
            component: () => import('src/pages/sylvia-core/DeviceRoute.vue'),
          },
          {
            path: 'dldata-buffer',
            component: () => import('src/pages/sylvia-core/DlDataBuffer.vue'),
          },
          {
            path: 'network',
            component: () => import('src/pages/sylvia-core/Network.vue'),
          },
          {
            path: 'network-route',
            component: () => import('src/pages/sylvia-core/NetworkRoute.vue'),
          },
          {
            path: 'redirect',
            component: () => import('src/pages/sylvia-core/Redirect.vue'),
          },
          {
            path: 'unit',
            component: () => import('src/pages/sylvia-core/Unit.vue'),
          },
          {
            path: 'user',
            component: () => import('src/pages/sylvia-core/User.vue'),
          },
        ],
      },
      {
        path: 'sylvia-data',
        component: () => import('src/layouts/Children.vue'),
        children: [
          {
            path: 'application',
            component: () => import('src/pages/sylvia-data/Application.vue'),
          },
          {
            path: 'network',
            component: () => import('src/pages/sylvia-data/Network.vue'),
          },
          {
            path: 'opdata',
            component: () => import('src/pages/sylvia-data/Operation.vue'),
          },
        ],
      },
      {
        path: 'sylvia-router',
        component: () => import('src/layouts/Children.vue'),
        children: [
          {
            path: 'wan',
            component: () => import('src/pages/sylvia-router/NetWan.vue'),
          },
          {
            path: 'lan',
            component: () => import('src/pages/sylvia-router/NetLan.vue'),
          },
          {
            path: 'wlan',
            component: () => import('src/pages/sylvia-router/NetWlan.vue'),
          },
          {
            path: 'wwan',
            component: () => import('src/pages/sylvia-router/NetWwan.vue'),
          },
        ],
      },
      {
        path: 'network',
        component: () => import('src/layouts/Children.vue'),
        children: [
          {
            path: 'lora-ifroglab',
            component: () =>
              import('src/pages/network/lora-ifroglab/Index.vue'),
          },
        ],
      },
      {
        path: 'application',
        component: () => import('src/layouts/Children.vue'),
        children: [
          {
            path: 'app-demo',
            component: () => import('src/pages/application/app-demo/Index.vue'),
          },
        ],
      },
    ],
  },

  // Always leave this as last one,
  // but you can also remove it
  {
    path: '/:catchAll(.*)*',
    component: () => import('pages/ErrorNotFound.vue'),
  },
];

export default routes;
