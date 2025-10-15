/**
 * video.js v1.0 | https://github.com/xaoxuu/hexo-theme-stellar/
 * 格式与官方标签插件一致使用空格分隔，中括号内的是可选参数（中括号不需要写出来）
 *
 * {% video src %}
 * {% video bilibili:BV1GP4y1d729 %}
 * {% video bilibili:BV1GP4y1d729 width:100% autoplay:0 %}
 * {% video youtube:LB8KwiiUGy0 %}
 * {% video youtube:LB8KwiiUGy0 width:100% autoplay:0 %}
 *
 * 支持的参数
 * width: 500px # 须带单位 80% 20em 100mm...
 * autoplay: 1/0 # 自动播放/手动播放 # 不设置默认为0手动播放
 */

'use strict';
let videoCounter = 0;

module.exports = ctx => function (args) {
  args = ctx.args.map(args, ['type', 'bilibili', 'youtube', 'ratio', 'width', 'autoplay', 'cachetime','lowLatencyMode'], ['src'])
  if (args.width == null) {
    args.width = '100%'
  }
  if (args.bilibili) {
    return `<div class="tag-plugin video-player" style="aspect-ratio:${args.ratio || 16 / 9};max-width:${args.width};">
    <iframe src="https://player.bilibili.com/player.html?bvid=${args.bilibili}&autoplay=${args.autoplay || 'false'}" scrolling="no" border="0" frameborder="no" allowfullscreen="true"></iframe>
    </div>`;
  }
  if (args.youtube) {
    if (args.autoplay == 'true' || args.autoplay == '1') { 
      args.autoplay = '1&mute=1'
    } else {
      args.autoplay = '0'
    }
    return `<div class="tag-plugin video-player" style="aspect-ratio:${args.ratio || 16 / 9};max-width:${args.width};">
    <iframe style="border:none" src="https://www.youtube.com/embed/${args.youtube}?rel=0&disablekb=1&playsinline=1&autoplay=${args.autoplay}" picture-in-picture="true" allowfullscreen="true"></iframe>
    </div>`;
  }

  // m3u8 HLS 播放
  if (args.src && args.src.endsWith('.m3u8')) {
    let lowLatencyMode = false;
    if (args.lowLatencyMode){
      lowLatencyMode = (args.lowLatencyMode == 'true');
    }
    let id = videoCounter++;
    return `<div class="tag-plugin video-player" style="aspect-ratio:${args.ratio || 16 / 9};max-width:${args.width};">
    <video id="video_hls_${id}" controls playsinline webkit-playsinline></video>
    <script>
      document.addEventListener('DOMContentLoaded', function() {
        var video = document.getElementById('video_hls_${id}');
        var src = "${args.src}";
        if (Hls.isSupported()) {
          var hls = new Hls({maxBufferLength:${args.cachetime || 30},maxBufferSize:6000000000,lowLatencyMode:${lowLatencyMode}});
          hls.loadSource(src);
          hls.attachMedia(video);
        } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
          video.src = src;
        }
      });
    </script>
    </div>`;
  }

  // 普通视频
  return `<div class="tag-plugin video-player" style="max-width:${args.width};">
  <video controls preload playsinline webkit-playsinline>
  <source src="${args.src}" type="${args.type || 'video/mp4'}">Your browser does not support the video tag.
  </video>
  </div>`;
};
