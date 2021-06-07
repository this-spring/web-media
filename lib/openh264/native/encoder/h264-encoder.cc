/*
 * @Author: xiuquanxu
 * @Company: kaochong
 * @Date: 2021-06-04 11:24:06
 * @LastEditors: xiuquanxu
 * @LastEditTime: 2021-06-04 11:40:24
*/
#include <stdlib.h>
#include <stdio.h>

namespace H264Encoder {
    class VideoEncoder
    {
    private:
        /* data */
    public:
        struct Setting
        {
            Setting() {
                fps = 15;
                frame_skip = false;
            }
            uint32_t width;
            uint32_t height;
            uint32_t bitrate_bps; // 码率
            uint32_t fps;
            bool frame_skip; // 是否开启跳帧
            uint32_t qp; // qp值
        };

        virtual bool Open(const Setting)
        
        VideoEncoder(/* args */);
        ~VideoEncoder();
    };
    
    VideoEncoder::VideoEncoder(/* args */)
    {
    }
    
    VideoEncoder::~VideoEncoder()
    {
    }
    
}