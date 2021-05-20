import redis from 'redis';

const client = redis.createClient();

client.on('connect', () => {
  console.log('client connctd to reedis');
});

client.on('ready', () => {
  console.log('client conneected to redis and ready to use');
});

client.on('error', (err) => {
  console.log(err.message);
});

client.on('end', () => {
  console.log('client disconnected from redis');
});

client.on('SIGINT', () => {
  client.quit();
});

export default client;
