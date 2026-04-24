import vue from '@vitejs/plugin-vue'
import vueJsx from '@vitejs/plugin-vue-jsx'
import AutoImport from 'unplugin-auto-import/vite'

import { NaiveUiResolver } from 'unplugin-vue-components/resolvers'
import Components from 'unplugin-vue-components/vite'
import viteCompression from 'vite-plugin-compression'
import VueDevTools from 'vite-plugin-vue-devtools'
import AutoProxy from './autoProxy'
import { serviceConfig } from '../service.config'
/**
 * @description: 设置vite插件配置
 * @param {*} env - 环境变量配置
 * @return {*}
 */
export function createVitePlugins(env: ImportMetaEnv) {
  const plugins = [
    // support vue
    vue(),
    vueJsx(),
    VueDevTools(),
    // auto import api of lib
    AutoImport({
      imports: [
        'vue',
        'vue-router',
        'pinia',
        '@vueuse/core',
        'vue-i18n',
        {
          'naive-ui': [
            'useDialog',
            'useMessage',
            'useNotification',
            'useLoadingBar',
            'useModal',
          ],
        },
      ],
      include: [
        /\.[tj]sx?$/,
        /\.vue$/,
        /\.vue\?vue/,
        /\.md$/,
      ],
      dts: 'src/typings/auto-imports.d.ts',
    }),

    // auto import components lib
    Components({
      dts: 'src/typings/components.d.ts',
      resolvers: [
        NaiveUiResolver(),
      ],
    }),

    AutoProxy({
      enableProxy: env.VITE_HTTP_PROXY === 'Y',
      serviceConfig,
      dts: 'src/typings/auto-proxy.d.ts',
    }),
  ]
  // use compression
  if (env.VITE_BUILD_COMPRESS === 'Y') {
    const { VITE_COMPRESS_TYPE = 'gzip' } = env
    plugins.push(viteCompression({
      algorithm: VITE_COMPRESS_TYPE, // 压缩算法
    }))
  }

  return plugins
}
