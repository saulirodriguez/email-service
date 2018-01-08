const config = require('./config.json');
const nodemailer = require('nodemailer');
const amqplib = require('amqplib/callback_api');

const transport = nodemailer.createTransport({
    service: 'Gmail',
    auth: config.sender
});

const mailOptions = {
    from: `Sauli Rodriguez <${config.sender.user}>`,
    to: 'sauli6692@gmail.com',
    subject: 'TO DO List'
};


amqplib.connect(config.rabbitmq.host, (err, connection) => {
    if (err) {
        console.error(err.stack);
        return process.exit(1);
    }

    connection.createChannel((err, channel) => {
        if (err) {
            console.error(err.stack);
            return process.exit(1);
        }

        channel.assertQueue(config.rabbitmq.queue, {
            durable: false
        }, err => {
            if (err) {
                console.error(err.stack);
                return process.exit(1);
            }

            console.log('Listening...');
            channel.prefetch(config.rabbitmq.prefetch);

            channel.consume(config.rabbitmq.queue, data => {
                if (data === null) {
                    return;
                }
                mailOptions.text = data;
                mailOptions.html = `<b> ${data} <b>`;
                transport.sendMail(mailOptions, (error, info) => {
				    if (error) {
				        console.log(error);
				    }
				    console.log(`Message sent: ${info.response}`);
				    channel.ack(data);
				});
            });
        });
    });
});
