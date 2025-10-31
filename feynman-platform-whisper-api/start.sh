#!/bin/bash

echo "启动Whisper API服务..."
echo ""
echo "首次运行会下载模型文件，请耐心等待..."
echo ""

# 检查Python是否安装
if ! command -v python3 &> /dev/null; then
    echo "错误: 未找到Python3，请先安装Python 3.8+"
    exit 1
fi

# 安装依赖
echo "安装Python依赖..."
pip3 install -r requirements.txt

# 启动服务
echo ""
echo "启动Whisper API服务..."
python3 app.py







