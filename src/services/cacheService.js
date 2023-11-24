import { createClient } from 'redis'
import ApiError from '../exceptions/apiError.expt.js';

// the doc is -> 
// https://redis.io/docs/connect/clients/nodejs/
// <- 
class CacheService {

  // the cache is ==== >
  // = > userDto is Object with :
  //  {
  //   userEmail: req.body.userEmail,
  //   userPassword: req.body.userPassword,
  //   twoStepCode: req.body.twoStepCode,
  //   token: "string",
  //   action: "string"
  // }

  // should update ?? < --
  async ClearCahce(userID){
    const cl = await this.#connect()
    await cl.functionDelete(userID)
    await cl.disconnect();
    return
  }

  async GetUserCache(key){
    const cl = await this.#connect()

    const temp = await cl.hGetAll(key);
    const c = JSON.parse(JSON.stringify(temp, null, 2))

    // console.log("user session is =>\n", c);
    await cl.disconnect();
    return c
  }

  async SetUserCache(userId, dto){
    const cl = await this.#connect()
    console.log("c dto =>\n",userId, "\n", dto);
    await cl.hSet(userId, dto)
    await cl.disconnect();
    return
  }

  async SetParserCache(userID, payload){
    const cl = await this.#connect()
    await cl.hSet(userID, payload)

    await cl.disconnect();
    return
  }





  async #connect(){

    // this.#client = createClient({
    //   username: 'default', // use your Redis user. More info https://redis.io/docs/management/security/acl/
    //   password: 'secret', // use your password here
    //   socket: {
    //       host: 'my-redis.cloud.redislabs.com',
    //       port: 6379,
    //       tls: true,
    //       key: readFileSync('./redis_user_private.key'),
    //       cert: readFileSync('./redis_user.crt'),
    //       ca: [readFileSync('./redis_ca.pem')]
    //   }
    // });

    // const url = process.env.CACHE_CONNECT_URL
    // const client = createClient({
    //   url
    // });
    const client = createClient();

    client.on('error', async function (err){
      throw await ApiError.ServerError("_redis_", err.message)
    });
    return await client.connect()
  }

}

export default new CacheService();