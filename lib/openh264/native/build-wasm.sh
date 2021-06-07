###
 # @Author: xiuquanxu
 # @Company: kaochong
 # @Date: 2021-02-03 14:26:01
 # @LastEditors: xiuquanxu
 # @LastEditTime: 2021-02-03 15:34:50
### 
EMCC_DEBUG=1 \
EMMAKEN_CFLAGS='-I . -I ../codec/api/svc -L . -L ../wasm' \
em++    h264.cc \
        ../wasm/libopenh264.a \
        -g2 \
        -s EMULATE_FUNCTION_POINTER_CASTS=1 \
        -s ASSERTIONS=2 \
        -s WASM=1 \
        -s ALLOW_MEMORY_GROWTH=1 \
        -s "MODULARIZE=1" \
        -s "EXPORT_NAME='OpenH264'" \
        -s "BINARYEN_METHOD='native-wasm'" \
        -s "EXPORTED_FUNCTIONS=['_H264DecoderInit', '_H264DecoderFrame', '_H264DecoderDestory']" \
        -s "EXTRA_EXPORTED_RUNTIME_METHODS"='["ccall", "cwrap"]' \
        -o ./wasm/openh264.js \
        -Wall \


# EMCC_DEBUG=1 \
# EMMAKEN_CFLAGS="-I/usr/local/include -DNOPUS_HAVE_RTCD" \
# emcc    ./opus2fmp4.c \
#         ./fmp4.c \
#         ./resample.c \
#         ../wasm/lib/libfaac.a  \
#         ../wasm/lib/libopus.a \
#         -g2 \
#         -s EMULATE_FUNCTION_POINTER_CASTS=1 \
#         -s ASSERTIONS=2 \
#         -s WASM=1 \
#         -s ALLOW_MEMORY_GROWTH=1 \
#         -s "MODULARIZE=1" \
#         -s "EXPORT_NAME='Opus2Fmp4'" \
#         -s "BINARYEN_METHOD='native-wasm'" \
#         -s "EXPORTED_FUNCTIONS=['_Opus2AacInit', '_Fmp4Data', '_MetadataData', '_test', '_EncodeOpus', '_ResetFmp4', '_PCMEncoderData', '_OpusInitEncoder']" \
#         -s EXTRA_EXPORTED_RUNTIME_METHODS='["ccall", "cwrap"]' \
#         -o ./webassembly/opus2fmp4.js \
#         -Wall \
