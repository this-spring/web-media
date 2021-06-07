/*
 * @Author: xiuquanxu
 * @Company: kaochong
 * @Date: 2021-01-28 15:12:01
 * @LastEditors: xiuquanxu
 * @LastEditTime: 2021-02-03 15:45:10
*/
#include <stdlib.h>
#include <stdio.h>
#include <stdint.h>
#include <memory.h>
#include "../codec/api/svc/codec_api.h"

typedef struct H264Decoder 
{
    ISVCDecoder *pSvcDecoder;
    unsigned char *pData[3];
    SBufferInfo sDstBufInfo;
    char* input;
    int i_size;
} h264_decoder;

H264Decoder* H264DecoderInit();

int H264DecoderFrame(H264Decoder* decoder, char* input, int size, char* out);

void H264DecoderDestory(H264Decoder* decoder);