import ApiError from "../exceptions/apiError.expt.js";


// BodyValidator -> validate req body middleware for empty value <- 
export default async function BodyValidator(req, res, next){
  const body = req.body

  try {
    for (let i in body) {
      console.log('request body element\n-> ', body[i]);
      if (body[i] === undefined) {
        next(ApiError.BadRequest())
      }
      if (body[i] === null) {
        next(ApiError.BadRequest())
      }
    }
  } catch (e) {
    next(ApiError.ServerError())
  }
  next()
}