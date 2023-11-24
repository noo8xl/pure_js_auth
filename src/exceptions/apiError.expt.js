import Helper from "../helpers/helper.js"

export default class ApiError extends Error {
  message
  status
  errors

  constructor(status, message, errors= []) {
    super(message)
    this.message = message
    this.status = status
    this.errors = errors
  }

  static async UnauthorizedError(){
    return new ApiError(401, 'unauthorized user')
  }

  static async PermissionDenied(area, txt) {
    const msg = txt + " _ " + "Permission denied!"
    await Helper.ErrorHandler(area, msg)
    return new ApiError(403, msg)
  }

  static async BadRequest() {
    return new ApiError(400, "Bad request")
  }

  static async ServerError(area, txt) {
    const msg = txt + " _ " + "Internal Error."
    await Helper.ErrorHandler(area, msg)
    return new ApiError(500, msg)
  }

}