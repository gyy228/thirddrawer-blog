/**
 * GitHub API 客户端（纯浏览器）。
 *
 * 这个控制台没有服务端，所有读写都直接打到 GitHub API，
 * 由 GitHub 在服务端校验 Token——所以「只有你能进」是真的，
 * 不是前端那套按 F12 就能绕过的假密码。
 *
 * 已实测：api.github.com 在国内可直连，且返回
 * Access-Control-Allow-Origin: *，允许浏览器带 Authorization 头调用。
 */

const API = "https://api.github.com";

export interface RepoConfig {
  owner: string;
  repo: string;
  branch: string;
}

export const DEFAULT_REPO: RepoConfig = {
  owner: "gyy228",
  repo: "thirddrawer-blog",
  branch: "main",
};

export class GitHubError extends Error {
  status: number;

  constructor(message: string, status: number) {
    super(message);
    this.name = "GitHubError";
    this.status = status;
  }
}

/* ── base64（浏览器没有 Buffer，且要正确处理中文）───── */

function encodeBase64(text: string): string {
  const bytes = new TextEncoder().encode(text);
  let binary = "";
  for (const byte of bytes) binary += String.fromCharCode(byte);
  return btoa(binary);
}

function decodeBase64(base64: string): string {
  // Contents API 返回的 base64 带换行
  const clean = base64.replace(/\s/g, "");
  const binary = atob(clean);
  const bytes = Uint8Array.from(binary, (c) => c.charCodeAt(0));
  return new TextDecoder().decode(bytes);
}

/* ── 请求封装 ─────────────────────────────────── */

async function request<T>(
  token: string,
  path: string,
  init: RequestInit = {},
): Promise<T> {
  const res = await fetch(`${API}${path}`, {
    ...init,
    headers: {
      Accept: "application/vnd.github+json",
      Authorization: `Bearer ${token}`,
      "X-GitHub-Api-Version": "2022-11-28",
      ...(init.body ? { "Content-Type": "application/json" } : {}),
      ...(init.headers ?? {}),
    },
  });

  if (res.status === 401) {
    throw new GitHubError("Token 无效或已过期，请重新填写。", 401);
  }
  if (res.status === 403) {
    const left = res.headers.get("x-ratelimit-remaining");
    if (left === "0") {
      const reset = Number(res.headers.get("x-ratelimit-reset") ?? 0) * 1000;
      const when = reset ? new Date(reset).toLocaleTimeString("zh-CN") : "稍后";
      throw new GitHubError(`GitHub 接口调用次数用完了，${when} 之后恢复。`, 403);
    }
    throw new GitHubError("没有权限执行这个操作，检查 Token 的仓库范围和权限。", 403);
  }
  if (res.status === 404) {
    throw new GitHubError("仓库或文件不存在（也可能是 Token 没有这个仓库的权限）。", 404);
  }

  if (!res.ok) {
    const detail = await res.text().catch(() => "");
    throw new GitHubError(
      `GitHub 返回 ${res.status}：${detail.slice(0, 200)}`,
      res.status,
    );
  }

  return (await res.json()) as T;
}

/* ── 类型 ─────────────────────────────────────── */

export interface RepoInfo {
  full_name: string;
  default_branch: string;
  private: boolean;
  permissions?: { push?: boolean };
}

export interface FileEntry {
  name: string;
  path: string;
  sha: string;
  size: number;
  type: "file" | "dir";
}

export interface FileContent {
  path: string;
  sha: string;
  content: string;
  size: number;
}

/* ── 具体操作 ─────────────────────────────────── */

/** 校验 Token 并确认对仓库有写权限 */
export async function verifyAccess(
  token: string,
  cfg: RepoConfig = DEFAULT_REPO,
): Promise<RepoInfo> {
  const info = await request<RepoInfo>(token, `/repos/${cfg.owner}/${cfg.repo}`);
  if (info.permissions && info.permissions.push === false) {
    throw new GitHubError("这个 Token 对该仓库只有读权限，无法保存内容。", 403);
  }
  return info;
}

