# 下游自研平台接入 Seedance 视频 API

本文面向下游客户，说明如何从自研平台调用视频 API。示例使用 `https://coderapi.vip`；客户实际应使用服务地址和下游 API Key。所有请求都发送到本服务。

客户端使用 OpenAI Videos API 兼容形式的 HTTP 接口、Bearer Token 和异步任务流程，不需要安装本仓库的 New API Task Plugin。如果客户的平台本身是 New API，并希望将本服务配置为渠道，才需要在客户自己的 New API 实例安装 `coder-video-gateway` Task Plugin。该插件是 New API 专用适配器，不是自研平台的客户端 SDK。

## 协议范围

- API 根地址使用你提供给客户的服务域名，例如 `https://coderapi.vip`；不要在根地址末尾重复添加 `/v1`。
- 创建、查询、下载路径兼容 OpenAI Videos API 的路径和任务式工作流；这是你的服务提供的兼容接口，不是 OpenAI 官方服务，也不承诺支持 OpenAI API 的全部参数或所有 SDK 行为。
- 四个扩展模型除本文的简化 JSON 格式外，也支持结构化 `content` 请求子集；请求始终发送到本服务的 `/v1/videos`。
- 本指南只说明你的服务当前开放的四个 Seedance 模型。服务端必须已开放相应模型并为调用方密钥授权。
- 客户只需要本服务的地址和服务方签发的 API Key。

## 认证与路径

所有请求都使用服务方签发给调用方的 API Key：

```http
Authorization: Bearer <YOUR_API_KEY>
```

| 用途 | 方法 | 路径 |
| --- | --- | --- |
| 创建生成任务 | `POST` | `/v1/videos` |
| 查询任务状态 | `GET` | `/v1/videos/{video_id}` |
| 下载生成视频 | `GET` | `/v1/videos/{video_id}/content` |

`video_id` 使用创建响应中的 `id`。不要把服务端渠道密钥放进客户请求；客户只使用服务方发放的下游 API Key。

## 本服务开放的模型

| 模型 ID | 输出分辨率 | 时长 |
| --- | --- | --- |
| `doubao-seedance-2-0-260128` | `720p` | 4-15 秒 |
| `doubao-seedance-2-0-fast-260128` | `720p` | 4-15 秒 |
| `doubao-seedance-2-0-mini-260615` | `720p` | 4-15 秒 |
| `doubao-seedance-2-5-260628` | `720p` | 4-30 秒 |

模型名必须与服务端开放的 ID 完全一致。当前插件不接受这些白名单之外的模型名。

## 创建任务

建议使用 `application/json`。简化格式要求 `model`、`prompt` 和 `resolution`（或可替代分辨率的 `size`）；`duration` 可选，但建议显式传入，避免依赖模型服务的默认行为。下方另有结构化 `content` 格式。

```sh
curl https://coderapi.vip/v1/videos \
  -H "Authorization: Bearer $API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "model": "doubao-seedance-2-0-260128",
    "prompt": "A quiet lakeside at sunrise; the camera slowly moves toward the trees.",
    "duration": 8,
    "resolution": "720p",
    "aspect_ratio": "16:9"
  }'
```

典型创建响应为一个异步任务：

```json
{
  "id": "task_xxxxxxxxx",
  "object": "video",
  "model": "doubao-seedance-2-0-260128",
  "status": "queued",
  "progress": 0,
  "created_at": 1792000000
}
```

字段规则：

| 字段 | 规则 |
| --- | --- |
| `model` | 必填；使用上方四个模型 ID 之一。 |
| `prompt` | 简化格式必填；非空字符串。原生 `content` 格式则要求至少一个非空 `content[].text`。 |
| `duration` 或 `seconds` | 可选；提供时必须是 4 到模型最大秒数之间的整数。两者同时传入时必须相同。未提供时按该模型最大时长预估预扣用量。 |
| `resolution` | 必填；当前只支持 `720p`。可用 `size` 替代。 |
| `size` | 可替代 `resolution`：接受 `720p`、`1280x720` 或 `720x1280`。宽高尺寸会分别选择 `16:9` 或 `9:16`。 |
| `aspect_ratio` | 可选：`16:9`、`9:16`、`1:1`、`21:9`、`4:3`、`3:4`；未传时默认为 `16:9`。也可使用别名 `aspectRatio` 或 `ratio`。 |
| `input_reference` / `image` / `image_url` | 可选单张参考图片 URL；仅 HTTPS。 |
| `reference_image_urls` | 可选参考图片 URL 数组；也可使用别名 `images` 或 `image_urls`。 |
| `reference_video_urls` | 可选参考视频 HTTPS URL 数组，用于参考视频生成；具体模型是否支持由模型端能力决定。 |
| `reference_audio_urls` | 可选参考音频 HTTPS URL 数组；具体模型是否支持由模型端能力决定。 |
| `first_frame_image_url` / `last_frame_image_url` | 可选首帧或末帧图片 HTTPS URL；不能与参考视频或其他参考图片同时使用。 |
| `generate_audio` | 可选布尔值；是否开放取决于对应模型。 |
| `watermark` | 可选布尔值；是否开放取决于对应模型。 |
| `seed` | 可选整数；是否开放取决于对应模型。 |

