CXX = g++
OBJ = h264.cc
TARGET = h264.a
FLAG = -I . -I ../codec/api/svc \
	 -L . -L ../ \
	 -lopenh264 \

$(TARGET): $(OBJ)
	$(CXX) $(OBJ) $(FLAG) -o $(TARGET)

.PHONY: clean
clean:
	rm -rf $(TARGET)

# ffplay -f rawvideo -pixel_format yuv420p -s 720*1280 test.yuv
# ffplay -f f32le -ac 1 -ar 48000 test-web-data.pcm
# ffplay -stats -f h264 test.264
