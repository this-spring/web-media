/*
 * @Author: xiuquanxu
 * @Company: kaochong
 * @Date: 2021-05-18 19:24:44
 * @LastEditors: xiuquanxu
 * @LastEditTime: 2021-05-19 19:13:41
*/
// https://developer.mozilla.org/zh-CN/docs/Web/API/HTMLCanvasElement/captureStream
// captureStream() 从canvas api上获取到一个MediaStream

// 枚举
// video audio input list
// var enumeratorPromise = navigator.mediaDevices.enumerateDevices();
// https://developer.mozilla.org/zh-CN/docs/Web/API/Screen_Capture_API/Using_Screen_Capture
// as a live MediaStream
const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');
let imageData = null;
let time = 0;
// https://developer.mozilla.org/en-US/docs/Web/API/MediaTrackConstraints
const DisplayMediaStreamConstraints = {
    video: {
        frameRate: 2,
        width: 600,
        height: 600,
    },
};
let reader = null;
document.getElementById('take').onclick = () => {
    console.log(' time:', time, ' raw data len:', imageData.length, ' width:', canvas.width, ' height:', canvas.height);
}
document.getElementById('start').onclick = async () => {
    const mediaStream = await startCapture(DisplayMediaStreamConstraints);
    const track = mediaStream.getVideoTracks()[0];
    const processor = new MediaStreamTrackProcessor( track );
    reader = processor.readable.getReader();
    readChunk();
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