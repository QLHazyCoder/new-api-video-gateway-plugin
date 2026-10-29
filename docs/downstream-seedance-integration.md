# 视频 API 接入指南

本服务提供统一的异步视频接口。自研平台通过 HTTP 调用即可，无需安装插件或专用 SDK。所有模型均可使用本文的统一请求格式；部分 Seedance 模型额外支持结构化 `content` 格式。

## 1. 服务地址与认证

API 根地址：`https://coderapi.vip`。根地址不包含 `/v1`，调用时使用下表的完整路径。

所有请求均需在请求头携带服务方签发的 API Key：

```http
Authorization: Bearer YOUR_API_KEY
```

| 操作 | 方法 | 路径 |
| --- | --- | --- |
| 查看密钥可用模型 | GET | `/v1/models` |
| 创建视频任务 | POST | `/v1/videos` |
| 查询视频任务 | GET | `/v1/videos/{video_id}` |
| 下载视频 | GET | `/v1/videos/{video_id}/content` |

创建任务使用 `Content-Type: application/json`。任务创建后保存响应中的 `id`，后续查询和下载始终使用这个 ID。API Key 请保存在平台服务端，避免放进页面公开代码或图片/视频 URL。

## 2. 模型与能力

模型名区分大小写。`offical` 是模型 ID 的固定拼写，请原样使用。实际可调用模型还受密钥授权和服务可用性限制，可通过 `/v1/models` 查看。

| 模型 ID | 输出分辨率 | 输出时长 | 结构化 content |
| --- | --- | --- | --- |
| `grok-imagine-video` | 480p、720p | 1–15 秒 | 不支持 |
| `grok-imagine-video-1.5` | 480p、720p、1080p | 1–15 秒 | 不支持 |
| `seedance-2.0` | 480p、720p | 5–15 秒 | 不支持 |
| `seedance-2.5` | 480p、720p、1080p | 5–30 秒 | 不支持 |
| `seedance-2.0-fast-offical` | 480p、720p | 4–15 秒 | 支持 |
| `seedance-2.0-mini-offical` | 480p、720p | 4–15 秒 | 支持 |
| `seedance-2.0-offical` | 480p、720p、1080p | 4–15 秒 | 支持 |
| `H3` | 720p | 4–15 秒 | 不支持 |
| `wan3.0-official` | 480p、720p、1080p | 2–30 秒；`-1` 自动时长 | 不支持 |
| `doubao-seedance-2-0-260128` | 480p、720p、1080p、4k | 4–15 秒 | 支持 |
| `doubao-seedance-2-0-fast-260128` | 480p、720p | 4–15 秒 | 支持 |
| `doubao-seedance-2-0-mini-260615` | 480p、720p | 4–15 秒 | 支持 |
| `doubao-seedance-2-5-260628` | 480p、720p、1080p | 4–30 秒 | 支持 |

时长使用整数秒，分辨率使用表中字符串，例如 `"720p"`，不要传 `"2K"` 或自行构造其他分辨率。

| 模型范围 | 参考图片 | 参考视频 | 参考音频 | 本地图片上传 |
| --- | --- | --- | --- | --- |
| 两个 `grok-imagine-video` 模型 | 单张 | 不支持 | 不支持 | 支持单张 multipart |
| `seedance-2.0` | 最多 9 张 | 最多 3 条 | 最多 3 条 | 不支持 |
| `seedance-2.5` | 最多 30 张 | 最多 10 条 | 最多 10 条 | 不支持 |
| 三个 `seedance-2.0-…offical` 模型 | 最多 9 张 | 最多 3 条 | 最多 3 条 | 不支持 |
| `H3` | 最多 9 张 | 不支持 | 最多 3 条 | 不支持 |
| `wan3.0-official` | 最多 10 张 | 最多 5 条 | 最多 5 条 | 不支持 |
| 四个 `doubao-seedance-…` 模型 | 支持 | 支持 | 支持 | 不支持 |

上表的数量是对应模型的输入上限，不表示任意媒体组合都可同时使用。四个 `doubao-seedance-…` 模型的素材数量及素材时长限制由所选模型决定，本文不为它们约定统一数量上限。

## 3. 统一请求格式

所有模型均可使用以下字段名称。替换 `model` 时，应同时遵守该模型的时长、分辨率和媒体能力。

### 文生视频

