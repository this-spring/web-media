/*
 * @Author: xiuquanxu
 * @Company: kaochong
 * @Date: 2020-03-30 22:47:07
 * @LastEditors: xiuquanxu
 * @LastEditTime: 2021-05-20 16:25:18
 * 
 * 
 * from: https://github.com/this-spring/pcm-recorder-player
 */
function PcmRecorder(config, cb) {
    if (!config) {
      config = {
        sampleBites: 16,
        sampleRate: (new (window.AudioContext
          || window.webkitAudioContext)()).sampleRate,
        numberChannels: 1,
        fftSize: 512,
        down: true,
        debug: true,
      }
    }
    this.config = config;
    this.recorder = null;
    this.analyser = null;
    this.audioInput = null; // 
    this.context = null; // AudioContext对象
    this.recorder = null; // 音频输入对象
  
    this.pcmBuffer = [];
    this.pcmBufferSize = 0;
    this.visualVolume = 0;
    this.cb = cb;
    this.init();
  }
  
  PcmRecorder.prototype.getVolume = function() {
    return this.visualVolume;
  }
  
  PcmRecorder.prototype.start = function() {
    var _this = this;
    navigator.mediaDevices.getUserMedia({
      audio: true,
    }).then((stream) => {
      _this.audioInput = _this.context.createMediaStreamSource(stream);
    }, (error) => {
      console.error(error);
    }).then(() => {
      _this.audioInput.connect(_this.analyser);
      _this.analyser.connect(_this.recorder);
      _this.recorder.connect(_this.context.destination);
    });
  }
  
  PcmRecorder.prototype.stop = function() {
    if (this.audioInput) this.audioInput.disconnect();
    if (this.recorder) this.recorder.disconnect();
  }
  
  PcmRecorder.prototype.init = function() {
    this.context = new (window.AudioContext || window.webkitAudioContext)();
    this.analyser = this.context.createAnalyser(); // 录音分析节点
    // this.analyser.fftSize = this.context.sampleRate / 100;
    this.analyser.fftSize = this.config.fftSize;
    // pcmNode
    const createScript = this.context.createScriptProcessor || this.context.createJavaScriptNode;
    // recorder Analyser
    this.recorder = createScript.apply(this.context,
      [this.config.fftSize, this.config.numberChannels, this.config.numberChannels]);
  
    // 音频采集
    this.recorder.onaudioprocess = this.onaudioprocess.bind(this)
  }
  
  PcmRecorder.prototype.onaudioprocess = function(e) {
    if (this.config.numberChannels === 1) {
      const data = e.inputBuffer.getChannelData(0);
      console.log(data.length);
    }
  }
  
document.getElementById('start').onclick = function() {
    const config = {
        sampleBites: 16,
        sampleRate: (new (window.AudioContext
            || window.webkitAudioContext)()).sampleRate,
        numberChannels: 1,
        fftSize: 512,
        down: true,
        debug: true,
    };
    const pr = new PcmRecorder(config);
    pr.start();
}

document.getElementById('take').onclick = function() {

}