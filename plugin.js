const GROK_CLASSIC = "grok-imagine-video";
const GROK_15 = "grok-imagine-video-1.5";
const GROK_MODELS = [GROK_CLASSIC, GROK_15];
const H3_MODEL = "H3";
const H3_ASPECT_RATIOS = ["9:16", "16:9", "4:3", "3:4", "1:1"];
const ROLLDEK_CONFIG = {
  "doubao-seedance-2-0-260128": { maxDuration: 15 },
  "doubao-seedance-2-0-fast-260128": { maxDuration: 15 },
  "doubao-seedance-2-0-mini-260615": { maxDuration: 15 },
  "doubao-seedance-2-5-260628": { maxDuration: 30 },
};
const ROLLDEK_MODELS = Object.keys(ROLLDEK_CONFIG);
const ROLLDEK_ASPECT_RATIOS = ["16:9", "9:16", "1:1", "21:9", "4:3", "3:4"];

const ZHIQI_MODELS = [
  "seedance-2.0",
  "seedance-2.5",
  "seedance-2.0-fast-offical",
  "seedance-2.0-mini-offical",
  "seedance-2.0-offical",
  H3_MODEL,
];

const VIDEO_MODELS = GROK_MODELS.concat(ZHIQI_MODELS, ROLLDEK_MODELS);
const GROK_CLASSIC_RESOLUTIONS = ["480p", "720p"];
const GROK_15_RESOLUTIONS = ["480p", "720p", "1080p"];
const GROK_RESOLUTIONS = GROK_15_RESOLUTIONS;
const ZHIQI_RESOLUTIONS = ["480p", "720p", "1080p"];
const ZHIQI_1080_MODELS = ["seedance-2.5", "seedance-2.0-offical"];
const ZHIQI_720_ONLY_MODELS = ["seedance-2.0", "seedance-2.0-fast-offical", "seedance-2.0-mini-offical"];
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
  seed: true,
  n: true,
  bypass_face_check: true,
  grid_strength: true,
  strength: true,
  auto_face_mask: true,
};

