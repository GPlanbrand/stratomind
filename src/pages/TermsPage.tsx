import React from 'react';
import { Link } from 'react-router-dom';

const TermsPage: React.FC = () => {
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
        <h1 className="text-2xl font-bold text-gray-900 mb-8">服务条款</h1>
        
        <div className="prose prose-gray max-w-none space-y-8">
          <section>
            <h2 className="text-lg font-semibold text-gray-900 mb-3">1. 服务内容</h2>
            <p className="text-gray-600 leading-relaxed">
              AI 创意工作台（以下简称"我们"）致力于为用户提供专业的品牌策划与创意生成服务。通过我们的平台，用户可以创建和管理品牌策划项目，获取智能品牌分析、创意策略生成等增值服务。
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-gray-900 mb-3">2. 用户责任</h2>
            <p className="text-gray-600 leading-relaxed mb-3">
              用户在使用我们的服务时，应遵守以下规定：
            </p>
            <ul className="list-disc list-inside text-gray-600 space-y-2">
              <li>用户提供真实、准确的注册信息</li>
              <li>妥善保管账号和密码，因保管不当造成的后果由用户自行承担</li>
              <li>不得利用服务从事任何违法活动</li>
              <li>不得侵犯他人知识产权或其他合法权益</li>
              <li>遵守当地法律法规</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-gray-900 mb-3">3. 知识产权</h2>
            <p className="text-gray-600 leading-relaxed">
              我们平台上生成的创意内容，版权归用户所有。我们有权对用户使用服务的情况进行统计分析，用于改进服务质量。用户保证其上传或输入的内容不侵犯任何第三方的知识产权或其他权利。
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-gray-900 mb-3">4. 服务变更与终止</h2>
            <p className="text-gray-600 leading-relaxed">
              我们保留随时修改或中断服务的权利。如需终止服务，我们会提前通知用户。因服务变更或终止造成的损失，我们在法律允许的范围内承担相应责任，但不承担任何间接或衍生的损失。
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-gray-900 mb-3">5. 积分与付费</h2>
            <p className="text-gray-600 leading-relaxed">
              用户可通过注册、签到等方式获取积分。积分不可兑换现金，不可转让。新用户注册赠送600积分，每日签到赠送10积分。我们保留调整积分规则的权利。
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-gray-900 mb-3">6. 免责声明</h2>
            <p className="text-gray-600 leading-relaxed">
              我们不对服务提供任何明示或暗示的保证。用户理解并同意，使用服务产生的风险由用户自行承担。因不可抗力导致的服务中断，我们不承担责任。
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-gray-900 mb-3">7. 协议修改</h2>
            <p className="text-gray-600 leading-relaxed">
              我们有权随时修改本协议。修改后的协议一经公布即生效。如用户继续使用服务，视为接受修改后的协议。
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-gray-900 mb-3">8. 联系我们</h2>
            <p className="text-gray-600 leading-relaxed">
              如您对本协议有任何疑问，请联系我们的客服团队。
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

export default TermsPage;
