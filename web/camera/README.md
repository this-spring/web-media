<!--
 * @Author: xiuquanxu
 * @Company: kaochong
 * @Date: 2021-05-19 18:41:35
 * @LastEditors: xiuquanxu
 * @LastEditTime: 2021-05-20 17:15:29
-->
## 前言  
做web多媒体有一段时间了，打算总结一下web端音视频知识，包括：音频捕获输出pcm、摄像头捕获输出rgba、屏幕捕获输出rgba、音频播放pcm、视频播放yuv、音频pcm利用wasm封装aac、视频rgba利用wasm编码h264。  

最后有可能做一套web端的audio-recorder-player和video-recorder-player  

本章介绍web端捕捉摄像头获取rgba数据

## web端捕获摄像头获取rgba数据  
  
### 摄像头捕获  

通过MediaDevices.getUserMedia(MediaStreamConstraints)获取到MediaStream。  
```
async function start() {
  const mediaStream = await startCamera(constraints);
  <!-- 获取到audio的mediaSteam -->
}


async function startCamera(constraints) {
  let cameraStream = null;
  try {
    cameraStream = await navigator.mediaDevices.getUserMedia(constraints);
  } catch (error) {
    console.error("Error: " + error);
  }
  return cameraStream;
}
```

## 捕获rgba数据  

### 方式一：  
首先把MediaStream对象渲染到video标签上，然后在通过canvas的drawImage获取到video上的数据，在通过getImageData获取到rgba数据  

完整代码:  
```
html:  
<body>
    <button id="start">start capture camera</button>
    <br/>
    <button id="take">take a frame data</button>
    <br />
    <canvas id="canvas"></canvas>
    <br />
    <video id="camera" controls></video>
</body>

js:
const video = document.getElementById('camera');
const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');
let imageData = null;
let time = 0;
let reader = null;
document.getElementById('take').onclick = () => {
  const w = video.videoWidth;
  const h = video.videoHeight;
  canvas.width = w;
  canvas.height = h;
  console.time('frame');
  ctx.drawImage(video, 0, 0, w, h);
  const imageData = ctx.getImageData(0, 0, w,h);
  console.timeEnd('frame');
  console.log(' raw data len:', imageData.data.length, ' width:', canvas.width, ' height:', canvas.height);
}
document.getElementById('start').onclick = () => {
    start();
}

const constraints = {
  audio: true,
  video: {
    width: 1280,
    height: 720,
    frameRate: 2,
  }
};

async function start() {
  const mediaStream = await startCamera(constraints);
  video.srcObject = mediaStream;
}


async function startCamera(constraints) {
  let cameraStream = null;
  try {
    cameraStream = await navigator.mediaDevices.getUserMedia(constraints);
  } catch (error) {
    console.error("Error: " + error);
  }
  return cameraStream;
}

```  
该方法在我的电脑macbook pro 8g i5浏览器开无痕模式下每采集一帧大概12ms。

### 方式二 
通过浏览器新特性MediaStreamTrackProcessor接口实现一个canvas即可实现rgba数据采集。使用该api需要在chrome中开启该特性  
开启：  
```
enable chrome://flags/#enable-experimental-web-platform-features, or
pass --enable-blink-features=WebCodecs flag via the command line.
```

关于该特性：  
<a href="https://github.com/w3c/webcodecs">w3c github</a>    
<a href="https://www.w3.org/TR/webcodecs/#dictdef-videodecoderinit">w3c org</a>    

通过MediaStream对象获取track对象实例化MediaStreamTrackProcessor，通过reader可以逐步读取rgba数据
```
const track = mediaStream.getVideoTracks()[0];
const processor = new MediaStreamTrackProcessor( track );
reader = processor.readable.getReader();
```  

reader获取rgba数据  
```
reader.read().then( ({ done, value }) => {
    const t = new Date();
    const w = value.displayWidth;
    const h = value.displayHeight;
    // the MediaStream video can have dynamic size
    if( canvas.width !== w || canvas.height !== h ) {
        canvas.width = w;
        canvas.height = h;
    }
    ctx.clearRect( 0, 0, w, h );
    ctx.drawImage( value, 0, 0 );
    imageData = ctx.getImageData(0, 0, w, h).data;
    value.close(); // close the VideoFrame when we're done with it
    if( !done ) {
        readChunk();
    }
    time = (new Date()) - t;
});
```  

完整代码:  

```
html:
<body>
    <button id="start">start capture camera</button>
    <br/>
    <button id="take">take a frame data</button>
    <br />
    <canvas id="canvas" width="600" height="600"></canvas>
    <br />
</body>

js:  
const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');
let imageData = null;
let time = 0;
let reader = null;
document.getElementById('take').onclick = () => {
    console.log(' time:', time, ' raw data len:', imageData.length, ' width:', canvas.width, ' height:', canvas.height);
}
document.getElementById('start').onclick = () => {
    start();
}

const constraints = {
  audio: true,
  video: {
    width: 1280,
    height: 720,
    frameRate: 2,
  }
};

async function start() {
  const mediaStream = await startCamera(constraints);
  const track = mediaStream.getVideoTracks()[0];
  const processor = new MediaStreamTrackProcessor( track );
  reader = processor.readable.getReader();
  readChunk();
}


async function startCamera(constraints) {
  let cameraStream = null;
  try {
    cameraStream = await navigator.mediaDevices.getUserMedia(constraints);
  } catch (error) {
    console.error("Error: " + error);
  }
  return cameraStream;
}


function readChunk() {
  reader.read().then( ({ done, value }) => {
      const t = new Date();
      const w = value.displayWidth;
      const h = value.displayHeight;
      // the MediaStream video can have dynamic size
      if( canvas.width !== w || canvas.height !== h ) {
          canvas.width = w;
          canvas.height = h;
      }
      ctx.clearRect( 0, 0, w, h );
      ctx.drawImage( value, 0, 0 );
      imageData = ctx.getImageData(0, 0, w, h).data;
      value.close(); // close the VideoFrame when we're done with it
      if( !done ) {
          readChunk();
      }
      time = (new Date()) - t;
  });
}
```  

该方法在我的电脑macbook pro 8g i5浏览器开无痕模式下每采集一帧大概12ms。  

## 总结  
- 本章介绍了两种方式实现摄像头采集rgba功能  
- web端已经有webrtc可以实现非常复杂功能，本系列文章希望从元数据角度来学习一下web端音视频，采集元数据通过wasm对原数据进行编解码，这给不使用webrtc的团队来做直播(录屏、出镜、录音)提供了可能。
- <a href="https://github.com/this-spring/web-media">github</a>