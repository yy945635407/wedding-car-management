
# 婚车管理系统 (Full-Stack Edition)

## 🖼️ 关于 Logo (ylyt.png)
如果你的 Logo 无法显示，请确保：
1. 图片文件名为 `ylyt.png`（或在 `config.json` 中修改 `logoUrl`）。
2. **重点**：将图片文件放在项目的**根目录**下（与 `index.html` 在同一级）。
3. 确保文件名的大小写与配置文件完全一致。

## 🚀 快速启动

### 1. 安装
```bash
npm install
```

### 2. 运行后端 (必须启动)
打开一个终端执行：
```bash
npm run server
```
*后端会自动创建缺失的 `cars.json` 和 `config.json`。*

### 3. 运行前端
打开另一个终端执行：
```bash
npm run dev
```

## 🛠️ 排查“服务器响应异常”
如果你看到这个错误：
1. 检查 `npm run server` 那个窗口是否有报错。
2. 确保 `cars.json` 文件没有被其他程序占用，且格式是合法的 JSON（初始化脚本通常会自动修复它）。
3. 检查 3001 端口是否被占用。
