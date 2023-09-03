const amqp = require('amqplib');
const dotenv = require('dotenv');
dotenv.config();
module.exports = {
    enqueueMail: async (mailOptions) => {
        const connection = await amqp.connect(`amqp://${process.env.RABBITMQ_DEFAULT_USER}:${process.env.RABBITMQ_DEFAULT_PASS}@192.168.0.2`);
        const channel = await connection.createChannel();

        const queue = 'mail_queue';
        await channel.assertQueue(queue, { durable: false });
        const message = JSON.stringify(mailOptions);
        channel.sendToQueue(queue, Buffer.from(message));
        //channel.sendToQueue(queue, Buffer.from(message),{persisten...});
        console.log('Email task enqueued:', mailOptions.to);
        await channel.close();
        await connection.close();
    }
    //

}