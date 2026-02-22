const fs = require('fs');
const path = require('path');
const glob = require('glob');
const https = require('https');
const http = require('http');

const outputPath = path.join(__dirname, '../../../../../image-blurhashes.json');

// 读取已有缓存
let cache = fs.existsSync(outputPath)
  ? JSON.parse(fs.readFileSync(outputPath))
  : {};

// 从 URL 下载图片为 Buffer
function fetchImageBuffer(url) {
  return new Promise((resolve, reject) => {
    const client = url.startsWith('https') ? https : http;
    client.get(url, { timeout: 15000 }, res => {
      if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
        return fetchImageBuffer(res.headers.location).then(resolve).catch(reject);
      }
      if (res.statusCode !== 200) {
        return reject(new Error(`HTTP ${res.statusCode}`));
      }
      const chunks = [];
      res.on('data', chunk => chunks.push(chunk));
      res.on('end', () => resolve(Buffer.concat(chunks)));
      res.on('error', reject);
    }).on('error', reject).on('timeout', () => reject(new Error('Request timeout')));
  });
}

// 计算图片的 blurhash
async function computeBlurhash(url) {
  let sharp, encode;
  try {
    sharp = require('sharp');
    ({ encode } = require('blurhash'));
  } catch (e) {
    throw new Error('缺少依赖，请在主题目录运行: npm install sharp blurhash');
  }

  const buffer = await fetchImageBuffer(url);

  // 缩小到最大 64px 以提升性能
  const { data, info } = await sharp(buffer)
    .resize(64, 64, { fit: 'inside' })
    .ensureAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });

  const hash = encode(
    new Uint8ClampedArray(data),
    info.width,
    info.height,
    4,
    3
  );
  // 直接返回原始 base83 字符串，缓存 JSON 中存储，渲染时动态注入，不写入 Markdown
  return hash;
}

// 提取 Markdown 中的图片 URL，并缓存已有 blurhash
function extractImageUrls(content, relative) {
  const urlsToProcess = [];
  const tagImgRegex = /{%\s+image\s+[^%]*?\b(https?:\/\/[^\s%]+)[^%]*?%}/g;

  if (!cache[relative]) cache[relative] = {};

  let match;
  while ((match = tagImgRegex.exec(content)) !== null) {
    const fullTag = match[0];
    const url = match[1];

    // 已有缓存的跳过
    if (cache[relative][url]) continue;

    // 如果标签本身已写有 blurhash 参数则缓存并跳过（base83 字符集）
    const bhMatch = fullTag.match(/blurhash:(\S+)/);
    if (bhMatch) {
      cache[relative][url] = bhMatch[1];
      fs.mkdirSync(path.dirname(outputPath), { recursive: true });
      fs.writeFileSync(outputPath, JSON.stringify(cache, null, 2));
      continue;
    }

    urlsToProcess.push(url);
  }

  return urlsToProcess;
}

// 主逻辑
module.exports = async (ctx, options) => {
  const cacheExists = fs.existsSync(outputPath);
  ctx.log.info(
    cacheExists
      ? '正在生成图片 Blurhash。缓存已存在，开始增量更新...'
      : '正在生成图片 Blurhash。首次可能耗时较久，请耐心等待...'
  );

  const mdFiles = glob.sync('source/**/*.md');

  for (const file of mdFiles) {
    const relative = path.relative(process.cwd(), file);
    const content = fs.readFileSync(file, 'utf8');

    if (!cache[relative]) cache[relative] = {};

    const imageUrls = extractImageUrls(content, relative);

    // 清理已从 Markdown 中移除的旧记录
    const currentUrls = new Set([
      ...imageUrls,
      ...Object.keys(cache[relative])
    ]);
    for (const oldUrl of Object.keys(cache[relative])) {
      if (!currentUrls.has(oldUrl)) {
        delete cache[relative][oldUrl];
      }
    }

    // 计算未缓存的图片
    for (const url of imageUrls) {
      if (cache[relative][url]) continue;

      try {
        const hash = await computeBlurhash(url);
        cache[relative][url] = hash;
        ctx.log.info(`✅ Blurhash 生成: ${url} → ${hash}`);

        // 实时落盘
        fs.mkdirSync(path.dirname(outputPath), { recursive: true });
        fs.writeFileSync(outputPath, JSON.stringify(cache, null, 2));
      } catch (e) {
        ctx.log.warn(`❌ Blurhash 失败: ${url}`, e.message);
      }
    }
  }

  ctx.log.info('[image-blurhashes.json] 生成完成');
};