/** 列目录。目录不存在时返回空数组而不是报错——新建目录前先调它会 404 */
export async function listDir(
  token: string,
  path: string,
  cfg: RepoConfig = DEFAULT_REPO,
): Promise<FileEntry[]> {
  try {
    const items = await request<FileEntry[] | FileEntry>(
      token,
      `/repos/${cfg.owner}/${cfg.repo}/contents/${encodeURI(path)}?ref=${cfg.branch}`,
    );
    return Array.isArray(items) ? items : [items];
  } catch (error) {
    if (error instanceof GitHubError && error.status === 404) return [];
    throw error;
  }
}

/** 读单个文件。不存在返回 null */
export async function getFile(
  token: string,
  path: string,
  cfg: RepoConfig = DEFAULT_REPO,
): Promise<FileContent | null> {
  try {
    const data = await request<{
      path: string;
      sha: string;
      content?: string;
      size: number;
    }>(
      token,
      `/repos/${cfg.owner}/${cfg.repo}/contents/${encodeURI(path)}?ref=${cfg.branch}`,
    );

    if (typeof data.content !== "string") {
      throw new GitHubError("这是一个目录，不是文件。", 400);
    }

    return {
      path: data.path,
      sha: data.sha,
      content: decodeBase64(data.content),
      size: data.size,
    };
  } catch (error) {
    if (error instanceof GitHubError && error.status === 404) return null;
    throw error;
  }
}

/**
 * 写文件。
 *
 * 已存在时必须带 sha——这是 GitHub 的乐观锁：
 * 如果你在别处改过同一文件，sha 对不上就会失败，而不是悄悄覆盖。
 */
export async function putFile(
  token: string,
  path: string,
  content: string,
  message: string,
  sha?: string,
  cfg: RepoConfig = DEFAULT_REPO,
): Promise<{ sha: string }> {
  const body: Record<string, unknown> = {
    message,
    content: encodeBase64(content),
    branch: cfg.branch,
  };
  if (sha) body.sha = sha;

  return request<{ sha: string }>(
    token,
    `/repos/${cfg.owner}/${cfg.repo}/contents/${encodeURI(path)}`,
    { method: "PUT", body: JSON.stringify(body) },
  );
}

/** 上传二进制（图片）。body 已经是 base64 时用这个，避免再转一层 */
export async function putBinaryFile(
  token: string,
  path: string,
  base64: string,
  message: string,
  sha?: string,
  cfg: RepoConfig = DEFAULT_REPO,
): Promise<{ sha: string }> {
  const body: Record<string, unknown> = {
    message,
    content: base64,
    branch: cfg.branch,
  };
  if (sha) body.sha = sha;

  return request<{ sha: string }>(
    token,
    `/repos/${cfg.owner}/${cfg.repo}/contents/${encodeURI(path)}`,
    { method: "PUT", body: JSON.stringify(body) },
  );
}

/** 删除文件 */
export async function deleteFile(
  token: string,
  path: string,
  sha: string,
  message: string,
  cfg: RepoConfig = DEFAULT_REPO,
): Promise<void> {
  await request<unknown>(
    token,
    `/repos/${cfg.owner}/${cfg.repo}/contents/${encodeURI(path)}`,
    {
      method: "DELETE",
      body: JSON.stringify({ message, sha, branch: cfg.branch }),
    },
  );
}

/** 读 JSON 数据文件，读不到时返回 fallback */
export async function getJson<T>(
  token: string,
  path: string,
  fallback: T,
  cfg: RepoConfig = DEFAULT_REPO,
): Promise<{ data: T; sha: string | null }> {
  const file = await getFile(token, path, cfg);
  if (!file) return { data: fallback, sha: null };
  try {
    const text = file.content.charCodeAt(0) === 0xfeff ? file.content.slice(1) : file.content;
    return { data: JSON.parse(text) as T, sha: file.sha };
  } catch {
    throw new GitHubError(`${path} 不是合法的 JSON。`, 400);
  }
}

/** 文件 → 可用的 base64（去掉 data URL 前缀） */
export function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const result = String(reader.result ?? "");
      const comma = result.indexOf(",");
      resolve(comma >= 0 ? result.slice(comma + 1) : result);
    };
    reader.onerror = () => reject(new Error("读取文件失败"));
    reader.readAsDataURL(file);
  });
}