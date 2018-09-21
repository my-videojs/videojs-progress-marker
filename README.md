# 视频播放器组件

---

视频播放器

## 何时使用

- 播放视频的时候

## 浏览器支持

IE 9+

## 安装

```bash
npm install rc-video --save
```

## 运行

```bash
# 默认开启服务器，地址为 ：http://local:8000/

# 能在ie9+下浏览本站，修改代码后自动重新构建，且能在ie10+运行热更新，页面会自动刷新
npm run start

# 构建生产环境静态文件，用于发布文档
npm run site
```

## 代码演示

### 基本

基本用法。

```jsx
import RcVideo from 'rc-video'
import "rc-video/lib/style/"


class App extends React.Component {
  render() {
    const videoJsOptions = {
      logo: 'http://os71std62.bkt.clouddn.com/logo.gif',
      className: 'vjs-big-play-centered',
      controls: true,
      inactivityTimeout: 0,
      poster: 'http://os71std62.bkt.clouddn.com/poster.jpg',
      sources: [
        {
          src: 'http://www.w3school.com.cn/i/movie.ogg',
          type: 'video/ogg'
        },{
          src: 'http://www.runoob.com/try/demo_source/movie.mp4',
          type: 'video/mp4'
        },{
          src: 'http://www.appstate.edu/~meltonml/mighty_mouse.f4v',
          type: 'video/flv'
        }
      ],
      onReady: (player) => {
        // 监听全屏事件
        player.on('fullscreenchange', () => {
           console.log('全屏')
        })
        // 监听跳转播放事件
        player.on('seeked', () => {
           console.log('跳转')
        })
      }
    }
    return (
       <RcVideo { ...videoJsOptions } />
    )
  }
}

ReactDOM.render(<App />, mountNode);
```

### 字幕

为视频添加字幕。

```jsx
import RcVideo from 'rc-video'
import "rc-video/lib/style/"

class App extends React.Component {
  render() {
    const videoJsOptions = {
      controls: true,
      fluid: true,
      playbackRates: [0.5, 1, 1.5, 2],
      sources: [{
        src: 'http://www.runoob.com/try/demo_source/movie.mp4',
        type: 'video/mp4'
      }],
      onReady: (player) => {
        const track = {
          kind: 'captions',
          src: 'http://os71std62.bkt.clouddn.com/test.vtt',
          srclang: 'en',
          label: 'english',
          default: 'default'
        }
        player.addRemoteTextTrack(track);
      }
    }
    return (
       <RcVideo { ...videoJsOptions } />
    )
  }
}

ReactDOM.render(<App />, mountNode);
```

### flash

使用flash播放。

```jsx
import RcVideo from 'rc-video'
import "rc-video/lib/style/"

class App extends React.Component {
  render() {
    const videoJsOptions = {
      controls: true,
      width: 500,
      height: 400,
      sources: [{
        src: 'http://www.appstate.edu/~meltonml/mighty_mouse.f4v',
        type: 'video/flv'
      }],
      techOrder: ['flash'],
      onReady: (player) => {
        console.log('i am ready')
      }
    }
    return (
       <RcVideo { ...videoJsOptions } />
    )
  }
}

ReactDOM.render(<App />, mountNode);
```

## API

更多参数可以参考: https://docs.videojs.com/tutorial-options.html

| 参数        | 说明                                                | 类型        | 默认值 |
|----------- |---------------------------------------------------  | ----------  |-------|
| logo       | 控制栏右下角logo图标                                  | string      | 无    |
| className  | 为video标签设置class；video.js提供了默认的如`vjs-big-play-centered`表示播放按钮居中，`vjs-fluid`表示自适应容器大小 | string | 无 |
| inactivityTimeout | 闲置超时，单位为毫秒；值为0表示没有              | number     | 3000  |
| controls | 是否显示控制条；当没有控制条的时候，需要使用autoplay属性或者通过player API来控制播放 | false  |   |
| width | 设置视频播放器的宽度(以像素为单位);当使用如`50%`的时候，会被自动转换为`50px` | string\|number  | 640  |
| height | 设置视频播放器的高度(以像素为单位);当使用如`50%`的时候，会被自动转换为`50px` | string\|number  | 480  |
| fluid | 设置为true时将会自适应容器大小，设置className为`vjs-fluid`有相同效果 | boolean  | false  |
| playbackRates | 播放速度，由大于0的数字组成的数组, 当有值时，控制栏会出现一个播放速度控制按钮 | array<number>  | 3000  |
| poster | 视频开始前的封面图片 | string  | 无  |
| sources | 对应video标签下的一系列souce标签的数组对象，对象内需要有src和type属性 | array<{src: string, type: string}>  | 无  |
| techOrder | 定义优先用那种方式播放视频，默认使用html5，组件里内置了flash播放；比如使用`['html5', 'flash']`表示优先使用html5，无法播放时使用flash;你也可以根据需要注册其他技术 | array<string> | ['html5'] |
| onReady | 视频初始化完成后的回调， 一些异步的操作可以在这里完成，参数为实例化后的player | function(player) | 无 |

## 一些问题
一些功能videojs没有集成，采用插件的方式实现, 是否在fish的demo里面集成  
清晰度切换 https://github.com/kmoskwiak/videojs-resolution-switcher  
广告 https://github.com/videojs/videojs-contrib-ads  
进度条标记（这个没有发布npm包，且点击跳转的时候回调参数不符合需求，是否fork一个自己修改） https://github.com/spchuang/videojs-markers  
国际化： react中使用报错[全局变量问题?](https://github.com/videojs/video.js/issues/5092)，在fish中使用fish的国际化  
非ie9下使用table布局 字幕按钮和播放速度按钮向左靠齐，ie9下向右靠齐
