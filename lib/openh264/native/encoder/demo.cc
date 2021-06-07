/*
 * @Author: xiuquanxu
 * @Company: kaochong
 * @Date: 2021-06-04 14:41:43
 * @LastEditors: xiuquanxu
 * @LastEditTime: 2021-06-07 20:40:58
 */
#include <codec_api.h>
#include <stdlib.h>
#include <stdio.h>
#include <string.h>
#include <stddef.h>
#include <algorithm>
#include <iostream> 
#include <fstream>

using namespace std;


class BufferedData {
 public:
  BufferedData() : data_ (NULL), capacity_ (0), length_ (0) {}

  ~BufferedData() {
    free (data_);
  }

  bool PushBack (uint8_t c) {
    if (!EnsureCapacity (length_ + 1)) {
      return false;
    }
    data_[length_++] = c;
    return true;
  }

  bool PushBack (const uint8_t* data, size_t len) {
    if (!EnsureCapacity (length_ + len)) {
      return false;
    }
    memcpy (data_ + length_, data, len);
    length_ += len;
    return true;
  }

  size_t PopFront (uint8_t* ptr, size_t len) {
    len = std::min (length_, len);
    memcpy (ptr, data_, len);
    memmove (data_, data_ + len, length_ - len);
    if (-1 == SetLength (length_ - len))
      return -1;
    return len;
  }

  void Clear() {
    length_ = 0;
  }

  int SetLength (size_t newLen) {
    if (EnsureCapacity (newLen)) {
      length_ = newLen;
    } else {
      Clear();
      //FAIL () << "unable to alloc memory in SetLength()";
      std::cout << "unable to alloc memory in SetLength()" << std::endl;
      return -1;
    }

    return 0;
  }

  size_t Length() const {
    return length_;
  }

  uint8_t* data() {
    return data_;
  }

 private:
  bool EnsureCapacity (size_t capacity) {
    if (capacity > capacity_) {
      size_t newsize = capacity * 2;

      uint8_t* data = static_cast<uint8_t*> (realloc (data_, newsize));

      if (!data)
        return false;

      data_ = data;
      capacity_ = newsize;
      return true;
    }
    return true;
  }

  uint8_t* data_;
  size_t capacity_;
  size_t length_;
};


int main() {
    int width = 1280;
    int height = 720;
    int total_num = 100;
    int read_len = width * height * 3 / 2;
    FILE *fin = NULL;
    FILE *ffin = NULL;
    FILE *fout = NULL;
    fin = fopen("../../data/1280-720-yuv.raw", "rb");
    ffin = fopen("../../data/1280-720-yuv-2.raw", "rb");
    fout = fopen("../../data/1280-720-264.raw", "wb");

    uint8_t in[read_len];
    uint8_t iin[read_len];
    fread(in, 1, read_len, fin);
    fread(iin, 1, read_len, ffin);
    ISVCEncoder* encoder_;
    int rv = WelsCreateSVCEncoder(&encoder_);
    if (rv != 0) {
        printf(" rv error");
        return 1;
    }
    if (encoder_ == NULL) {
        printf(" init encoder error \n");
        return 1;
    }
    SEncParamBase param;
    memset(&param, 0, sizeof(SEncParamBase));
    param.iUsageType = CAMERA_VIDEO_REAL_TIME;
    param.fMaxFrameRate = 10;
    param.iPicWidth = width;
    param.iPicHeight = height;
    param.iTargetBitrate = 5000000;
    encoder_->Initialize(&param);
    int video_format = videoFormatI420;
    encoder_->SetOption(ENCODER_OPTION_DATAFORMAT, &video_format);

    ofstream outFi;
    outFi.open ("test.264", ios::out | ios::binary);

    // step 4
    int frameSize = width * height * 3 / 2;
    // BufferedData buf;
    // buf.SetLength (frameSize);
    // assert (buf.Length() == (size_t)frameSize);
    SFrameBSInfo info;
    memset (&info, 0, sizeof (SFrameBSInfo));
    SSourcePicture pic;
    memset (&pic, 0, sizeof (SSourcePicture));
    for(int num = 0;num<total_num;num++) {
        //prepare input data
        pic.iPicWidth = width;
        pic.iPicHeight = height;
        pic.iColorFormat = videoFormatI420;
        pic.iStride[0] = pic.iPicWidth;
        pic.iStride[1] = pic.iStride[2] = pic.iPicWidth >> 1;
        if (num % 2 == 0) {
            pic.pData[0] = in;
        } else {
            pic.pData[0] = iin;
        }
        pic.pData[1] = in + width * height;
        pic.pData[2] = in + width * height + (width * height >> 2);
        rv = encoder_->EncodeFrame (&pic, &info);
        if (rv == cmResultSuccess && info.eFrameType != videoFrameTypeSkip) {
            printf("success \n");
           for (int iLayer = 0; iLayer < info.iLayerNum; iLayer += 1) {
               SLayerBSInfo* pLayerBSInfo = &info.sLayerInfo[iLayer];

               int iLayerSize = 0;
               int iNalIdx = pLayerBSInfo->iNalCount - 1;
               do {
                   iLayerSize += pLayerBSInfo->pNalLengthInByte[iNalIdx];
                   --iNalIdx;
               } while (iNalIdx >= 0);
               unsigned char *outBuf = pLayerBSInfo->pBsBuf;
                outFi.write((char *)outBuf, iLayerSize);
           }
        }
    }

    // if (encoder_) {
    //     encoder_->Uninitialize();
    //     WelsDestroySVCEncoder (encoder_);
    // }

    outFi.close();
    return 1;
}