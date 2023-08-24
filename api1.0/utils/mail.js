const amqp = require('amqplib');
module.exports = {
    enqueueMail: async (mailOptions) => {
        const connection = await amqp.connect('amqp://52.64.240.159'); // RabbitMQ 連接設定
        const channel = await connection.createChannel();

        const queue = 'mail_queue';
        await channel.assertQueue(queue, { durable: true });
        const message = JSON.stringify(mailOptions);
        channel.sendToQueue(queue, Buffer.from(message), { persistent: true });
        console.log('Email task enqueued:', mailOptions.to);
        await channel.close();
        await connection.close();
    }

}