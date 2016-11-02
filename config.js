var config = {};

config.backend_host = process.env.BACKEND_HOST || 'localhost';
config.backend_port = process.env.BACKEND_PORT || '8080';
config.backend = 'http://' + config.backend_host + ':' + config.backend_port;

config.db_host = process.env.DB_HOST || 'localhost';
config.db_name = process.env.DB_NAME || 'pacs';
config.db_username = process.env.DB_USERNAME || 'root';
config.db_password = process.env.DB_PASSWORD || 'root';

module.exports = config;
