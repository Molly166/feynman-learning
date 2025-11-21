// controllers/baiduAiController.js
// 确保环境变量已加载（如果 index.js 中的 dotenv 还没执行）
if (!process.env.QIANFAN_API_KEY) {
    require('dotenv').config({ path: require('path').join(__dirname, '../.env') });
}

const { HNSWLib } = require("@langchain/community/vectorstores/hnswlib");
const { BaiduQianfanEmbeddings } = require("@langchain/baidu-qianfan");
const { BaiduQianfanChat } = require("@langchain/baidu-qianfan");
const { PromptTemplate } = require("@langchain/core/prompts");
const { StringOutputParser } = require("@langchain/core/output_parsers");
const { RunnableSequence } = require("@langchain/core/runnables");
const path = require('path');
const { getEmbeddings } = require('../services/vectorStoreService');

const VECTOR_STORE_PATH = path.join(__dirname, '../vector_store');

// 初始化千帆的聊天模型
function getChatModel() {
    const apiKey = process.env.QIANFAN_API_KEY;
    const apiSecret = process.env.QIANFAN_SECRET_KEY;
    
    if (!apiKey || !apiSecret) {
        throw new Error('QIANFAN_API_KEY 和 QIANFAN_SECRET_KEY 环境变量未配置。请在 .env 文件中配置这些变量。');
    }
    
    // BaiduQianfanChat 支持两种认证方式：
    // 1. qianfanAK/qianfanSK (旧版 API Key)
    // 2. qianfanAccessKey/qianfanSecretKey (新版 Access Key)
    // 如果 API Key 以 "ALT" 开头，使用 Access Key 方式
    if (apiKey.startsWith('ALT')) {
        return new BaiduQianfanChat({
            model: "ERNIE-Bot-turbo",
            qianfanAccessKey: apiKey,
            qianfanSecretKey: apiSecret,
        });
    } else {
        return new BaiduQianfanChat({
            model: "ERNIE-Bot-turbo",
            qianfanAK: apiKey,
            qianfanSK: apiSecret,
        });
    }
}

exports.answerWithRAG = async (req, res) => {
    const { question } = req.body;
    if (!question) {
        return res.status(400).json({ msg: 'Question is required.' });
    }

    try {
        // 1. [进阶] 定义遵循大模型上下文协议 (MCP) 的Prompt模板
        // 讲解：MCP是一种向大模型高效、清晰地传递信息的"最佳实践"。
        // 它通过类似XML的标签，明确地告诉模型各部分内容的角色（比如，这是背景资料，这是用户的问题）。
        // 这样做能显著减少歧义，让模型更好地理解任务，从而给出更精确的回答。
        const promptTemplate = PromptTemplate.fromTemplate(
            `<role>你是一个知识库问答机器人。</role>\n` +
            `<instruction>请根据下面提供的<context>信息来回答用户的<question>。如果上下文中没有相关信息，就明确说你不知道，不要编造答案。请让回答简洁明了。</instruction>\n\n` +
            `<context>\n{context}\n</context>\n\n` +
            `<question>\n{question}\n</question>\n\n` +
            `<answer>你的回答是：</answer>`
        );
        
        // 2. 加载向量数据库并创建检索器
        const embeddings = getEmbeddings();
        let vectorStore;
        try {
            vectorStore = await HNSWLib.load(VECTOR_STORE_PATH, embeddings);
            console.log('向量数据库加载成功');
        } catch (error) {
            console.error('向量数据库加载失败:', error.message);
            // 如果向量库不存在，返回提示信息
            if (error.message.includes('No such file or directory') || 
                error.message.includes('ENOENT') || 
                error.message.includes('Cannot find module') ||
                error.code === 'ENOENT') {
                return res.json({ 
                    answer: '抱歉，知识库还没有内容。请先创建一些知识点，然后再来提问。' 
                });
            }
            throw error;
        }
        
        const retriever = vectorStore.asRetriever(4);

        // 3. 定义格式化函数和 LCEL 链
        const formatDocs = (docs = []) => {
            if (!docs.length) {
                return '没有找到相关的文档内容。';
            }
            return docs.map((doc, index) => `--- 文档 ${index + 1} ---\n${doc.pageContent}`).join("\n\n");
        };

        const chatModel = getChatModel();

        const ragChain = RunnableSequence.from([
            async (input) => {
                const docs = await retriever.invoke(input.question);
                return {
                    context: formatDocs(docs),
                    question: input.question,
                };
            },
            promptTemplate,
            chatModel,
            new StringOutputParser(),
        ]);

        const answer = await ragChain.invoke({ question });
        res.json({ answer });

    } catch (error) {
        console.error('RAG Chain execution error:', error);
        console.error('Error message:', error.message);
        console.error('Error stack:', error.stack);
        
        // 检查是否是 API 配额限制错误
        if (error.message && (
            error.message.includes('daily request limit') || 
            error.message.includes('error_code') && error.message.includes('17') ||
            error.message.includes('request limit reached')
        )) {
            return res.status(500).json({ 
                msg: '百度千帆 API 每日请求次数已达上限。',
                hint: '请等待明天重置，或升级 API 配额。',
                error: 'Open api daily request limit reached'
            });
        }
        
        // 检查是否是 API key 相关错误
        if (error.message && (error.message.includes('API') || error.message.includes('key') || error.message.includes('AK/SK') || error.message.includes('QIANFAN') || error.message.includes('invalid_client'))) {
            return res.status(500).json({ 
                msg: 'API配置错误，请检查QIANFAN_API_KEY和QIANFAN_SECRET_KEY环境变量。',
                error: error.message,
                details: process.env.NODE_ENV === 'development' ? error.stack : undefined
            });
        }
        
        // 检查是否是向量库相关错误
        if (error.message && (error.message.includes('vector') || error.message.includes('HNSW') || error.message.includes('ENOENT'))) {
            return res.status(500).json({ 
                msg: '向量数据库错误，请确保已创建至少一个知识点。',
                error: error.message
            });
        }
        
        res.status(500).json({ 
            msg: 'Error answering question with RAG.',
            error: error.message,
            errorType: error.constructor.name,
            details: process.env.NODE_ENV === 'development' ? error.stack : undefined
        });
    }
};

