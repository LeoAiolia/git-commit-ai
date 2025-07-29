// 测试命令是否存在的脚本
// 可以在VS Code的调试控制台中运行

// 尝试列出所有可用命令
vscode.commands.getCommands().then(commands => {
    console.log('可用命令列表:');
    // 过滤出包含'git-commit-ai'的命令
    const gitCommitCommands = commands.filter(cmd => cmd.includes('git-commit-ai'));
    if (gitCommitCommands.length > 0) {
        console.log('找到相关命令:');
        gitCommitCommands.forEach(cmd => console.log(`  - ${cmd}`));
    } else {
        console.log('未找到相关命令');
        // 显示所有命令以便排查
        console.log('所有命令:');
        commands.slice(0, 50).forEach(cmd => console.log(`  - ${cmd}`));
        console.log(`... 以及其他 ${commands.length - 50} 个命令`);
    }
});

// 检查VS Code版本
console.log(`VS Code版本: ${vscode.version}`);

// 检查扩展是否激活
console.log('检查扩展是否激活...');
// 这个变量应该在扩展激活时设置
if (typeof window !== 'undefined' && window.extensionActivated) {
    console.log('扩展已激活');
} else {
    console.log('扩展未激活或未设置激活标志');
}