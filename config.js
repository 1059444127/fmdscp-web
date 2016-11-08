var config = {};

config.PORT = process.env.PORT || '3000';

config.backend_host = process.env.BACKEND_HOST || 'localhost';
config.backend_port = process.env.BACKEND_PORT || '8080';
config.backend = 'http://' + config.backend_host + ':' + config.backend_port;

config.db_host = process.env.DB_HOST || 'localhost';
config.db_name = process.env.DB_NAME || 'pacs';
config.db_username = process.env.DB_USERNAME || 'root';
config.db_password = process.env.DB_PASSWORD || 'root';

config.AUTH0_DOMAIN = process.env.AUTH0_DOMAIN;
config.AUTH0_CLIENT_ID = process.env.AUTH0_CLIENT_ID;
config.AUTH0_CLIENT_SECRET = process.env.AUTH0_CLIENT_SECRET;
config.AUTH0_CALLBACK_URL = process.env.AUTH0_CALLBACK_URL || 'http://home.draconpern.com:3000/callback';

module.exports = config;
