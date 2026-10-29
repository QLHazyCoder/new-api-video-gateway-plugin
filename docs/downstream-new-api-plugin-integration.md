# New API 视频插件接入指南

本文面向已经部署 New API、希望把本服务的视频模型接入自己站点的管理员。按照本文即可下载插件、完成安装和渠道配置，再向自己的用户提供视频接口；不需要克隆代码仓库或自行开发插件。

本文对应插件 **Coder Video Gateway 1.1.0**，插件标识为 `coder-video-gateway`。文末第 11 节附有可直接复制安装的完整插件源码；后续更新插件的步骤见第 9 节。

## 1. 接入前需要准备什么

- 一个支持 **Task Plugin API v1（任务插件）** 的 New API 实例，并支持模型级任务用量配置、标准视频协议和视频内容下载。不同 New API 版本、分支的功能可能不同，不能仅凭项目名称判断兼容性。
- 自己 New API 的超级管理员账号，用于安装和激活插件。
- 在本服务取得的视频 API Key，并确认它所属的服务分组、可用模型和余额。
- New API 服务器可以访问 `https://coderapi.vip`。通过 URL 导入插件时，操作浏览器还需要能访问本文给出的原始文件地址。

登录自己的 New API 后，找到 **任务插件 / Task Plugins** 页面；通常也可以在自己的站点根地址后追加 `/task-plugins` 访问。如果页面不存在、没有插件管理能力，或上传时明确提示不支持插件声明，需要先使用具备这些功能的兼容版本。本文不约定一个未经核验的最低版本号。

### 两种密钥不要混淆

| 密钥 | 在哪里取得 | 填在哪里 | 用途 |
| --- | --- | --- | --- |
| 本服务 API Key | 本服务签发 | 你自己的 New API 的渠道密钥 | 让你的 New API 调用本服务 |
| 你的站点令牌 | 你自己的 New API 签发 | 你的客户端或最终用户的请求头 | 让用户调用你自己的站点 |

调用关系为：

```text
最终用户 → 你的 New API → 本服务
          用户使用你的令牌   渠道使用本服务 API Key
```

最终用户调用你的站点，不需要安装插件，也不需要拿到你的渠道密钥。

## 2. 下载与安装插件

### 方式一：直接复制本文末尾的源码

1. 找到本文末尾 **第 11 节“附件：完整插件源码”**，复制整个 JavaScript 代码块的内容。只复制源码，不包含代码块前后的说明或 Markdown 围栏标记。
2. 用超级管理员账号打开自己 New API 的 **任务插件** 页面，确认 **启用任务插件** 总开关已开启。
3. 在 **已安装** 标签页点击 **上传插件**，将复制的内容粘贴到 **源码编辑框**；不要粘贴到“从 URL 导入”输入框。
4. 核对预览中的名称、标识和版本为 `Coder Video Gateway`、`coder-video-gateway`、`1.1.0`，点击 **上传**。
5. 如果提示需要激活，点击 **立即激活**；回到列表，确认插件已启用、当前版本正确，运行状态为 **已注册 / Registered**。
6. 安装完成后，继续按第 3 节创建渠道并配置渠道密钥。不要把自己的密钥写进插件源码。

也可以将复制的源码保存成 UTF-8 编码的 `plugin.js` 文件，再使用上传窗口的 **选择文件** 导入。下面两种方式供需要 URL 导入或文件下载的用户使用。

### 方式二：直接从 URL 导入

本教程的固定版本源码地址为：

```text
https://raw.githubusercontent.com/QLHazyCoder/new-api-video-gateway-plugin/a560c4dcea109fd2aa62cd89565bcade4190ae00/plugin.js
```

