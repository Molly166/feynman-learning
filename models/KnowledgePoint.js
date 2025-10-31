// models/KnowledgePoint.js
const mongoose = require('mongoose');

const KnowledgePointSchema = new mongoose.Schema({
    user: { // �������û�
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User' // ����Userģ��
    },
    title: {
        type: String,
        required: true
    },
    content: { // ���Markdown, LaTeX, Mermaid��ԭʼ����
        type: String,
        required: true
    },
    status: { // ѧϰ״̬�� 'not_started', 'in_progress', 'mastered'
        type: String,
        default: 'not_started'
    },
    reviewList: { // �Ƿ��ڸ�ϰ�б���
        type: Boolean,
        default: false
    }
}, { timestamps: true });

module.exports = mongoose.model('KnowledgePoint', KnowledgePointSchema);