###
 # @Author: xiuquanxu
 # @Company: kaochong
 # @Date: 2021-06-01 19:00:09
 # @LastEditors: xiuquanxu
 # @LastEditTime: 2021-06-04 17:06:44
### 
gcc WrapperLibyuv.c -I . -I include -I . -I include/libyuv -L lib/macos -lyuv  -o  WrapperLibyuv.a
./WrapperLibyuv.a
ffplay -f rawvideo -video_size 1280*720 -pixel_format yuv420p 1280-720-yuv-2.raw
# ffplay -f rawvideo -pixel_format rgb24 -s 1080*720  1280-720-argb-1.raw