也可以直接点击 [下载 plugin.js（1.1.0 当前版本）](https://raw.githubusercontent.com/QLHazyCoder/new-api-video-gateway-plugin/main/plugin.js)。打开后应当看到 JavaScript 源码。

1. 用超级管理员账号打开自己 New API 的 **任务插件** 页面。
2. 确认页面上的 **启用任务插件** 总开关已开启。
3. 在 **已安装** 标签页点击 **上传插件**。
4. 将上述完整地址填入 **从 URL 导入**，点击 **拉取**。
5. 源码加载后核对预览中的名称、插件标识和版本：`Coder Video Gateway`、`coder-video-gateway`、`1.1.0`。第三方插件能够使用渠道凭据，应核对来源和源码后再安装。
6. 点击 **上传**。拉取源码只是填充编辑框，不代表已经安装。
7. 如果提示 **插件已保存，需要激活**，点击 **立即激活**；也可以从该插件的版本页面激活对应版本。
8. 回到列表，确认插件已启用，当前活动版本是 `1.1.0`，运行状态显示 **已注册 / Registered**。

不要把仓库首页地址填进源码导入框，例如 `https://github.com/QLHazyCoder/new-api-video-gateway-plugin`；仓库首页不是插件文件。这里直接使用上面的 `plugin.js` 原始文件地址即可。

### 方式三：下载文件后上传，或粘贴源码

如果 URL 导入提示“无法在浏览器中拉取”，可能是当前浏览器无法访问原始文件主机或跨域请求失败。可以改用下面的方式，不需要修改 New API 的代理配置：

1. 打开 [plugin.js 固定版本下载地址](https://raw.githubusercontent.com/QLHazyCoder/new-api-video-gateway-plugin/a560c4dcea109fd2aa62cd89565bcade4190ae00/plugin.js)，将原始内容保存为 `plugin.js`；不要保存成网页 HTML。
2. 在 **上传插件** 窗口点击 **选择文件**，选中这个 `.js` 文件，或把完整源码粘贴进源码编辑框。
3. 继续执行上传、激活、启用和运行状态核对。

只需要这个单独的 `plugin.js` 文件。安装本插件不需要上传整份仓库、运行 Node.js、修改 New API 源码或为它另建接口路由。

## 3. 创建视频渠道

打开你自己 New API 的 **渠道** 页面，新建一个渠道。不同版本的选择器外观可能不同：新版可以直接搜索并选择 **Coder Video Gateway**；较早的兼容界面可能需要先选择 **任务插件 / Task Plugin**，再选择插件。

无论界面形式如何，保存后的渠道应为 **任务插件类型（61）**，绑定 **`coder-video-gateway`**。

| 配置项 | 应填写的内容 |
| --- | --- |
| 渠道名称 | 自定义，例如 `视频接入-分组A` |
| 渠道类型 / 提供商 | `Coder Video Gateway` 对应的任务插件渠道 |
| 绑定插件 | `coder-video-gateway` |
| API 地址 / Base URL | `https://coderapi.vip` |
| 渠道密钥 | 本服务签发、对应所需服务分组的 API Key，通常填写密钥本身即可 |
| 渠道模型 | 本插件支持、该服务密钥有权限、且你打算开放的模型的交集 |
| 渠道分组 | 你自己 New API 中允许使用该渠道的本地用户/令牌分组 |
| 模型映射 | 首次接入建议留空，保持模型 ID 原样 |
| 渠道状态 | 启用 |

Base URL 填服务根地址即可。插件会追加 `/v1/videos`，因此不要填成 `https://coderapi.vip/v1`、`https://coderapi.vip/v1/videos` 或任何文档、定价页面地址。

选择插件时，某些界面会自动填入插件支持的全部模型。**这不是密钥授权结果**；保存前仍要删除该服务密钥无权访问或你不准备开放的模型。

任务插件类型目前不依赖渠道编辑页的“获取模型”功能。若该界面没有获取按钮，可以用第 4 节的 `/v1/models` 查看服务密钥的模型，再手动填写；不要为了获取列表而把渠道改成 OpenAI 类型。

### 多个服务分组如何配置

本服务的视频模型可能提供多个分组，每个分组使用各自签发的密钥。需要接入多个服务分组时，分别新建渠道：同一个插件可以被多个渠道复用，不必重复安装。

例如，你取得了服务分组 A 和服务分组 B 的两把密钥，就建立 A、B 两个渠道，各填对应密钥。渠道名称建议标明分组，避免后续排查混淆。

这里有两个不同的分组概念：

- **服务分组**：由填入渠道的本服务 API Key 决定，影响该渠道实际可用的模型和参数范围。
- **本地分组**：由你自己的 New API 管理，决定哪些本地用户或令牌能够使用这个渠道。名称不要求与服务分组相同。

如果希望本地用户明确选择某条服务线路，可以把渠道分别绑定到不同的本地分组，并签发对应的本地令牌。把多个渠道放在同一本地分组时，会参与 New API 的渠道选择；不能靠在视频请求体中临时添加一个自定义 `group` 字段来选择服务分组。

## 4. 核对可用模型

以下命令用于从本服务查看当前服务密钥可用的模型，不会创建视频任务。`SERVICE_API_KEY` 表示已保存在本机环境变量中的本服务密钥：

```sh
curl --fail-with-body https://coderapi.vip/v1/models \
  -H "Authorization: Bearer $SERVICE_API_KEY"
```

通常从响应的 `data[].id` 读取模型 ID。模型列表可用于核对授权范围，但不保证某个模型当前一定可生成，也不包含完整参数说明。

插件 `1.1.0` 支持以下模型。模型 ID 区分大小写，`offical` 是固定拼写，不要自行改成 `official`。

| 模型 ID | 插件支持的输出分辨率 | 输出时长 |
| --- | --- | --- |
| `grok-imagine-video` | `480p`、`720p` | 1–15 秒 |
| `grok-imagine-video-1.5` | `480p`、`720p`、`1080p` | 1–15 秒 |
| `seedance-2.0` | `480p`、`720p` | 5–15 秒 |
| `seedance-2.5` | `480p`、`720p`、`1080p` | 5–30 秒 |
| `seedance-2.0-fast-offical` | `480p`、`720p` | 4–15 秒 |
| `seedance-2.0-mini-offical` | `480p`、`720p` | 4–15 秒 |
| `seedance-2.0-offical` | `480p`、`720p`、`1080p` | 4–15 秒 |
| `H3` | `720p` | 4–15 秒 |
| `wan3.0-official` | `480p`、`720p`、`1080p` | 2–30 秒；`-1` 自动时长 |
| `doubao-seedance-2-0-260128` | `480p`、`720p`、`1080p`、`4k` | 4–15 秒 |
| `doubao-seedance-2-0-fast-260128` | `480p`、`720p` | 4–15 秒 |
| `doubao-seedance-2-0-mini-260615` | `480p`、`720p` | 4–15 秒 |
| `doubao-seedance-2-5-260628` | `480p`、`720p`、`1080p` | 4–30 秒 |

**表中列的是插件能识别的最大范围，实际调用还必须符合所选服务分组的限制。** 例如，某个服务分组仅提供 720p 时，不能因为插件支持 1080p 就向该分组提交 1080p。请同时核对服务分组说明。

第一次接入建议只选一个已授权模型，完成第 7 节的完整验证，再逐步增加其他模型。

## 5. 配置你自己的模型价格与模型管理

插件负责请求转换、任务查询和计量，不会自动写入你站内的销售价格，也不会自动同步本服务的价格或倍率。上线给用户之前，需要由你自己配置模型定价。

在你自己的 New API **模型定价** 中，为已经开放的每个模型配置任务计费表达式。插件提供的计量字段为：

| 模型范围 | 可使用的计量字段 | 定价时的区别 |
| --- | --- | --- |
| 两个 Grok 模型 | `duration`、`resolution`、`image_count` | 视频时长按秒；可按输出分辨率区分单价 |
| 五个 `seedance-…` 模型 | 上述字段，另有 `has_video` | `has_video` 为字符串 `"true"` 或 `"false"`，可区分是否提供参考视频 |
| `H3` | `duration`、`resolution`、`image_count`、`audio_count` | 可按视频秒数配置，并按业务需要处理输入素材费用 |
| `wan3.0-official` | `duration`、`resolution`、`image_count`、`input_video_duration` | 按秒计费；`-1` 预留 30 秒，完成态用上游实际参考视频时长覆盖 |
| 四个 `doubao-seedance-…` 模型 | `tokens`、`duration`、`resolution`、`video_input` | 使用任务 Token 用量时，注意每百万 Token 单价与 Token 数量的单位；`video_input` 为 `"none"` 或 `"video"` |

按秒销售的模型不能只填一个按次固定价格，Token 计费模型也不能直接套用其他视频模型的每秒单价。请按你希望的销售规则、金额单位和本地分组倍率设置，并检查预估与成功后的实际结算。

本服务扣除的是你的服务账户费用；你的 New API 按自己的定价向最终用户扣费。安装插件不会自动让两边的价格、余额或用户账单保持一致。

如果维护模型广场或模型管理，还需要检查模型名称、简介和 API 端点配置：视频端点应为公开类型 **`openai-video`**、路径 **`/v1/videos`**。不要把这些视频模型介绍成使用 `/v1/chat/completions` 的聊天模型。

## 6. 给最终用户签发本地令牌

在你自己的 New API 中创建用于测试的令牌，确认：

1. 令牌所属本地分组与第 3 节渠道分组匹配。
2. 令牌没有过期、余额或额度足够，模型限制允许本次测试模型。
3. 渠道已启用，模型名称填写正确，模型定价已配置。

接下来最终用户只需要以下信息：

| 项目 | 提供给最终用户的值 |
| --- | --- |
| API 地址 | 你自己的 New API 公网根地址 |
| API Key | 你自己站点签发的令牌 |
| 创建接口 | `POST /v1/videos` |
| 查询接口 | `GET /v1/videos/{video_id}` |
| 下载接口 | `GET /v1/videos/{video_id}/content` |
| 模型与参数 | 你开放的模型名称及对应参数范围 |

模型映射留空时，用户使用表中原始模型 ID。若你自行设置了模型映射，需同步告诉用户公开的模型别名；确认映射目标仍在插件支持范围内。

## 7. 通过自己的站点完成验证

下面请求发往 **你自己的 New API**。`LOCAL_BASE_URL` 表示你站点的公网根地址，不带 `/v1`；`LOCAL_API_KEY` 表示你站点签发的测试令牌。不要把本服务渠道密钥当作本地测试令牌。

### 第一步：确认本地令牌能看到模型

```sh
curl --fail-with-body "$LOCAL_BASE_URL/v1/models" \
  -H "Authorization: Bearer $LOCAL_API_KEY"
```

响应中应包含你准备测试的模型。此步骤只验证模型列表可见性，不代表视频生成链路已验证成功。

### 第二步：创建一个视频任务

先确认测试模型已经授权、所选服务分组支持下面的配置，并知晓创建任务会产生费用，再执行一次：

```sh
curl --fail-with-body "$LOCAL_BASE_URL/v1/videos" \
  -H "Authorization: Bearer $LOCAL_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "model": "doubao-seedance-2-0-mini-260615",
    "prompt": "一个透明玻璃瓶放在木桌上，镜头缓慢推进，光线自然",
    "duration": 4,
    "resolution": "720p",
    "aspect_ratio": "16:9"
  }'
```

这是一个完整请求示例，不代表所有服务密钥都拥有这个模型。换模型时，需一起调整到该模型允许的参数范围。

成功创建会返回类似下面的 JSON：

```json
{
  "id": "task_example",
  "object": "video",
  "model": "doubao-seedance-2-0-mini-260615",
  "status": "queued"
}
```

保存响应中的 `id`。它是 **你的 New API 对外返回的任务 ID**；接下来仍向你的站点查询，不要换成其他平台上的任务 ID，也不要切换到本服务域名查询。

### 第三步：查询同一个任务

把创建响应中的 `id` 保存为环境变量 `VIDEO_ID`，使用同一本地令牌查询：

```sh
curl --fail-with-body "$LOCAL_BASE_URL/v1/videos/$VIDEO_ID" \
  -H "Authorization: Bearer $LOCAL_API_KEY"
```

| status | 应如何处理 |
| --- | --- |
| `queued` | 排队中，等待后继续查询 |
| `in_progress` | 生成中，继续查询 |
| `completed` | 已完成，可以下载 |
| `failed` | 读取 `error.message`，停止轮询并排查 |
| `unknown` | 延后重查，持续出现时排查任务日志 |

建议每 5–10 秒查询一次。创建请求超时、客户端断线或暂时排队时，应先检查已有任务，不要自动重复创建，避免重复生成与扣费。

### 第四步：下载视频

确认状态为 `completed` 后执行：

```sh
curl --fail-with-body "$LOCAL_BASE_URL/v1/videos/$VIDEO_ID/content" \
  -H "Authorization: Bearer $LOCAL_API_KEY" \
  --output result.mp4
```

成功响应是视频二进制。检查 HTTP 状态和文件内容，确认拿到能播放的视频，而不是把 JSON 错误保存成了 `.mp4` 文件。

当前任务插件渠道不支持普通渠道的内置测试功能。渠道页提示“Task Plugin channel test is not supported”不代表本插件生成失败，应按上面步骤调用标准视频接口验证。

## 8. 图生视频、多素材与结构化请求

安装插件不会额外增加本地素材上传能力，输入方式仍受模型限制：

- 两个 Grok 模型支持单图 URL，也支持单张本地图片 multipart 上传。
- 其他当前支持的模型使用公开可访问的素材 URL；本地图片应先上传到媒体存储取得 URL，再提交图生视频请求。素材地址在任务处理期间需要保持可读取。
- `H3` 支持图片和音频参考，不接受参考视频。
- `wan3.0-official` 支持 480p/720p/1080p、2–30 秒、`adaptive`/`21:9`/`16:9`/`4:3`/`1:1`/`3:4`/`9:16`，最多 10 张图片、5 条参考视频、5 条参考音频；可选 `prompt_extend` 和 `watermark`。
- 多图、参考视频、参考音频、首尾帧以及 Seedance 结构化 `content`，需遵守对应模型的参数和组合限制。
- 使用 `content` 时，把提示词与媒体都放入 `content`；不要再传顶层 `prompt` 或参考媒体字段，即使 `prompt` 是空字符串或 `null` 也不要混用。

单图示例仍发送到你自己的 `/v1/videos`：

```json
{
  "model": "doubao-seedance-2-0-mini-260615",
  "prompt": "保持图片中的主体，镜头缓慢推进",
  "duration": 4,
  "resolution": "720p",
  "aspect_ratio": "16:9",
  "input_reference": "https://media.example.com/product.jpg"
}
```

请把示例素材地址替换为实际可读的图片。完整参数、参考视频/音频、首尾帧、Grok multipart 和结构化 `content` 示例见 [视频 API 接入指南](https://coderapi.vip/docs/videos)。在你的站点使用时，将该指南中的请求域名改为你自己的 New API 域名，API Key 改为你的本地令牌；请求字段保持一致。

## 9. 插件更新与回退

最新源码直达地址为：

```text
https://raw.githubusercontent.com/QLHazyCoder/new-api-video-gateway-plugin/main/plugin.js
```

这条地址随发布更新；第 2 节固定版本地址保持不变。插件上传到你的 New API 后不会自动跟随此地址升级。

更新前，记录当前活动版本，并备份涉及的渠道和价格配置。在任务插件列表选择 **上传新版本**，导入新源码，核对插件标识仍是 `coder-video-gateway`，再上传并激活新版本。最后确认插件已启用、运行状态已注册，重新核对原渠道绑定和模型列表。

更新插件不代表新模型已经写入已有渠道，也不会自动给新模型定价；新增模型需要同时检查服务密钥授权、本地渠道模型和本地模型定价。

出现问题时，先保留报错和任务 ID，可在插件详情的 **版本** 页面使用 **激活 / 回滚** 切回仍保留的旧版本。保留已有版本，尤其不要在仍有排队或生成中任务时直接删除插件或旧版本。不要通过关闭整个任务插件总开关来尝试回退单个插件。

## 10. 常见问题

| 现象 | 检查与处理 |
| --- | --- |
| 找不到任务插件页面 | 确认使用超级管理员账号，并检查 New API 版本是否具备 Task Plugin v1 及视频能力 |
| 从 URL 导入失败 | 使用本文原始文件地址；导入请求由浏览器发起，可以改为下载 `.js` 后上传或粘贴源码 |
| 上传成功但渠道列表里没有插件 | 确认任务插件总开关、单插件启用、活动版本和“已注册”状态；新增渠道的管理员还需具备插件绑定权限 |
| 提示编译失败或声明不支持 | 阅读插件运行错误；核对宿主功能与插件版本，不要把 HTML 文件当插件上传 |
| 提示插件或路由冲突 | 按报错中列出的冲突对象检查已有配置，不强制覆盖或停用其他仍在使用的插件 |
| 渠道没有“获取模型”按钮 | 按第 4 节查询服务密钥的模型后手动填写，保留任务插件渠道类型 |
| 普通渠道测试提示不支持 | 按第 7 节执行视频任务完整流程，不用聊天测试判断视频接口是否正常 |
| `No available channel for model` | 先查本地渠道是否启用、类型与插件绑定、模型名、本地令牌分组；若是转发后的服务响应，还需检查服务密钥授权与服务可用性 |
| 提示只提供网页、API 地址错误或返回 HTML | 核对渠道 Base URL 是否为 `https://coderapi.vip` 根地址，是否误填网页地址或额外追加 `/v1`；自行使用的反向代理还需正确转发 API 路径 |
| 401 / 403 | 区分本地令牌认证失败和服务渠道密钥认证失败，检查对应密钥的状态、授权、模型限制及 IP 限制 |
| `content cannot be combined ...` | 统一格式和 `content` 格式二选一，删除另一种格式的顶层提示词或媒体字段 |
| 分辨率不支持 | 同时核对模型能力和服务分组限制；不能用其他模型或其他分组的分辨率范围替代 |
| 任务创建成功但迟迟未完成 | 检查自己的任务日志、插件运行状态、服务器到本服务的访问和服务响应；保存原任务 ID 继续查询，不重复 POST |
| 查询不到任务 | 使用你站点返回的 `id`、你站点域名和具有该任务访问权限的本地令牌，不混用两级任务 ID |
| 已完成但下载失败 | 核对任务归属和下载路径，检查代理是否正确传递认证与视频响应；重试同一任务下载，无需重新生成 |
| 用户扣费与服务费用不同 | 分别核对本地价格表达式、分组倍率、任务用量和最终结算；插件不自动同步两边价格 |

交付给最终用户前，请完成：插件激活并注册、渠道启用且分组匹配、模型授权和定价核对、一次任务创建、查询到完成、下载到可播放的视频。仅安装成功或看到模型列表，不代表生成链路已经验收。

## 11. 附件：完整插件源码（1.1.0）

以下代码块是 `plugin.js` 的完整内容，可直接复制到 New API **上传插件 → 源码编辑框**，或保存为 UTF-8 编码的 `plugin.js` 后选择文件上传。上传后仍需激活、启用插件并按前文配置渠道。

- 插件名称：`Coder Video Gateway`
- 插件标识：`coder-video-gateway`
- 版本：`1.1.0`
- 源码 SHA-256：`b70af4bccf5ace48bdc6580f00026dee3e6422d6e848731dd367662a1fa939e3`

复制时仅保留下方 JavaScript 源码，不要包含 Markdown 的三反引号围栏。附件对应本文固定版本；以后升级时，应同时核对新版本源码、插件版本和安装说明。

```javascript
const MULTIPART_CLASSIC = "grok-imagine-video";
const MULTIPART_15 = "grok-imagine-video-1.5";
const MULTIPART_MODELS = [MULTIPART_CLASSIC, MULTIPART_15];
const H3_MODEL = "H3";
const WAN_MODEL = "wan3.0-official";
const WAN_RATIOS = ["adaptive", "21:9", "16:9", "4:3", "1:1", "3:4", "9:16"];
const EXTENDED_CONFIG = {
  "doubao-seedance-2-0-260128": { maxDuration: 15, resolutions: ["480p", "720p", "1080p", "4k"] },
  "doubao-seedance-2-0-fast-260128": { maxDuration: 15, resolutions: ["480p", "720p"] },
  "doubao-seedance-2-0-mini-260615": { maxDuration: 15, resolutions: ["480p", "720p"] },
  "doubao-seedance-2-5-260628": { maxDuration: 30, resolutions: ["480p", "720p", "1080p"] },
};
const EXTENDED_MODELS = Object.keys(EXTENDED_CONFIG);
const EXTENDED_ASPECT_RATIOS = ["16:9", "9:16", "1:1", "21:9", "4:3", "3:4"];
const EXTENDED_RESOLUTION_PIXELS = {
  "480p": 854 * 480,
  "720p": 1280 * 720,
  "1080p": 1920 * 1080,
  "4k": 3840 * 2160,
};
const EXTENDED_SIZE_OPTIONS = {
  "480p": { resolution: "480p" },
  "854x480": { resolution: "480p", ratio: "16:9" },
  "480x854": { resolution: "480p", ratio: "9:16" },
  "720p": { resolution: "720p" },
  "1280x720": { resolution: "720p", ratio: "16:9" },
  "720x1280": { resolution: "720p", ratio: "9:16" },
  "1080p": { resolution: "1080p" },
  "1920x1080": { resolution: "1080p", ratio: "16:9" },
  "1080x1920": { resolution: "1080p", ratio: "9:16" },
  "4k": { resolution: "4k" },
  "3840x2160": { resolution: "4k", ratio: "16:9" },
  "2160x3840": { resolution: "4k", ratio: "9:16" },
};

const URL_INPUT_CONFIG = {
  "seedance-2.0": { minDuration: 5, maxDuration: 15, defaultDuration: 5, resolutions: ["480p", "720p"], maxImages: 9, maxVideos: 3, maxAudios: 3 },
  "seedance-2.5": { minDuration: 5, maxDuration: 30, defaultDuration: 5, resolutions: ["480p", "720p", "1080p"], maxImages: 30, maxVideos: 10, maxAudios: 10 },
  "seedance-2.0-fast-offical": { minDuration: 4, maxDuration: 15, defaultDuration: 4, resolutions: ["480p", "720p"], maxImages: 9, maxVideos: 3, maxAudios: 3 },
  "seedance-2.0-mini-offical": { minDuration: 4, maxDuration: 15, defaultDuration: 4, resolutions: ["480p", "720p"], maxImages: 9, maxVideos: 3, maxAudios: 3 },
  "seedance-2.0-offical": { minDuration: 4, maxDuration: 15, defaultDuration: 4, resolutions: ["480p", "720p", "1080p"], maxImages: 9, maxVideos: 3, maxAudios: 3 },
  H3: { minDuration: 4, maxDuration: 15, defaultDuration: 4, resolutions: ["720p"], maxImages: 9, maxVideos: 0, maxAudios: 3 },
  "wan3.0-official": { minDuration: 2, maxDuration: 30, defaultDuration: 5, resolutions: ["480p", "720p", "1080p"], maxImages: 10, maxVideos: 5, maxAudios: 5, allowAutoDuration: true },
};
const URL_INPUT_MODELS = Object.keys(URL_INPUT_CONFIG);
const URL_INPUT_720_ONLY_MODELS = URL_INPUT_MODELS.filter(function (model) { return model !== H3_MODEL && URL_INPUT_CONFIG[model].resolutions.length === 2; });
const URL_INPUT_1080_MODELS = URL_INPUT_MODELS.filter(function (model) { return model !== WAN_MODEL && URL_INPUT_CONFIG[model].resolutions.indexOf("1080p") >= 0; });
const URL_INPUT_RESOLUTIONS = URL_INPUT_CONFIG["seedance-2.5"].resolutions;
const URL_CONTENT_MODELS = ["seedance-2.0-fast-offical", "seedance-2.0-mini-offical", "seedance-2.0-offical"];
const URL_ASPECT_RATIOS = ["9:16", "16:9", "1:1", "3:4", "4:3"];
const URL_CONTENT_FIELDS = { model: true, content: true, duration: true, resolution: true, ratio: true, generate_audio: true, return_last_frame: true, seed: true, output_format: true };

const VIDEO_MODELS = MULTIPART_MODELS.concat(URL_INPUT_MODELS, EXTENDED_MODELS);
const MULTIPART_CLASSIC_RESOLUTIONS = ["480p", "720p"];
const MULTIPART_15_RESOLUTIONS = ["480p", "720p", "1080p"];
const MULTIPART_RESOLUTIONS = MULTIPART_15_RESOLUTIONS;
const ASPECT_RATIOS = ["1:1", "16:9", "9:16", "4:3", "3:4", "3:2", "2:3"];
const SIZE_TO_ASPECT_RATIO = {
  "1024x1024": "1:1",
  "1280x720": "16:9",
  "1920x1080": "16:9",
  "720x1280": "9:16",
  "1080x1920": "9:16",
  "1024x768": "4:3",
  "768x1024": "3:4",
  "1536x1024": "3:2",
  "1024x1536": "2:3",
};

const SUPPORTED_FIELDS = {
  model: true,
  prompt: true,
  duration: true,
  seconds: true,
  size: true,
  resolution: true,
  aspect_ratio: true,
  aspectRatio: true,
  ratio: true,
  input_reference: true,
  image: true,
  image_url: true,
  reference_image_urls: true,
  images: true,
  image_urls: true,
  reference_video_urls: true,
  reference_audio_urls: true,
  first_frame_image_url: true,
  last_frame_image_url: true,
  negative_prompt: true,
  generate_audio: true,
  return_last_frame: true,
  output_format: true,
  seed: true,
  n: true,
  bypass_face_check: true,
  grid_strength: true,
  strength: true,
  auto_face_mask: true,
  prompt_extend: true,
  watermark: true,
};

const EXTENDED_SUPPORTED_FIELDS = {
  model: true,
  prompt: true,
  duration: true,
  seconds: true,
  size: true,
  resolution: true,
  aspect_ratio: true,
  aspectRatio: true,
  ratio: true,
  input_reference: true,
  image: true,
  image_url: true,
  reference_image_urls: true,
  images: true,
  image_urls: true,
  reference_video_urls: true,
  reference_audio_urls: true,
  first_frame_image_url: true,
  last_frame_image_url: true,
  generate_audio: true,
  watermark: true,
  seed: true,
};
const EXTENDED_NATIVE_FIELDS = {
  model: true,
  content: true,
  duration: true,
  resolution: true,
  ratio: true,
  generate_audio: true,
  watermark: true,
  seed: true,
};

const DURATION_FIELD = {
  type: "number",
  unit: "second",
  description: { en: "Video generation unit price", zh: "视频生成单价" },
};

const IMAGE_COUNT_FIELD = {
  type: "number",
  unit: "count",
  unitLabel: { en: "image", zh: "张" },
  description: { en: "Input image unit price", zh: "输入图片单价" },
};

const AUDIO_COUNT_FIELD = {
  type: "number",
  unit: "count",
  unitLabel: { en: "audio", zh: "条" },
  description: { en: "Input audio unit price", zh: "输入音频单价" },
};

const INPUT_VIDEO_DURATION_FIELD = {
  type: "number",
  unit: "second",
  description: { en: "Reference video duration unit price", zh: "参考视频时长单价" },
};

const HAS_VIDEO_FIELD = {
  enum: ["true", "false"],
  enumLabels: {
    true: { en: "With reference video", zh: "含参考视频" },
    false: { en: "Without reference video", zh: "不含参考视频" },
  },
  description: { en: "Whether a reference video is supplied", zh: "是否包含参考视频" },
};

const EXTENDED_VIDEO_INPUT_FIELD = {
  enum: ["none", "video"],
  enumLabels: {
    none: { en: "No reference video", zh: "无参考视频" },
    video: { en: "With reference video", zh: "含参考视频" },
  },
  description: { en: "Reference video input", zh: "参考视频输入" },
};

const RESOLUTION_LABELS = {
  "480p": { en: "480p", zh: "480p" },
  "720p": { en: "720p", zh: "720p" },
  "1080p": { en: "1080p", zh: "1080p" },
  "4k": { en: "4K", zh: "4K" },
};

function extendedUsageSchema(resolutions) {
  const schema = {
    tokens: {
      type: "number",
      unit: "token",
      description: { en: "Video generation token unit price", zh: "视频生成 Token 单价" },
    },
    duration: DURATION_FIELD,
    resolution: {
      enum: resolutions.slice(),
      enumLabels: {},
      description: { en: "Output video resolution", zh: "输出视频分辨率" },
    },
    video_input: EXTENDED_VIDEO_INPUT_FIELD,
  };
  for (const resolution of resolutions) schema.resolution.enumLabels[resolution] = RESOLUTION_LABELS[resolution];
  return schema;
}

function extendedUsageExamples(resolutions) {
  const duration = 6;
  const first = resolutions[0];
  const last = resolutions[resolutions.length - 1];
  return [
    {
      label: first + " · 6s · no reference video",
      facts: { tokens: estimateExtendedTokens(duration, first), duration: duration, resolution: first, video_input: "none" },
    },
    {
      label: last + " · 6s · reference video",
      facts: { tokens: estimateExtendedTokens(duration, last), duration: duration, resolution: last, video_input: "video" },
    },
  ];
}

const EXTENDED_USAGE_PROFILES = EXTENDED_MODELS.map(function (model) {
  const resolutions = EXTENDED_CONFIG[model].resolutions;
  return {
    models: [model],
    schema: extendedUsageSchema(resolutions),
    examples: extendedUsageExamples(resolutions),
  };
});

function usageSchema(resolutions, includeVideo, includeInputVideo) {
  const schema = {
    duration: DURATION_FIELD,
    resolution: {
      enum: resolutions.slice(),
      enumLabels: {},
      description: { en: "Output video resolution", zh: "输出视频分辨率" },
    },
    image_count: IMAGE_COUNT_FIELD,
  };
  for (const resolution of resolutions) schema.resolution.enumLabels[resolution] = RESOLUTION_LABELS[resolution];
  if (includeVideo) schema.has_video = HAS_VIDEO_FIELD;
  if (includeInputVideo) schema.input_video_duration = INPUT_VIDEO_DURATION_FIELD;
  return schema;
}

export const meta = {
  apiVersion: 1,
  key: "coder-video-gateway",
  name: "Coder Video Gateway",
  icon: "text:CV",
  description: {
    en: "Video generation through a standard OpenAI-compatible interface",
    zh: "通过标准 OpenAI 兼容接口提供视频生成服务",
  },
  version: "1.1.0",
  author: { name: "QLHazyCoder" },
  website: "https://coderapi.vip",
  baseUrl: "https://coderapi.vip",
  models: VIDEO_MODELS,
  fetchMode: "per_task",
  protocols: ["openai_video"],
  usageProfiles: [
    {
      models: [MULTIPART_CLASSIC],
      schema: usageSchema(MULTIPART_CLASSIC_RESOLUTIONS, false),
      examples: [
        { label: "480p 5s", facts: { duration: 5, resolution: "480p", image_count: 0 } },
        { label: "720p 10s · image", facts: { duration: 10, resolution: "720p", image_count: 1 } },
      ],
    },
    {
      models: [MULTIPART_15],
      schema: usageSchema(MULTIPART_15_RESOLUTIONS, false),
      examples: [
        { label: "480p 5s", facts: { duration: 5, resolution: "480p", image_count: 0 } },
        { label: "1080p 10s · image", facts: { duration: 10, resolution: "1080p", image_count: 1 } },
      ],
    },
    {
      models: URL_INPUT_720_ONLY_MODELS,
      schema: usageSchema(["480p", "720p"], true),
      examples: [
        { label: "720p 5s", facts: { duration: 5, resolution: "720p", image_count: 0, has_video: "false" } },
        { label: "720p 8s · reference video", facts: { duration: 8, resolution: "720p", image_count: 0, has_video: "true" } },
      ],
    },
    {
      models: URL_INPUT_1080_MODELS,
      schema: usageSchema(URL_INPUT_RESOLUTIONS, true),
      examples: [
        { label: "720p 5s", facts: { duration: 5, resolution: "720p", image_count: 0, has_video: "false" } },
        { label: "1080p 8s · reference video", facts: { duration: 8, resolution: "1080p", image_count: 0, has_video: "true" } },
      ],
    },
    {
      models: [H3_MODEL],
      schema: Object.assign(usageSchema(["720p"], false), { audio_count: AUDIO_COUNT_FIELD }),
      examples: [
        { label: "720p 4s", facts: { duration: 4, resolution: "720p", image_count: 0, audio_count: 0 } },
        { label: "720p 15s · 9 images · 3 audio", facts: { duration: 15, resolution: "720p", image_count: 9, audio_count: 3 } },
      ],
    },
    {
      models: [WAN_MODEL],
      schema: usageSchema(["480p", "720p", "1080p"], false, true),
      examples: [
        { label: "720p 5s", facts: { duration: 5, resolution: "720p", image_count: 0, input_video_duration: 0 } },
        { label: "1080p 10s · reference video", facts: { duration: 10, resolution: "1080p", image_count: 0, input_video_duration: 8 } },
      ],
    },
    ...EXTENDED_USAGE_PROFILES,
  ],
};

function trimmed(value) {
  return String(value === undefined || value === null ? "" : value).trim();
}

function hasOwn(object, key) {
  return Object.prototype.hasOwnProperty.call(object || {}, key);
}

function isObject(value) {
  return !!value && typeof value === "object" && !Array.isArray(value);
}

function assertObject(value, message) {
  if (!isObject(value)) throw new Error(message);
  return value;
}

function hasValue(value) {
  return value !== undefined && value !== null && (typeof value !== "string" || trimmed(value) !== "");
}

function assertSupportedFields(request) {
  for (const field of Object.keys(request)) {
    if (!hasOwn(SUPPORTED_FIELDS, field)) throw new Error("unsupported field: " + field);
  }
}

function supportsMultipartInput(model) {
  return MULTIPART_MODELS.indexOf(model) >= 0;
}

function isUrlInputModel(model) {
  return URL_INPUT_MODELS.indexOf(model) >= 0;
}

function isExtended(model) {
  return Object.prototype.hasOwnProperty.call(EXTENDED_CONFIG, model);
}

function clientModelFor(ctx, request) {
  const selected = trimmed(ctx && ctx.model);
  const supplied = trimmed(request && request.model);
  if (selected && supplied && selected !== supplied) throw new Error("request model does not match the selected model");
  const model = selected || supplied;
  if (!model) throw new Error("model is required");
  const upstream = trimmed(ctx && ctx.upstreamModel) || model;
  if (VIDEO_MODELS.indexOf(upstream) < 0) throw new Error("unsupported video model: " + model);
  return model;
}

function upstreamModelFor(ctx, clientModel) {
  const model = trimmed(ctx && ctx.upstreamModel) || clientModel;
  if (VIDEO_MODELS.indexOf(model) < 0) throw new Error("unsupported upstream video model: " + model);
  return model;
}

function integerValue(value, field, min, max) {
  if (typeof value !== "number" && typeof value !== "string") {
    throw new Error(field + " must be an integer");
  }
  if (typeof value === "string" && !/^\s*[+-]?\d+\s*$/.test(value)) {
    throw new Error(field + " must be an integer");
  }
  const number = Number(value);
  if (!Number.isSafeInteger(number) || number < min || (max !== undefined && number > max)) {
    const range = max === undefined ? "at least " + min : "between " + min + " and " + max;
    throw new Error(field + " must be an integer " + range);
  }
  return number;
}

function durationFor(request, model) {
  const values = [];
  const config = URL_INPUT_CONFIG[model];
  const minimum = config ? config.minDuration : isExtended(model) ? 4 : 1;
  const maximum = config ? config.maxDuration : isExtended(model) ? EXTENDED_CONFIG[model].maxDuration : 15;
  const normalizeDuration = function (value, field) {
    if (config && config.allowAutoDuration && (value === -1 || (typeof value === "string" && trimmed(value) === "-1"))) return -1;
    return integerValue(value, field, minimum, maximum);
  };
  if (hasValue(request.seconds)) values.push(normalizeDuration(request.seconds, "seconds"));
  if (hasValue(request.duration)) values.push(normalizeDuration(request.duration, "duration"));
  if (values.length > 1 && values[0] !== values[1]) throw new Error("seconds and duration must match when both are provided");
  if (!values.length) {
    if (config) return config.defaultDuration;
    throw new Error("seconds or duration is required for video generation");
  }
  return values[0];
}

function normalizeResolution(value, model) {
  const raw = trimmed(value).toLowerCase();
  const resolution = raw === "480" ? "480p" : raw === "720" ? "720p" : raw === "1080" ? "1080p" : raw;
  const allowed = isExtended(model) ? EXTENDED_CONFIG[model].resolutions : model === H3_MODEL ? ["720p"] : supportsMultipartInput(model)
    ? model === MULTIPART_CLASSIC
      ? ["480p", "720p"]
      : MULTIPART_RESOLUTIONS
    : URL_INPUT_CONFIG[model].resolutions;
  if (allowed.indexOf(resolution) < 0) throw new Error("resolution is not supported by " + model + "; use " + allowed.join(", "));
  return resolution;
}

function resolutionFor(request, model) {
  return hasValue(request.resolution) ? normalizeResolution(request.resolution, model) : supportsMultipartInput(model) ? "480p" : "720p";
}

function stringValue(value, field) {
  if (typeof value !== "string" || !trimmed(value)) throw new Error(field + " must be a non-empty string");
  return trimmed(value);
}

function publicURL(value, field) {
  const url = stringValue(value, field);
  if (!/^https?:\/\/[^\s]+$/i.test(url)) throw new Error(field + " must be a public HTTP(S) URL");
  return url;
}

function publicURLArray(value, field) {
  if (!Array.isArray(value)) throw new Error(field + " must be an array of public HTTP(S) URLs");
  return value.map(function (item, index) {
    return publicURL(item, field + "[" + index + "]");
  });
}

function aliasValue(request, names, label, normalize) {
  let selected;
  let selectedName = "";
  for (const name of names) {
    if (!hasOwn(request, name) || !hasValue(request[name])) continue;
    const value = normalize(request[name], name);
    if (selected !== undefined && JSON.stringify(selected) !== JSON.stringify(value)) {
      throw new Error(names.join(", ") + " must describe the same " + label);
    }
    selected = value;
    selectedName = name;
  }
  return selectedName ? selected : undefined;
}

function booleanValue(value, field) {
  if (typeof value === "boolean") return value;
  const normalized = trimmed(value).toLowerCase();
  if (normalized === "true") return true;
  if (normalized === "false") return false;
  throw new Error(field + " must be true or false");
}

function optionalString(request, field) {
  if (!hasOwn(request, field) || !hasValue(request[field])) return undefined;
  return stringValue(request[field], field);
}

function copyFilePlaceholder(value, expectedRef) {
  const placeholder = assertObject(value, "image file reference is invalid");
  const allowed = { __fileRef: true, encoding: true, mimeType: true, maxBytes: true };
  for (const key of Object.keys(placeholder)) {
    if (!allowed[key]) throw new Error("image file reference is invalid");
  }
  const ref = trimmed(placeholder.__fileRef);
  const encoding = trimmed(placeholder.encoding);
  if (!ref || (encoding !== "base64" && encoding !== "dataUrl")) throw new Error("image file reference is invalid");
  if (expectedRef && ref !== expectedRef) throw new Error("image file reference does not match the uploaded image");
  const copied = { __fileRef: ref, encoding: encoding };
  if (hasValue(placeholder.mimeType)) copied.mimeType = trimmed(placeholder.mimeType);
  if (placeholder.maxBytes !== undefined) copied.maxBytes = placeholder.maxBytes;
  return copied;
}

function imageValue(value, field, model, allowFilePlaceholder, expectedFileRef) {
  if (typeof value === "string") {
    const raw = trimmed(value);
    if (!raw) throw new Error(field + " must not be empty");
    if (isUrlInputModel(model)) return { kind: "public", value: publicURL(raw, field) };
    return { kind: "image", value: { url: raw } };
  }
  const object = assertObject(value, field + " must be a URL, data URL, or image object");
  const keys = Object.keys(object);
  if (keys.length !== 1 || (!hasOwn(object, "url") && !hasOwn(object, "file_id"))) {
    throw new Error(field + " must contain exactly one of url or file_id");
  }
  if (hasOwn(object, "file_id")) {
    const fileID = stringValue(object.file_id, field + ".file_id");
    if (isUrlInputModel(model)) throw new Error(field + ".file_id is not supported; use a public image URL");
    return { kind: "image", value: { file_id: fileID } };
  }
  if (isObject(object.url)) {
    if (!allowFilePlaceholder || isUrlInputModel(model)) throw new Error(field + ".url must be a public HTTP(S) URL for this model");
    return { kind: "image", value: { url: copyFilePlaceholder(object.url, expectedFileRef) } };
  }
  const url = stringValue(object.url, field + ".url");
  if (isUrlInputModel(model)) return { kind: "public", value: publicURL(url, field + ".url") };
  return { kind: "image", value: { url: url } };
}

function imageFromRequest(request, model, uploadedFile) {
  const candidates = [];
  for (const field of ["image", "input_reference", "image_url"]) {
    if (hasOwn(request, field) && hasValue(request[field])) candidates.push(imageValue(request[field], field, model, !!uploadedFile, uploadedFile && uploadedFile.ref));
  }
  if (uploadedFile) {
    if (isUrlInputModel(model)) {
      throw new Error("this model requires a public HTTP(S) image URL; upload the image to an image host first");
    }
    const existing = candidates[0];
    const existingRef = existing && isObject(existing.value) && isObject(existing.value.url) ? trimmed(existing.value.url.__fileRef) : "";
    if (!existing) {
      candidates.push({ kind: "image", value: { url: { __fileRef: uploadedFile.ref, encoding: "dataUrl" } } });
    } else if (existingRef !== trimmed(uploadedFile.ref)) {
      throw new Error("provide at most one image or input_reference");
    }
  }
  if (candidates.length > 1 && candidates.some(function (value) { return JSON.stringify(value) !== JSON.stringify(candidates[0]); })) {
    throw new Error("image, input_reference, and image_url must describe the same input reference");
  }
  return candidates.length ? candidates[0] : null;
}

function normalizeAspectRatio(request, hasImage) {
  const values = [];
  for (const field of ["aspect_ratio", "aspectRatio", "ratio"]) {
    if (!hasValue(request[field])) continue;
    const value = stringValue(request[field], field);
    if (ASPECT_RATIOS.indexOf(value) < 0) throw new Error("aspect_ratio must be one of " + ASPECT_RATIOS.join(", "));
    values.push(value);
  }
  if (hasValue(request.size)) {
    const size = trimmed(request.size).toLowerCase().replace(/\s/g, "");
    const mapped = SIZE_TO_ASPECT_RATIO[size];
    if (!mapped) throw new Error("size is not supported; use aspect_ratio instead");
    values.push(mapped);
  }
  if (values.length > 1 && values.some(function (value) { return value !== values[0]; })) {
    throw new Error("aspect_ratio, aspectRatio, and ratio must describe the same aspect ratio");
  }
  if (values.length) return values[0];
  return hasImage ? "" : "16:9";
}

function imageCount(request) {
  if (Array.isArray(request.content)) {
    return request.content.filter(function (item) { return item.type === "image_url"; }).length;
  }
  let count = 0;
  if (request.image || request.input_reference) count += 1;
  if (Array.isArray(request.reference_image_urls)) count += request.reference_image_urls.length;
  if (request.first_frame_image_url) count += 1;
  if (request.last_frame_image_url) count += 1;
  return count;
}

function audioCount(request) {
  if (Array.isArray(request.content)) {
    return request.content.filter(function (item) { return item.type === "audio_url"; }).length;
  }
  return Array.isArray(request.reference_audio_urls) ? request.reference_audio_urls.length : 0;
}

function estimateExtendedTokens(duration, resolution) {
  const pixels = EXTENDED_RESOLUTION_PIXELS[resolution];
  if (!pixels) throw new Error("unsupported output resolution for token estimate: " + resolution);
  return Math.ceil((duration * pixels * 24) / 1024);
}

function hasReferenceVideo(request) {
  if (Array.isArray(request.content)) {
    return request.content.some(function (item) { return item.type === "video_url" && item.role === "reference_video"; });
  }
  return Array.isArray(request.reference_video_urls) && request.reference_video_urls.length > 0;
}

function actionFor(request) {
  if (hasReferenceVideo(request)) return "reference_to_video";
  if (imageCount(request) > 0) return "image_to_video";
  return "text_to_video";
}

function normalizeMultipartVideoRequest(request, model, uploadedFile) {
  for (const field of [
    "reference_image_urls",
    "images",
    "image_urls",
    "reference_video_urls",
    "reference_audio_urls",
    "first_frame_image_url",
    "last_frame_image_url",
    "negative_prompt",
    "return_last_frame",
    "output_format",
    "bypass_face_check",
    "seed",
    "n",
    "grid_strength",
    "strength",
    "auto_face_mask",
  ]) {
    if (hasOwn(request, field) && hasValue(request[field])) throw new Error(field + " is not supported by " + model);
  }
  const image = imageFromRequest(request, model, uploadedFile);
  const prompt = hasValue(request.prompt) ? stringValue(request.prompt, "prompt") : "";
  if (!prompt && !image) throw new Error("prompt is required when no image is provided");
  const normalized = {
    model: model,
    duration: durationFor(request, model),
    resolution: resolutionFor(request, model),
  };
  if (prompt) normalized.prompt = prompt;
  const aspectRatio = normalizeAspectRatio(request, !!image);
  if (aspectRatio) normalized.aspect_ratio = aspectRatio;
  if (image) normalized.image = image.value;
  if (hasOwn(request, "generate_audio")) normalized.generate_audio = booleanValue(request.generate_audio, "generate_audio");
  return normalized;
}

function normalizeUrlInputRequest(request, model, uploadedFile) {
  if (model === H3_MODEL) {
    for (const field of ["reference_video_urls", "first_frame_image_url", "last_frame_image_url", "size"]) {
      if (hasOwn(request, field) && hasValue(request[field])) throw new Error(field + " is not supported by H3");
    }
  }
  const image = imageFromRequest(request, model, uploadedFile);
  const normalized = {
    model: model,
    prompt: stringValue(request.prompt, "prompt"),
    duration: durationFor(request, model),
    resolution: resolutionFor(request, model),
  };
  const aspectRatio = aliasValue(request, ["aspect_ratio", "aspectRatio", "ratio"], "aspect ratio", function (value, field) {
    return stringValue(value, field);
  });
  if (aspectRatio !== undefined) {
    const allowedRatios = model === WAN_MODEL ? WAN_RATIOS : URL_ASPECT_RATIOS;
    if (allowedRatios.indexOf(aspectRatio) < 0) {
      throw new Error("aspect_ratio must be one of " + allowedRatios.join(", ") + " for " + model);
    }
    normalized.aspect_ratio = aspectRatio;
  }
  if (image) normalized.input_reference = image.value;
  const referenceImages = aliasValue(request, ["reference_image_urls", "images", "image_urls"], "reference images", function (value, field) {
    return publicURLArray(value, field);
  });
  if (referenceImages !== undefined && referenceImages.length > 0) normalized.reference_image_urls = referenceImages;
  for (const field of ["reference_video_urls", "reference_audio_urls"]) {
    if (hasOwn(request, field) && hasValue(request[field])) normalized[field] = publicURLArray(request[field], field);
  }
  for (const field of ["size", "negative_prompt", "first_frame_image_url", "last_frame_image_url"]) {
    const value = optionalString(request, field);
    if (value !== undefined) normalized[field] = field.endsWith("_url") ? publicURL(value, field) : value;
  }
  for (const field of ["generate_audio", "return_last_frame", "bypass_face_check", "auto_face_mask"]) {
    if (hasOwn(request, field)) normalized[field] = booleanValue(request[field], field);
  }
  if (hasOwn(request, "prompt_extend")) {
    if (model !== WAN_MODEL) throw new Error("prompt_extend is supported only by " + WAN_MODEL);
    normalized.prompt_extend = booleanValue(request.prompt_extend, "prompt_extend");
  }
  if (hasOwn(request, "watermark")) {
    if (model !== WAN_MODEL) throw new Error("watermark is supported only by " + WAN_MODEL);
    normalized.watermark = booleanValue(request.watermark, "watermark");
  }
  if (hasOwn(request, "seed")) normalized.seed = integerValue(request.seed, "seed", 0);
  if (hasOwn(request, "output_format")) {
    if (stringValue(request.output_format, "output_format").toLowerCase() !== "mp4") throw new Error("output_format must be mp4");
  }
  if (hasOwn(request, "n")) normalized.n = integerValue(request.n, "n", 1, model === H3_MODEL ? 1 : 16);
  if (hasOwn(request, "grid_strength")) {
    if (typeof request.grid_strength !== "number" && typeof request.grid_strength !== "string") {
      throw new Error("grid_strength must be between 0 and 1");
    }
    const strength = Number(request.grid_strength);
    if (!Number.isFinite(strength) || strength < 0 || strength > 1) throw new Error("grid_strength must be between 0 and 1");
    normalized.grid_strength = strength;
  }
  if (hasOwn(request, "strength")) normalized.strength = integerValue(request.strength, "strength", 1, 10);
  const config = URL_INPUT_CONFIG[model];
  if (imageCount(normalized) > config.maxImages) throw new Error(model + " accepts at most " + config.maxImages + " input images");
  if ((normalized.reference_video_urls || []).length > config.maxVideos) throw new Error(model + " accepts at most " + config.maxVideos + " reference videos");
  if (audioCount(normalized) > config.maxAudios) throw new Error(model + " accepts at most " + config.maxAudios + " reference audio URLs");
  if (URL_CONTENT_MODELS.indexOf(model) >= 0) {
    const hasFrames = !!(normalized.first_frame_image_url || normalized.last_frame_image_url);
    if (normalized.last_frame_image_url && !normalized.first_frame_image_url) throw new Error("last_frame_image_url requires first_frame_image_url");
    if (hasFrames && (normalized.input_reference || (normalized.reference_image_urls || []).length || hasReferenceVideo(normalized) || audioCount(normalized))) {
      throw new Error("first/last-frame input cannot be mixed with reference images, videos, or audio");
    }
    if (audioCount(normalized) > 0 && !hasReferenceVideo(normalized) && !imageCount(normalized)) {
      throw new Error("this model does not accept audio-only input; include a reference image or video");
    }
  }
  return normalized;
}

function normalizeOfficialContent(value) {
  if (!Array.isArray(value) || value.length === 0) throw new Error("content must be a non-empty array");
  const textParts = [];
  const images = [];
  const videos = [];
  const audios = [];
  for (let index = 0; index < value.length; index += 1) {
    const item = assertObject(value[index], "content[" + index + "] must be an object");
    const field = "content[" + index + "]";
    const type = stringValue(item.type, field + ".type");
    if (type === "text") {
      assertExactKeys(item, { type: true, text: true }, field);
      textParts.push(stringValue(item.text, field + ".text"));
      continue;
    }
    const roleOptions = { image_url: ["reference_image", "first_frame", "last_frame"], video_url: ["reference_video"], audio_url: ["reference_audio"] };
    const roles = hasOwn(roleOptions, type) ? roleOptions[type] : null;
    if (!roles) throw new Error("unsupported content type: " + type);
    const allowed = { type: true, role: true };
    allowed[type] = true;
    assertExactKeys(item, allowed, field);
    const address = assertObject(item[type], field + "." + type + " must be an object");
    assertExactKeys(address, { url: true }, field + "." + type);
    const url = publicURL(address.url, field + "." + type + ".url");
    const role = hasOwn(item, "role") ? stringValue(item.role, field + ".role") : "";
    if (role && roles.indexOf(role) < 0) throw new Error(field + ".role must be one of " + roles.join(", "));
    if (type === "image_url") images.push({ url: url, role: role });
    else (type === "video_url" ? videos : audios).push(url);
  }
  const hasFrameRole = images.some(function (image) { return image.role === "first_frame" || image.role === "last_frame"; });
  for (const image of images) {
    if (image.role) continue;
    if (images.length === 1) image.role = "first_frame";
    else {
      if (hasFrameRole) throw new Error("content[].role must be provided for every image when using first/last-frame input");
      image.role = "reference_image";
    }
  }
  const result = {};
  if (textParts.length) result.prompt = textParts.join("\n").trim();
  const first = images.filter(function (image) { return image.role === "first_frame"; });
  const last = images.filter(function (image) { return image.role === "last_frame"; });
  const references = images.filter(function (image) { return image.role === "reference_image"; });
  if (first.length > 1 || last.length > 1) throw new Error("content accepts at most one first_frame and one last_frame image");
  if (first.length || last.length) {
    if (last.length && !first.length) throw new Error("last_frame requires a first_frame image");
    if (references.length || videos.length || audios.length) throw new Error("first/last-frame input cannot be mixed with reference images, videos, or audio");
    if (first.length) result.first_frame_image_url = first[0].url;
    if (last.length) result.last_frame_image_url = last[0].url;
  } else {
    if (references.length) result.reference_image_urls = references.map(function (image) { return image.url; });
    if (videos.length) result.reference_video_urls = videos;
    if (audios.length) result.reference_audio_urls = audios;
    if (audios.length && !references.length && !videos.length) throw new Error("this model does not accept audio-only content; include a reference image or video");
  }
  return result;
}

function validatedMediaURL(value, field) {
  const url = stringValue(value, field);
  if (/^https:\/\/[^\s]+$/i.test(url)) return url;
  throw new Error(field + " must be a public HTTPS URL");
}

function validatedImageValue(value, field) {
  if (typeof value === "string") return validatedMediaURL(value, field);
  const object = assertObject(value, field + " must be a public HTTPS URL");
  const keys = Object.keys(object);
  if (keys.length !== 1 || !hasOwn(object, "url") || typeof object.url !== "string") {
    throw new Error(field + " must be a public HTTPS URL");
  }
  return validatedMediaURL(object.url, field + ".url");
}

function validatedMediaURLArray(value, field) {
  if (!Array.isArray(value)) throw new Error(field + " must be an array of public HTTPS URLs");
  return value.map(function (item, index) {
    return validatedMediaURL(item, field + "[" + index + "]");
  });
}

function assertExactKeys(value, allowed, field) {
  for (const key of Object.keys(value)) {
    if (!hasOwn(allowed, key)) throw new Error(field + " contains unsupported field: " + key);
  }
}

function normalizeExtendedContent(value) {
  if (!Array.isArray(value) || value.length === 0) throw new Error("content must be a non-empty array");
  const content = value.map(function (item, index) {
    const field = "content[" + index + "]";
    assertObject(item, field + " must be an object");
    const type = stringValue(item.type, field + ".type");
    if (type === "text") {
      assertExactKeys(item, { type: true, text: true }, field);
      return { type: "text", text: stringValue(item.text, field + ".text") };
    }

    const mediaTypes = {
      image_url: { field: "image_url", roles: ["reference_image", "first_frame", "last_frame"] },
      video_url: { field: "video_url", roles: ["reference_video"] },
      audio_url: { field: "audio_url", roles: ["reference_audio"] },
    };
    const media = hasOwn(mediaTypes, type) ? mediaTypes[type] : null;
    if (!media) throw new Error(field + ".type must be text, image_url, video_url, or audio_url");
    const allowed = { type: true, role: true };
    allowed[media.field] = true;
    assertExactKeys(item, allowed, field);
    if (media.roles.indexOf(item.role) < 0) {
      throw new Error(field + ".role must be one of " + media.roles.join(", "));
    }
    const address = assertObject(item[media.field], field + "." + media.field + " must be an object");
    assertExactKeys(address, { url: true }, field + "." + media.field);
    const normalized = { type: type, role: item.role };
    normalized[media.field] = { url: validatedMediaURL(address.url, field + "." + media.field + ".url") };
    return normalized;
  });

  if (!content.some(function (item) { return item.type === "text"; })) {
    throw new Error("content must include at least one non-empty text item");
  }
  const images = content.filter(function (item) { return item.type === "image_url"; });
  const firstFrames = images.filter(function (item) { return item.role === "first_frame"; });
  const lastFrames = images.filter(function (item) { return item.role === "last_frame"; });
  const referenceImages = images.filter(function (item) { return item.role === "reference_image"; });
  const hasFrames = firstFrames.length > 0 || lastFrames.length > 0;
  const hasVideo = content.some(function (item) { return item.role === "reference_video"; });
  if (firstFrames.length > 1 || lastFrames.length > 1 || (hasFrames && images.length > 2)) {
    throw new Error("first/last-frame mode accepts at most two images, with one image per frame role");
  }
  if (hasFrames && referenceImages.length > 0) {
    throw new Error("first/last-frame mode cannot be combined with other reference images");
  }
  if (hasFrames && hasVideo) throw new Error("first/last-frame mode cannot be combined with reference video");
  return content;
}

function normalizeExtendedNativeRequest(request, model, uploadedFile) {
  for (const field of Object.keys(request)) {
    if (!hasOwn(EXTENDED_NATIVE_FIELDS, field)) throw new Error("unsupported field: " + field);
  }
  if (uploadedFile) throw new Error("this model requires public HTTPS reference URLs; local uploads are not supported");
  if (!hasValue(request.model)) throw new Error("model is required");

  const config = EXTENDED_CONFIG[model];
  let duration;
  if (hasOwn(request, "duration")) {
    if (typeof request.duration !== "number") throw new Error("duration must be an integer");
    duration = integerValue(request.duration, "duration", 4, config.maxDuration);
  }
  const resolution = normalizeResolution(stringValue(request.resolution, "resolution"), model);

  let ratio = "16:9";
  if (hasOwn(request, "ratio")) {
    ratio = stringValue(request.ratio, "ratio");
    if (EXTENDED_ASPECT_RATIOS.indexOf(ratio) < 0) {
      throw new Error("ratio must be one of " + EXTENDED_ASPECT_RATIOS.join(", "));
    }
  }
  const normalized = {
    model: model,
    content: normalizeExtendedContent(request.content),
    resolution: resolution,
    ratio: ratio,
  };
  if (duration !== undefined) normalized.duration = duration;
  for (const field of ["generate_audio", "watermark"]) {
    if (!hasOwn(request, field)) continue;
    if (typeof request[field] !== "boolean") throw new Error(field + " must be a boolean");
    normalized[field] = request[field];
  }
  if (hasOwn(request, "seed")) {
    if (typeof request.seed !== "number") throw new Error("seed must be an integer");
    normalized.seed = integerValue(request.seed, "seed", -Number.MAX_SAFE_INTEGER, Number.MAX_SAFE_INTEGER);
  }
  return normalized;
}

function normalizeExtendedRequest(request, model, uploadedFile) {
  for (const field of Object.keys(request)) {
    if (!hasOwn(EXTENDED_SUPPORTED_FIELDS, field)) throw new Error(field + " is not supported by " + model);
  }
  if (uploadedFile) throw new Error("this model requires a public HTTPS image URL; local uploads are not supported");

  const config = EXTENDED_CONFIG[model];
  const duration = aliasValue(request, ["duration", "seconds"], "duration", function (value, field) {
    return integerValue(value, field, 4, config.maxDuration);
  });
  const size = hasValue(request.size) ? trimmed(request.size).toLowerCase() : "";
  const sizeOption = size ? EXTENDED_SIZE_OPTIONS[size] : undefined;
  if (size && !sizeOption) throw new Error("size must be a supported resolution name or 16:9/9:16 pixel size");
  const suppliedResolution = hasValue(request.resolution) ? normalizeResolution(request.resolution, model) : undefined;
  const sizeResolution = sizeOption ? normalizeResolution(sizeOption.resolution, model) : undefined;
  if (suppliedResolution && sizeResolution && suppliedResolution !== sizeResolution) {
    throw new Error("size and resolution must select the same output resolution");
  }
  const resolution = suppliedResolution || sizeResolution;
  if (!resolution) throw new Error("resolution is required; choose one of " + config.resolutions.join(", "));

  const ratio = aliasValue(request, ["aspect_ratio", "aspectRatio", "ratio"], "aspect ratio", function (value, field) {
    const normalized = stringValue(value, field);
    if (EXTENDED_ASPECT_RATIOS.indexOf(normalized) < 0) {
      throw new Error(field + " must be one of " + EXTENDED_ASPECT_RATIOS.join(", "));
    }
    return normalized;
  });
  if (ratio !== undefined && sizeOption && sizeOption.ratio && ratio !== sizeOption.ratio) {
    throw new Error("size and aspect ratio must describe the same aspect ratio");
  }

  const normalized = {
    model: model,
    prompt: stringValue(request.prompt, "prompt"),
    resolution: resolution,
    aspect_ratio: ratio || (sizeOption && sizeOption.ratio) || "16:9",
  };
  if (duration !== undefined) normalized.duration = duration;

  const referenceImage = aliasValue(request, ["input_reference", "image", "image_url"], "input reference", validatedImageValue);
  if (referenceImage !== undefined) normalized.input_reference = referenceImage;
  const referenceImages = aliasValue(request, ["reference_image_urls", "images", "image_urls"], "reference images", validatedMediaURLArray);
  if (referenceImages !== undefined && referenceImages.length > 0) normalized.reference_image_urls = referenceImages;
  for (const field of ["first_frame_image_url", "last_frame_image_url"]) {
    if (hasValue(request[field])) normalized[field] = validatedMediaURL(request[field], field);
  }
  for (const field of ["reference_video_urls", "reference_audio_urls"]) {
    if (hasValue(request[field])) normalized[field] = validatedMediaURLArray(request[field], field);
  }

  const hasFrame = !!(normalized.first_frame_image_url || normalized.last_frame_image_url);
  const hasVideo = hasReferenceVideo(normalized);
  if (hasFrame && hasVideo) throw new Error("first/last-frame mode cannot be combined with reference video");
  if (hasFrame && (normalized.input_reference || (normalized.reference_image_urls && normalized.reference_image_urls.length))) {
    throw new Error("first/last-frame mode accepts at most two images and cannot include other reference images");
  }

  for (const field of ["generate_audio", "watermark"]) {
    if (hasOwn(request, field)) normalized[field] = booleanValue(request[field], field);
  }
  if (hasOwn(request, "seed")) normalized.seed = integerValue(request.seed, "seed", -Number.MAX_SAFE_INTEGER, Number.MAX_SAFE_INTEGER);
  return normalized;
}

function normalizeVideoRequest(request, model, uploadedFile) {
  const input = assertObject(request, "request body must be an object");
  if (hasOwn(input, "content")) {
    for (const field of ["prompt", "input_reference", "image", "image_url", "reference_image_urls", "images", "image_urls", "reference_video_urls", "reference_audio_urls", "first_frame_image_url", "last_frame_image_url"]) {
      if (hasOwn(input, field)) throw new Error("content cannot be combined with top-level prompt or reference fields; put text and media in content or use the unified format");
    }
    if (URL_CONTENT_MODELS.indexOf(model) >= 0) {
      assertExactKeys(input, URL_CONTENT_FIELDS, "request");
      const translated = Object.assign({}, input, normalizeOfficialContent(input.content));
      delete translated.content;
      return normalizeUrlInputRequest(translated, model, uploadedFile);
    }
    if (!isExtended(model)) throw new Error("structured content format is only supported for configured models");
    return normalizeExtendedNativeRequest(input, model, uploadedFile);
  }
  assertSupportedFields(input);
  if (supportsMultipartInput(model)) return normalizeMultipartVideoRequest(input, model, uploadedFile);
  if (isExtended(model)) return normalizeExtendedRequest(input, model, uploadedFile);
  return normalizeUrlInputRequest(input, model, uploadedFile);
}

function uploadedFileForContext(ctx, request) {
  const files = Array.isArray(ctx && ctx.files) ? ctx.files : [];
  if (!files.length) return null;
  const refs = [];
  for (const field of ["image", "input_reference", "image_url"]) {
    const value = request && request[field];
    if (isObject(value) && isObject(value.url) && hasOwn(value.url, "__fileRef")) {
      refs.push(trimmed(value.url.__fileRef));
    }
  }
  if (refs.length) {
    for (const file of files) {
      if (refs.indexOf(trimmed(file && file.ref)) >= 0) return file;
    }
  }
  return files.length === 1 ? files[0] : null;
}

function normalizedRequestForContext(ctx) {
  const request = assertObject(ctx && ctx.requestBody, "request body must be an object");
  const clientModel = clientModelFor(ctx, request);
  const upstreamModel = upstreamModelFor(ctx, clientModel);
  const normalized = normalizeVideoRequest(request, upstreamModel, uploadedFileForContext(ctx, request));
  normalized.model = clientModel;
  return {
    clientModel: clientModel,
    upstreamModel: upstreamModel,
    request: normalized,
  };
}

function bearerAuthorization(value) {
  const credential = trimmed(value);
  if (!credential) return "";
  return /^Bearer\s+/i.test(credential) ? credential : "Bearer " + credential;
}

function authorizationFor(ctx) {
  const apiKey = bearerAuthorization(ctx && ctx.apiKey);
  if (apiKey) return apiKey;
  const authHeader = bearerAuthorization(ctx && ctx.authHeader);
  if (authHeader) return authHeader;
  throw new Error("video gateway API key is missing");
}

function baseURLFor(ctx) {
  const baseURL = trimmed(ctx && ctx.baseUrl).replace(/\/+$/, "");
  if (!baseURL) throw new Error("video gateway base URL is missing");
  return baseURL;
}

function objectBody(response) {
  const body = response && response.body;
  if (!isObject(body)) return {};
  if (isObject(body.task)) return body.task;
  if (!hasOwn(body, "id") && !hasOwn(body, "task_id") && !hasOwn(body, "request_id") && !hasOwn(body, "status") && isObject(body.data)) return body.data;
  return body;
}

function taskBody(body) {
  if (!isObject(body)) return {};
  if (isObject(body.task)) return body.task;
  if (!hasOwn(body, "status") && isObject(body.data)) return body.data;
  return body;
}

function failureReason(body, fallback) {
  if (isObject(body && body.error)) {
    if (trimmed(body.error.message)) return trimmed(body.error.message);
    if (trimmed(body.error.code)) return trimmed(body.error.code);
  }
  if (trimmed(body && body.message)) return trimmed(body.message);
  return fallback;
}

function progressFor(data) {
  const value = Number(data && data.progress);
  if (!Number.isFinite(value) || value < 0 || value > 100) return "";
  return String(value) + "%";
}

function videoURL(data) {
  if (!isObject(data)) return "";
  if (isObject(data.video) && trimmed(data.video.url)) return trimmed(data.video.url);
  if (trimmed(data.url)) return trimmed(data.url);
  if (trimmed(data.content_url)) return trimmed(data.content_url);
  return "";
}

export function buildSubmitRequest(ctx) {
  const normalized = normalizedRequestForContext(ctx);
  const body = Object.assign({}, normalized.request, { model: normalized.upstreamModel });
  return {
    url: baseURLFor(ctx) + "/v1/videos",
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: authorizationFor(ctx) },
    body: body,
    action: actionFor(body),
  };
}

export function parseSubmitResponse(_ctx, response) {
  const body = objectBody(response);
  const taskId = trimmed(body.id || body.task_id || body.request_id);
  if (!taskId) throw new Error(failureReason(body, "video gateway response did not include a task id"));
  const result = { taskId: taskId, taskData: response && response.body ? response.body : body };
  const model = trimmed(_ctx && _ctx.upstreamModel) || trimmed(_ctx && _ctx.model);
  if (isExtended(model)) {
    const normalized = normalizedRequestForContext(_ctx).request;
    result.state = {
      duration: normalized.duration || EXTENDED_CONFIG[model].maxDuration,
      resolution: normalized.resolution,
      video_input: hasReferenceVideo(normalized) ? "video" : "none",
    };
  }
  return result;
}

function reservedDurationForUsage(duration, model) {
  if (duration === -1 && URL_INPUT_CONFIG[model]) return URL_INPUT_CONFIG[model].maxDuration;
  return duration;
}

function numericFact(value) {
  if (typeof value === "number" && Number.isFinite(value) && value >= 0) return value;
  if (typeof value === "string" && trimmed(value) !== "" && Number.isFinite(Number(value)) && Number(value) >= 0) return Number(value);
  return undefined;
}

function usageObjects(data) {
  const objects = [];
  if (!isObject(data)) return objects;
  objects.push(data);
  if (isObject(data.usage)) objects.push(data.usage);
  if (isObject(data.metadata)) objects.push(data.metadata);
  if (isObject(data.metadata) && isObject(data.metadata.usage)) objects.push(data.metadata.usage);
  if (isObject(data.result)) objects.push(data.result);
  if (isObject(data.result) && isObject(data.result.usage)) objects.push(data.result.usage);
  return objects;
}

function firstNumericUsage(data, fields) {
  for (const object of usageObjects(data)) {
    for (const field of fields) {
      const value = numericFact(object[field]);
      if (value !== undefined) return value;
    }
  }
  return undefined;
}

export function extractUsage(ctx) {
  const resolved = normalizedRequestForContext(ctx);
  const normalized = resolved.request;
  if (isExtended(resolved.upstreamModel)) {
    const duration = normalized.duration || EXTENDED_CONFIG[resolved.upstreamModel].maxDuration;
    return {
      tokens: estimateExtendedTokens(duration, normalized.resolution),
      duration: duration,
      resolution: normalized.resolution,
      video_input: hasReferenceVideo(normalized) ? "video" : "none",
    };
  }
  const facts = {
    duration: reservedDurationForUsage(normalized.duration, resolved.upstreamModel),
    resolution: normalized.resolution,
    image_count: imageCount(normalized),
  };
  if (resolved.upstreamModel === WAN_MODEL) {
    const maxDuration = URL_INPUT_CONFIG[WAN_MODEL].maxDuration;
    facts.input_video_duration = hasReferenceVideo(normalized) ? Math.max(0, maxDuration - facts.duration) : 0;
  } else if (resolved.upstreamModel === H3_MODEL) facts.audio_count = audioCount(normalized);
  else if (isUrlInputModel(resolved.upstreamModel)) facts.has_video = hasReferenceVideo(normalized) ? "true" : "false";
  return facts;
}

export function extractUsageOnComplete(ctx, _result, body) {
  const data = taskBody(body);
  const modelCandidates = [
    trimmed(ctx && ctx.upstreamModel),
    trimmed(ctx && ctx.model),
    trimmed(ctx && ctx.properties && (ctx.properties.upstreamModelName || ctx.properties.UpstreamModelName)),
    trimmed(data && data.upstreamModel),
    trimmed(data && data.model),
  ];
  const model = modelCandidates.find(function (candidate) { return VIDEO_MODELS.indexOf(candidate) >= 0; }) || MULTIPART_15;
  const facts = {};
  const status = trimmed(data && data.status).toLowerCase();
  if (isExtended(model) && ["succeeded", "success", "completed", "complete", "done"].indexOf(status) >= 0) {
    const config = EXTENDED_CONFIG[model];
    const state = isObject(ctx && ctx.state) ? ctx.state : {};
    const tokens = data && isObject(data.usage) ? data.usage.total_tokens : undefined;
    if (typeof tokens === "number" && Number.isSafeInteger(tokens) && tokens >= 0 && tokens <= 2147483647) {
      facts.tokens = tokens;
    }
    const durationCandidates = [
      data.duration,
      data.seconds,
      isObject(data.video) ? data.video.duration : undefined,
      state.duration,
    ];
    for (const raw of durationCandidates) {
      if (!hasValue(raw)) continue;
      try {
        facts.duration = integerValue(raw, "upstream video duration", 4, config.maxDuration);
        break;
      } catch (_error) {
        // Keep the reserved request duration when the upstream returns an invalid value.
      }
    }
    if (hasValue(data.resolution)) {
      try {
        facts.resolution = normalizeResolution(data.resolution, model);
      } catch (_error) {
        // Keep the reserved request resolution when the upstream returns an invalid value.
      }
    }
    if (!facts.resolution && hasValue(state.resolution)) {
      try {
        facts.resolution = normalizeResolution(state.resolution, model);
      } catch (_error) {
        // Ignore an invalid reserved resolution from an older task state.
      }
    }
    if (state.video_input === "video" || state.video_input === "none") facts.video_input = state.video_input;
  }
  if (isExtended(model)) return facts;
  if (model === WAN_MODEL) {
    const duration = firstNumericUsage(data, ["output_video_duration", "outputVideoDuration", "duration", "seconds"]);
    if (duration !== undefined) {
      try {
        facts.duration = integerValue(duration, "upstream video duration", URL_INPUT_CONFIG[WAN_MODEL].minDuration, URL_INPUT_CONFIG[WAN_MODEL].maxDuration);
      } catch (_error) {
        // Keep the reserved request duration when the upstream returns an invalid value.
      }
    }
    if (hasValue(data.resolution)) {
      try {
        facts.resolution = normalizeResolution(data.resolution, model);
      } catch (_error) {
        // Keep the request resolution when the upstream returns an invalid value.
      }
    }
    const inputVideoDuration = firstNumericUsage(data, [
      "input_video_duration",
      "inputVideoDuration",
      "reference_video_duration",
      "referenceVideoDuration",
    ]);
    if (inputVideoDuration !== undefined) facts.input_video_duration = inputVideoDuration;
    return facts;
  }
  const durationCandidates = [
    data.duration,
    data.seconds,
    isObject(data.video) ? data.video.duration : undefined,
  ];
  for (const raw of durationCandidates) {
    if (!hasValue(raw)) continue;
    try {
      const config = URL_INPUT_CONFIG[model];
      facts.duration = integerValue(raw, "upstream video duration", config ? config.minDuration : 1, config ? config.maxDuration : 15);
      break;
    } catch (_error) {
      // An invalid task fact must not replace the reserved request fact.
    }
  }
  if (hasValue(data.resolution)) {
    try {
      facts.resolution = normalizeResolution(data.resolution, model);
    } catch (_error) {
      // Keep the request resolution when the upstream returns an invalid value.
    }
  }
  return facts;
}

export function buildQueryRequest(ctx) {
  const taskId = trimmed(ctx && ctx.taskId);
  if (!taskId) throw new Error("video gateway task id is missing");
  return {
    url: baseURLFor(ctx) + "/v1/videos/" + encodeURIComponent(taskId),
    method: "GET",
    headers: { Authorization: authorizationFor(ctx) },
  };
}

export function parseTaskResult(_ctx, body) {
  const data = taskBody(body);
  const status = trimmed(data.status).toLowerCase();
  if (["queued", "pending", "submitted", "created"].indexOf(status) >= 0) return { status: "QUEUED" };
  if (["in_progress", "processing", "running"].indexOf(status) >= 0) {
    const result = { status: "IN_PROGRESS" };
    const progress = progressFor(data);
    if (progress) result.progress = progress;
    return result;
  }
  if (["succeeded", "success", "completed", "complete", "done"].indexOf(status) >= 0) {
    const result = { status: "SUCCESS" };
    const url = videoURL(data);
    if (url) result.remoteUrl = url;
    result.progress = "100%";
    return result;
  }
  if (["failed", "failure", "cancelled", "canceled", "expired"].indexOf(status) >= 0) {
    return { status: "FAILURE", reason: failureReason(data, "video gateway task " + status) };
  }
  return { status: "UNKNOWN", reason: "unrecognized video gateway task status: " + (status || "empty") };
}

export function listArtifacts(task) {
  return task && task.status === "SUCCESS" ? [{ key: "video", type: "video", mimeType: "video/mp4" }] : [];
}

export function buildContentRequest(ctx) {
  if (!ctx || ctx.artifactKey !== "video") throw new Error("artifact_not_found");
  const taskId = trimmed(ctx.upstreamTaskId || ctx.taskId);
  if (!taskId) throw new Error("video gateway task id is missing");
  return {
    url: baseURLFor(ctx) + "/v1/videos/" + encodeURIComponent(taskId) + "/content",
    method: ctx.clientRequest && ctx.clientRequest.method ? ctx.clientRequest.method : "GET",
    headers: { Authorization: authorizationFor(ctx) },
  };
}

function requestFromBody(body) {
  if (!body || (body.kind !== "json" && body.kind !== "multipart")) {
    throw new Error("JSON or multipart body required");
  }
  if (body.kind === "json") return { request: assertObject(body.value, "JSON object required"), uploadedFile: null };
  const request = {};
  for (const field of Object.keys(body.fields || {})) {
    const values = body.fields[field] || [];
    if (!Array.isArray(values) || values.length === 0) throw new Error(field + " must be provided once");
    const arrayField = ["reference_image_urls", "images", "image_urls", "reference_video_urls", "reference_audio_urls"].indexOf(field) >= 0;
    if (!arrayField && values.length !== 1) throw new Error(field + " must be provided once");
    if (arrayField) {
      if (values.length === 1 && /^\s*\[/.test(values[0])) {
        try {
          request[field] = JSON.parse(values[0]);
        } catch (_error) {
          throw new Error(field + " must be a JSON array or repeated field");
        }
      } else {
        request[field] = values.slice();
      }
    } else {
      request[field] = values[0];
    }
  }
  let uploadedFile = null;
  for (const file of body.files || []) {
    if (file.field !== "image" && file.field !== "input_reference") throw new Error("unexpected video image file field");
    if (uploadedFile) throw new Error("provide at most one image or input_reference");
    uploadedFile = file;
  }
  return { request: request, uploadedFile: uploadedFile };
}

export const protocols = {
  openai_video: {
    decodeRequest: function (ctx) {
      const parsed = requestFromBody(ctx.body);
      const clientModel = clientModelFor(ctx, parsed.request);
      const upstreamModel = upstreamModelFor(ctx, clientModel);
      const normalized = normalizeVideoRequest(parsed.request, upstreamModel, parsed.uploadedFile);
      normalized.model = clientModel;
      return {
        kind: "submit",
        model: clientModel,
        action: actionFor(normalized),
        requestBody: normalized,
      };
    },
    render: function (_ctx, task) {
      const data = isObject(task && task.data) ? Object.assign({}, task.data) : { object: "video" };
      if (task && task.status === "SUCCESS") {
        data.content_url = "/v1/videos/" + encodeURIComponent(task.task_id) + "/content";
      }
      if (task && task.status === "FAILURE" && !data.error) {
        data.error = {
          code: "video_generation_failed",
          message: trimmed(task.fail_reason) || "The video generation task failed.",
        };
      }
      return data;
    },
  },
};
```
