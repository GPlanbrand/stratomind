#!/usr/bin/env node
/**
 * 图标生成脚本
 * 使用说明:
 *   node scripts/generate-icons.js
 * 
 * 需要安装 sharp: npm install sharp --save-dev
 * 首次运行会自动下载并转换图标
 */

import sharp from 'sharp';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

// 检查是否安装了 sharp
async function checkSharp() {
  try {
    await import('sharp');
    return true;
  } catch {
    console.log('需要安装 sharp 库来生成图标...');
    console.log('请运行: npm install sharp --save-dev');
    return false;
  }
}

// 读取 SVG 文件
function readSvg() {
  const svgPath = path.join(rootDir, 'public', 'favicon.svg');
  if (fs.existsSync(svgPath)) {
    return fs.readFileSync(svgPath);
  }
  throw new Error('未找到 favicon.svg 文件');
}

// 生成 Windows ICO 文件 (包含多个尺寸)
async function generateIco(svgBuffer) {
  const buildDir = path.join(rootDir, 'build');
  
  // 生成多个 PNG 尺寸用于 ICO
  const sizes = [16, 32, 48, 64, 128, 256];
  
  // 256x256 用于主图标
  await sharp(svgBuffer)
    .resize(256, 256)
    .png()
    .toFile(path.join(buildDir, 'icon.png'));
  
  console.log('✓ 生成 icon.png (256x256)');
  
  // 生成 512x512 版本
  await sharp(svgBuffer)
    .resize(512, 512)
    .png()
    .toFile(path.join(buildDir, 'icon-512.png'));
  
  console.log('✓ 生成 icon-512.png (512x512)');
  
  // 生成 Linux 图标集
  const iconSizes = [16, 32, 48, 64, 128, 256, 512];
  const iconsDir = path.join(buildDir, 'icons');
  
  if (!fs.existsSync(iconsDir)) {
    fs.mkdirSync(iconsDir, { recursive: true });
  }
  
  for (const size of iconSizes) {
    await sharp(svgBuffer)
      .resize(size, size)
      .png()
      .toFile(path.join(iconsDir, `${size}x${size}.png`));
  }
  
  console.log('✓ 生成 Linux 图标集 (16x16 到 512x512)');
  
  // 对于 Windows ICO，我们可以使用 PNG 文件
  // electron-builder 支持直接使用 PNG，ICO 会自动生成
  await sharp(svgBuffer)
    .resize(256, 256)
    .png()
    .toFile(path.join(buildDir, 'icon.ico.png'));
  
  console.log('✓ 生成 icon.ico.png (electron-builder 会自动转换)');
}

// 主函数
async function main() {
  console.log('🎨 开始生成应用图标...\n');
  
  const hasSharp = await checkSharp();
  if (!hasSharp) {
    console.log('\n请先安装依赖后重试');
    process.exit(1);
  }
  
  try {
    const svgBuffer = readSvg();
    await generateIco(svgBuffer);
    
    console.log('\n✅ 图标生成完成!');
    console.log('图标位置: build/');
    console.log('\n下一步: npm run build:electron');
  } catch (error) {
    console.error('❌ 生成失败:', error.message);
    process.exit(1);
  }
}

main();
