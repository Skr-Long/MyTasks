---
name: "git-worktree-project-manager"
description: "使用 git worktree 管理多项目工作流程，支持在同一仓库的不同分支上并发执行多个项目。当需要创建/切换/删除项目分支或管理 worktree 时调用。"
---

# Git Worktree 多项目管理器

这个 skill 帮助你使用 git worktree 功能在同一个仓库中管理多个并行项目。每个项目使用独立的分支和文件夹，可以同时进行多个任务而互不干扰。

## 核心概念

- **主仓库**: 当前所在的主目录 (master/main 分支)
- **Worktree**: 每个项目对应一个独立的文件夹，链接到特定的分支
- **分支隔离**: 每个项目在独立分支上开发，互不影响
- **并发执行**: 可以同时打开多个项目文件夹，并行工作

## 使用流程

### 1. 创建新项目

当开始一个新的代码标注任务时：

```bash
# 格式: git worktree add ../<项目文件夹名> <分支名>
git worktree add ../project-001 feature/project-001
```

这会：
- 创建一个新文件夹 `../project-001`
- 自动创建并切换到分支 `feature/project-001`
- 两个文件夹共享同一个 .git 仓库

### 2. 查看所有项目

```bash
git worktree list
```

显示所有 worktree 及其对应的分支和提交。

### 3. 切换到另一个项目

直接进入对应的文件夹即可：

```bash
cd ../project-002
# 开始在 project-002 上工作
```

### 4. 完成一个项目后清理

```bash
# 1. 先提交该项目的所有更改
cd ../project-001
git add .
git commit -m "完成项目 001 标注"
git push origin feature/project-001

# 2. 删除 worktree
cd ../主仓库目录
git worktree remove ../project-001

# 3. (可选) 删除分支
git branch -d feature/project-001
git push origin --delete feature/project-001
```

## 常用命令速查

| 命令 | 说明 |
|------|------|
| `git worktree add <路径> <分支名>` | 创建新的 worktree |
| `git worktree list` | 列出所有 worktree |
| `git worktree remove <路径>` | 删除 worktree |
| `git worktree move <旧路径> <新路径>` | 移动 worktree |
| `git worktree prune` | 清理已删除的 worktree 引用 |

## 最佳实践

1. **命名规范**: 
   - 分支名: `feature/project-XXX` 或 `task/标注项目编号`
   - 文件夹名: `project-XXX` 或与任务同名

2. **文件夹组织**:
   ```
   父目录/
   ├── 主仓库/          # master 分支，用于管理
   ├── project-001/    # 项目 001 的 worktree
   ├── project-002/    # 项目 002 的 worktree
   └── project-003/    # 项目 003 的 worktree
   ```

3. **提交策略**:
   - 每个项目独立提交
   - 完成后可合并到 master 或保留分支归档

4. **快速切换**:
   - 每个项目文件夹是独立的，可以同时在 VS Code 中打开多个窗口
   - 无需 git checkout，直接切换文件夹即可

## 常见问题

**Q: worktree 和普通 clone 有什么区别？**
A: worktree 共享同一个 .git 目录，节省存储空间，所有分支共享，操作更高效。

**Q: 可以在不同 worktree 中同时进行 git 操作吗？**
A: 可以，但避免同时操作同一个分支。每个 worktree 应该对应不同的分支。

**Q: 删除 worktree 会丢失代码吗？**
A: 不会，只要你已经提交并推送到远程，代码会保存在分支中。
