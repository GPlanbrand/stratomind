/**
 * 数据库初始化接口
 * 访问此接口自动创建所有数据表
 * GET /api/admin/init-db
 */

import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export const config = {
  runtime: 'nodejs' // 使用nodejs运行时以支持Prisma
}

export default async function handler(req: Request) {
  // CORS
  if (req.method === 'OPTIONS') {
    return new Response(null, {
      status: 204,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type'
      }
    })
  }

  if (req.method !== 'GET') {
    return new Response(
      JSON.stringify({ success: false, message: '只支持GET请求' }),
      { status: 405, headers: { 'Content-Type': 'application/json' } }
    )
  }

  try {
    // 执行原始SQL创建表（兼容Prisma push的效果）
    const result = await prisma.$executeRawUnsafe(`
      -- 创建用户表
      CREATE TABLE IF NOT EXISTS "users" (
        "id" TEXT NOT NULL,
        "username" VARCHAR(50) NOT NULL,
        "email" VARCHAR(100) NOT NULL,
        "password_hash" VARCHAR(255) NOT NULL,
        "avatar" VARCHAR(500),
        "member_level" VARCHAR(20) NOT NULL DEFAULT 'normal',
        "points" INTEGER NOT NULL DEFAULT 0,
        "member_expires_at" TIMESTAMP(3),
        "sign_in_days" INTEGER NOT NULL DEFAULT 0,
        "last_sign_in_date" DATE,
        "invite_code" VARCHAR(20) NOT NULL,
        "invited_by" TEXT,
        "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "last_login_at" TIMESTAMP(3),
        "deleted_at" TIMESTAMP(3),
        CONSTRAINT "users_pkey" PRIMARY KEY ("id")
      );
      
      -- 创建项目表
      CREATE TABLE IF NOT EXISTS "projects" (
        "id" TEXT NOT NULL,
        "user_id" TEXT NOT NULL,
        "name" VARCHAR(200) NOT NULL,
        "client_name" VARCHAR(200) NOT NULL,
        "status" VARCHAR(20) NOT NULL DEFAULT 'active',
        "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "updated_at" TIMESTAMP(3) NOT NULL,
        "deleted_at" TIMESTAMP(3),
        CONSTRAINT "projects_pkey" PRIMARY KEY ("id")
      );
      
      -- 创建项目步骤表
      CREATE TABLE IF NOT EXISTS "project_steps" (
        "id" TEXT NOT NULL,
        "project_id" TEXT NOT NULL,
        "client_info" JSONB,
        "requirements" JSONB,
        "competitors" JSONB,
        "brief" JSONB,
        "strategy" JSONB,
        "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "updated_at" TIMESTAMP(3) NOT NULL,
        CONSTRAINT "project_steps_pkey" PRIMARY KEY ("id")
      );
      
      -- 创建积分流水表
      CREATE TABLE IF NOT EXISTS "points_transactions" (
        "id" TEXT NOT NULL,
        "user_id" TEXT NOT NULL,
        "type" VARCHAR(20) NOT NULL,
        "amount" INTEGER NOT NULL,
        "balance_after" INTEGER NOT NULL,
        "source" VARCHAR(50) NOT NULL,
        "description" TEXT,
        "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        CONSTRAINT "points_transactions_pkey" PRIMARY KEY ("id")
      );
      
      -- 创建AI日志表
      CREATE TABLE IF NOT EXISTS "ai_usage_logs" (
        "id" TEXT NOT NULL,
        "user_id" TEXT NOT NULL,
        "project_id" TEXT,
        "feature" VARCHAR(50) NOT NULL,
        "input_data" JSONB,
        "output_data" JSONB,
        "model_used" VARCHAR(100),
        "tokens_used" INTEGER,
        "points_cost" INTEGER NOT NULL DEFAULT 0,
        "status" VARCHAR(20) NOT NULL DEFAULT 'success',
        "error_message" TEXT,
        "duration_ms" INTEGER,
        "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        CONSTRAINT "ai_usage_logs_pkey" PRIMARY KEY ("id")
      );
      
      -- 创建唯一索引
      CREATE UNIQUE INDEX IF NOT EXISTS "users_username_key" ON "users"("username");
      CREATE UNIQUE INDEX IF NOT EXISTS "users_email_key" ON "users"("email");
      CREATE UNIQUE INDEX IF NOT EXISTS "users_invite_code_key" ON "users"("invite_code");
      CREATE UNIQUE INDEX IF NOT EXISTS "project_steps_project_id_key" ON "project_steps"("project_id");
      
      -- 创建普通索引
      CREATE INDEX IF NOT EXISTS "projects_user_id_idx" ON "projects"("user_id");
      CREATE INDEX IF NOT EXISTS "points_transactions_user_id_idx" ON "points_transactions"("user_id");
      CREATE INDEX IF NOT EXISTS "ai_usage_logs_user_id_idx" ON "ai_usage_logs"("user_id");
      CREATE INDEX IF NOT EXISTS "ai_usage_logs_project_id_idx" ON "ai_usage_logs"("project_id");
      
      -- 添加外键约束
      ALTER TABLE "projects" ADD CONSTRAINT "projects_user_id_fkey" 
        FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
      ALTER TABLE "project_steps" ADD CONSTRAINT "project_steps_project_id_fkey" 
        FOREIGN KEY ("project_id") REFERENCES "projects"("id") ON DELETE CASCADE ON UPDATE CASCADE;
      ALTER TABLE "points_transactions" ADD CONSTRAINT "points_transactions_user_id_fkey" 
        FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
      ALTER TABLE "ai_usage_logs" ADD CONSTRAINT "ai_usage_logs_user_id_fkey" 
        FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
      ALTER TABLE "ai_usage_logs" ADD CONSTRAINT "ai_usage_logs_project_id_fkey" 
        FOREIGN KEY ("project_id") REFERENCES "projects"("id") ON DELETE SET NULL ON UPDATE CASCADE;
      
      -- 创建资产库表
      CREATE TABLE IF NOT EXISTS "assets" (
        "id" TEXT NOT NULL,
        "user_id" TEXT NOT NULL,
        "project_id" TEXT,
        "name" VARCHAR(200) NOT NULL,
        "type" VARCHAR(20) NOT NULL,
        "file_url" VARCHAR(500) NOT NULL,
        "file_size" INTEGER NOT NULL DEFAULT 0,
        "tags" TEXT[] DEFAULT ARRAY[]::TEXT[],
        "description" TEXT,
        "download_count" INTEGER NOT NULL DEFAULT 0,
        "is_public" BOOLEAN NOT NULL DEFAULT false,
        "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "updated_at" TIMESTAMP(3) NOT NULL,
        "deleted_at" TIMESTAMP(3),
        CONSTRAINT "assets_pkey" PRIMARY KEY ("id")
      );
      
      -- 创建知识库表
      CREATE TABLE IF NOT EXISTS "knowledge" (
        "id" TEXT NOT NULL,
        "user_id" TEXT NOT NULL,
        "title" VARCHAR(200) NOT NULL,
        "content" TEXT NOT NULL,
        "category" VARCHAR(20) NOT NULL,
        "tags" TEXT[] DEFAULT ARRAY[]::TEXT[],
        "view_count" INTEGER NOT NULL DEFAULT 0,
        "is_public" BOOLEAN NOT NULL DEFAULT false,
        "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "updated_at" TIMESTAMP(3) NOT NULL,
        "deleted_at" TIMESTAMP(3),
        CONSTRAINT "knowledge_pkey" PRIMARY KEY ("id")
      );
      
      -- 创建额外索引
      CREATE INDEX IF NOT EXISTS "assets_user_id_idx" ON "assets"("user_id");
      CREATE INDEX IF NOT EXISTS "assets_project_id_idx" ON "assets"("project_id");
      CREATE INDEX IF NOT EXISTS "knowledge_user_id_idx" ON "knowledge"("user_id");
      CREATE INDEX IF NOT EXISTS "knowledge_category_idx" ON "knowledge"("category");
      
      -- 添加外键约束
      ALTER TABLE "assets" ADD CONSTRAINT "assets_user_id_fkey" 
        FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
      ALTER TABLE "knowledge" ADD CONSTRAINT "knowledge_user_id_fkey" 
        FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
    `)

    return new Response(
      JSON.stringify({
        success: true,
        message: '数据库初始化成功！',
        tables: ['users', 'projects', 'project_steps', 'points_transactions', 'ai_usage_logs', 'assets', 'knowledge'],
        timestamp: new Date().toISOString()
      }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    )

  } catch (error: any) {
    console.error('数据库初始化错误:', error)
    
    // 如果表已存在，返回成功
    if (error.message?.includes('already exists') || error.message?.includes('duplicate')) {
      return new Response(
        JSON.stringify({
          success: true,
          message: '数据库表已存在，无需重复初始化',
          timestamp: new Date().toISOString()
        }),
        { status: 200, headers: { 'Content-Type': 'application/json' } }
      )
    }

    return new Response(
      JSON.stringify({
        success: false,
        message: '数据库初始化失败',
        error: error.message
      }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    )
  } finally {
    await prisma.$disconnect()
  }
}
