<!--
 * @Author: xiuquanxu
 * @Company: kaochong
 * @Date: 2021-05-19 18:41:35
 * @LastEditors: xiuquanxu
 * @LastEditTime: 2021-05-20 17:26:25
-->
## 前言  
做web多媒体有一段时间了，打算总结一下web端音视频知识，包括：音频捕获输出pcm、摄像头捕获输出rgba、屏幕捕获输出rgba、音频播放pcm、视频播放yuv、音频pcm利用wasm封装aac、视频rgba利用wasm编码h264。  

最后有可能做一套web端的audio-recorder-player和video-recorder-player  

本章介绍web端捕捉音频获取pcm数据

## web端捕获音频获取pcm数据
  
### 捕获音频

通过MediaDevices.getUserMedia(MediaStreamConstraints)获取到音频的MediaStream，然后通过AudioContext对象对MediaStream进行分析

本篇文章请参考：<a href="https://zhuanlan.zhihu.com/p/126758240">H5端音频采集播放
</a>  

本节代码放在: <a href="https://github.com/this-spring/web-media/tree/main/web/audio">github</a>

## 总结  
- 本章介绍了通过web端采集pcm数据  
- web端已经有webrtc可以实现非常复杂功能，本系列文章希望从元数据角度来学习一下web端音视频，采集元数据通过wasm对原数据进行编解码，这给不使用webrtc的团队来做直播(录屏、出镜、录音)提供了可能。
- <a href="https://github.com/this-spring/web-media">github</a>