import React from 'react';
import { Link } from 'react-router-dom';

const PrivacyPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-white">
      {/* 顶部导航 */}
      <nav className="bg-white border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-3xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link to="/" className="flex items-center gap-2">
              <img src="/logo.svg" alt="AI 创意工作台" className="h-8 w-auto" />
              <span className="font-medium text-gray-900">AI 创意工作台</span>
            </Link>
            <Link to="/" className="text-sm text-gray-500 hover:text-gray-700">
              返回登录
            </Link>
          </div>
        </div>
      </nav>

      {/* 内容 */}
      <main className="max-w-3xl mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-8">隐私政策</h1>
        
        <div className="prose prose-gray max-w-none space-y-8">
          <section>
            <h2 className="text-lg font-semibold text-gray-900 mb-3">1. 信息收集</h2>
            <p className="text-gray-600 leading-relaxed mb-3">
              我们收集以下类型的信息：
            </p>
            <ul className="list-disc list-inside text-gray-600 space-y-2">
              <li><strong>账户信息</strong>：用户名、邮箱地址、手机号码</li>
              <li><strong>使用信息</strong>：您创建的项目、生成的创意内容、使用偏好</li>
              <li><strong>设备信息</strong>：浏览器类型、操作系统、IP地址</li>
              <li><strong>日志信息</strong>：访问时间、页面浏览、功能使用</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-gray-900 mb-3">2. 信息使用</h2>
            <p className="text-gray-600 leading-relaxed mb-3">
              我们使用收集的信息用于：
            </p>
            <ul className="list-disc list-inside text-gray-600 space-y-2">
              <li>提供、维护和改进我们的服务</li>
              <li>处理您的请求和交易</li>
              <li>发送服务相关通知</li>
              <li>分析和优化用户体验</li>
              <li>预防和调查欺诈或滥用行为</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-gray-900 mb-3">3. 信息共享</h2>
            <p className="text-gray-600 leading-relaxed">
              我们不会出售您的个人信息。我们可能在以下情况下共享信息：获得您的同意、法律要求、合并或收购、保护我们的权利或安全。
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-gray-900 mb-3">4. 信息保护</h2>
            <p className="text-gray-600 leading-relaxed">
              我们采用行业标准的安全措施保护您的信息，包括数据加密、访问控制、安全审计等。但互联网传输存在固有风险，我们无法保证100%的安全。
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-gray-900 mb-3">5. Cookie政策</h2>
            <p className="text-gray-600 leading-relaxed mb-3">
              我们使用Cookie和类似技术：
            </p>
            <ul className="list-disc list-inside text-gray-600 space-y-2">
              <li><strong>必要Cookie</strong>：确保服务正常运行</li>
              <li><strong>功能Cookie</strong>：记住您的偏好设置</li>
              <li><strong>分析Cookie</strong>：了解用户如何使用的服务</li>
            </ul>
            <p className="text-gray-600 leading-relaxed mt-3">
              您可以通过浏览器设置拒绝Cookie，但这可能影响部分功能。
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-gray-900 mb-3">6. 用户权利</h2>
            <p className="text-gray-600 leading-relaxed mb-3">
              您对您的个人信息享有以下权利：
            </p>
            <ul className="list-disc list-inside text-gray-600 space-y-2">
              <li>访问您的个人信息</li>
              <li>更正不准确的信息</li>
              <li>删除您的个人信息</li>
              <li>导出您的数据</li>
              <li>撤回同意</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-gray-900 mb-3">7. 儿童隐私</h2>
            <p className="text-gray-600 leading-relaxed">
              我们的服务不面向未满18岁的未成年人。如果您是未成年人，请在监护人陪同下使用我们的服务。
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-gray-900 mb-3">8. 政策更新</h2>
            <p className="text-gray-600 leading-relaxed">
              我们可能不时更新本隐私政策。更新将在本页公布。建议您定期查阅以了解最新信息。
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-gray-900 mb-3">9. 联系我们</h2>
            <p className="text-gray-600 leading-relaxed">
              如您对本隐私政策有任何疑问，请联系我们的客服团队。
            </p>
          </section>

          <p className="text-sm text-gray-400 pt-8 border-t border-gray-100">
            最后更新日期：2024年1月
          </p>
        </div>
      </main>
    </div>
  );
};

export default PrivacyPage;
