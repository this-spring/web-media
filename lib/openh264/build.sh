###
 # @Author: xiuquanxu
 # @Company: kaochong
 # @Date: 2021-06-07 12:25:36
 # @LastEditors: xiuquanxu
 # @LastEditTime: 2021-06-07 15:45:08
### 
g++ test.cc -I ./codec/api/svc -I /usr/local/include/ -L ./lib/ -lopenh264 -L /usr/local/lib 
-lopencv_core -L /usr/local/lib   -lopencv_imgcodecs -L /usr/local/lib  -lopencv_highgui -L /usr/local/lib  -lopencv_imgproc -o demo.a