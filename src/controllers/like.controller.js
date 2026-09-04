import mongoose, {isValidObjectId} from "mongoose"
import {Like} from "../models/like.model.js"
import {ApiError} from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"

const toggleVideoLike = asyncHandler(async (req, res) => {
    const {videoId} = req.params
    //TODO: toggle like on video
    const userId = req.user._id

    if(!isValidObjectId(videoId)) {
        throw new ApiError(400, "Invalid video ID")
    }

    const existingLike = await Like.findOne({video: videoId, likedBy: userId})

    if(existingLike) {
        await existingLike.remove()
        return res.status(200).json(new ApiResponse(200, null, "Like removed"))
    }

    const newLike = new Like({video: videoId, likedBy: userId})

    return res.status(201).json(new ApiResponse(201, newLike, "Like added"))
})

const toggleCommentLike = asyncHandler(async (req, res) => {
    const {commentId} = req.params
    //TODO: toggle like on comment
     const userId = req.user._id

    if(!isValidObjectId(commentId)) {
        throw new ApiError(400, "Invalid comment ID")
    }

    const existingLike = await Like.findOne({comment: commentId, likedBy: userId})

    if(existingLike) {
        await existingLike.remove()
        return res.status(200).json(new ApiResponse(200, null, "Comment like removed"))
    }

    const newLike = new Like({comment: commentId, likedBy: userId})

    return res.status(201).json(new ApiResponse(201, newLike, "Comment liked"))
})

const toggleTweetLike = asyncHandler(async (req, res) => {
    const {tweetId} = req.params
    //TODO: toggle like on tweet
     const userId = req.user._id

    if(!isValidObjectId(tweetId)) {
        throw new ApiError(400, "Invalid tweet ID")
    }

    const existingLike = await Like.findOne({tweet: tweetId, likedBy: userId})

    if(existingLike) {
        await existingLike.remove()
        return res.status(200).json(new ApiResponse(200, null, "Tweet like removed"))
    }

    const newLike = new Like({tweet: tweetId, likedBy: userId})

    return res.status(201).json(new ApiResponse(201, newLike, "Tweet liked"))
}
)

const getLikedVideos = asyncHandler(async (req, res) => {
    //TODO: get all liked videos
    const userId = req.user._id

    if(!isValidObjectId(userId)) {
        throw new ApiError(400, "Invalid user ID")
    }

    const likedVideos = await Like.find({likedBy: userId, video: {$exists: true}}).populate('video')
    return res.status(200).json(new ApiResponse(200, likedVideos, "Liked videos fetched"))
})

export {
    toggleCommentLike,
    toggleTweetLike,
    toggleVideoLike,
    getLikedVideos
}