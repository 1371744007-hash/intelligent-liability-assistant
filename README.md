# 智能判责助手

一个仅使用模拟数据的中文网页 Demo。浏览器端负责录入和预览材料，Node.js 服务端可调用阿里云百炼或 OpenAI 分析文字与图片，并对结构化结果做业务一致性校验。

## 如何启动

1. 安装 Node.js 18 或更高版本（推荐当前 LTS）。
2. 在本目录打开终端，首次配置时执行：

   ```bash
   cp .env.example .env
   ```

3. 默认使用阿里云百炼。打开 `.env`，填写 `DASHSCOPE_API_KEY`；默认模型为支持图片输入的 `qwen-vl-max`。**不要把密钥发到聊天中，也不要提交 `.env`。** 如需切回 OpenAI，可将 `AI_PROVIDER` 改为 `openai` 并填写对应配置。
4. 启动：

   ```bash
   npm start
   ```

5. 浏览器打开 [http://localhost:3000](http://localhost:3000)。停止服务时在终端按 `Control + C`。

如果本机需要通过代理访问 OpenAI API，可在 `.env` 中配置 `HTTPS_PROXY=http://127.0.0.1:端口`。本项目的启动器会让 Node.js 服务读取该代理；本地网页地址通过 `NO_PROXY` 保持直连。

项目没有第三方 npm 依赖，因此无需执行 `npm install`。没有 API 密钥时也能使用订单、案例、图片预览和规则查看；点击分析会明确提示未配置，不会伪造结果。

## 使用方式

从“演示案例”选择 R001–R008 场景，或在“模拟订单”中选择“自定义报案”录入商品和验货记录；按需上传 JPG/PNG 并给每张图片标注类型，随后点击“开始智能分析”。边界案例只用于测试，不在页面下拉框展示。结果会展示责任、赔付、追偿、规则编号、图片现象、材料问题和人工复核原因。

## 测试

```bash
npm test
```

自动化测试不调用模型 API，只验证页面、数据隔离和结构化业务校验，因此不计入判责准确率。真实模型评测需配置 API 后逐条运行 `docs/TEST_CASES.md` 中案例并如实记录。

## Render 免费部署

仓库根目录提供了 `render.yaml`。在 Render 中选择 **New Blueprint Instance**，连接本仓库并确认免费方案；创建时只需填写 `DASHSCOPE_API_KEY`。密钥由 Render 作为服务端环境变量保存，不会出现在网页或 Git 仓库中。免费服务闲置后可能休眠，首次重新打开需要等待一段时间。

[![Deploy to Render](https://render.com/images/deploy-to-render-button.svg)](https://render.com/deploy?repo=https%3A%2F%2Fgithub.com%2F1371744007-hash%2Fintelligent-liability-assistant)

## 文件导航

- `docs/REQUIREMENTS.md`：范围与安全要求
- `docs/RULES.md`：模拟业务规则
- `docs/TEST_CASES.md`：案例预期与理由
- `data/`：模拟订单和案例
- `lib/openai.js`：多模态请求与结构化输出
- `lib/rules.js`：结果校验
- `public/`：网页
- `render.yaml`：Render 免费部署配置
- `STATUS.md`：当前进度和测试实况
