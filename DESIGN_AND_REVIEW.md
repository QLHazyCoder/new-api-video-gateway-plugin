# Coder Video Gateway 插件设计与审查记录

## 项目整体分析

这个仓库是给 New API Task Plugin v1 使用的独立插件，职责边界是把下游的标准 OpenAI 视频协议请求转换成 Coder 视频网关请求，再把网关任务状态转换回 New API 的任务状态。

调用链保持为：

```text
下游客户端
  POST /v1/videos
        |
        v
New API openai_video 主机协议
        |
        v
本插件 decodeRequest -> buildSubmitRequest -> Coder 网关 /v1/videos
        |
        v
后台轮询 buildQueryRequest -> Coder 网关 /v1/videos/{task_id}
        |
        v
完成后 listArtifacts/buildContentRequest -> /v1/videos/{task_id}/content
```

协议端点由 New API 主机拥有，插件没有注册私有路由，也没有暴露 Grok 的 `/v1/videos/generations`。插件使用的渠道密钥只在插件请求上游时使用，客户端继续使用 New API 自己的地址和访问密钥。

模型白名单是 8 个已确认模型：

| 供应商 | 模型 | 支持分辨率 | 时长校验 |
| --- | --- | --- | --- |
| Grok | `grok-imagine-video` | 480p、720p | 1–15 秒 |
| Grok | `grok-imagine-video-1.5` | 480p、720p、1080p | 1–15 秒 |
| Seedance | `seedance-2.0` | 480p、720p | 1–3600 秒 |
| Seedance | `seedance-2.5` | 480p、720p、1080p | 1–3600 秒 |
| Seedance | `seedance-2.0-fast-offical` | 480p、720p | 1–3600 秒 |
| Seedance | `seedance-2.0-mini-offical` | 480p、720p | 1–3600 秒 |
| Seedance | `seedance-2.0-offical` | 480p、720p、1080p | 1–3600 秒 |
| MiniMax | `H3` | 720p | 4–15 秒；最多 9 图、3 音频 |

插件不包含 Sora，也不包含供应商价格。价格和倍率仍由 New API 模型定价配置承担；插件只报告 `duration`、`resolution`、`image_count`，以及 Seedance 的 `has_video`。

## 重构方案

### 端点和协议

- `meta.protocols` 只声明 `openai_video`。
- `decodeRequest` 接收 New API 已解析的 JSON 或 multipart 请求，输出标准 submit intent。
- `buildSubmitRequest` 固定生成 `POST {baseUrl}/v1/videos`。
- `parseSubmitResponse` 接受 `id`、`task_id` 或 `request_id`，统一成任务 ID。
- `buildQueryRequest` 固定生成 `GET {baseUrl}/v1/videos/{task_id}`。
- `parseTaskResult` 将 queued/pending/processing/completed/failed 等状态映射为主机状态。
- `listArtifacts` 声明一个 `video` artifact；`buildContentRequest` 固定生成 `GET` 或 `HEAD {baseUrl}/v1/videos/{task_id}/content`。

插件不设置 descriptor 顶层 `model`，以便 New API 保留下游模型别名；请求 JSON 内的 `model` 使用 `ctx.upstreamModel`，因此渠道模型映射后上游收到机器模型名，计费仍按原模型身份处理。

### 图片能力

- Grok 支持 JSON 中的图片 URL、`url` 对象、`file_id`，以及 multipart `image`/`input_reference` 文件。
- Grok 本地文件只生成 New API 认可的 `__fileRef` data URL 占位符，文件字节仍由宿主机读取，插件不接触文件系统。
- Seedance 只接受公网 HTTP(S) 图片地址；本地 multipart 文件明确拒绝并提示先上传图床。
- 多个图片别名同时出现时要求它们代表同一个输入，避免请求被重复计量；Seedance 的数组字段支持重复 multipart 字段或 JSON 数组。

### 计量和结算

- 请求阶段按规范化请求报告 `duration`、`resolution`、`image_count`；Seedance 额外报告 `has_video` 的字符串枚举值，H3 额外报告 `audio_count`。
- 完成阶段优先读取上游 `video.duration`，兼容顶层 `duration`/`seconds`，并按模型时长上限校验。
- 无效或越界的上游事实会被忽略，保留宿主已经冻结的请求事实，避免异常响应把结算倍率替换成不安全值。
- 所有数值字段拒绝布尔值、数组和非整数文本；`seed`、`n`、`strength`、`grid_strength` 也进行范围校验。

### 模型映射

