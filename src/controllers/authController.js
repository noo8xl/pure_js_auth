import Helper from "../helpers/helper.js"
import AuthService from "../services/authService.js"
import CacheService from "../services/cacheService.js"


class AuthController {

  async signUp(req, res, next) {
    const userDto = {
      userEmail: req.body.userEmail,
      userPassword: req.body.userPassword,
      userName: req.body.userName, // code or ""
    }

    try {
      const init = new AuthService(userDto)
      await init.signUp()

      return res.status(201).json({message: "ok"}).end()
    } catch (e) {
      next(e) 
    }
  }

  async activateAccount(req, res, next){
    const activationLink = req.params.link

    try {
      const init = new AuthService({activationLink})
      const result = await init.activateAccount()

      return res.status(202).json(result).end()
    } catch (e) {
      next(e) 
    }
  }

  async signIn(req, res, next){

    const userDto = {
      userEmail: req.body.userEmail,
      userPassword: req.body.userPassword,
      twoStepCode: req.body.twoStepCode, // code or ""
    }

    let isTwoStep = false
    let isValid = false

    try {
      const init = new AuthService(userDto)

      if(userDto.twoStepCode !== "") {
        
        isTwoStep = await init.checkTwoStep()
        if (isTwoStep) return res
          .status(200)
          .json({message: "Two step turned on.",status: true})
          .end()

        isValid = await init.getVerifiedTwoStepCode()
        if (!isValid) return res
          .status(400)
          .json({message: "Wrong two step code."})
          .end()
      } 

      const result = await init.signin()
      const c = await Helper.PrepareUserCacheData(result.user, result.tokens.refreshToken)      
      await CacheService.SetUserCache(c._id, c)

      res.cookie('refreshToken', result.tokens.refreshToken, {
        maxAge: 30 * 4 * 60 * 60 * 1000,
        httpOnly: true,
        sameSite: "none",
        secure: true,
      })

      return res.status(200).json(result).end()
    } catch (e) {
      next(e)
    }
  }

  async forgotPassword(req, res, next){
    const userEmail = req.params.userEmail

    try {
      const init = new AuthService({userEmail})
      await init.forgotPwd()

      return res.status(200).end()
    } catch (e) {
      next(e)
    }
  }


  async refresh(req, res, next){
    const token = req.cookies.refreshToken

    try {
      const init = new AuthService({token})
      const result = await init.refresh() 

      res.cookie('refreshToken', result.tokens.refreshToken, {
        maxAge: 30 * 4 * 60 * 60 * 1000,
        httpOnly: true,
        sameSite: "none",
        secure: true,
      })

      return res.status(200).json(result).end()
    } catch (e) {  
      next(e)
    }
  }

  async logout(req, res, next){
    const token = req.cookies.refreshToken
    const userId = req.params.userId
    try {
      const init = new AuthService({token})
      await init.logout()

      await CacheService.ClearCahce(userId)
      await res.clearCookie('refreshToken')

      return res.status(200).end()
    } catch (e) {
      next(e)
    }
  }

  // =================================================
  // =========== > helper handler below < ============
  // =================================================

  // async fun(params) {
  //   return
  // }
}

export default new AuthController();