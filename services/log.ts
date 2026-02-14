
import { SystemLog } from '../types';

const LOG_STORAGE_KEY = 'wedding_system_logs';
let cachedIp = '未知IP';

export const LogService = {
  async fetchIp() {
    try {
      const response = await fetch('https://api.ipify.org?format=json');
      const data = await response.json();
      cachedIp = data.ip;
    } catch (e) {
      console.warn('Failed to fetch IP', e);
    }
    return cachedIp;
  },

  addLog(username: string, action: string, details: string) {
    const logs: SystemLog[] = JSON.parse(localStorage.getItem(LOG_STORAGE_KEY) || '[]');
    const newLog: SystemLog = {
      timestamp: new Date().toLocaleString('zh-CN', { hour12: false }),
      ip: cachedIp,
      username,
      action,
      details
    };
    logs.push(newLog);
    localStorage.setItem(LOG_STORAGE_KEY, JSON.stringify(logs));
  },

  exportLogs() {
    const logs: SystemLog[] = JSON.parse(localStorage.getItem(LOG_STORAGE_KEY) || '[]');
    if (logs.length === 0) return alert('暂无日志记录');

    const header = `${'时间戳'.padEnd(25)} | ${'IP地址'.padEnd(15)} | ${'用户名'.padEnd(10)} | ${'动作'.padEnd(10)} | 详情\n`;
    const separator = '-'.repeat(100) + '\n';
    
    const content = logs.map(log => {
      return `${log.timestamp.padEnd(25)} | ${log.ip.padEnd(15)} | ${log.username.padEnd(10)} | ${log.action.padEnd(10)} | ${log.details}`;
    }).join('\n');

    const blob = new Blob([header + separator + content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `婚车系统日志_${new Date().toISOString().split('T')[0]}.log`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }
};
