/*
 * @Author: xiuquanxu
 * @Company: kaochong
 * @Date: 2021-05-18 19:24:44
 * @LastEditors: xiuquanxu
 * @LastEditTime: 2021-05-19 11:57:53
*/
navigator.mediaDevices.getUserMedia({
    video: {
      width: { min: 640, ideal: 1920 },
      height: { min: 400, ideal: 1080 },
      aspectRatio: { ideal: 1.7777777778 }
    },
    audio: {
      sampleSize: 16,
      channelCount: 2
    }
  }).then(stream => {
    videoElement.srcObject = stream;    
  }).catch(handleError);