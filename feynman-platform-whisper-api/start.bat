@echo off
echo 启动Whisper API服务...
echo.
echo 首次运行会下载模型文件，请耐心等待...
echo.

REM 检查Python是否安装
python --version >nul 2>&1
if errorlevel 1 (
    echo 错误: 未找到Python，请先安装Python 3.8+
    pause
    exit /b 1
)

REM 安装依赖
echo 安装Python依赖...
pip install -r requirements.txt

REM 启动服务
echo.
echo 启动Whisper API服务...
python app.py

pause







