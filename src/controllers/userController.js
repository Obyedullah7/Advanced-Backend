import { asyncHandler } from '../utils/asyncHandler.js';
import { ApiError } from '../utils/ApiError.js';
import { User } from '../models/userModel.js';
import { uploadOnCloudinary } from '../utils/cloudinary.js';
import { ApiResponse } from '../utils/ApiResponse.js';


const registerUser = asyncHandler(async (req, res) => {
    //get user details from frontend

    const { fullname, username, email, password } = req.body;

    //validate user details

    if(
        [fullname, username, email, password].some((field) => field?.trim() === "")
    )
    {
        throw new ApiError(400, "All fields are required");
    }

    //check if user already exists

    const existing = await User.findOne({
        $or: [{ username: username.toLowerCase() }, { email }]
    });

    if(existing)
    {
        throw new ApiError(400, "User already exists");
    }


    //check avatar and cover image

    const avatarLocalPath = req.files?.avatar[0]?.path;
    
    let coverImageLocalPath;
    if(req.files && Array.isArray(req.files.coverImage) && req.files.coverImage.length > 0)
    {
        coverImageLocalPath = req.files.coverImage[0].path;
    }

    if(!avatarLocalPath)
    {
        throw new ApiError(400, "Avatar file is required");
    }

    //upload them to cloudinary

    const avatar = await uploadOnCloudinary(avatarLocalPath);
    const coverImage = await uploadOnCloudinary(coverImageLocalPath);

    if(!avatar)
    {
        throw new ApiError(500, "Error uploading files to cloudinary");
    }

    //create user object - create entry in database

    const user = await User.create({
        fullname,
        username: username.toLowerCase(),
        email,
        password,
        avatar: avatar.url,
        coverImage: coverImage?.url || ""
    });

    //remove password and refresh token from user object

    const createdUser = await User.findById(user._id).select("-password -refreshToken");

    if(!createdUser)
    {
        throw new ApiError(500, "Error creating user");
    }

    //return response

    return res.status(201).json(
        new ApiResponse(201, "User created successfully", createdUser)
    )

 
});




export { registerUser };