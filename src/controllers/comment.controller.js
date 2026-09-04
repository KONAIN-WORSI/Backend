import mongoose, {isValidObjectId} from "mongoose"
import {Comment} from "../models/comment.model.js"
import {ApiError} from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"

const getVideoComments = asyncHandler(async (req, res) => {
    //TODO: get all comments for a video
    const {videoId} = req.params
    const {page = 1, limit = 10} = req.query
    const userId = req.user._id

    const pageNumber = Number(page) || 1
    const limitNumber = Number(limit) || 10

    if(!isValidObjectId(videoId)) {
        throw new ApiError(400, "Invalid video ID")
    }
    if(!isValidObjectId(userId)) {
        throw new ApiError(400, "Invalid user ID")
    }

    const comments = await Comment.find({video: videoId})
        .skip((pageNumber - 1) * limitNumber)
        .limit(limitNumber)
        .sort({createdAt: -1})

    return res
    .status(200)
    .json(new ApiResponse(200, comments, "Comments fetched successfully"))
})

const addComment = asyncHandler(async (req, res) => {
    // TODO: add a comment to a video
    const videoId = req.params.videoId
    const userId = req.user._id
    const {content} = req.body

    if(!isValidObjectId(videoId)) {
        throw new ApiError(400, "Invalid video ID")
    }

    if(!isValidObjectId(userId)) {
        throw new ApiError(400, "Invalid user ID")
    }

    if(!content || content.trim() === "") {
        throw new ApiError(400, "Comment content cannot be empty")
    }

    const newComment = new Comment({
        owner: userId,
        video: videoId,
        content: content
    })

    await newComment.save()

    return res
    .status(201)
    .json(new ApiResponse(201, newComment, "Comment added successfully"))

})

const updateComment = asyncHandler(async (req, res) => {
    // TODO: update a comment
    const {commentId} = req.params
    const userId = req.user._id
    const {content} = req.body

    if(!isValidObjectId(commentId)) {
        throw new ApiError(400, "Invalid comment ID")
    }
    if(!isValidObjectId(userId)) {
        throw new ApiError(400, "Invalid user ID")
    }
    if(!content || content.trim() === "") {
        throw new ApiError(400, "Comment content cannot be empty")
    }

    const comment = await Comment.findByIdAndUpdate(commentId, {content: content}, {new: true})


    return res
    .status(200)
    .json(new ApiResponse(200, comment, "Comment updated successfully"))
})

const deleteComment = asyncHandler(async (req, res) => {
    // TODO: delete a comment
    const {commentId} = req.params
    const userId = req.user._id

    if(!isValidObjectId(commentId)) {
        throw new ApiError(400, "Invalid comment ID")
    }  
    if(!isValidObjectId(userId)) {
        throw new ApiError(400, "Invalid user ID")
    }

    const comment = await Comment.findByIdAndDelete(commentId)

    return res
    .status(200)
    .json(new ApiResponse(200, comment, "Comment deleted successfully"))
})

export {
    getVideoComments, 
    addComment, 
    updateComment,
    deleteComment
}
