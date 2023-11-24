import crypto from "crypto"

class Helper {

  // GeneratePassword > generate unic code by userData <-
  // doc is here -> 
  // https://www.geeksforgeeks.org/node-js-crypto-createhash-method/
  async GeneratePassword(dto) {
    return crypto
      .createHash('sha256', dto)
      .digest('hex')
  }

  // ErrorHandler > handle each error amoung project <-
  async ErrorHandler(area, errTxt) {
    let msg = "auth_tmplt receive an error at" + area + " " + errTxt;
    console.error(msg)

    // connect to exception notification api ?*
    // response.end() here <-
    return
  }

  async PrepareUserCacheData(dto, t){
    // copying <-
    let c = JSON.parse(JSON.stringify(dto))

    delete c.createdAt
    c._id = c._id.toString()
    c.token = t
    c.action = ""

    return c
  }
}

export default new Helper();