```sh
curl https://coderapi.vip/v1/videos \
  -H "Authorization: Bearer $API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "model": "grok-imagine-video",
    "prompt": "一个透明玻璃瓶放在木桌上，阳光穿过玻璃，镜头缓慢推进",
    "duration": 5,
    "resolution": "720p",
    "aspect_ratio": "16:9"
  }'
```

### 单图生视频

```json
{
  "model": "grok-imagine-video-1.5",
  "prompt": "保持图片中的主体，镜头缓慢推进，背景树叶轻轻摆动",
  "duration": 5,
  "resolution": "720p",
  "aspect_ratio": "16:9",
  "input_reference": "https://media.example.com/scene.jpg"
}
```

单图使用 `input_reference`；支持多图的模型使用 `reference_image_urls`。不要把同一张图片重复放进多个字段。

### 多图、参考视频与参考音频

只对支持这些能力的模型使用相应字段：

```json
{
  "model": "seedance-2.5",
  "prompt": "保持参考图片中的角色外观，参考视频中的动作，按参考音频的节奏生成画面",
  "duration": 8,
  "resolution": "720p",
  "aspect_ratio": "16:9",
  "reference_image_urls": ["https://media.example.com/character.jpg"],
  "reference_video_urls": ["https://media.example.com/motion.mp4"],
  "reference_audio_urls": ["https://media.example.com/music.mp3"]
}
```

`H3` 可使用图片和音频，不接受参考视频：

```json
{
  "model": "H3",
  "prompt": "让图片中的人物随音乐自然起舞，镜头保持平稳",
  "duration": 5,
  "resolution": "720p",
  "aspect_ratio": "9:16",
  "reference_image_urls": ["https://media.example.com/person.jpg"],
  "reference_audio_urls": ["https://media.example.com/music.mp3"]
}
```

Wan 使用统一顶层字段，支持参考图、参考视频和参考音频；客户端只传公开模型 ID：

```json
{
  "model": "wan3.0-official",
  "prompt": "让参考视频中的纸船继续向前漂流",
  "duration": 8,
  "resolution": "720p",
  "aspect_ratio": "adaptive",
  "reference_video_urls": ["https://media.example.com/motion.mp4"],
  "prompt_extend": true,
  "watermark": false
}
```

### 首帧与尾帧

三个 `seedance-2.0-…offical` 模型及四个 `doubao-seedance-…` 模型可使用以下形式：

```json
{
  "model": "seedance-2.0-fast-offical",
  "prompt": "从第一张画面自然过渡到最后一张画面，保持主体一致",
  "duration": 5,
  "resolution": "720p",
  "aspect_ratio": "16:9",
  "first_frame_image_url": "https://media.example.com/first.jpg",
  "last_frame_image_url": "https://media.example.com/last.jpg"
}
```

首帧、尾帧各最多一张。为获得明确的行为，请同时提供首帧和尾帧；只需要首帧时仅传 `first_frame_image_url`。首尾帧模式不要与 `input_reference`、参考图片数组、参考视频或参考音频组合使用。

### 字段说明

| 字段 | 类型 | 规则 |
| --- | --- | --- |
| `model` | string | 必填，使用已授权的模型 ID |
| `prompt` | string | 除 Grok 单图生视频可省略外，其余模型必填非空字符串 |
| `duration` | integer | 输出时长，建议始终显式提供，范围见模型表 |
| `resolution` | string | 输出分辨率，建议始终显式提供，范围见模型表 |
| `aspect_ratio` | string | 输出比例，具体取值见下表 |
| `input_reference` | string | 单张图片 URL；也接受只包含 `url` 的对象 |
| `reference_image_urls` | string[] | 参考图片 URL 数组 |
| `reference_video_urls` | string[] | 参考视频 URL 数组；H3、Grok 不支持 |
| `reference_audio_urls` | string[] | 参考音频 URL 数组；Grok 不支持 |
| `first_frame_image_url` | string | 首帧图片 URL，只对前述支持模型使用 |
| `last_frame_image_url` | string | 尾帧图片 URL，按上述首尾帧规则使用 |
| `generate_audio` | boolean | 可选，是否生成音频；实际可用性取决于模型 |
| `prompt_extend` | boolean | 可选，仅 `wan3.0-official` 接受 |
| `seed` | integer | 可选，非负安全整数；Grok 不支持 |
| `watermark` | boolean | 可选，`wan3.0-official` 和四个 `doubao-seedance-…` 模型接受 |

