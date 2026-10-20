# Coder Video Gateway 插件设计与审查记录

## 项目整体分析

本仓库提供 New API Task Plugin v1 插件，面向下游暴露标准视频任务流程。New API 主机负责公开路由；插件仅处理请求校验、任务提交、状态查询、计量事实和视频内容代理。

```text
下游客户端
  POST /v1/videos
        |
        v
New API openai_video 主机协议
        |
        v
本插件 -> 配置的视频服务 /v1/videos
        |
        v
后台轮询 /v1/videos/{task_id}
        |
        v
完成后代理 /v1/videos/{task_id}/content
```

公开端点：

- `POST /v1/videos`
- `GET /v1/videos/{task_id}`
- `GET|HEAD /v1/videos/{task_id}/content`

插件不注册额外客户端路由。渠道凭据由 New API 配置，客户端请求使用 New API 对外签发的访问密钥。

## 公共模型契约

模型 ID 是请求接口的一部分，因此下表保留已开放的 ID 和能力限制。New API 渠道可按部署配置为模型设置客户侧别名。

| 模型 ID | 分辨率 | 时长和输入限制 |
| --- | --- | --- |
| `grok-imagine-video` | 480p、720p | 1–15 秒 |
| `grok-imagine-video-1.5` | 480p、720p、1080p | 1–15 秒 |
| `seedance-2.0` | 480p、720p | 5–15 秒 |
| `seedance-2.5` | 480p、720p、1080p | 5–30 秒 |
| `seedance-2.0-fast-offical` | 480p、720p | 4–15 秒 |
| `seedance-2.0-mini-offical` | 480p、720p | 4–15 秒 |
| `seedance-2.0-offical` | 480p、720p、1080p | 4–15 秒 |
| `H3` | 720p | 4–15 秒；最多 9 张图片、3 条音频 |
| `doubao-seedance-2-0-260128` | 480p、720p、1080p、4K | 4–15 秒 |
| `doubao-seedance-2-0-fast-260128` | 480p、720p | 4–15 秒 |
| `doubao-seedance-2-0-mini-260615` | 480p、720p | 4–15 秒 |
| `doubao-seedance-2-5-260628` | 480p、720p、1080p | 4–30 秒 |

模型白名单在请求解码阶段校验。价格和倍率由 New API 模型定价配置承担；插件只报告计量事实，不写入价格。

## 请求与任务处理

- `meta.protocols` 声明 `openai_video`，由主机解析 JSON 和 multipart 请求。
- JSON 请求支持文档列出的字段；未知字段、错误的类型、超出模型能力的参数会被拒绝。
- 支持本地文件的模型使用主机管理的 `__fileRef` 占位符；其他模型要求公开可访问的图片地址。
- 全部模型接受统一 JSON 字段；三个 `offical` 模型与四个扩展模型额外支持结构化 `content`。两种格式互斥，顶层 `prompt` 不与 `content` 拼接。
- 提交、查询和内容下载都使用配置服务的标准 `/v1/videos` 路由。
- 任务状态统一映射为 New API 任务状态；客户端只使用 New API 任务 ID 查询和下载。
- 成功任务可提供最终用量；无有效最终用量时保留请求阶段的计量事实。

## 计量与校验

- 常规模型报告 `duration`、`resolution` 和 `image_count`。
- 支持参考视频的模型额外报告 `has_video`；`H3` 额外报告 `audio_count`。
- 四个扩展模型报告 `tokens`、`duration`、`resolution` 和 `video_input`；预估 token 数随分辨率像素数缩放，成功任务结果中的有效 token 用量优先于提交阶段估算值。
- 数值字段拒绝布尔值、数组和非整数文本；`seed`、`n`、`strength`、`grid_strength` 进行范围校验。
- 无效或越界的任务事实不会覆盖已冻结的请求计量事实。

## 文件结构设计

| 路径 | 作用 |
| --- | --- |
| `plugin.js` | 单文件运行时插件：元数据、白名单、能力校验、任务转换、计量和内容代理。 |
| `golden.json` | 确定性回归夹具，覆盖模型限制、JSON/multipart、映射、文件引用、标准端点、状态、artifact 和结算事实。 |
| `README.md` | 管理员安装、渠道配置、公共模型能力、图片输入和本地验证说明。 |
| `docs/downstream-seedance-integration.md` | 下游自研平台的 HTTP 接口、字段、任务轮询和媒体输入指南。 |
| `DESIGN_AND_REVIEW.md` | 公共职责边界、文件说明、开发清单及自检记录。 |
| `.github/workflows/validate.yml` | 在 GitHub Actions 执行 JavaScript 语法检查和 fixture JSON 格式检查。 |

## 开发清单

### 阶段一：契约核对

- [x] 确认 New API Task Plugin v1 和 `openai_video` 主机协议边界。
- [x] 确认模型白名单、请求字段、文件占位符、artifact 和完成态计量契约。
- [x] 确认公开任务路由由 New API 主机提供。

### 阶段二：插件实现

- [x] 实现标准视频任务提交、查询和内容下载。
- [x] 实现 JSON/multipart 解码、模型能力校验和公开图片 URL 校验。
- [x] 实现结构化 `content` 子集及模型范围限制。
- [x] 实现 usage profiles、模型映射和完成态实际用量结算。
- [x] 维护 12 个模型白名单及各模型分辨率、时长和输入限制；四个扩展 Seedance 模型分别校验分辨率。

