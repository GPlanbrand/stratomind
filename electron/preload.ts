import { contextBridge, ipcRenderer } from 'electron'

// 暴露给渲染进程的API
contextBridge.exposeInMainWorld('electronAPI', {
  // 发送桌面通知
  showNotification: (title: string, body: string) => {
    return ipcRenderer.invoke('show-notification', { title, body })
  },

  // 获取应用版本
  getAppVersion: () => {
    return ipcRenderer.invoke('get-app-version')
  },

  // 获取平台信息
  getPlatform: () => {
    return ipcRenderer.invoke('get-platform')
  },

  // 窗口控制
  windowMinimize: () => ipcRenderer.invoke('window-minimize'),
  windowMaximize: () => ipcRenderer.invoke('window-maximize'),
  windowClose: () => ipcRenderer.invoke('window-close'),
  windowIsMaximized: () => ipcRenderer.invoke('window-is-maximized'),

  // 监听最大化状态变化
  onMaximizeChange: (callback: (isMaximized: boolean) => void) => {
    ipcRenderer.on('maximize-change', (_, isMaximized) => callback(isMaximized))
  },
})

// 类型声明
declare global {
  interface Window {
    electronAPI: {
      showNotification: (title: string, body: string) => Promise<boolean>
      getAppVersion: () => Promise<string>
      getPlatform: () => Promise<string>
      windowMinimize: () => Promise<void>
      windowMaximize: () => Promise<void>
      windowClose: () => Promise<void>
      windowIsMaximized: () => Promise<boolean>
      onMaximizeChange: (callback: (isMaximized: boolean) => void) => void
    }
  }
}