可用比例：

| 模型范围 | aspect_ratio |
| --- | --- |
| 两个 Grok 模型 | `16:9`、`9:16`、`1:1`、`4:3`、`3:4`、`3:2`、`2:3` |
| `seedance-2.0`、`seedance-2.5`、三个 `offical` 模型、H3 | `16:9`、`9:16`、`1:1`、`4:3`、`3:4` |
| `wan3.0-official` | `adaptive`、`21:9`、`16:9`、`4:3`、`1:1`、`3:4`、`9:16` |
| 四个 `doubao-seedance-…` 模型 | `16:9`、`9:16`、`1:1`、`4:3`、`3:4`、`21:9` |

兼容别名：`seconds` 对应 `duration`；`ratio`、`aspectRatio` 对应 `aspect_ratio`；`image`、`image_url` 对应 `input_reference`；`images`、`image_urls` 对应 `reference_image_urls`。同一语义的多个别名同时传入时必须相同，否则报错。建议新接入只使用表中的规范名称，尺寸使用 `resolution` 和 `aspect_ratio` 分别指定，不依赖历史 `size` 字段。

不要发送未列出的任意参数。除 `wan3.0-official` 明确支持 `duration: -1` 和 `ratio: "adaptive"` 外，其他模型不要传这些值；回调、草稿及其他未声明的功能均不属于本文接口范围。一个任务生成一个视频，建议不要传批量数量 `n`。

缺省行为仅用于兼容，建议客户端不要依赖：Grok 必须传时长；`seedance-2.0` 与 `seedance-2.5` 缺省时长为 5 秒；三个 `offical` 模型与 H3 为 4 秒；Wan 缺省时长为 5 秒，传 `-1` 时由模型决定并按最长 30 秒预留，完成后以有效实际用量结算。四个 `doubao-seedance-…` 模型省略时长时由模型确定，费用预估会按模型最大时长预留，成功后使用有效实际用量结算；省略时长不表示请求指定了最大时长。分辨率缺省时 Grok 使用 480p，七个非 `doubao-` 的 Seedance/H3/Wan 模型使用 720p；四个 `doubao-` 模型必须指定分辨率。

## 4. Seedance 结构化 content 格式

模型表标记“支持”的七个 Seedance 模型可使用这一格式，仍调用 `POST /v1/videos`。这是额外的请求体格式，创建、查询和下载路径均不改变。

```sh
curl https://coderapi.vip/v1/videos \
  -H "Authorization: Bearer $API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "model": "doubao-seedance-2-5-260628",
    "content": [
      {"type": "text", "text": "保持参考图片的主体外观，参考视频动作与音频节奏，镜头平稳移动"},
      {"type": "image_url", "image_url": {"url": "https://media.example.com/scene.jpg"}, "role": "reference_image"},
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

三个 `offical` 模型同样可以使用 `content`，但不要传 `watermark`：

```json
{
  "model": "seedance-2.0-offical",
  "content": [
    {"type": "text", "text": "保持角色外观，镜头从左向右缓慢移动"},
    {"type": "image_url", "image_url": {"url": "https://media.example.com/character.jpg"}, "role": "reference_image"}
  ],
  "duration": 5,
  "resolution": "720p",
  "ratio": "16:9",
  "generate_audio": true,
  "seed": 42
}
```

| content 项目 | 结构与 role |
| --- | --- |
| 文本 | `{"type":"text","text":"非空提示词"}` |
| 参考图 | `type: "image_url"`，地址放 `image_url.url`，role 为 `reference_image` |
| 首帧 | 图片项 role 为 `first_frame` |
| 尾帧 | 图片项 role 为 `last_frame` |
| 参考视频 | `type: "video_url"`，地址放 `video_url.url`，role 为 `reference_video` |
| 参考音频 | `type: "audio_url"`，地址放 `audio_url.url`，role 为 `reference_audio` |

请明确填写媒体 role。单任务仍受模型能力、素材数量和组合限制；`content` 不会让原本不支持参考视频的模型获得该能力。

使用 `content` 时必须遵守：

- 提示词放入 `content` 的 `text` 项，不再传顶层 `prompt`。即使顶层 `prompt` 是空字符串或 null，也会被视为混用而拒绝。
- 图片、视频、音频全部放入 `content`，不再传顶层 `input_reference` 或各类 `reference_*_urls`。
- `content` 必须是非空数组，并包含有效非空文本。不要使用不存在 `text` 的文本项。
- 时长、分辨率、比例等控制参数仍在顶层，使用 `duration`、`resolution`、`ratio`。
- 四个 `doubao-seedance-…` 模型可额外传 `generate_audio`、`watermark`、`seed`；三个 `offical` 模型可传 `generate_audio`、`seed`。
- 首帧、尾帧仍分别最多一张，遵循前面的首尾帧组合要求。

这两种格式应二选一。已经使用顶层 `prompt` 的客户端可以继续采用统一格式，不必改用 `content`。

## 5. 图片与媒体地址

建议全部使用公开可访问的 HTTPS URL。图生视频、参考视频和参考音频的素材地址必须在任务处理期间持续有效，并允许生成服务直接读取。

除两个 Grok 模型外，图片、视频和音频均使用 URL，不接受客户端本地路径、二进制文件、Base64 图片或需要登录后才能访问的地址。客户端本地素材请先上传到自己控制的媒体存储，再提交 URL。本文的 `media.example.com` 是示例地址，必须替换为实际可读的素材地址。

两个 Grok 模型还支持单张图片 multipart 上传，其他字段仍使用统一名称：

```sh
curl https://coderapi.vip/v1/videos \
  -H "Authorization: Bearer $API_KEY" \
  -F "model=grok-imagine-video" \
  -F "prompt=让图片中的云缓慢移动" \
  -F "duration=5" \
  -F "resolution=720p" \
  -F "input_reference=@/absolute/path/scene.png"
