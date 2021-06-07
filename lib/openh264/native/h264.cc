/*
 * @Author: xiuquanxu
 * @Company: kaochong
 * @Date: 2021-01-28 15:11:41
 * @LastEditors: xiuquanxu
 * @LastEditTime: 2021-06-04 11:15:47
*/
#include "h264.h"

bool nalu_start(char* data, int pos) {
    if (data[pos] == 0 && data[pos + 1] == 0 && data[pos + 2] == 1) {
        return true;
    }
    if (data[pos] == 0 && data[pos + 1] == 0 && data[pos + 2] == 0 && data[pos + 3] == 1) {
        return true;
    }
    return false;
}
int nalu_end(char* data, int pos, int size) {
    int end = pos;
    while (end < size)
    {
        if (nalu_start(data, end)) {
            return end;
        }
        end += 1;
    }
    return 0;
}

int H264DecoderFrame(H264Decoder *decoder, char* input, int size, char* out, int *outsize) {
    int i_ret = decoder->pSvcDecoder->DecodeFrameNoDelay((unsigned char *)input, size, decoder->pData, &decoder->sDstBufInfo);
    if (i_ret != 0) {
        printf("h264 decode error i_ret:%d\n", i_ret);
        return i_ret;
    }
    if ((&decoder->sDstBufInfo)->iBufferStatus == 1) {
        int width = (&decoder->sDstBufInfo)->UsrData.sSystemBuffer.iWidth;
        int height = (&decoder->sDstBufInfo)->UsrData.sSystemBuffer.iHeight;
        int y = (&decoder->sDstBufInfo)->UsrData.sSystemBuffer.iStride[0];
        int uv = (&decoder->sDstBufInfo)->UsrData.sSystemBuffer.iStride[1];
        uint8_t* src_y = decoder->pData[0];
        uint8_t* src_u = decoder->pData[1];
        uint8_t* src_v = decoder->pData[2];
        uint8_t* dst_y = (uint8_t *)out;
        uint8_t* dst_u = dst_y + (width) * (height);
        uint8_t* dst_v = dst_u + (width) * (height) / 4;
        for (int i = 0; i < height; i += 1) {
            memcpy(dst_y, src_y, width);
            dst_y += width;
            src_y += y;
            if (i < height / 2) {
                memcpy(dst_u, src_u, width / 2);
                memcpy(dst_v, src_v, width / 2);
                dst_u += width / 2;
                dst_v += width / 2;
                src_u += uv;
                src_v += uv;
            }
        }
        printf("height:%d widht:%d, y_stride:%d, uv_stride:%d\n", height, width, y, uv);
        *outsize = height * width * 3 / 2;
    }
    return 0;
}

H264Decoder* H264DecoderInit() {
    H264Decoder* decoder = (H264Decoder *)malloc(sizeof(H264Decoder));
    memset(decoder, 0, sizeof(H264Decoder));
    int w_ret = WelsCreateDecoder(&decoder->pSvcDecoder);
    if (w_ret != 0) {
        printf("error:%d\n", w_ret);
    }
    memset(&decoder->sDstBufInfo, 0, sizeof(SBufferInfo));
    memset(decoder->pData, 0, sizeof(decoder->pData));
    SDecodingParam sParam = { 0 };
    int i_ret = decoder->pSvcDecoder->Initialize(&sParam);
    if (i_ret != 0) {
        printf("error:%d\n", i_ret);
    }
    return decoder;
}


void H264DecoderDestory(H264Decoder* decoder){
    if (decoder) {
            if (decoder->pSvcDecoder) {
                decoder->pSvcDecoder->Uninitialize();
                WelsDestroyDecoder(decoder->pSvcDecoder);
            }
            free(decoder);
            decoder = NULL;
    }
}
int main() {
    H264Decoder* decoder = H264DecoderInit();
    printf("init decoder success \n");
    FILE* input = NULL;
    FILE* output = NULL;
    output = fopen("./test.yuv", "wb+");
    input = fopen("./BAMQ1_JVC_C.264", "rb+"); // 176* 144
    fseek(input, 0, SEEK_END);
    char* out = (char *)malloc(10 * 1024 * 1024);
    int length = ftell(input);
    char* data = (char *)malloc((length + 1) * sizeof(char));
    rewind(input);
    length = fread(data, 1, length, input);
    fclose(input);
    int pos = 0;
    while (pos < length - 4)
    {
        if (nalu_start(data, pos)) {
            int size = 0;
            int end = nalu_end(data, pos + 3, length);
            int ret = H264DecoderFrame(decoder, data + pos, end - pos, out, &size);
            printf("start:%d, end:%d ret:%d size:%d\n", pos, end, ret, size);
            if (ret == 0 && size != 0){
                fwrite(out, size, 1, output);
            }
            pos += 3;
        } else {
            pos += 1;
        }
    }
    
    return 0;
}