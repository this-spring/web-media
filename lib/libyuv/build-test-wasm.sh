###
 # @Author: xiuquanxu
 # @Company: kaochong
 # @Date: 2021-06-01 19:00:36
 # @LastEditors: xiuquanxu
 # @LastEditTime: 2021-06-03 14:11:51
### 
# echo "------start build wasm-----"
source /Users/xuxiuquan/h5project/emsdk/emsdk_env.sh
rm -rf wasm
mkdir wasm
pwd
EMCC_DEBUG=1
EMMAKEN_CFLAGS="-I/Users/xuxiuquan/mygithub/web-media/lib/libyuv/include/ -I/Users/xuxiuquan/mygithub/web-media/lib/libyuv/include/libyuv/ -L//Users/xuxiuquan/mygithub/web-media/lib/libyuv/lib/wasm/ -lyuv -DNOPUS_HAVE_RTCD" \
emcc  ./WrapperLibyuv.c \
    ./lib/wasm/libyuv.a \
    -I . -I include -I . -I include/libyuv -L lib/wasm -lyuv \
    -g2 \
    -s EMULATE_FUNCTION_POINTER_CASTS=1 \
    -s ASSERTIONS=2 \
    -s WASM=1 \
    -s ALLOW_MEMORY_GROWTH=1 \
    -s "MODULARIZE=1" \
    -s "EXPORT_NAME='LibYUV'" \
    -s "BINARYEN_METHOD='native-wasm'" \
    -s EXPORTED_FUNCTIONS="['_malloc', '_free', '_ConvertRGBA88882YUV420P', '_ConvertYUV420P2RGBA8888', '_I420ToABGR', '_ABGRToI420']" \
    -s EXPORTED_RUNTIME_METHODS='["ccall", "cwrap"]' \
    -o ./wasm/LibYUV.js \
    -Wall \
