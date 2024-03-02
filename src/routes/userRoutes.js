import { Router } from 'express';
import { registerUser, loginUser, logoutUser } from '../controllers/userController.js';
import { upload } from '../middlewares/multerMiddleware.js';
import { verifyJWT } from '../middlewares/authMiddleware.js';

const router = Router();

router.route("/register").post(
    upload.fields([
        { 
            name: 'avatar', 
            maxCount: 1 
        },
        { 
            name: 'coverImage', 
            maxCount: 1
        }
    ]),
        registerUser
    );

router.route("/login").post(loginUser)

router.route("/logout").post(verifyJWT, logoutUser)





export default router;