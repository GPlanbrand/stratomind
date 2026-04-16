#!/usr/bin/env node
/**
 * Electron 环境检查和构建脚本
 * 
 * 用法:
 *   node scripts/electron-build.js          # 检查并构建
 *   node scripts/electron-build.js --dev    # 开发模式
 *   node scripts/electron-build.js --win    # 仅构建 Windows
 *   node scripts/electron-build.js --mac    # 仅构建 macOS
 */

import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

const args = process.argv.slice(2);
const isDev = args.includes('--dev');
const isWin = args.includes('--win');
const isMac = args.includes('--mac');

console.log('🚀 灵思AI创意工作台 - Electron 构建工具\n');

// 检查 Node.js 版本
function checkNodeVersion() {
  const version = process.version.match(/^v(\d+)/)?.[1];
  if (version && parseInt(version) < 18) {
    console.error('❌ Node.js 版本过低，需要 18.0.0 或更高版本');
    console.error(`   当前版本: ${process.version}`);
    process.exit(1);
  }
  console.log('✅ Node.js 版本检查通过');
}

// 检查依赖
function checkDependencies() {
  const nodeModules = path.join(rootDir, 'node_modules');
  const requiredDeps = ['electron', 'electron-builder'];
  
  console.log('\n📦 检查依赖...');
  
  for (const dep of requiredDeps) {
    if (fs.existsSync(path.join(nodeModules, dep))) {
      console.log(`   ✅ ${dep}`);
    } else {
      console.log(`   ❌ ${dep} 未安装`);
      console.log(`   请运行: npm install`);
      process.exit(1);
    }
  }
}

// 检查图标
function checkIcons() {
  const buildDir = path.join(rootDir, 'build');
  const iconPath = path.join(buildDir, 'icon.png');
  
  if (!fs.existsSync(buildDir)) {
    fs.mkdirSync(buildDir, { recursive: true });
  }
  
  if (!fs.existsSync(iconPath)) {
    console.log('\n⚠️  未找到应用图标');
    console.log('   请运行以下命令生成图标:');
    console.log('   npm install sharp --save-dev');
    console.log('   node scripts/generate-icons.js');
    console.log('   或者手动将 256x256 PNG 图标放置到 build/icon.png');
  } else {
    console.log('\n✅ 应用图标已就绪');
  }
}

// 构建前端
function buildFrontend() {
  console.log('\n🔨 正在构建前端...');
  try {
    execSync('npm run build', { cwd: rootDir, stdio: 'inherit' });
    console.log('✅ 前端构建完成');
  } catch (error) {
    console.error('❌ 前端构建失败');
    process.exit(1);
  }
}

// 构建 Electron
function buildElectron(target) {
  console.log(`\n📦 正在构建 Electron 应用${target ? ` (${target})` : ''}...`);
  
  const builderArgs = ['electron-builder', '--config', 'electron-builder.yml'];
  
  if (target === 'win') {
    builderArgs.push('--win');
  } else if (target === 'mac') {
    builderArgs.push('--mac');
  }
  
  try {
    execSync(builderArgs.join(' '), { cwd: rootDir, stdio: 'inherit' });
    console.log('\n✅ Electron 构建完成!');
    console.log(`📁 输出目录: ${path.join(rootDir, 'release')}`);
  } catch (error) {
    console.error('\n❌ Electron 构建失败');
    process.exit(1);
  }
}

// 启动开发模式
function startDev() {
  console.log('⚡ 启动 Electron 开发模式...\n');
  console.log('提示:');
  console.log('  - 前端开发服务器应运行在 http://localhost:3000');
  console.log('  - 修改 electron/ 目录下的代码后需要重启\n');
  
  try {
    execSync('ELECTRON_DEV=true electron .', { 
      cwd: rootDir, 
      stdio: 'inherit',
      env: { ...process.env, ELECTRON_DEV: 'true' }
    });
  } catch (error) {
    // 用户手动退出
    console.log('\n👋 已退出开发模式');
  }
}

// 主流程
async function main() {
  checkNodeVersion();
  checkDependencies();
  checkIcons();
  
  if (isDev) {
    startDev();
  } else {
    buildFrontend();
    
    if (isWin) {
      buildElectron('win');
    } else if (isMac) {
      buildElectron('mac');
    } else {
      buildElectron();
    }
  }
}

main();
