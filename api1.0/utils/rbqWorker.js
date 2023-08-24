const amqp = require('amqplib');
const nodemailer = require('nodemailer');
const dotenv = require('dotenv');
dotenv.config()

module.exports = {
    startWorker: async ()=>{
        console.log("rabbit start~");
        const connection = await amqp.connect('amqp://52.64.240.159'); // RabbitMQ 連接設定
        connection.on('error', (err) => {
            console.error('RabbitMQ Connection Error:', err);
        });
        console.log("rabbit connection success~");
        const channel = await connection.createChannel();
        console.log("rabbit create channel success~");
      
        const queue = 'mail_queue';
        await channel.assertQueue(queue, { durable: true });
      
        console.log('Mail worker is waiting for tasks...');
      //
        // 監聽佇列，處理郵件發送任務
        channel.consume(queue, async(msg) => {
          console.log(msg.content.toString());
          const mailOptions = JSON.parse(msg.content.toString());
          await sendMail(mailOptions)
            .then(() => {
              console.log('Email sent:', mailOptions.to);
              channel.ack(msg); // 確認訊息已處理
            })
            .catch((error) => {
              console.error('Error sending email:', error);
              channel.reject(msg, false); // 拒絕訊息並不再重新排程
            });
        });
    },
    sendMail: async(mailOptions)=>{
        const transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
              user: 'howard369369@gmail.com', // 使用你的 Gmail 帳號
              pass: process.env.GP // 使用密碼或應用程式密碼
            }
        });
        await transporter.sendMail(mailOptions);
    }

}