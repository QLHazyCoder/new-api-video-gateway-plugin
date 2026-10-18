# Coder Video Gateway Task Plugin

这是一个给 New API 使用的独立 Task Plugin。它把下游客户的标准 OpenAI 视频接口统一转发到一个 New API 视频网关，公开端点始终是：

- `POST /v1/videos`
- `GET /v1/videos/:task_id`
- `GET|HEAD /v1/videos/:task_id/content`

插件不会注册 Grok 的 `/v1/videos/generations`，也不会把 ZeeQi 的私有协议暴露给下游。

## 支持模型

当前显式支持以下 12 个模型，不包含 Sora：

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

模型列表是插件的显式白名单，其他模型会在请求解码阶段被拒绝。

能力约束如下：`grok-imagine-video` 只支持 480p/720p；`grok-imagine-video-1.5` 支持 480p/720p/1080p；`seedance-2.0`、`seedance-2.0-fast-offical`、`seedance-2.0-mini-offical` 支持 480p/720p；`seedance-2.5` 和 `seedance-2.0-offical` 支持 480p/720p/1080p；`H3` 只支持 720p、4–15 秒、最多 9 张图片和 3 条音频参考。四个 RollDek Seedance 模型只支持 720p；时长分别为 4–15 秒（2.0、2.0-fast、2.0-mini）和 4–30 秒（2.5）。RollDek 未提供时长时按源站模型最长时长预估，实际计费 token 以源站完成任务返回的 `usage.total_tokens` 为准。Grok 时长为 1–15 秒，其他 Seedance 时长为 1–3600 秒。

## New API 配置

1. 在根管理员的任务插件页面上传 `plugin.js`，启用 `coder-video-gateway@1.0.3`。
2. 新建渠道，渠道类型选择 **Task Plugin**，不要选择 OpenAI 类型。
3. 任务插件选择 `coder-video-gateway`。
4. Base URL 填写网关地址，例如 `https://coderapi.vip`。
5. 渠道密钥填写该网关要求的密钥。
6. 在渠道模型中只启用需要的模型，并在模型定价中分别配置价格表达式。

渠道类型是 **Task Plugin (61)**。插件的默认 Base URL 是 `https://coderapi.vip`，也可以在渠道中填写实际网关地址；渠道密钥只填写网关 API key。安装目标需要支持 Task Plugin v1、`usageProfiles`、文件占位符和视频 artifact。

下游客户仍然使用你自己的 New API 地址和自己的访问密钥，调用 `POST /v1/videos`。插件会使用渠道密钥访问 Base URL，不会向客户端暴露上游厂商路径。

## 图生视频限制

Grok 模型接受标准 JSON 图片 URL，也接受标准 multipart 上传；上传文件会在网关请求中转换为受控的 data URL 占位符。

ZeeQi Seedance 模型的上游要求公网图片 URL，因此插件会拒绝本地 multipart 图片和非 HTTP(S) 图片地址。RollDek Seedance 接受 HTTPS 图片 URL 或授权的 `asset://ast-...` 资源 ID，也拒绝本地 multipart 图片。请先把图片放到图床，再把地址放到 `input_reference`、`image` 或 `image_url`。

RollDek Seedance 还接受火山方舟风格的 JSON `content` 数组，请求仍发送到标准 `POST /v1/videos`。此格式仅用于四个 RollDek 模型，支持 `text`、`image_url`、`video_url`、`audio_url` 内容项，以及 `duration`、`resolution`、`ratio`、`generate_audio`、`watermark`、`seed`。它只实现 RollDek 文档支持的参数子集：该渠道固定为 `720p`，宽高比限于 `16:9`、`9:16`、`1:1`、`21:9`、`4:3`、`3:4`；`adaptive`、`duration: -1` 和未列出的火山参数不会透传。详细格式见下游接入文档。

## 计量与价格

插件只报告计量事实，不内置价格：

- Grok：`duration`、`resolution`、`image_count`
- Seedance：`duration`、`resolution`、`image_count`、`has_video`
- H3：`duration`、`resolution`、`image_count`、`audio_count`
- RollDek Seedance：`tokens`、`video_input`

RollDek 的提交阶段按源插件一致的规则预估 token 数，成功任务查询阶段读取源站返回的最终 token 数并用于结算；如果源站没有返回用量，继续使用预估值。价格由 New API 模型定价页面配置，插件不会覆盖现有价格，也不会写入任何供应商价格。

## 本地验证

在 New API 源码目录执行：

```sh
new-api plugin lint /opt/qlh-main/new-api-video-gateway-plugin/plugin.js
new-api plugin test /opt/qlh-main/new-api-video-gateway-plugin/plugin.js --fixture /opt/qlh-main/new-api-video-gateway-plugin/golden.json
```

测试夹具覆盖 12 个模型、RollDek 720p/时长/token 计量和火山格式 `content` 请求、JSON/multipart 解码、Grok 本地图片、Seedance 公网图片与 H3 多图多音频限制、标准 `/v1/videos` 提交/查询/内容请求、状态映射、渲染和计量事实。

## 客户调用示例

下游客户自研平台接入说明（通过本服务调用 Seedance 视频模型）见 [`docs/downstream-seedance-integration.md`](docs/downstream-seedance-integration.md)。

```sh
curl https://你的-new-api.example/v1/videos \
  -H 'Authorization: Bearer 你的下游密钥' \
  -H 'Content-Type: application/json' \
  -d '{"model":"grok-imagine-video-1.5","prompt":"A paper boat on a rainy street","duration":5,"resolution":"720p"}'
```

接口会返回 New API 的公共任务 ID。客户随后使用 `GET /v1/videos/{task_id}` 查询状态，成功后使用 `GET /v1/videos/{task_id}/content` 下载视频。Seedance 图生视频请求中的图片必须是公网 HTTP(S) URL；Grok 才支持 multipart 本地图片。

详细职责边界、文件说明、开发清单和审查记录见 [`DESIGN_AND_REVIEW.md`](DESIGN_AND_REVIEW.md)。
