
import express from 'express';
import fs from 'fs/promises';
import { existsSync } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();
const PORT = process.env.PORT || 3001;
const DATA_FILE = path.join(__dirname, 'cars.json');
const CONFIG_FILE = path.join(__dirname, 'config.json');

// 初始数据模板
const initialCars = [
  {
    "id": "car-1",
    "plate": "京A·88888",
    "driverName": "王叔",
    "seats": { "driver": "王叔", "passenger": null, "rearLeft": null, "rearRight": null }
  }
];

const initialConfig = {
  "adminName": "ylyt",
  "weddingTitle": "ylyt",
  "infoMessage": "时间预计 2026.3.21 7:00 左右哦",
  "logoUrl": "ylyt.png"
};

// 初始化文件检查
async function initFiles() {
  if (!existsSync(DATA_FILE)) {
    await fs.writeFile(DATA_FILE, JSON.stringify(initialCars, null, 2));
    console.log('已初始化 cars.json');
  }
  if (!existsSync(CONFIG_FILE)) {
    await fs.writeFile(CONFIG_FILE, JSON.stringify(initialConfig, null, 2));
    console.log('已初始化 config.json');
  }
}

app.use(express.json());

// 显式托管根目录下的静态资源（如 ylyt.png, config.json）
// 这确保了无论通过哪个端口访问，资源都能被找到
app.use(express.static(__dirname));

// 获取车队数据
app.get('/api/cars', async (req, res) => {
  try {
    const data = await fs.readFile(DATA_FILE, 'utf-8');
    res.json(JSON.parse(data));
  } catch (error) {
    console.error('读取 cars.json 失败:', error);
    res.status(500).json({ error: '读取数据失败，请检查文件权限' });
  }
});

// 保存车队数据
app.post('/api/cars', async (req, res) => {
  try {
    const cars = req.body;
    if (!Array.isArray(cars)) {
      return res.status(400).json({ error: '数据格式不正确' });
    }
    await fs.writeFile(DATA_FILE, JSON.stringify(cars, null, 2), 'utf-8');
    console.log(`[${new Date().toLocaleTimeString()}] 数据同步成功`);
    res.json({ success: true });
  } catch (error) {
    console.error('写入失败:', error);
    res.status(500).json({ error: '无法保存数据到服务器' });
  }
});

// 生产环境下提供打包后的静态文件服务
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, 'dist')));
  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'dist', 'index.html'));
  });
}

initFiles().then(() => {
  app.listen(PORT, () => {
    console.log(`✅ 后端服务已启动: http://localhost:${PORT}`);
    console.log(`📁 数据文件路径: ${DATA_FILE}`);
  });
});
