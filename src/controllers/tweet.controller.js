import mongoose, { isValidObjectId } from "mongoose"
import {Tweet} from "../models/tweet.model.js"
import {User} from "../models/user.model.js"
import {ApiError} from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"

const createTweet = asyncHandler(async (req, res) => {
    //TODO: create tweet
    const content = req.body
    const userId = req.user._id

    if(!userId || !isValidObjectId(userId)) {
        throw new ApiError(400, "Invalid user ID")
    }

    if(!content) {
        throw new ApiError(400, "Content is required")
    }

    const tweet = await Tweet.create({
        content: content.toString(),
        owner: userId
    })

    if(!tweet) {
        throw new ApiError(500, "Failed to create tweet")
    }

    return res.status(201).json(new ApiResponse(201, tweet, "Tweet created successfully"))
})

const getUserTweets = asyncHandler(async (req, res) => {
    // TODO: get user tweets
    const userId = req.user._id

    if(!userId || !isValidObjectId(userId)) {
        throw new ApiError(400, "Invalid user ID")
    }

    const tweets = await Tweet.find({owner: userId}).sort({createdAt: -1})

    return res.status(200).json(new ApiResponse(200, tweets, "User tweets fetched successfully"))
})

const updateTweet = asyncHandler(async (req, res) => {
    //TODO: update tweet
    const {tweetId} = req.params
    const {content} = req.body
    const userId = req.user._id

    if(!tweetId || !isValidObjectId(tweetId)) {
        throw new ApiError(400, "Invalid tweet ID")
    }

    if(!content) {
        throw new ApiError(400, "Content is required")
    }

    if(!userId || !isValidObjectId(userId)) {
        throw new ApiError(400, "Invalid user ID")
    }

    const tweet = await Tweet.findOne({user: userId, _id: tweetId})

    if(!tweet) {
        throw new ApiError(404, "Tweet not found")
    }

    return res.status(200).json(new ApiResponse(200, tweet, "Tweet updated successfully"))
})

const deleteTweet = asyncHandler(async (req, res) => {
    //TODO: delete tweet
    const {tweetId} = req.params
    const userId = req.user._id

    if(!tweetId || !isValidObjectId(tweetId)) {
        throw new ApiError(400, "Invalid tweet ID")
    }

    if(!userId || !isValidObjectId(userId)) {
        throw new ApiError(400, "Invalid user ID")
    }

    const tweet = await Tweet.deleteOne({owner: userId, _id: tweetId})

    if(!tweet) {
        throw new ApiError(404, "Tweet not found")
    }

    return res.status(200).json(new ApiResponse(200, null, "Tweet deleted successfully"))
})

export {
    createTweet,
    getUserTweets,
    updateTweet,
    deleteTweet
}