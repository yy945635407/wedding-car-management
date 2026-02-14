# 婚车管理系统 (Wedding Fleet Manager)

一个精致、优雅的婚车车队管理系统，专为婚礼筹备设计。采用 IOS 风格的 UI 设计，主打粉色与淡蓝色的浪漫色调。

## ✨ 主要功能

### 1. 用户系统
*   **名字登录**：宾客通过输入名字直接登录，简单快捷。
*   **权限管理**：
    *   普通宾客：查看车队、选择座位。
    *   管理员 (用户名通过配置文件设置，默认 `ylyt`)：额外拥有删除车辆、拖拽调整车队顺序的权限。
*   **会话保持**：支持登录状态持久化。

### 2. 车队管理 (主页)
*   **车队展示**：横向滚动查看所有婚车，直观显示每辆车的序号、车牌、司机及入座率。
*   **添加车辆**：支持输入车牌号和司机姓名快速添加新婚车。
*   **车辆排序**：管理员可通过长按并拖拽的方式自由调整车队中车辆的行进顺序。
*   **删除车辆**：管理员可将车辆拖拽至底部垃圾桶区域进行删除。
*   **结婚信息**：顶部导航栏提供婚礼时间等补充信息提示。

### 3. 在线选座
*   **可视化座位图**：精美的 2x2 布局（主驾、副驾、后排左右），配合小车模型背景。
*   **智能选座**：
    *   点击空座即可入座。
    *   点击其他空座自动切换位置。
    *   点击自己已选座位可取消选择。
    *   司机不能占用乘客座位。
*   **状态同步**：实时显示座位上的宾客姓名。

---

## 🛠️ 部署上线的操作方法

本项目基于现代前端技术栈 (Vite + React + TypeScript) 构建，**必须经过编译**生成静态文件后才能部署到服务器。

### 1. 环境准备
确保你的本地开发电脑上安装了 [Node.js](https://nodejs.org/) (推荐 v18 或更高版本)。

### 2. 本地构建 (Build)
在将代码上传到服务器之前，需要在本地执行构建命令，生成可用于生产环境的代码。

1.  打开终端 (Terminal/CMD)，进入项目根目录。
2.  如果是第一次运行，请先安装依赖：
    ```bash
    npm install
    ```
3.  执行构建命令：
    ```bash
    npm run build
    ```
4.  命令执行成功后，项目根目录下会生成一个名为 **`dist`** 的文件夹。
    *   这个文件夹包含了所有编译后的 HTML、CSS、JavaScript 和资源文件。
    *   **注意**：你只需要部署这个 `dist` 文件夹里的内容，不需要上传源代码。

### 3. 服务器部署 (Nginx 示例)
假设你的云服务器使用 Nginx 作为 Web 服务器。

1.  **上传文件**：
    将本地 **`dist` 文件夹内的所有文件** 上传到服务器的网站根目录（例如 `/var/www/wedding`）。
    *   确保 `index.html`、`assets` 文件夹、`config.json` 等都在该目录下。

2.  **配置 Nginx**：
    修改 Nginx 配置文件（通常在 `/etc/nginx/sites-available/default` 或 `/etc/nginx/conf.d/your-site.conf`），添加如下配置：

    ```nginx
    server {
        listen 80;
        server_name your-domain.com; # 替换为你的域名

        # 指向你上传文件的目录
        root /var/www/wedding; 
        index index.html;

        # 核心配置：支持 React 路由
        location / {
            try_files $uri $uri/ /index.html;
        }

        # 可选：开启 gzip 压缩加速加载
        gzip on;
        gzip_types text/plain text/css application/json application/javascript text/xml application/xml application/xml+rss text/javascript;
    }
    ```

3.  **重启 Nginx**：
    ```bash
    sudo nginx -t  # 检查配置语法
    sudo systemctl restart nginx # 重启服务
    ```

4.  **访问**：
    在浏览器输入你的域名，即可看到系统。

---

## ⚙️ 动态配置 (服务器端修改)

部署上线后，如果需要修改管理员名字或婚礼标题，**不需要重新打包上传**。

1.  登录你的云服务器。
2.  进入网站根目录（例如 `/var/www/wedding`）。
3.  找到 `config.json` 文件。
4.  使用编辑器（如 vim 或 nano）修改内容：
    ```bash
    nano config.json
    ```
    ```json
    {
      "adminName": "new_admin",
      "weddingTitle": "新的婚礼标题",
      "infoMessage": "更新后的婚礼信息..."
    }
    ```
5.  保存退出。
6.  刷新浏览器页面，新配置立即生效。

---

## 💻 本地开发指南 (开发者用)

如果你需要修改代码功能：

1.  启动开发服务器：
    ```bash
    npm run dev
    ```
2.  访问 `http://localhost:5173` 进行调试。