### 阶段三：功能回归

- [x] 覆盖 12 个模型、两种请求格式、任务状态和视频 artifact。
- [x] 检查未知模型、未知字段、越界参数和不支持的输入格式会被拒绝。
- [x] 检查客户端响应使用公共任务 ID，渠道凭据不进入响应或任务数据。

### 阶段四：下游发布审查

- [x] 统一下游文档、插件元数据、错误信息和 fixture 名称中的能力描述。
- [x] 整理发布说明，仅保留下游配置和故障排查所需的信息。
- [x] 检查仓库内容格式、凭据样例和公共 API 契约。
- [x] 保留模型白名单、请求字段和计量规则；媒体输入仅接受公开 HTTPS URL。

### 阶段五：最终验证

- [x] 初始验证记录：New API 插件 lint 通过，golden fixture 42/42 通过；本次统一协议的验证结果见下方阶段记录。
- [x] JavaScript 语法、fixture JSON、品牌词/私有路径扫描和差异空白检查通过。

## 阶段自检记录

### 请求与响应

- JSON 请求必须是对象并包含有效模型；必要字段、字段类型和模型能力均在解码阶段检查。
- `duration`/`seconds` 同时提供时必须相同。
- 状态和下载响应使用本服务公开任务 ID，不返回内部任务 ID 或媒体存储地址。

### 凭据与文件

- 插件不读取环境变量、不访问文件系统、不直接发起网络请求；由宿主按 descriptor 执行请求。
- 文件引用只允许宿主提供的 `request_file:*`，伪造的占位符会被拒绝。
- 渠道凭据只用于插件生成的服务请求，不进入渲染结果或任务公开字段。

### 本次下游文档审查

- 修正对象：`README.md`、`docs/downstream-seedance-integration.md`、`plugin.js`、`golden.json` 和本文件。
- 修正内容：统一文档、插件管理器描述、客户端错误信息及 fixture 名称，使其聚焦公开 API 行为。
- 兼容性：保留公开模型 ID、请求字段、结构化输入、任务路径和计量逻辑；媒体资源 ID 不再作为请求输入。
- 配置：New API 渠道可将模型映射到客户侧别名；模型映射变更需要同步渠道配置与接入文档。

### 本次 Seedance 分辨率同步

- 标准 Seedance 2.0 接受 480p、720p、1080p、4K；Fast 和 Mini 接受 480p、720p；Seedance 2.5 接受 480p、720p、1080p。
- 简化 JSON 与结构化 `content` 两种请求格式共用逐模型分辨率白名单；`size` 像素别名也按同一白名单校验。
- usage profile 按模型拆分并公开其可用分辨率、时长和参考视频事实。
- 提交阶段预扣 token 估算按分辨率像素数缩放；成功时仍优先使用有效 `usage.total_tokens`，并保留请求阶段的分辨率、时长和视频输入事实。
- 变更文件：`plugin.js`、`golden.json`、`README.md`、`docs/downstream-seedance-integration.md` 和本文件；未增删目录或职责文件。
- 验证：`go run . plugin lint /opt/qlh-main/new-api-video-gateway-plugin/plugin.js` 通过；`go run . plugin test /opt/qlh-main/new-api-video-gateway-plugin/plugin.js --fixture /opt/qlh-main/new-api-video-gateway-plugin/golden.json` 通过（54/54）；`node --check plugin.js`、fixture JSON 解析和 `git diff --check` 均通过。

### 本次统一请求协议验证

- 源码版本：`coder-video-gateway@1.0.5`，12 个模型保持白名单；统一公共字段并按模型声明时长、分辨率和素材数量。
- 三个 `offical` 模型新增结构化 content 转换，四个扩展模型保留原生 content；两个模式不混用。
- 相同别名归一后只统计一次，冲突别名与未知字段在提交前拒绝；支持的 content 文本顺序和素材角色保持明确。
- 站内离线串联验证覆盖 12 个模型、1286 项断言，确认最终请求与计量事实一致；公开指南中的 7 个请求示例同样通过。
- 当前插件 JavaScript 语法、New API plugin lint、golden fixtures 70/70、JSON 和差异检查通过；未执行付费视频生成。
- 公开指南、README、插件和夹具中的供应商名称与内部接口路径扫描无匹配；模型 ID 作为公共接口保留。
- 本次发布内容为 `coder-video-gateway@1.0.5` 源码与统一接入文档；服务端兼容实现已部署。客户在自己的 New API 实例更新插件后使用新协议；自研平台直接按指南调用。价格、密钥和渠道配置不在修改范围。

## 最终审查结论

本次统一协议发布版本为 `coder-video-gateway@1.0.5`。支持 12 个模型的共同请求格式和七个 Seedance 模型的 `content` 子集；请求别名、模型能力和计量事实保持一致。对外指南覆盖模型表、媒体输入、格式互斥、异步轮询和下载，不含服务内部适配信息。客户自己的 New API 实例需要导入并激活该版本，仓库发布不会替客户执行安装。

下游文档与插件元数据描述公开端点、模型 ID、字段和逐模型分辨率能力，且与当前实现保持一致。插件仍按现有模型 ID 和字段执行能力校验；不支持本地上传的模型仅接受公开 HTTPS 媒体地址，不接受资源 ID。New API 插件 lint、fixture、语法、JSON、敏感信息和差异检查结果随本次验证记录更新。
