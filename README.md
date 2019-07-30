# 进度条标记

---

videojs播放器进度条标记插件（videojs6）

## 何时使用

- 需要给videojs播放器的进度条打上标记的时候

## 浏览器支持

IE 9+

## 安装

```bash
npm install @my-videojs/videojs-progress-marker --save
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

在进度条添加标记

```jsx
import videojs from 'video.js'
import 'video.js/dist/video-js.css'
import "videojs-progress-marker/lib"
import "videojs-progress-marker/lib/style/"

class App extends React.Component {
  componentDidMount () {
    const node = ReactDOM.findDOMNode(this.videoWrap)
    if (!node) {
      return
    }
    const videoJsOptions = {
      controls: true,
      sources: [{
        src: '//www.w3school.com.cn/example/html5/mov_bbb.mp4',
        type: 'video/mp4'
      }],
    }
    // react0.14.x data-reactid问题
    const videoEl = document.createElement('video')
    videoEl.className = `video-js`

    node.appendChild(videoEl)
    this.player = videojs(videoEl, {...videoJsOptions}, () => {
      this.addMarker()
    })
  }
  componentWillUnmount () {
    if (this.player) {
      this.player.dispose()
    }
  }
  addMarker () {
    this.player.markers({
      markers: [
          {time: 3, text: "this"},
          {time: 4,  text: "is"},
          {time: 7,text: "so"},
          {time: 8,  text: "cool"}
      ]
    })
  }
  render() {
    return (
       <div data-vjs-player ref={node => { this.videoWrap = node }} />
    )
  }
}

ReactDOM.render(<App />, mountNode);
```

### 自定义标记

自定义标记，tootip和overlay的样式和文字

```jsx
import videojs from 'video.js'
import 'video.js/dist/video-js.css'
import "videojs-progress-marker/lib"
import "videojs-progress-marker/lib/style/"

class App extends React.Component {
  componentDidMount () {
    const node = ReactDOM.findDOMNode(this.videoWrap)
    if (!node) {
      return
    }
    const videoJsOptions = {
      controls: true,
      sources: [{
        src: '//www.w3school.com.cn/example/html5/mov_bbb.mp4',
        type: 'video/mp4'
      }],
    }
    // react0.14.x data-reactid问题
    const videoEl = document.createElement('video')
    videoEl.className = `video-js`

    node.appendChild(videoEl)
    this.player = videojs(videoEl, {...videoJsOptions}, () => {
      this.addMarker()
    })
  }
  componentWillUnmount () {
    if (this.player) {
      this.player.dispose()
    }
  }
  addMarker () {
    this.player.markers({
      markerStyle: {
      'width':'9px',
      'border-radius': '40%',
      'background-color': 'orange'
      },
      markerTip:{
          display: true,
          text: function(marker) {
            return "I am a marker tip: "+ marker.text;
          }
      },
      breakOverlay:{
          display: true,
          displayTime: 4,
          style:{
            'width':'100%',
            'height': '30%',
            'background-color': 'rgba(10,10,10,0.6)',
            'color': 'white',
            'font-size': '16px'
          },
          text: function(marker) {
            return "This is a break overlay: " + marker.overlayText;
          },
      },
      markers: [
          {time: 3, text: "this", overlayText: "1", class: "special-blue"},
          {time: 4,  text: "is", overlayText: "2"},
          {time: 7,text: "so", overlayText: "3"},
          {time: 8,  text: "cool", overlayText: "4"}
      ]
    })
  }
  render() {
    return (
       <div data-vjs-player ref={node => { this.videoWrap = node }} />
    )
  }
}

ReactDOM.render(<App />, mountNode);
```

### 动态添加，删除标记

动态添加，删除标记，跳转到标记点

```css
.btn-group button{
  border: 1px  solid #ccc;
  background: #fff;
  padding: 0 10px;
  margin: 10px;
}
```

```jsx
import videojs from 'video.js'
import 'video.js/dist/video-js.css'
import "videojs-progress-marker/lib"
import "videojs-progress-marker/lib/style/"

class App extends React.Component {
  componentDidMount () {
    const node = ReactDOM.findDOMNode(this.videoWrap)
    if (!node) {
      return
    }
    const videoJsOptions = {
      controls: true,
      sources: [{
        src: '//www.w3school.com.cn/example/html5/mov_bbb.mp4',
        type: 'video/mp4'
      }],
    }
    // react0.14.x data-reactid问题
    const videoEl = document.createElement('video')
    videoEl.className = `video-js`

    node.appendChild(videoEl)
    this.player = videojs(videoEl, {...videoJsOptions}, () => {
      this.addMarker()
    })
  }
  componentWillUnmount () {
    if (this.player) {
      this.player.dispose()
    }
  }
  addMarker () {
    this.player.markers({
      breakOverlay:{
        display: true
      },
      onMarkerClick: function(marker){
        console.log(`Marker click:${marker.time}`)
      },
      onMarkerReached: (marker) => {
        this.player.pause()
        console.log(this.player.currentTime())
        console.log(`Marker reached:${marker.time}`)
      },
      markers: [
          {time: 3, text: "this", overlayText: "1"},
          {time: 4,  text: "is", overlayText: "2"},
          {time: 7,text: "so", overlayText: "3"},
          {time: 8,  text: "cool", overlayText: "4"}
      ]
    })
  }
  handlePrev = () => {
    this.player.markers.prev()
  }
  handleNext = () => {
    this.player.markers.next()
  }
  handleAdd = () => {
    const randomTime = Math.floor((Math.random() * parseInt(this.player.duration())) + 1);

    // come up with a random time
    this.player.markers.add([{
      time: randomTime,
      text: "I'm new",
      overlayText: "I'm new"
    }]);
  }
  handleMoveForward = () => {
    const markers = this.player.markers.getMarkers();
    for(var i = 0; i < markers.length; i++) {
      markers[i].time += 1;
    }
    this.player.markers.updateTime();
  }
  handleRemoveFirst = () => {
    this.player.markers.remove([0]);
  }
  handleRemoveAll = () => {
    this.player.markers.removeAll();
  }
  handleDestroy = () => {
    this.player.markers.destroy();
  }
  render() {
    return (
      <div> 
        <div data-vjs-player ref={node => { this.videoWrap = node }} />
        <div className="btn-group">
          <button onClick={this.handlePrev}>上一个</button>
          <button onClick={this.handleNext}>下一个</button>
          <button onClick={this.handleAdd}>添加</button>  
          <button onClick={this.handleMoveForward}>向前移动一秒</button>  
          <button onClick={this.handleRemoveFirst}>移除第一个</button>  
          <button onClick={this.handleRemoveAll}>移除所有</button>  
          <button onClick={this.handleDestroy}>销毁</button>  
        </div> 
      </div>
    )
  }
}

ReactDOM.render(<App />, mountNode);
```

## API

代码是fork了[videojs-markers](https://github.com/spchuang/videojs-markers)稍加修改后得来的（videojs-marker没有发布npm包），
API与之相比没有变化，可以查看[这里](http://www.sampingchuang.com/videojs-markers)。
