// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';
import simpleGit from 'simple-git';
import axios from 'axios';

// 模型类型定义
type AIModel = 'doubao' | 'deepseek' | 'tongyi';

// AI模型配置接口
interface ModelConfig {
	apiKey: string;
	apiEndpoint: string;
}

// This method is called when your extension is activated
// Your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {

	// Use the console to output diagnostic information (console.log) and errors (console.error)
	// This line of code will only be executed once when your extension is activated
	console.log('Congratulations, your extension "git-commit-ai" is now active!');
	console.log('Registering command: git-commit-ai.generateCommitMessage');

	vscode.window.showInformationMessage('🔥 Git Commit AI 插件已激活');

	// The command has been defined in the package.json file
	// Now provide the implementation of the command with registerCommand
	// The commandId parameter must match the command field in package.json
	const disposable = vscode.commands.registerCommand('git-commit-ai.generateCommitMessage', async () => {
		// 获取当前工作区路径
		const workspaceFolder = vscode.workspace.workspaceFolders?.[0]?.uri.fsPath;
		if (!workspaceFolder) {
			vscode.window.showErrorMessage('请打开一个工作区文件夹');
			return;
		}

		// 初始化Git并检查仓库
	let diff: string | undefined;
	try {
		const git = simpleGit(workspaceFolder);
		// 检查是否是Git仓库
		await git.status();

		// 获取暂存区变更
		diff = await git.diff(['--staged']);
			if (!diff) {
				vscode.window.showInformationMessage('没有暂存的变更，请先暂存文件');
				return;
			}
		} catch (error) {
			vscode.window.showErrorMessage(`Git操作失败: ${error instanceof Error ? error.message : String(error)}`);
			return;
		}

		// 获取配置
		const config = vscode.workspace.getConfiguration('gitCommitAI');
		const apiKey = config.get<string>('apiKey');
		const model = config.get<string>('model');
		const apiEndpoint = config.get<string>('apiEndpoint');

		if (!apiKey || !apiEndpoint) {
			vscode.window.showErrorMessage('请配置API密钥和端点');
			return;
		}

		// 调用AI生成commit消息
		try {
			// 获取模型配置
			const modelConfig = getModelConfig(model as AIModel, apiKey, apiEndpoint);
			if (!modelConfig) {
				vscode.window.showErrorMessage('不支持的AI模型，请检查配置');
				return;
			}

			// 构建提示词
			const prompt = createPrompt(diff);

			// 根据模型调用不同的API
			let commitMessage: string;
			switch (model as AIModel) {
				case 'doubao':
					commitMessage = await callDoubaoAPI(modelConfig, prompt);
					break;
				case 'deepseek':
					commitMessage = await callDeepSeekAPI(modelConfig, prompt);
					break;
				case 'tongyi':
					commitMessage = await callTongyiAPI(modelConfig, prompt);
					break;
				default:
					vscode.window.showErrorMessage('不支持的AI模型');
					return;
			}

			// 显示并复制到剪贴板
			if (commitMessage) {
				vscode.window.showInformationMessage(`生成的Commit消息: ${commitMessage}`);
				await vscode.env.clipboard.writeText(commitMessage);
				vscode.window.showInformationMessage('Commit消息已复制到剪贴板');
			}
		} catch (error) {
			console.error('AI调用错误:', error);
			vscode.window.showErrorMessage(`调用AI模型失败: ${error instanceof Error ? error.message : String(error)}`);
		}
	});

	context.subscriptions.push(disposable);
}

// This method is called when your extension is deactivated
export function deactivate() { }

// 获取模型配置
function getModelConfig(model: AIModel, apiKey: string, customEndpoint?: string): ModelConfig | undefined {
	const endpoints: Record<AIModel, string> = {
		doubao: 'https://api.doubao.com/v1/chat/completions',
		deepseek: 'https://api.deepseek.com/v1/chat/completions',
		tongyi: 'https://dashscope.aliyuncs.com/api/v1/services/aigc/text-generation/generation'
	};

	return {
		apiKey,
		apiEndpoint: customEndpoint || endpoints[model]
	};
}

// 创建提示词模板
function createPrompt(diff: string): string {
	return `请根据以下Git变更内容生成一个符合Conventional Commits规范的提交消息。

变更内容:
${diff}

提交消息要求:
1. 简洁明了，不超过50个字符
2. 使用英文动词开头（如feat, fix, docs, style, refactor, test, chore）
3. 概括主要变更内容
4. 不需要额外解释`;
}

// 调用豆包API
async function callDoubaoAPI(config: ModelConfig, prompt: string): Promise<string> {
	const response = await axios.post(config.apiEndpoint, {
		model: 'ernie-bot',
		messages: [{
			role: 'user',
			content: prompt
		}]
	}, {
		headers: {
			'Content-Type': 'application/json',
			'Authorization': `Bearer ${config.apiKey}`
		}
	});

	return response.data.result || response.data.choices[0]?.message?.content || '';
}

// 调用DeepSeek API
async function callDeepSeekAPI(config: ModelConfig, prompt: string): Promise<string> {
	const response = await axios.post(config.apiEndpoint, {
		model: 'deepseek-chat',
		messages: [{
			role: 'user',
			content: prompt
		}]
	}, {
		headers: {
			'Content-Type': 'application/json',
			'Authorization': `Bearer ${config.apiKey}`
		}
	});

	return response.data.choices[0]?.message?.content || '';
}

// 调用通义千问API
async function callTongyiAPI(config: ModelConfig, prompt: string): Promise<string> {
	const response = await axios.post(config.apiEndpoint, {
		model: 'qwen-plus',
		input: {
			prompt: prompt
		},
		parameters: {
			max_new_tokens: 100,
			temperature: 0.7
		}
	}, {
		headers: {
			'Content-Type': 'application/json',
			'Authorization': `Bearer ${config.apiKey}`
		}
	});

	return response.data.output?.text || '';
}