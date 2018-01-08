let config = {
	sender: {
		user: "srodr6692@gmail.com",
		pass: "Asd.1234"
	},
	rabbitmq: {
		port: 5672,
		host: "rabbitmq",
		queue: "todo-list",
		prefetch: 1
	}
};


config.rabbitmqURL = "amqp://" + config.rabbitmq.host + ":" + config.rabbitmq.port;

module.exports = config;
