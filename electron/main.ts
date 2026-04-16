import { app, BrowserWindow, ipcMain, Tray, Menu, nativeImage, Notification, shell } from 'electron'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// 获取构建模式
const isDev = process.env.ELECTRON_DEV === 'true'
const isPackaged = app.isPackaged

let mainWindow: BrowserWindow | null = null
let tray: Tray | null = null

// 创建主窗口
function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    minWidth: 900,
    minHeight: 600,
    title: '灵思AI创意工作台',
    icon: path.join(__dirname, '../public/icon.png'),
    webPreferences: {
      preload: path.join(__dirname, 'preload.mjs'),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: false,
    },
    show: false,
    backgroundColor: '#ffffff',
  })

  // 窗口准备就绪后显示
  mainWindow.once('ready-to-show', () => {
    mainWindow?.show()
  })

  // 加载应用
  if (isDev) {
    mainWindow.loadURL('http://localhost:3000')
    mainWindow.webContents.openDevTools()
  } else {
    mainWindow.loadFile(path.join(__dirname, '../dist/index.html'))
  }

  // 窗口关闭时最小化到托盘
  mainWindow.on('close', (event) => {
    if (tray && !app.isQuitting) {
      event.preventDefault()
      mainWindow?.hide()
    }
  })

  mainWindow.on('closed', () => {
    mainWindow = null
  })

  // 打开外部链接
  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    shell.openExternal(url)
    return { action: 'deny' }
  })
}

// 创建系统托盘
function createTray() {
  // 使用默认图标或自定义图标
  let trayIcon: nativeImage
  const iconPath = path.join(__dirname, '../public/icon.png')
  
  try {
    trayIcon = nativeImage.createFromPath(iconPath)
    if (trayIcon.isEmpty()) {
      trayIcon = nativeImage.createEmpty()
    }
  } catch {
    trayIcon = nativeImage.createEmpty()
  }

  tray = new Tray(trayIcon)

  const contextMenu = Menu.buildFromTemplate([
    {
      label: '打开灵思AI',
      click: () => {
        mainWindow?.show()
        mainWindow?.focus()
      }
    },
    { type: 'separator' },
    {
      label: '最小化到托盘',
      click: () => mainWindow?.hide()
    },
    { type: 'separator' },
    {
      label: '退出',
      click: () => {
        (app as any).isQuitting = true
        app.quit()
      }
    }
  ])

  tray.setToolTip('灵思AI创意工作台')
  tray.setContextMenu(contextMenu)

  // 点击托盘图标显示窗口
  tray.on('click', () => {
    mainWindow?.show()
    mainWindow?.focus()
  })
}

// 发送桌面通知
function showNotification(title: string, body: string) {
  if (Notification.isSupported()) {
    new Notification({
      title,
      body,
      icon: path.join(__dirname, '../public/icon.png'),
    }).show()
  }
}

// 注册IPC处理器
function registerIpcHandlers() {
  // 发送通知
  ipcMain.handle('show-notification', (_, { title, body }: { title: string; body: string }) => {
    showNotification(title, body)
    return true
  })

  // 获取应用版本
  ipcMain.handle('get-app-version', () => {
    return app.getVersion()
  })

  // 获取平台信息
  ipcMain.handle('get-platform', () => {
    return process.platform
  })

  // 窗口控制
  ipcMain.handle('window-minimize', () => {
    mainWindow?.minimize()
  })

  ipcMain.handle('window-maximize', () => {
    if (mainWindow?.isMaximized()) {
      mainWindow.unmaximize()
    } else {
      mainWindow?.maximize()
    }
  })

  ipcMain.handle('window-close', () => {
    mainWindow?.close()
  })

  ipcMain.handle('window-is-maximized', () => {
    return mainWindow?.isMaximized() ?? false
  })
}

// 应用准备就绪
app.whenReady().then(() => {
  createWindow()
  createTray()
  registerIpcHandlers()

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow()
    } else {
      mainWindow?.show()
    }
  })
})

// 所有窗口关闭
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

// 应用退出前
app.on('before-quit', () => {
  (app as any).isQuitting = true
})

// 处理未捕获的异常
process.on('uncaughtException', (error) => {
  console.error('Uncaught Exception:', error)
})

process.on('unhandledRejection', (reason) => {
  console.error('Unhandled Rejection:', reason)
})
