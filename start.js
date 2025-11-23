import { spawn } from 'child_process';
import { existsSync } from 'fs';
import { platform } from 'os';

const isWindows = platform() === 'win32';
const npmCmd = isWindows ? 'npm.cmd' : 'npm';

const runCommand = (command, args) => {
  return new Promise((resolve, reject) => {
    const child = spawn(command, args, { stdio: 'inherit', shell: true });
    child.on('close', (code) => {
      if (code === 0) {
        resolve();
      } else {
        reject(new Error(`Lệnh thất bại với mã lỗi: ${code}`));
      }
    });
  });
};

const main = async () => {
  try {
    // 1. Kiểm tra và cài đặt thư viện nếu chưa có
    if (!existsSync('node_modules')) {
      console.log('\n📦 Phát hiện lần chạy đầu tiên: Đang tự động cài đặt thư viện (npm install)...');
      console.log('⏳ Quá trình này có thể mất vài phút, vui lòng đợi...\n');
      
      await runCommand(npmCmd, ['install']);
      
      console.log('\n✅ Cài đặt hoàn tất!');
    } else {
      console.log('\n⚡ Đã tìm thấy thư viện (node_modules). Bỏ qua bước cài đặt.\n');
    }

    // 2. Khởi động ứng dụng
    console.log('🚀 Đang khởi động AssetFlow...');
    await runCommand(npmCmd, ['run', 'vite-dev']);

  } catch (error) {
    console.error('\n❌ Đã xảy ra lỗi:', error.message);
    process.exit(1);
  }
};

main();