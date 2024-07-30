import type { RedisClientType, RedisFunctions, RedisModules, RedisScripts } from '@redis/client';
import { createClient } from 'redis';
let redisClient: RedisClientType<RedisModules, RedisFunctions, RedisScripts>;

// cache lifespan in seconds (currently 2 weeks)
// the cache gets invalidated when the areas are edited so it can be stale for a while
const cacheLifespan = 60 * 60 * 24 * 14;
export const initializeRedisClient = async () => {
    // read the Redis connection URL from the envs
    const redisURL = process.env.REDIS_URI
    const redisHost = process.env.REDIS_HOST
    const redisPort = process.env.REDIS_PORT
    const redisPassword = process.env.REDIS_PASSWORD
    if (redisURL || redisHost) {
        // create the Redis client object
        if(redisHost && redisPort && redisPassword) {
            redisClient = createClient({
                password: redisPassword,
                socket: {
                    host: redisHost,
                    port: parseInt(redisPort)
                }
            });
        }else {
            redisClient = createClient({ url: redisURL }).on("error", (e) => {
                console.error(`Failed to create the Redis client with error:`);
                console.error(e);
            });
        }

        try {
            // connect to the Redis server
            await redisClient.connect();
            console.log(`Connected to Redis successfully!`);
        } catch (e) {
            console.error(`Connection to Redis failed with error:`);
            console.error(e);
        }
    }
}

const isRedisWorking = () => {
    // verify wheter there is an active connection
    // to a Redis server or not
    return !!redisClient?.isOpen;
}

export const writeData = async (key: string, data: string) => {
    if (isRedisWorking()) {
        try {
            // write data to the Redis cache
            await redisClient.set(key, data, { EX: cacheLifespan });
        } catch (e) {
            console.error(`Failed to cache data for key=${key}`, e);
        }
    }
}

export const readData = async (key: string) => {
    let cachedValue = undefined;

    if (isRedisWorking()) {
        // try to get the cached response from redis
        cachedValue = await redisClient.get(key);
        if (cachedValue) {
            return cachedValue;
        }
    }
}

export const invalidateCashe = async (key: string) => {
    redisClient.del(key);
}
