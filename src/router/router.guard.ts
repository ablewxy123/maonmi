
import type { Router } from 'vue-router'
import { useAppStore } from '@/store'

const title = import.meta.env.VITE_APP_NAME

export function setupRouterGuard(router: Router) {
    const appStore = useAppStore()
    router.beforeEach(async (to, from, next) => {

        appStore.showProgress && window.$loadingBar?.start()

        if (to.name === 'root') {
            next({ path: import.meta.env.VITE_HOME_PATH, replace: true })
            return
        }
        next()
    })

    router.beforeResolve((to) => {

    })

    router.afterEach((to) => {
        // 修改网页标题
        document.title = `${to.meta.title} - ${title}`
        // 结束 loadingBar
        appStore.showProgress && window.$loadingBar?.finish()
    })
}