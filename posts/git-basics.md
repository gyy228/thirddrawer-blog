---
title: Git 使用教程
date: 2026-10-27
tags: [工具, 编程]
summary: 够用就好的 Git 速查：日常三步、看历史、回退、冲突，以及本站实际用到的场景。
pinned: true
---

这篇是写给自己的速查。Git 的命令有几百个，但**日常真正用到的就十几个**。

下面按「会不会用到」排序，前面的必须会。

## 一、日常三步

改完东西，走完这三步就提交了：

```bash
git add -A                    # 把所有改动放进暂存区
git commit -m "改了点什么"     # 记一笔
git push                      # 推到远端
```

`-m` 后面那句话是写给未来的自己看的。**别写「更新」「修改」**，三个月后你完全不知道改了什么。

### add 的几种写法

```bash
git add file.md        # 只加这一个文件
git add posts/         # 加整个目录
git add -A             # 全部改动（含删除）
git add -p             # 逐块确认，改动多时很有用
```

## 二、先看再提交

提交前养成看一眼的习惯：

```bash
git status             # 哪些文件改了
git diff               # 具体改了什么
git diff --staged      # 已经 add 进去的改了什么
```

`git diff` 是**提交前最后一道保险**。我见过太多次把不该提交的东西（密钥、临时文件、node_modules）一起推上去。

## 三、看历史

```bash
git log --oneline                 # 一行一条，看最近提交
git log --oneline -10             # 只看最近 10 条
git log --oneline -- posts/       # 只看某个目录的提交
git show <提交号>                 # 看某次提交改了什么
git blame 文件                     # 每一行是谁、哪次提交改的
```

提交号那一长串十六进制（如 `a1b2c3d`）不用记全，**前七位就够**。

## 四、撤销

这是最容易搞混的部分。按「改动到哪一步了」区分：

| 你的改动在哪 | 用什么 | 结果 |
|---|---|---|
| 改了但没 add | `git restore 文件` | 丢掉改动，回到上次提交 |
| add 了但没 commit | `git restore --staged 文件` | 退回未暂存（改动还在） |
| commit 了但没 push | `git reset --soft HEAD~1` | 撤销提交，改动留在暂存区 |
| 已经 push 了 | `git revert <提交号>` | **新增**一次反向提交 |

最后一行要特别记住：**已经推上去的提交不要用 `reset`**。

`reset` 是改写历史，别人拉下来的和你对不上；`revert` 是往前加一笔「把那次改动撤回来」，历史完整，谁都不会乱。

## 五、分支

```bash
git switch -c new-feature    # 新建并切过去
git switch main              # 切回主分支
git branch                   # 看本地分支
git merge new-feature        # 把那个分支合进来
```

个人项目里，分支最大的用处不是协作，是**试错**——想大改但不确定，就开个分支折腾，不行直接删掉，主分支一点没脏。

## 六、远程

```bash
git clone <地址>       # 把仓库拉下来
git pull               # 拉最新（= fetch + merge）
git push               # 推上去
git remote -v          # 看远程地址
```

`pull` 和 `fetch` 的区别：`fetch` 只下载不合并，`pull` 下载完直接合并进来。

**不确定远程有什么变化时，先 `fetch` 再 `diff`**，看清楚再决定合不合。

## 七、冲突

两个人改了同一个文件的同一行，合并时就会冲突。文件里会出现：

```
<<<<<<< HEAD
你这边的版本
=======
那边的版本
>>>>>>> other-branch
```

处理方式：**手动改成人想要的样子，删掉那些 `<<<<` `>>>>` 标记，然后 add + commit。**

关键是别慌，也别乱按「取我们的」——冲突说明两边都改了，值得看一眼再决定。

## 八、`.gitignore`

有些东西不该进仓库：

```gitignore
node_modules/
.next/
out/
.env
.dev.vars
```

**密钥一定不能提交。** 一旦推上去，就算后面删掉，历史里还在，得用 `git filter-repo` 彻底清理，很麻烦。

所以第一次提交前就写好 `.gitignore`。

## 九、本站实际用到的几个场景

### 改文章

```bash
git add -A && git commit -m "content: 更新文章" && git push
```

推送后 GitHub Actions 自动构建，约一分钟线上可见。

### 网络不稳导致 push 失败

国内直连 GitHub 经常重置。要么挂代理，要么多试几次：

```bash
git -c http.proxy=http://127.0.0.1:7897 push origin main
```

### 确认线上和本地一致

```bash
git fetch origin main
git rev-parse HEAD            # 本地最新提交
git rev-parse origin/main     # 远端最新提交
```

两个一样才算同步完。

> **一个真实的坑**：有次我用 `fetch` 查远端，走代理拿到了缓存数据，看到的是旧提交，以此判断「线上没更新」——判断错了。后来用 GitHub API 才看到已经更新。
>
> 查远端状态时，别只信一条命令。

## 十、记不住怎么办

```bash
git help -a          # 所有命令
git <命令> --help    # 某个命令的详细说明
```

说实话，我也记不住全部。**把上面这些用熟，日常开发就够了**，剩下的用到再查。