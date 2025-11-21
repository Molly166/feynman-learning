require('dotenv').config({ path: './.env' });
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const app = express();
const port = process.env.PORT || 3000;

// �м��
app.use(cors());
app.use(express.json()); // ? ����·��ǰ

// MongoDB 连接
const rawUri = (process.env.MONGO_URI || '').trim();
const maskedUri = rawUri.replace(/:(.*?)@/, ':****@');
if (!rawUri || (!rawUri.startsWith('mongodb://') && !rawUri.startsWith('mongodb+srv://'))) {
  console.error('MongoDB connection error: Invalid MONGO_URI scheme. Got:', maskedUri || '(empty)');
} else {
  mongoose.connect(rawUri)
    .then(() => console.log('MongoDB connected successfully!'))
    .catch(err => console.error('MongoDB connection error:', err));
}

// ��·��
app.get('/', (req, res) => {
  res.send('Feynman Platform backend is running');
});

// ·��
app.use('/api/users', require('./routes/users'));
app.use('/api/knowledge-points', require('./routes/knowledgePoints'));
app.use('/api/audio', require('./routes/audio'));
app.use('/api/ai', require('./routes/ai'));
app.use('/api/graph', require('./routes/graph'));

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
