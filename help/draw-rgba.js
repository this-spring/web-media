/*
 * @Author: xiuquanxu
 * @Company: kaochong
 * @Date: 2020-04-20 12:00:20
 * @LastEditors: xiuquanxu
 * @LastEditTime: 2021-06-01 12:26:44
*/

class DrawRgba {
  constructor(canvas) {
    this.canvas = canvas;
    this.ctx = this.canvas.getContext('2d');
  }

  play(data, width, height) {
    const clampBuffer = new Uint8ClampedArray(data);
    if (clampBuffer.length !== 4 * width * height) {
      console.error(TAG, ' play clampBuffer !== 4 * width * heigh');
      return;
    }
    const imageData = new ImageData(clampBuffer, width, height);
    this.ctx.putImageData(imageData, 0, 0, 0, 0, width, height);
  }
}

export { DrawRgba };
