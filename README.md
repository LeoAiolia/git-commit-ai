# git-commit-ai README

基于AI的Git提交信息生成器，帮助开发者快速生成符合Conventional Commits规范的提交消息。

## 功能特点

- 🤖 支持多种AI模型（豆包、DeepSeek、通义千问）
- ✨ 自动分析Git暂存区变更内容
- 📝 生成符合Conventional Commits规范的提交消息
- 📋 一键复制结果到剪贴板

## 安装要求

- Node.js v14.0.0 或更高版本
- VS Code v1.102.0 或更高版本
- 有效的AI模型API密钥

## 扩展配置

该扩展提供以下配置选项：

* `gitCommitAI.apiKey`: AI模型API密钥（必填）
* `gitCommitAI.model`: 选择AI模型（doubao/deepseek/tongyi，默认：doubao）
* `gitCommitAI.apiEndpoint`: 自定义API端点（可选）

## 使用方法

1. 在VS Code中打开命令面板（Ctrl+Shift+P 或 Cmd+Shift+P）
2. 输入命令：`生成AI Commit消息`
3. 确保已暂存Git变更
4. 生成的提交消息将自动复制到剪贴板

## 已知问题

- 目前不支持自定义提交消息模板
- 某些复杂变更可能生成不够准确的提交类型

## 版本历史

### 0.0.1

- 初始版本发布
- 支持豆包、DeepSeek和通义千问AI模型
- 基础的提交消息生成功能

## 扩展指南

该扩展遵循VS Code扩展开发最佳实践，代码结构清晰，便于维护和扩展。

**使用愉快！**
