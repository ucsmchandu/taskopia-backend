class RedisRateLimitStore {
    constructor({ client, prefix, windowMs }) {
        this.client = client;
        this.prefix = prefix;
        this.windowMs = windowMs;
    }

    init(options) {
        this.windowMs = options.windowMs;
    }

    // return the redis key (eg: taskopia:rate-limit:global:ip address (or) taskopia:rate-limit:auth:ip address)
    getKey(key) {
        return `${this.prefix}:${key}`;
    }

    // increments the ip address counts
    async increment(key) {
        // get the key
        const redisKey = this.getKey(key);
        // incre the value
        const totalHits = await this.client.incr(redisKey);

        // sets the time
        if (totalHits === 1) {
            await this.client.pExpire(redisKey, this.windowMs);
        }

        // gives the remaining time
        const ttl = await this.client.pTTL(redisKey);

        const resetTime = new Date(Date.now() + (ttl > 0 ? ttl : this.windowMs));

        return { totalHits, resetTime };
    }

    async decrement(key) {
        // get the key
        const redisKey = this.getKey(key);
        // decre teh count
        const totalHits = await this.client.decr(redisKey);

        if (totalHits <= 0) {
            await this.client.del(redisKey);
        }
    }

    async resetKey(key) {
        await this.client.del(this.getKey(key));
    }
}

module.exports = RedisRateLimitStore;