```

multipart 请求由客户端自动生成 `Content-Type` 边界，不要手工固定为 `application/json`。一次请求只上传一张图片，不同时提供 URL 图片和上传文件。

## 6. 创建响应、轮询与下载

典型创建响应：

```json
{
  "id": "task_example",
  "object": "video",
  "model": "grok-imagine-video",
  "status": "queued",
  "progress": 0,
  "created_at": 1792000000
}
```

保存 `id`，使用相同 API Key 查询：

```sh
curl "https://coderapi.vip/v1/videos/$VIDEO_ID" \
  -H "Authorization: Bearer $API_KEY"
```

| status | 含义 | 客户端行为 |
| --- | --- | --- |
| `queued` | 排队中 | 继续轮询 |
| `in_progress` | 生成中 | 继续轮询，按 progress 展示进度 |
| `completed` | 已完成 | 下载视频 |
| `failed` | 失败 | 展示 error.message，停止轮询 |
| `unknown` | 暂时无法识别状态 | 延后重查；持续出现时联系服务方 |

建议每 5–10 秒查询一次，不要因暂时排队或客户端超时重复创建相同任务。客户端停止等待不会自动取消任务；重新连接后继续查询已保存的 ID。

成功后下载 MP4：

```sh
curl --fail "https://coderapi.vip/v1/videos/$VIDEO_ID/content" \
  -H "Authorization: Bearer $API_KEY" \
  --output result.mp4
```

查询响应可能包含 `content_url`；也可以直接按上述任务 ID 构造下载路径。下载接口返回视频二进制，不是 JSON。尚未完成时不要调用下载；任务与视频可获取期限由服务保存策略决定，建议完成后及时保存到自己的存储。

## 7. 错误处理与接入检查

非成功 HTTP 响应应先读取 JSON 错误信息。任务生成失败还需检查查询响应中的 `error.message`。错误示例：

```json
{
  "error": {
    "code": "",
    "message": "请求参数错误或所选模型暂不可用，具体原因以实际响应为准",
    "type": "new_api_error"
  }
}
```

不要仅依赖固定 `error.code` 判断所有失败；不同阶段的错误 code 可能为空。记录响应中的 request id（若提供），提交给服务方排查。认证、参数或模型授权错误应修正后再提交；创建响应不确定时先核对已有任务，避免自动重复提交造成额外生成。

接入时依次确认：密钥有效且有模型权限；模型 ID 完全匹配；时长、分辨率、比例在该模型范围内；素材 URL 可读取；请求只选择统一格式或 `content` 格式之一；最后完成一次创建、查询到完成、下载视频的完整流程。
