/*
 * @Author: xiuquanxu
 * @Company: kaochong
 * @Date: 2021-05-18 19:24:44
 * @LastEditors: xiuquanxu
 * @LastEditTime: 2021-05-19 18:32:43
*/
const video = document.getElementById('screen');
const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');
// https://developer.mozilla.org/en-US/docs/Web/API/MediaTrackConstraints
const DisplayMediaStreamConstraints = {
    video: {
        frameRate: 2,
        // width: 600,
        // height: 600,
    },
};
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
document.getElementById('start').onclick = async () => {
    const mediaStream = await startCapture(DisplayMediaStreamConstraints);
    video.srcObject = mediaStream;
}

async function startCapture(displayMediaOptions) {
    let captureStream = null;
    try {
        captureStream = await navigator.mediaDevices.getDisplayMedia(displayMediaOptions);
    } catch(err) {
        console.error("Error: " + err);
    }
    console.log(captureStream);
    return captureStream;
}