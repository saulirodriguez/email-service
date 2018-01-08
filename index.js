const config = require('./config');
const nodemailer = require('nodemailer');
const amqplib = require('amqplib/callback_api');

const tries = {
	1: 'First',
	2: 'Second',
	3: 'Third'
};

const transport = nodemailer.createTransport({
    service: 'Gmail',
    auth: config.sender
});

const mailOptions = {
    from: `Sauli Rodriguez <${config.sender.user}>`,
    to: 'sauli6692@gmail.com',
    
    subject: 'TO DO List'
};

let connectionsCount = 1;

const connectToRabbitmq = () => {
	amqplib.connect(config.rabbitmqURL, (err, connection) => {
	    if (err) {
	    	if (connectionsCount < 3) {
	    		console.log('Connection failed: ' + tries[connectionsCount++] + ' try');
				setTimeout(() => connectToRabbitmq(), 20000);
			} else {
				console.log('CONNECTION FAILED', err.stack);
				return process.exit(1);
			}
	    } else {
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
						let message = data.content.toString('utf8');
						mailOptions.text = message;
						mailOptions.html = `<b> ${message} <b>`;
						console.log('MESSAGE', message);
						transport.sendMail(mailOptions, (error, info) => {
						    if (error) {
								console.log(error);
								return;
						    }
						    console.log(`Message sent: ${info ? info.response: 'no message'}`);
						    channel.ack(data);
						});
				    });
				});
			});
	    }

	});
}

connectToRabbitmq();
