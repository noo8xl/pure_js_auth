import DatabaseService from "./databaseService.js"
import TokenService from "./tokenService.js"
import ApiError from "../exceptions/apiError.expt.js"
import Helper from "../helpers/helper.js"
import NotificationService from "./notificationService.js"

export default class AuthService {
  #userName
  #userEmail
  #userPassword
  #token
  #twoStep
  #twoStepCode
  #activationLink


  constructor(userDto){ // is obj with user data from client
    this.#userEmail = userDto.userEmail
    this.#userPassword = userDto.userPassword
    this.#token = userDto.token
    this.#twoStepCode = userDto.twoStepCode
    this.#userName = userDto.userName
    this.#activationLink = userDto.activationLink
  }

  async signUp(){

    try {
      const code = await Helper.GeneratePassword(this.#userEmail)
      this.#activationLink = code.slice(0, 18).toUpperCase()

      let userDto = {
        userName: this.#userName,
        userEmail: this.#userEmail,
        userPassword: this.#userPassword,
        activationLink: this.#activationLink
      }
      await DatabaseService.CreateUser(userDto)
      await this.#sendActivationEmail()
    } catch (e) {
      throw await ApiError.ServerError("_db_signUp", e.message)
    }
    return
  }

  async activateAccount(){
    return await DatabaseService.ActivateUserAccount(this.#activationLink)
  }

  async checkTwoStep(){
    this.#twoStep = await DatabaseService.CheckTwoStepAuth(this.#userEmail)
    if(!this.#twoStep) return false

    await this.#createAndSendTwoStepCode(true)
    return this.#twoStep
  }

  async getVerifiedTwoStepCode() {
    return await DatabaseService.VerifiedCode(this.#twoStepCode, this.#userEmail)
  }

  async signin(){ // return bool or user dto with auth token
    
    let userDto = {}
    let user = {}
    let tokens = {}

    try {
      user = await DatabaseService.GetUserByIdOrEmail(this.#userEmail)
      if(!user) throw await ApiError.BadRequest()
      if(user.userPassword !== this.#userPassword) throw await ApiError.BadRequest()
      tokens = await this.#issueTokenPair()
      // save refresh token to db
      userDto.userId = user._id.toString()
      userDto.refreshToken = tokens.refreshToken
      await DatabaseService.SaveToken(userDto)

    } catch (e) {
      throw await ApiError.ServerError("_auth_login", e.message)
    }
    // return userDto + token <-
    return {
      tokens,
      user,
    }
  }

  async forgotPwd(){
    const user = await DatabaseService.GetUserByIdOrEmail(this.#userEmail)
    const tmp = await Helper.GeneratePassword(user.userPassword)
    const code = tmp.slice(0, 8).toUpperCase()

    await DatabaseService.UpdateUserPassword(user.id, code)
    console.log("2fa code was sent");
  }

  async logout(){
    return await this.#clearToken()
  }

  async refresh() {
    let userDto = {}
    let user = {}
    let tokens = {}

    try {
      const curToken = await this.#validateToken()
      const dbToken = await TokenService.FindToken(this.#token)
      if(!curToken) throw await ApiError.UnauthorizedError()
      if(this.#token !== dbToken.refreshToken) {        // await CacheService.ClearCahce(dbToken.userId)
        throw await ApiError.UnauthorizedError()
      } 

      await this.#clearToken()
      tokens = await this.#issueTokenPair()
      // save refresh token to db 
      userDto.userId = dbToken.userId
      userDto.refreshToken = tokens.refreshToken
      await DatabaseService.SaveToken(userDto)
      // set cache data with accesstoken
    } catch (e) {
      throw await ApiError.ServerError("_db_refresh", e.message)
    }
    // return userDto + token <-
    return {
      tokens,
      user,
    }
  }

  async isHaveAccessToUse(){
    const c = await this.#isUserExists()
    if (!c) return false
    const t = await this.#isTokenAvailable()
    if (!t) return false
    return true
  }

  async #sendActivationEmail(){
    return await NotificationService.sendActivationMail(this.#userEmail, this.#activationLink)
  }


  async #createAndSendTwoStepCode(){
    const user = await DatabaseService.GetUserByIdOrEmail(this.#userEmail)
    const tmp = await Helper.GeneratePassword(this.#userEmail)
    const code = tmp.slice(0, 8).toUpperCase()

    const twoFaParams = await DatabaseService.GetTwoStepParams(user.id)
    twoFaParams.type === "email"
      ? await NotificationService.send2faEmailCode(this.#userEmail, code)
      : await NotificationService.send2faTelegramCode(twoFaParams.telegramId, code)

    return
  }


  async #isUserExists(){ // return bool
    return await DatabaseService.GetUserByIdOrEmail(this.#userEmail)
  }

  async #isTokenAvailable(){ // return bool
    return await DatabaseService.ValidateToken(this.#token)
  }

  async #issueTokenPair(){
    let payload = {
      userEmail: this.#userEmail,
      userPassword: this.#userPassword
    }
    return await TokenService.GenTokenPair(payload)
  }

  async #validateToken() {
    return await TokenService.ValidateToken(this.#token)
  }

  async #clearToken(){
    return await DatabaseService.RemoveToken(this.#token)
  }
  
}