如果同时传入 `resolution` 和 `size`，它们必须描述同一个分辨率；如果 `size` 同时指定了宽高比例，也不能与 `aspect_ratio` 冲突。插件只接受明确支持的字段；不要额外发送 `n`、`metadata`、`negative_prompt`、`webhook` 等未列出的字段。

`duration` 虽不是当前接口的强制字段，但建议始终提供。未提供时，服务不会替请求补时长，预估计量按该模型的最大时长计算；模型服务可能使用自己的默认值，也可能要求显式时长。若成功任务返回实际用量，最终计量使用该实际用量。

## 结构化 content 请求

四个扩展模型还接受 `content` 数组结构。请求仍发到本服务 `POST /v1/videos`，模型名使用本服务开放的 ID：

```sh
curl https://coderapi.vip/v1/videos \
  -H "Authorization: Bearer $API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "model": "doubao-seedance-2-5-260628",
    "content": [
      {"type": "text", "text": "参考图片主体和视频动作，生成平滑的镜头运动"},
      {"type": "image_url", "image_url": {"url": "https://images.example.com/scene.png"}, "role": "reference_image"},
      {"type": "video_url", "video_url": {"url": "https://media.example.com/motion.mp4"}, "role": "reference_video"},
      {"type": "audio_url", "audio_url": {"url": "https://media.example.com/music.mp3"}, "role": "reference_audio"}
    ],
    "duration": 8,
    "resolution": "720p",
    "ratio": "16:9",
    "generate_audio": true,
    "watermark": false,
    "seed": 42
  }'
```

支持的字段如下：

| 字段 | 规则 |
| --- | --- |
| `model` | 必填；使用上方四个扩展模型 ID。 |
| `content` | 必填非空数组，且至少包含一个非空 `text` 项。 |
| `content[].type=text` | 项目结构为 `{"type":"text","text":"..."}`。 |
| `content[].type=image_url` | 使用 `image_url.url` 和 `role`；role 为 `reference_image`、`first_frame` 或 `last_frame`。 |
| `content[].type=video_url` | 使用 `video_url.url`，role 固定为 `reference_video`。 |
| `content[].type=audio_url` | 使用 `audio_url.url`，role 固定为 `reference_audio`。 |
| `duration` | 可选整数；Seedance 2.0 系列为 4–15 秒，Seedance 2.5 为 4–30 秒。 |
| `resolution` | 必填；当前下游渠道只开放 `720p`。 |
| `ratio` | 可选：`16:9`、`9:16`、`1:1`、`21:9`、`4:3`、`3:4`；默认 `16:9`。 |
| `generate_audio`、`watermark` | 可选布尔值。 |
| `seed` | 可选整数。 |

各媒体项必须使用可公开访问的 HTTPS 地址；本地文件和资源 ID 均不支持。首尾帧最多各一张，首尾帧模式不能与参考图片或参考视频混合。`content` 格式不能和简化格式的 `prompt`、`input_reference`、`reference_video_urls` 等字段混用。

该结构仅支持本服务列出的字段，不会透传未列出的参数。`ratio: "adaptive"`、`duration: -1`、`output_format`、`priority`、回调和草稿等字段会被拒绝；这四个模型当前只支持 `720p`。其他模型继续使用上面的简化请求格式。

## 图生视频

图生视频请求需要让生成服务读取参考图片，因此传 HTTPS 图片地址，而不是客户端本地文件路径或二进制文件。若原图在客户设备上，客户平台应先将它上传到自己控制、生成服务可访问的图床，再把 URL 放进请求：