`ctx.model` 是客户请求的展示/计费模型名，`ctx.upstreamModel` 是模型映射后的机器模型名。插件按后者选择供应商规则和请求格式，同时把前者保留在解码结果中。这样既能支持客户别名，也不会把别名误当成供应商模型或错误套用另一供应商的价格规则。

## 文件结构设计

| 路径 | 作用 |
| --- | --- |
| `plugin.js` | 唯一运行时插件模块：元数据、8 个模型的能力声明、请求解码、提交、轮询、状态转换、计量和内容下载。保持单文件以符合 Task Plugin 沙箱。 |
| `golden.json` | New API 官方 fixture 格式的确定性回归夹具，覆盖 JSON/multipart、8 个模型、映射、图片文件引用、标准端点、状态、artifact 和结算事实。 |
| `README.md` | 管理员安装、渠道配置、客户端调用、图片限制、模型能力和本地验证说明。 |
| `DESIGN_AND_REVIEW.md` | 本次设计、职责边界、开发清单、阶段自检和最终审查记录。 |
| `.github/workflows/validate.yml` | GitHub 上执行 JavaScript 语法检查和 JSON 夹具格式检查；New API 官方 fixture 命令仍在宿主仓库中执行。 |

## 开发清单

### 阶段一：契约核对 — 已完成

- [x] 阅读 New API Task Plugin v1 文档和现有 JS 适配器实现。
- [x] 确认 `openai_video` 是主机协议，插件不注册公开端点。
- [x] 确认 `ctx.model`/`ctx.upstreamModel`、文件占位符、artifact 内容代理和完成态结算契约。
- [x] 对照现有 Grok、Seedance 插件保留模型字段、分辨率和图像输入语义。

### 阶段二：插件实现 — 已完成

- [x] 创建 `coder-video-gateway@1.0.1`，只保留 8 个确认模型并加入 H3 的 720p/4–15 秒/9 图 3 音频约束。
- [x] 实现标准 `/v1/videos` 提交、查询和内容下载。
- [x] 实现 Grok JSON/multipart 与 Seedance 公网图片输入规则。
- [x] 实现模型级 usage profiles，不写入供应商价格。
- [x] 实现映射别名和完成态实际时长结算。

### 阶段三：回归和审查 — 已完成

- [x] 通过 New API 插件 lint。
- [x] 通过包含 H3 用例的 golden fixture（原有 21 个用例全部保留）。
- [x] 通过 JavaScript 语法检查、JSON 解析和 `git diff --check`。
- [x] 检查 Sora、私有 Grok 路径、未知模型和超出模型能力的分辨率不会进入插件。
- [x] 检查本地 Grok 文件只保留宿主占位符，Seedance 本地文件被拒绝。

### 阶段四：发布 — 已完成

- [x] 创建 GitHub 公开仓库 `QLHazyCoder/new-api-video-gateway-plugin`。
- [x] 在 `main` 提交并推送插件源文件。
- [x] 读取远程提交和 Actions 状态，确认远程内容与本地提交一致。

## 阶段自检记录

### 请求面

- JSON 请求要求对象、模型和必要字段；Grok 无图片时要求 prompt，Seedance 总是要求 prompt。
- duration/seconds 必须是整数且两者同时提供时必须相同。
- 解析后的请求不会把供应商私有路径返回给客户端。

### 文件和安全面

- 插件不读取环境变量、不访问文件系统、不执行网络请求；所有网络访问由宿主根据 descriptor 执行。
- 文件引用只允许宿主提供的 `request_file:*`，并在提交阶段由宿主解析；伪造的 JSON 文件占位符会被拒绝。
- 上游密钥只写入 Authorization 请求头，不进入任务 data、渲染结果或日志字段。

### 任务面

- 提交响应没有可识别任务 ID 时失败。
- 未知轮询状态返回 `UNKNOWN`，不会错误地当成进行中。
- 任务成功后只声明标准 video artifact，内容请求支持 GET/HEAD。
- 渲染结果使用 New API 公共任务 ID 的 content URL；上游任务 ID 不直接提供给客户。

## 最终审查结论

当前实现符合 New API Task Plugin v1 的单文件沙箱边界和 `openai_video` 主机协议边界。8 个模型、模型映射、分辨率能力、图片/音频输入、轮询、artifact、完成态计量均有显式逻辑和 fixture 覆盖。插件仍然依赖宿主已经支持 Task Plugin v1、usage profiles、文件占位符和视频 artifact；安装前应确认目标 New API 构建包含这些能力。

远程发布验收结果是：GitHub `main` 已包含上述交付文件，New API lint 成功，golden fixture 21/21 成功，并且管理员可在渠道类型 **Task Plugin (61)** 中绑定 `coder-video-gateway` 后使用标准 `POST /v1/videos`。
