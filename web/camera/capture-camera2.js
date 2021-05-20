/*
 * @Author: xiuquanxu
 * @Company: kaochong
 * @Date: 2021-05-18 19:24:44
 * @LastEditors: xiuquanxu
 * @LastEditTime: 2021-05-20 14:49:10
*/
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
