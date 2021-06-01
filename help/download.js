/*
 * @Author: xiuquanxu
 * @Company: kaochong
 * @Date: 2021-06-01 11:20:35
 * @LastEditors: xiuquanxu
 * @LastEditTime: 2021-06-01 12:19:25
*/

class DownloadBytes {
    constructor() {
        this.bytesArray = [];
    }

    saveUint8Array(bytes) {
        this.bytesArray.push(bytes);
    }

    downloadUint8Array(filename) {
        let bytesLen = 0;
        for (let i = 0; i < this.bytesArray.length; i += 1) {
            bytesLen += this.bytesArray[i].length;
        }
        let buffer = new Uint8Array(bytesLen);
        let offset = 0;
        this.bytesArray.forEach(item => {
            buffer.set(item, offset);
            offset += item.length;
        });
        const blobData = new Blob([buffer]);
        const adownload = document.createElement('a');
        adownload.href = window.URL.createObjectURL(blobData);
        adownload.download = filename;
        adownload.click();
    }
}

export { DownloadBytes }
