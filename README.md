# Coder Video Gateway Task Plugin

这是一个给 New API 使用的独立 Task Plugin。它把下游客户的标准视频请求转发到视频服务，公开端点始终由 New API 提供：

- `POST /v1/videos`
- `GET /v1/videos/:task_id`
- `GET|HEAD /v1/videos/:task_id/content`

插件不注册额外公开端点。下游只使用上面列出的标准视频接口。

## 支持模型

当前显式支持以下 12 个模型：

- `grok-imagine-video`
- `grok-imagine-video-1.5`
- `seedance-2.0`
- `seedance-2.5`
- `seedance-2.0-fast-offical`
- `seedance-2.0-mini-offical`
- `seedance-2.0-offical`
- `H3`
- `doubao-seedance-2-0-260128`
- `doubao-seedance-2-0-fast-260128`
- `doubao-seedance-2-0-mini-260615`
- `doubao-seedance-2-5-260628`

以下模型构成插件白名单，未列出的模型会在请求解码阶段被拒绝。

| 模型 ID | 分辨率 | 时长与输入限制 |
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

New API 渠道支持将模型 ID 映射为客户侧别名；映射规则由服务配置决定。

## New API 配置

1. 在根管理员的任务插件页面上传 `plugin.js`，启用 `coder-video-gateway@1.0.5`。
2. 新建渠道，渠道类型选择 **Task Plugin**，不要选择 OpenAI 类型。
3. 任务插件选择 `coder-video-gateway`。
4. Base URL 填写网关地址，例如 `https://coderapi.vip`。
5. 渠道密钥填写该网关要求的密钥。
6. 在渠道模型中只启用需要的模型，并在模型定价中分别配置价格表达式。

渠道类型是 **Task Plugin (61)**。插件的默认 Base URL 是 `https://coderapi.vip`，也可以在渠道中填写实际网关地址；渠道密钥只填写网关 API key。安装目标需要支持 Task Plugin v1、`usageProfiles`、文件占位符和视频 artifact。

下游客户使用你提供的 New API 地址和访问密钥调用 `POST /v1/videos`。提交、查询和下载均通过前述公开端点完成。

## 图生视频限制

前两个模型 ID 接受 JSON 图片 URL，也接受 multipart 图片上传；上传文件会转换为 New API 管理的文件占位符。

`seedance-2.0`、`seedance-2.5`、三个 `seedance-2.0-...` 模型及 `H3` 使用可公开访问的 HTTP(S) 图片 URL，不接受本地 multipart 图片。四个 `doubao-seedance-...` 模型接受 HTTPS 图片 URL，也不接受本地 multipart 图片。需要让服务读取的素材应使用可访问的 HTTPS 地址，并放入 `input_reference`、`image` 或 `image_url`。

全部模型共用 `model`、`prompt`、`duration`、`resolution`、`aspect_ratio` 和单图 `input_reference` 等规范字段；别名相同则归一，冲突则拒绝。多图、参考视频和参考音频按逐模型能力校验，不把不支持的参数静默丢弃。

三个 `offical` 模型和四个 `doubao-seedance-...` 模型还接受结构化 JSON `content`，包含 `text`、`image_url`、`video_url`、`audio_url`。使用该格式时文本和媒体全部放进 `content`，不与顶层 `prompt` 或参考媒体字段混用；控制参数仍放顶层。三个 `offical` 模型为 4–15 秒、最多 9 图/3 视频/3 音频、五种固定比例；四个 `doubao-seedance-...` 模型按各自时长、分辨率和比例校验。`watermark` 仅四个 `doubao-` 模型接受。详细支持范围、默认值和完整示例见下游指南。

## 计量与价格

插件只报告计量事实，不内置价格：

- 标准模型：`duration`、`resolution`、`image_count`
- 支持参考视频的模型：另含 `has_video`
- `H3`：另含 `audio_count`
- 四个 `doubao-seedance-...` 模型：`tokens`、`duration`、`resolution`、`video_input`

四个扩展模型在提交阶段预估 token 数，成功任务查询阶段优先使用任务结果中的 `usage.total_tokens`；没有有效实际用量时保留预估值。价格由 New API 模型定价页面配置，插件不会写入价格。

## 本地验证

在 New API 源码目录执行：

```sh
new-api plugin lint /opt/qlh-main/new-api-video-gateway-plugin/plugin.js
new-api plugin test /opt/qlh-main/new-api-video-gateway-plugin/plugin.js --fixture /opt/qlh-main/new-api-video-gateway-plugin/golden.json
```

测试夹具覆盖 12 个模型、分辨率与时长限制、token 计量和结构化 `content` 请求、JSON/multipart 解码、图片/音频输入、标准 `/v1/videos` 提交/查询/内容请求、状态映射、渲染和计量事实。

## 客户调用示例

覆盖全部视频模型的自研平台接入说明见 [`docs/downstream-seedance-integration.md`](docs/downstream-seedance-integration.md)。该文件可独立发给客户；原路径保留以兼容已有链接。

```sh
curl https://你的-new-api.example/v1/videos \
  -H 'Authorization: Bearer 你的下游密钥' \
  -H 'Content-Type: application/json' \
  -d '{"model":"seedance-2.0","prompt":"A paper boat on a rainy street","duration":5,"resolution":"720p"}'
```

接口会返回 New API 的公共任务 ID。客户随后使用 `GET /v1/videos/{task_id}` 查询状态，成功后使用 `GET /v1/videos/{task_id}/content` 下载视频。图片输入限制取决于所选模型；请使用公开文档列出的图片 URL 或 multipart 形式。

详细职责边界、文件说明、开发清单和审查记录见 [`DESIGN_AND_REVIEW.md`](DESIGN_AND_REVIEW.md)。
