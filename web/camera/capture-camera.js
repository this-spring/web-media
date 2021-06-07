/*
 * @Author: xiuquanxu
 * @Company: kaochong
 * @Date: 2021-05-18 19:24:44
 * @LastEditors: xiuquanxu
 * @LastEditTime: 2021-06-04 17:02:16
*/
import { DownloadBytes } from '../../help/download.js';
const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');
let imageData = null; // rgba
let time = 0;
let reader = null;
document.getElementById('take').onclick = () => {
    console.log(' time:', time, ' raw data len:', imageData.length, ' width:', canvas.width, ' height:', canvas.height, imageData);
    const download = new DownloadBytes();
    download.saveUint8Array(imageData);
    download.downloadUint8Array('1280-720-rgba.raw');
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