import CacheService from "../services/cacheService.js"

class UserController {

  async dashboard(req, res, next){
    const userId = req.params.userId
    console.log("userId => ", userId);
    try {

      return res.status(200).json(true).end()
    } catch (e) {
      next(e)
    }
  }

  async profile(req, res, next){
    const userId = req.params.userId
    let result = {}
    try {
      result = await CacheService.GetUserCache(userId)
      if(!result) result = await databaseService.GetUserByIdOrEmail(userId)
      delete result.action
      return res.status(200).json(result).end()
    } catch (e) {
      next(e)
    }
  }
}

export default new UserController();