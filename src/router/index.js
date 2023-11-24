import { Router } from "express"
import UserController from '../controllers/userController.js'
import AuthController from '../controllers/authController.js'
const router = Router()

// authChecker -> validate access auth token <- 
import authChecker from "../middlewares/auth.mwr.js"

// ===========================================================================================//
// ================================== handle auth endpoints ==================================//
// ===========================================================================================//


// registration <- 
router.post(
  "/auth/sign-up/",  
  AuthController.signUp
)

// activate account <-
router.get(
  "/auth/activate/:link/",  
  AuthController.activateAccount
)

// login <-
router.post(
  "/auth/sign-in/",  
  AuthController.signIn
)

// forgot passord <-
router.get(
  "/auth/forgot-password/:userEmail/",  
  AuthController.forgotPassword
)

// refresh <-
router.get(
  "/auth/refresh/",  
  AuthController.refresh
)

// logout <-
router.get(
  "/auth/logout/:userId/",  
  AuthController.logout
)


// ===========================================================================================//
// ================================= handle user endpoints ===================================//
// ===========================================================================================//

// test profile page <-
router.get(
  "/profile/:userId/",
  authChecker, 
  UserController.profile
)


export default router;