import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
    // 构建/运维脚本，不是应用代码。
    // tools/digest 是给 GitHub Actions 跑的 Node 脚本，
    // React/Next 那套规则对它是噪音。
    "tools/**",
  ]),
]);

export default eslintConfig;