const ROLLDEK_SUPPORTED_FIELDS = {
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

const HAS_VIDEO_FIELD = {
  enum: ["true", "false"],
  enumLabels: {
    true: { en: "With reference video", zh: "含参考视频" },
    false: { en: "Without reference video", zh: "不含参考视频" },
  },
  description: { en: "Whether a reference video is supplied", zh: "是否包含参考视频" },
};

const ROLLDEK_USAGE_SCHEMA = {
  tokens: {
    type: "number",
    unit: "token",
    description: { en: "Video generation token unit price", zh: "视频生成 Token 单价" },
  },
  video_input: {
    enum: ["none", "video"],
    enumLabels: {
      none: { en: "No reference video", zh: "无参考视频" },
      video: { en: "With reference video", zh: "含参考视频" },
    },
    description: { en: "Reference video input", zh: "参考视频输入" },
  },
};

const RESOLUTION_LABELS = {
  "480p": { en: "480p", zh: "480p" },
  "720p": { en: "720p", zh: "720p" },
  "1080p": { en: "1080p", zh: "1080p" },
};

function usageSchema(resolutions, includeVideo) {
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
  return schema;
}

export const meta = {
  apiVersion: 1,
  key: "coder-video-gateway",
  name: "Coder Video Gateway",
  icon: "text:CV",
  description: {
    en: "Standard OpenAI video gateway for Grok Imagine, Seedance, RollDek, and MiniMax H3 models",
    zh: "通过标准 OpenAI 视频接口提供 Grok Imagine、Seedance、RollDek 和 MiniMax H3 模型",
  },
  version: "1.0.2",
  author: { name: "QLHazyCoder" },
  website: "https://coderapi.vip",
  baseUrl: "https://coderapi.vip",
  models: VIDEO_MODELS,
  fetchMode: "per_task",
  protocols: ["openai_video"],
  usageProfiles: [
    {
      models: [GROK_CLASSIC],
      schema: usageSchema(GROK_CLASSIC_RESOLUTIONS, false),
      examples: [
        { label: "480p 5s", facts: { duration: 5, resolution: "480p", image_count: 0 } },
        { label: "720p 10s · image", facts: { duration: 10, resolution: "720p", image_count: 1 } },
      ],
    },
    {
      models: [GROK_15],
      schema: usageSchema(GROK_15_RESOLUTIONS, false),
      examples: [
        { label: "480p 5s", facts: { duration: 5, resolution: "480p", image_count: 0 } },
        { label: "1080p 10s · image", facts: { duration: 10, resolution: "1080p", image_count: 1 } },
      ],
    },
    {
      models: ZHIQI_720_ONLY_MODELS,
      schema: usageSchema(["480p", "720p"], true),
      examples: [
        { label: "720p 4s", facts: { duration: 4, resolution: "720p", image_count: 0, has_video: "false" } },
        { label: "720p 8s · reference video", facts: { duration: 8, resolution: "720p", image_count: 0, has_video: "true" } },
      ],
    },
    {
      models: ZHIQI_1080_MODELS,
      schema: usageSchema(ZHIQI_RESOLUTIONS, true),
      examples: [
        { label: "720p 4s", facts: { duration: 4, resolution: "720p", image_count: 0, has_video: "false" } },
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
      models: ROLLDEK_MODELS,
      schema: ROLLDEK_USAGE_SCHEMA,
      examples: [
        { label: "720p · 6s · no reference video", facts: { tokens: 129600, video_input: "none" } },
        { label: "720p · 6s · reference video", facts: { tokens: 129600, video_input: "video" } },
      ],
    },
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

function isGrok(model) {
  return GROK_MODELS.indexOf(model) >= 0;
}

function isZhiqi(model) {
  return ZHIQI_MODELS.indexOf(model) >= 0;
}

function isRollDek(model) {
  return Object.prototype.hasOwnProperty.call(ROLLDEK_CONFIG, model);
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
  const minimum = model === H3_MODEL || isRollDek(model) ? 4 : 1;
  const maximum = isGrok(model) || model === H3_MODEL ? 15 : isRollDek(model) ? ROLLDEK_CONFIG[model].maxDuration : 3600;
  if (hasValue(request.seconds)) values.push(integerValue(request.seconds, "seconds", minimum, maximum));
  if (hasValue(request.duration)) values.push(integerValue(request.duration, "duration", minimum, maximum));
  if (values.length > 1 && values[0] !== values[1]) throw new Error("seconds and duration must match when both are provided");
  if (!values.length) throw new Error("seconds or duration is required for video generation");
  return values[0];
}

function normalizeResolution(value, model) {
  const raw = trimmed(value).toLowerCase();
  const resolution = raw === "480" ? "480p" : raw === "720" ? "720p" : raw === "1080" ? "1080p" : raw;
  const allowed = isRollDek(model) ? ["720p"] : model === H3_MODEL ? ["720p"] : isGrok(model)
    ? model === GROK_CLASSIC
      ? ["480p", "720p"]
      : GROK_RESOLUTIONS
    : ZHIQI_720_ONLY_MODELS.indexOf(model) >= 0
      ? ["480p", "720p"]
      : ZHIQI_RESOLUTIONS;
  if (allowed.indexOf(resolution) < 0) throw new Error("resolution is not supported by " + model + "; use " + allowed.join(", "));
  return resolution;
}

function resolutionFor(request, model) {
  return hasValue(request.resolution) ? normalizeResolution(request.resolution, model) : isGrok(model) ? "480p" : "720p";
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
    if (isZhiqi(model)) return { kind: "public", value: publicURL(raw, field) };
    return { kind: "image", value: { url: raw } };
  }
  const object = assertObject(value, field + " must be a URL, data URL, or image object");
  const keys = Object.keys(object);
  if (keys.length !== 1 || (!hasOwn(object, "url") && !hasOwn(object, "file_id"))) {
    throw new Error(field + " must contain exactly one of url or file_id");
  }
  if (hasOwn(object, "file_id")) {
    const fileID = stringValue(object.file_id, field + ".file_id");
    if (isZhiqi(model)) throw new Error(field + ".file_id is not supported; use a public image URL");
    return { kind: "image", value: { file_id: fileID } };
  }
  if (isObject(object.url)) {
    if (!allowFilePlaceholder || isZhiqi(model)) throw new Error(field + ".url must be a public HTTP(S) URL for this model");
    return { kind: "image", value: { url: copyFilePlaceholder(object.url, expectedFileRef) } };
  }
  const url = stringValue(object.url, field + ".url");
  if (isZhiqi(model)) return { kind: "public", value: publicURL(url, field + ".url") };
  return { kind: "image", value: { url: url } };
}

function imageFromRequest(request, model, uploadedFile) {
  const candidates = [];
  for (const field of ["image", "input_reference", "image_url"]) {
    if (hasOwn(request, field) && hasValue(request[field])) candidates.push(imageValue(request[field], field, model, !!uploadedFile, uploadedFile && uploadedFile.ref));
  }
  if (uploadedFile) {
    if (isZhiqi(model)) {
      throw new Error("ZeeQi image-to-video requires a public HTTP(S) image URL; upload the image to an image host first");
    }
    const existing = candidates[0];
    const existingRef = existing && isObject(existing.value) && isObject(existing.value.url) ? trimmed(existing.value.url.__fileRef) : "";
    if (!existing) {
      candidates.push({ kind: "image", value: { url: { __fileRef: uploadedFile.ref, encoding: "dataUrl" } } });
    } else if (existingRef !== trimmed(uploadedFile.ref)) {
      throw new Error("provide at most one image or input_reference");
    }
  }
  if (candidates.length > 1) throw new Error("provide at most one image or input_reference");
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
  let count = 0;
  if (request.image || request.input_reference) count += 1;
  if (Array.isArray(request.reference_image_urls)) count += request.reference_image_urls.length;
  if (request.first_frame_image_url) count += 1;
  if (request.last_frame_image_url) count += 1;
  return count;
}

function audioCount(request) {
  return Array.isArray(request.reference_audio_urls) ? request.reference_audio_urls.length : 0;
}

function estimateRollDekTokens(duration) {
  return Math.ceil((duration * 1280 * 720 * 24) / 1024);
}

function hasReferenceVideo(request) {
  return Array.isArray(request.reference_video_urls) && request.reference_video_urls.length > 0;
}

function actionFor(request) {
  if (hasReferenceVideo(request)) return "reference_to_video";
  if (imageCount(request) > 0) return "image_to_video";
  return "text_to_video";
}

function normalizeGrokRequest(request, model, uploadedFile) {
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

function normalizeZhiqiRequest(request, model, uploadedFile) {
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
    if (model === H3_MODEL && H3_ASPECT_RATIOS.indexOf(aspectRatio) < 0) {
      throw new Error("aspect_ratio must be one of " + H3_ASPECT_RATIOS.join(", ") + " for H3");
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
  if (model === H3_MODEL && imageCount(normalized) > 9) throw new Error("H3 accepts at most 9 reference images");
  if (model === H3_MODEL && audioCount(normalized) > 3) throw new Error("H3 accepts at most 3 reference audio URLs");
  for (const field of ["size", "negative_prompt", "first_frame_image_url", "last_frame_image_url"]) {
    const value = optionalString(request, field);
    if (value !== undefined) normalized[field] = field.endsWith("_url") ? publicURL(value, field) : value;
  }
  for (const field of ["generate_audio", "return_last_frame", "bypass_face_check", "auto_face_mask"]) {
    if (hasOwn(request, field)) normalized[field] = booleanValue(request[field], field);
  }
  if (hasOwn(request, "seed")) normalized.seed = integerValue(request.seed, "seed", 0);
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
  return normalized;
}

function rollDekAssetURL(value, field) {
  const url = stringValue(value, field);
  if (/^https:\/\/[^\s]+$/i.test(url) || /^asset:\/\/ast-[A-Za-z0-9_-]+$/i.test(url)) return url;
  throw new Error(field + " must be a public HTTPS URL or an authorized asset://ast-... ID");
}

function rollDekImageValue(value, field) {
  if (typeof value === "string") return rollDekAssetURL(value, field);
  const object = assertObject(value, field + " must be a public HTTPS URL or an authorized asset ID");
  const keys = Object.keys(object);
  if (keys.length !== 1 || !hasOwn(object, "url") || typeof object.url !== "string") {
    throw new Error(field + " must be a public HTTPS URL or an authorized asset ID");
  }
  return rollDekAssetURL(object.url, field + ".url");
}

function rollDekAssetURLArray(value, field) {
  if (!Array.isArray(value)) throw new Error(field + " must be an array of public HTTPS URLs or authorized asset IDs");
  return value.map(function (item, index) {
    return rollDekAssetURL(item, field + "[" + index + "]");
  });
}

function normalizeRollDekRequest(request, model, uploadedFile) {
  for (const field of Object.keys(request)) {
    if (!hasOwn(ROLLDEK_SUPPORTED_FIELDS, field)) throw new Error(field + " is not supported by " + model);
  }
  if (uploadedFile) throw new Error("RollDek Seedance requires a public HTTPS image URL or authorized asset ID; local uploads are not supported");

  const config = ROLLDEK_CONFIG[model];
  const duration = aliasValue(request, ["duration", "seconds"], "duration", function (value, field) {
    return integerValue(value, field, 4, config.maxDuration);
  });
  const size = hasValue(request.size) ? trimmed(request.size).toLowerCase() : "";
  const sizeOptions = {
    "720p": { resolution: "720p" },
    "1280x720": { resolution: "720p", ratio: "16:9" },
    "720x1280": { resolution: "720p", ratio: "9:16" },
  };
  const sizeOption = size ? sizeOptions[size] : undefined;
  if (size && !sizeOption) throw new Error("size must be 720p, 1280x720, or 720x1280");
  const suppliedResolution = hasValue(request.resolution) ? normalizeResolution(request.resolution, model) : undefined;
  if (suppliedResolution && sizeOption && suppliedResolution !== sizeOption.resolution) {
    throw new Error("size and resolution must select the same output resolution");
  }
  const resolution = suppliedResolution || (sizeOption && sizeOption.resolution);
  if (!resolution) throw new Error("resolution is required; use 720p");

  const ratio = aliasValue(request, ["aspect_ratio", "aspectRatio", "ratio"], "aspect ratio", function (value, field) {
    const normalized = stringValue(value, field);
    if (ROLLDEK_ASPECT_RATIOS.indexOf(normalized) < 0) {
      throw new Error(field + " must be one of " + ROLLDEK_ASPECT_RATIOS.join(", "));
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

  const referenceImage = aliasValue(request, ["input_reference", "image", "image_url"], "input reference", rollDekImageValue);
  if (referenceImage !== undefined) normalized.input_reference = referenceImage;
  const referenceImages = aliasValue(request, ["reference_image_urls", "images", "image_urls"], "reference images", rollDekAssetURLArray);
  if (referenceImages !== undefined && referenceImages.length > 0) normalized.reference_image_urls = referenceImages;
  for (const field of ["first_frame_image_url", "last_frame_image_url"]) {
    if (hasValue(request[field])) normalized[field] = rollDekAssetURL(request[field], field);
  }
  for (const field of ["reference_video_urls", "reference_audio_urls"]) {
    if (hasValue(request[field])) normalized[field] = rollDekAssetURLArray(request[field], field);
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
  assertSupportedFields(input);
  if (isGrok(model)) return normalizeGrokRequest(input, model, uploadedFile);
  if (isRollDek(model)) return normalizeRollDekRequest(input, model, uploadedFile);
  return normalizeZhiqiRequest(input, model, uploadedFile);
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
  return { taskId: taskId, taskData: response && response.body ? response.body : body };
}

export function extractUsage(ctx) {
  const resolved = normalizedRequestForContext(ctx);
  const normalized = resolved.request;
  if (isRollDek(resolved.upstreamModel)) {
    const duration = normalized.duration || ROLLDEK_CONFIG[resolved.upstreamModel].maxDuration;
    return {
      tokens: estimateRollDekTokens(duration),
      video_input: hasReferenceVideo(normalized) ? "video" : "none",
    };
  }
  const facts = {
    duration: normalized.duration,
    resolution: normalized.resolution,
    image_count: imageCount(normalized),
  };
  if (resolved.upstreamModel === H3_MODEL) facts.audio_count = audioCount(normalized);
  else if (isZhiqi(resolved.upstreamModel)) facts.has_video = hasReferenceVideo(normalized) ? "true" : "false";
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
  const model = modelCandidates.find(function (candidate) { return VIDEO_MODELS.indexOf(candidate) >= 0; }) || GROK_15;
  const facts = {};
  const status = trimmed(data && data.status).toLowerCase();
  if (isRollDek(model) && ["succeeded", "success", "completed", "complete", "done"].indexOf(status) >= 0) {
    const tokens = data && isObject(data.usage) ? data.usage.total_tokens : undefined;
    if (typeof tokens === "number" && Number.isSafeInteger(tokens) && tokens >= 0 && tokens <= 2147483647) {
      facts.tokens = tokens;
    }
  }
  if (isRollDek(model)) return facts;
  const durationCandidates = [
    data.duration,
    data.seconds,
    isObject(data.video) ? data.video.duration : undefined,
  ];
  for (const raw of durationCandidates) {
    if (!hasValue(raw)) continue;
    try {
      facts.duration = integerValue(raw, "upstream video duration", model === H3_MODEL ? 4 : 1, isGrok(model) || model === H3_MODEL ? 15 : 3600);
      break;
    } catch (_error) {
      // An invalid vendor fact must not replace the reserved request fact.
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
