import jwt from "jsonwebtoken"
import DatabaseService from "./databaseService.js"
import ApiError from "../exceptions/apiError.expt.js"
import * as dotenv from "dotenv"
dotenv.config()

class TokenService {
  #privateKey = process.env.JWT_PRIVATE_SECRET

  async GenTokenPair(payload) {
    let accessToken = "" 
    let refreshToken = ""
    try {
      accessToken = jwt.sign(
        payload, 
        this.#privateKey, 
        {expiresIn: '30m'})

      refreshToken = jwt.sign(
        payload, 
        this.#privateKey, 
        {expiresIn: '4h'})
    } catch (e) {
      throw await ApiError.ServerError("_GenTokenPair_", e.message)
    }

    console.log("tokens =>\n", accessToken, "\n", refreshToken);
    return {
      accessToken,
      refreshToken
    }
  } 

  async ValidateToken(token){
    return jwt.verify(token, this.#privateKey, function(err,decode) {
      if(err) console.error("err =>", err );
      console.log("decode =>\n", decode);
      return decode
    })
  }

  async FindToken(t){
    return await DatabaseService.FindToken(t)
  }
}

export default new TokenService();