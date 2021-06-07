/*
 * @Author: xiuquanxu
 * @Company: kaochong
 * @Date: 2021-05-31 19:02:38
 * @LastEditors: xiuquanxu
 * @LastEditTime: 2021-06-04 17:08:17
 */
#include <stdlib.h>
#include <stdio.h>
#include "libyuv.h"
#include "libyuv/convert.h"
#include "libyuv/convert_argb.h"

int ConvertRGBA88882YUV420P(uint8_t* src_frame, uint8_t* dst_frame, int width, int height) {
    uint8_t* dst_y = dst_frame;
    uint8_t* dst_u = dst_frame + (width * height);
    uint8_t* dst_v = dst_u + (width * height) / 4;
    return ABGRToI420(src_frame, width * 4,
                             dst_y, width,
                             dst_u, width / 2,
                             dst_v, width / 2,
                             width, height);
}

int ConvertYUV420P2RGBA8888(uint8_t* src_frame, uint8_t* dst_frame, int width, int height) {
    uint8_t* src_y = src_frame;
    uint8_t* src_u = src_y + (width * height);
    uint8_t* src_v = src_u + (width * height) / 4;
    return I420ToABGR(src_y, width,
                           src_u, width / 2,
                           src_v, width / 2,
                           dst_frame, width * 4,
                           width, height);
}

int main() {
    FILE *fin = NULL;
    FILE *fout = NULL;
    fin = fopen("./1280-720-rgba2.raw", "rb");
    fout = fopen("./1280-720-yuv-2.raw", "wb");
    int width = 1280;
    int height = 720;
    int read_len = width * height * 4;
    int out_len = width * height * 3 / 2;
    uint8_t in[read_len];
    uint8_t out[out_len];
    fread(in, 1, read_len, fin);
    int res = ConvertRGBA88882YUV420P(in, out, width, height);
    fwrite(out, 1, out_len, fout);
    return 0;
}

// int main() {
//     FILE *fin = NULL;
//     FILE *fout = NULL;
//     fin = fopen("./1280-720-yuv.raw", "rb");
//     fout = fopen("./1280-720-argb-1.raw", "wb");
//     int width = 1280;
//     int height = 720;
//     int out_len = width * height * 4;
//     int read_len = width * height * 3 / 2;
//     uint8_t in[read_len];
//     uint8_t out[out_len];
//     fread(in, 1, read_len, fin);
//     int res = ConvertYUV420P2RGBA8888(in, out, width, height);
//     fwrite(out, 1, out_len, fout);
//     return 0;
// }
