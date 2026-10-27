# 照片墙
#
# 把图片放进这个目录就会自动出现在 /photos 页面上，不需要改代码。
# 支持的格式：jpg / jpeg / png / webp / avif / gif
#
# 想给照片加说明文字，在本目录下建一个 captions.json：
#
#   {
#     "2026-10-27-某个下午.jpg": "出门走走",
#     "2026-10-28-窗边.jpg": "光线刚好"
#   }
#
# 注意：保存 captions.json 时不要带 UTF-8 BOM
# （Windows 记事本和 PowerShell 的 Set-Content -Encoding utf8 都会加），
# 否则解析会失败——代码里已经做了兜底，但会在构建日志里打警告。