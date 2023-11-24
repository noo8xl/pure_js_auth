import ApiError from '../exceptions/apiError.expt.js'
import TokenService from '../services/tokenService.js'

export default async function (req, res, next) {
  const authorizationHeader = req.headers.authorization
  const accessToken = authorizationHeader.split(' ')[1]
  const isValid = await TokenService.ValidateToken(accessToken)
  try {
    if (!authorizationHeader) return next(await ApiError.UnauthorizedError())
    if (!accessToken) return next(await ApiError.UnauthorizedError())
    if (!isValid) return next(await ApiError.UnauthorizedError())
    next()
  } catch (e) {
    return next(await ApiError.UnauthorizedError())
  }
}