```json
{
  "model": "doubao-seedance-2-0-260128",
  "prompt": "Animate the scene with a gentle camera pan.",
  "duration": 8,
  "resolution": "720p",
  "input_reference": "https://images.example.com/scene.jpg"
}
```

单张图片可使用 `input_reference`、`image` 或 `image_url`，值为 HTTPS URL；`input_reference` 也可写为 `{"url":"https://..."}`。多张图可使用 `reference_image_urls`、`images` 或 `image_urls` 数组。第一帧/末帧可分别使用 `first_frame_image_url` 和 `last_frame_image_url`。

本服务目前不接受这四个模型的本地 multipart 图片文件上传或资源 ID。图片链接应在提交任务后仍有效，并允许生成服务读取；需要登录 Cookie、浏览器 Referer 或客户端私有网络才能访问的 URL 通常不能作为图片输入。

若使用结构化格式，请将图片项写入 `content`，并按场景选择 `reference_image`、`first_frame` 或 `last_frame` 角色。此结构只用于上方列出的四个模型。

可选的 `reference_video_urls` 和 `reference_audio_urls` 接受 HTTPS URL 数组。它们是否能用于具体模型，仍受模型能力和服务端配置约束。四个扩展模型也可以通过 `content` 中的 `video_url` / `audio_url` 输入。第一帧/末帧模式不能与参考视频或其他参考图片混用。

## 参考视频生成

需要让模型参考一段视频时，在 `reference_video_urls` 数组中传入可由生成服务访问的 HTTPS 视频地址。不要传本地路径或 multipart 文件。当前服务会把该请求标记为含参考视频（定价事实 `video_input` 为 `video`）；不含参考视频时为 `none`。视频输入能力仍以对应模型和渠道实际支持情况为准。

```sh
curl https://coderapi.vip/v1/videos \
  -H "Authorization: Bearer $API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "model": "doubao-seedance-2-0-260128",
    "prompt": "Continue the motion and keep the camera movement smooth.",
    "duration": 8,
    "resolution": "720p",
    "reference_video_urls": [
      "https://media.example.com/reference.mp4"
    ]
  }'
```

参考视频 URL 应在任务处理期间保持有效，并允许生成服务直接访问。若是私有素材，先将其放到你控制的、生成服务可以访问的 HTTPS 存储，再传入该 URL。若模型不支持参考视频，服务会返回参数或能力错误。

## 查询与下载

创建成功后，使用返回的 `id` 轮询任务：

```sh
curl "https://coderapi.vip/v1/videos/$VIDEO_ID" \
  -H "Authorization: Bearer $API_KEY"
```

常见 `status` 值：

- `queued`：任务排队中。
- `in_progress`：生成中；`progress` 是当前进度百分比。
- `completed`：已完成，可下载视频。
- `failed`：任务失败；检查响应中的 `error.code` 和 `error.message`。
- `unknown`：服务端暂时无法映射任务状态；重新查询或联系服务方排查。

状态查询响应会保留本服务任务 ID，不会把内部任务 ID 或媒体存储地址交给客户端。完成后通过本服务下载：

```sh
curl "https://coderapi.vip/v1/videos/$VIDEO_ID/content" \
  -H "Authorization: Bearer $API_KEY" \
  --output generated.mp4
```

内容接口返回视频文件流，通常为 `video/mp4`。应保存流式响应，不要把它当作 JSON 解析。任务未完成、任务不存在或调用方无权访问时，接口返回 HTTP 错误；客户端应检查 HTTP 状态码，再读取 JSON 错误信息。

成功任务可能包含：

```json
{
  "usage": {
    "total_tokens": 129600
  }
}
```

`usage` 是可选字段；只有在服务端已部署用量输出支持、且服务端收到并保存了有效的成功用量时才会出现。客户端不能依赖它作为任务成功的必要条件。

## 自研平台实现建议

下游自研平台只需实现三项 HTTP 操作：向本服务创建任务、按 `id` 查询任务、从本服务下载完成的视频。使用普通 HTTPS 客户端即可，不需要调用其他模型 API，也不需要接入 New API 插件 SDK。视频任务是异步的，平台应保存 `id` 并在后台轮询；不要在用户浏览器中暴露长期 API Key。图生视频则在调用前将本地文件上传至可供生成服务访问的 HTTPS 图床。

若使用官方 OpenAI SDK，请先确认该 SDK 版本仍保留 Videos API 方法，以及其请求字段与本指南列出的接口参数兼容。由于本接口仅承诺上面列出的兼容子集，使用原始 HTTP 请求通常更直接。
