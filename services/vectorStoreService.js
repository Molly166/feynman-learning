// services/vectorStoreService.js
const { HNSWLib } = require("@langchain/community/vectorstores/hnswlib");
const { BaiduQianfanEmbeddings } = require("@langchain/baidu-qianfan");
const { RecursiveCharacterTextSplitter } = require("@langchain/textsplitters");
const fs = require('fs');
const path = require('path');

const VECTOR_STORE_PATH = path.join(__dirname, '../vector_store');

// 文本分割器
const textSplitter = new RecursiveCharacterTextSplitter({
    chunkSize: 500,  // 每个文本块的最大长度
    chunkOverlap: 50, // 块之间的重叠长度，保证语义连续性
});

/**
 * 获取百度千帆的Embedding模型实例（延迟初始化）
 */
function getEmbeddings() {
    // 确保环境变量已加载
    if (!process.env.QIANFAN_API_KEY || !process.env.QIANFAN_SECRET_KEY) {
        require('dotenv').config({ path: path.join(__dirname, '../.env') });
    }
    
    const apiKey = process.env.QIANFAN_API_KEY;
    const apiSecret = process.env.QIANFAN_SECRET_KEY;
    
    if (!apiKey || !apiSecret) {
        throw new Error('QIANFAN_API_KEY 和 QIANFAN_SECRET_KEY 环境变量未配置');
    }
    
    // BaiduQianfanEmbeddings 支持两种认证方式：
    // 1. qianfanAK/qianfanSK (旧版 API Key)
    // 2. qianfanAccessKey/qianfanSecretKey (新版 Access Key)
    // 如果 API Key 以 "ALT" 开头，使用 Access Key 方式
    if (apiKey.startsWith('ALT')) {
        return new BaiduQianfanEmbeddings({
            qianfanAccessKey: apiKey,
            qianfanSecretKey: apiSecret,
            // modelName: "Embedding-V1" // 可以指定模型，默认为Embedding-V1
        });
    } else {
        return new BaiduQianfanEmbeddings({
            qianfanAK: apiKey,
            qianfanSK: apiSecret,
            // modelName: "Embedding-V1" // 可以指定模型，默认为Embedding-V1
        });
    }
}

// 导出 getEmbeddings 供其他模块使用
exports.getEmbeddings = getEmbeddings;

/**
 * 将单个知识点的内容添加到向量数据库中
 * @param {object} knowledgePoint - 包含 _id 和 content 的知识点对象
 */
exports.addKnowledgePointToStore = async (knowledgePoint) => {
    try {
        console.log(`正在为知识点 ${knowledgePoint._id} 创建向量...`);

        // 1. 分割文本
        const content = knowledgePoint.content || '';
        if (!content.trim()) {
            console.warn(`知识点 ${knowledgePoint._id} 内容为空，跳过向量化。`);
            return;
        }

        const docs = await textSplitter.createDocuments(
            [content], // 接收一个字符串数组
            [{ knowledgePointId: knowledgePoint._id.toString() }] // 为每个文档块添加元数据
        );

        console.log(`知识点被分割成 ${docs.length} 个文本块。`);
        
        // 2. 检查向量数据库是否存在，如果存在则加载并添加，否则新建
        const embeddings = getEmbeddings(); // 延迟初始化
        let vectorStore;
        try {
            // 尝试加载已存在的存储
            vectorStore = await HNSWLib.load(VECTOR_STORE_PATH, embeddings);
            await vectorStore.addDocuments(docs);
            console.log('向已存在的向量库中添加了新文档。');
        } catch (e) {
            // 如果加载失败（比如文件不存在），则创建一个新的
            console.log('未找到向量库，正在创建新的...');
            vectorStore = await HNSWLib.fromDocuments(docs, embeddings);
        }

        // 3. 保存向量数据库到本地文件
        if (!fs.existsSync(VECTOR_STORE_PATH)) {
            fs.mkdirSync(VECTOR_STORE_PATH, { recursive: true });
        }
        await vectorStore.save(VECTOR_STORE_PATH);
        console.log(`知识点 ${knowledgePoint._id} 的向量已成功保存。`);

    } catch (error) {
        console.error('添加到向量库失败:', error);
        
        // 检查是否是 API 配额限制错误
        if (error.message && (
            error.message.includes('daily request limit') || 
            error.message.includes('error_code') && error.message.includes('17') ||
            error.message.includes('request limit reached')
        )) {
            console.error('⚠️ 百度千帆 API 每日请求次数已达上限，无法创建向量索引。');
            console.error('💡 提示：请等待明天重置，或升级 API 配额。');
        }
    }
};

/**
 * 从向量数据库中检索与问题相关的文档
 * @param {string} query - 用户的问题
 * @returns {Promise<Document[]>} - 返回相关文档片段的数组
 */
exports.queryVectorStore = async (query) => {
    try {
        // 1. 加载向量数据库
        const embeddings = getEmbeddings(); // 延迟初始化
        const vectorStore = await HNSWLib.load(VECTOR_STORE_PATH, embeddings);

        // 2. 从向量存储创建一个检索器 (Retriever)
        // .asRetriever(k) 表示返回最相关的 k 个结果
        const retriever = vectorStore.asRetriever(4); 

        // 3. 使用检索器获取相关文档
        const relevantDocs = await retriever.invoke(query);
        
        console.log(`为问题 "${query}" 检索到 ${relevantDocs.length} 个相关文档。`);
        return relevantDocs;

    } catch (error) {
        console.error('从向量库检索失败:', error);
        // 如果向量库不存在，可以返回空数组或特定错误
        if (error.message.includes('No such file or directory') || error.message.includes('ENOENT')) {
            return [];
        }
        throw error;
    }
};

