<!--
 * @Author: xiuquanxu
 * @Company: kaochong
 * @Date: 2021-06-02 14:05:45
 * @LastEditors: xiuquanxu
 * @LastEditTime: 2021-06-02 15:54:42
-->
## Building Project  

使用Emscripten构建大型项目非常简单。Emscripten提供了两个简单的脚本，用于配置makefile，使其使用emcc作为gcc的替代品—在大多数情况下，项目当前构建系统的其余部分保持不变。

### Integrating(集成) with a build system
要使用Emscripten构建，需要在makefile中用emcc替换gcc。这是使用emconfigure完成的，它配置了适当的环境变量，如CXX（C++编译器）和CC（编译器）。

思考一下这个例子，你通常使用下面命令行来构建：  
```
./configure
make
```

使用emscripten，你可以使用下面命令行代替:  
```
emconfigure ./configure
emmake make
```

## Building to Webassembly

### 构建到wasm  
wasm是一个在web上可执行binary格式，需要下载内容更少，解析更快比js和asm.js。emscripten默认编译成wasm，但是也可以编译成js来兼容老版本浏览器  

#### setup  
wasm是默认编译选项，你不需要用特殊的flag来指定  
```
如果你不想编译成wasm，你可以禁用它像这样:  
emcc [..args..] -s WASM=0
```  

### Backends  
emscripten使用upstream LLVM来作为wasm的后端，从1.39.0（2019 october）。在之前也支持fastcomp作为后端，在2.0.0(2020 august)被移除了。  

有一些不同你需要注意点在两个后端之间。如果你从fastcomp更新到upstream：  
TODO  

### Trapping  
TODO

### Compiler output  
当使用emcc去构建wasm，你将会看见一个.wasm文件和一个.js文件。这两个文件一起工作：.js文件将会为你自动加载和构建wasm代码，正确的设置导入和导出从wasm中，当然还有很多其他的工作，例如导出api等。基于此，你不需要关心编译产物是asm.js还是wasm，他仅仅是一个编译选项。  
你可能也会有额外的文件生成，例如.data文件，如果你预加载文件到虚拟系统。所有这些与构建asm.js时完全相同。您可能注意到的一个区别是缺少.mem文件，对于asm.js，它包含静态内存初始化数据，在WebAssembly中，我们可以更有效地将这些数据打包到WebAssembly二进制文件中  

### Testing native Webassembly in browsers  
wasm默认在Firfox 52，Chrome 57和Opera 44能够支持。在edge15上，您可以通过“Experimental JavaScript Features”标志启用它。

### .wasm files and compilation
WebAssembly代码的编写方式与asm.js有些不同。asm.js可以绑定到主js文件中，而正如前面提到的，WebAssembly是一个二进制文件，因此您将有多个文件要分发。  

另一个值得注意的效果是，默认情况下，WebAssembly是异步编译的，这意味着您必须等待编译完成，然后才能调用编译后的代码（通过等待main（）或onRuntimeInitialized回调等），当您有任何其他使启动异步的东西时，也需要这样做，例如asm.js的.mem文件，或预加载的文件数据等）。您可以通过设置WASM\u async\u compilation=0来关闭异步编译，但由于当前的限制，这在Chrome中可能不起作用。  

要通过网络以最有效的方式为wasm提供服务，请确保您的web服务器对.wasm文件有适当的MIME时间，即application/wasm。这将允许流式编译，浏览器可以在下载时开始编译代码。  
```
apache中，你可以这样做: 
AddType application/wasm .wasm
``` 

也要确保gzip启用  
```
AddOutputFileByType DEFLATE application/wasm
```  

如果您提供大的.wasm文件，Web服务器将在每次请求时动态压缩它们，从而消耗CPU。相反，您可以将它们预压缩到.wasm.gz并使用内容协商：

```
Options Multiviews
RemoveType .gz
AddEncoding x-gzip .gz
AddType application/wasm .wasm
```