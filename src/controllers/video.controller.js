import mongoose, {isValidObjectId} from "mongoose"
import {Video} from "../models/video.model.js"
import {User} from "../models/user.model.js"
import {ApiError} from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"
import {uploadOnCloudinary} from "../utils/cloudinary.js"
import { removeImagesFromCloudinary } from "../utils/removeCloudinaryImage.js"


const getAllVideos = asyncHandler(async (req, res) => {
    const { page = 1, limit = 10, query, sortBy, sortType, userId } = req.query

    // Convert the values from the URL into numbers.
    const pageNumber = Number(page) || 1
    const pageLimit = Number(limit) || 10

    // `$match` contains the conditions used to filter videos.
    // This endpoint shows published videos only.
    const matchConditions = { isPublished: true }

    if (userId) {
        if (!isValidObjectId(userId)) {
            throw new ApiError(400, "Invalid user id")
        }

        // Add this condition only when a particular owner's videos are requested.
        matchConditions.owner = new mongoose.Types.ObjectId(userId)
    }

    if (query) {
        // Find videos whose title OR description contains the search text.
        matchConditions.$or = [
            { title: { $regex: query, $options: "i" } },
            { description: { $regex: query, $options: "i" } }
        ]
    }

    // `1` means ascending order; `-1` means descending order.
    // If sorting is omitted, show the newest videos first.
    const sortOptions = {
        [sortBy || "createdAt"]: sortType === "asc" ? 1 : -1
    }

    // First filter videos with `$match`, then arrange them with `$sort`.
    const videoAggregate = Video.aggregate([
        { $match: matchConditions },
        { $sort: sortOptions }
    ])

    // `aggregatePaginate` returns the requested page and pagination details.
    const videos = await Video.aggregatePaginate(videoAggregate, {
        page: pageNumber,
        limit: pageLimit
    })

    return res
        .status(200)
        .json(new ApiResponse(200, videos, "Videos fetched successfully"))
})

const publishAVideo = asyncHandler(async (req, res) => {
    const { title, description} = req.body
    // TODO: get video, upload to cloudinary, create video
    const thumbnailLocalPath = req.files?.thumbnail[0]?.path
    const videoLocalPath = req.files?.videoFile[0]?.path

    if(!thumbnailLocalPath || !videoLocalPath) {
        throw new ApiError(400, "Thumbnail or video file is missing!")
    }

    const thumbnail = await uploadOnCloudinary(thumbnailLocalPath)
    const video = await uploadOnCloudinary(videoLocalPath)

    const newVideo = await Video.create({
        title: title,
        description: description,
        thumbnail: thumbnail.url,
        videoFile: video.url,
        duration: video.duration,
        owner: req.user._id
    })

    return res
    .status(201)
    .json(new ApiResponse(201, newVideo, "Video published successfully"))

})

const getVideoById = asyncHandler(async (req, res) => {
    const { videoId } = req.params
    //TODO: get video by id
    const video = await Video.findById(videoId)

    if(!video) {
        throw new ApiError(404, "Video not found")
    }

    return res
    .status(200)
    .json(new ApiResponse(200, video, "Video fetched successfully"))

})

const updateVideo = asyncHandler(async (req, res) => {
    const { videoId } = req.params
    //TODO: update video details like title, description, thumbnail
    const {title, description} = req.body

    const thumbnailLocalPath = req.file?.path

    const video = await Video.findById(videoId)

    const thumbnail = await uploadOnCloudinary(thumbnailLocalPath)
    
    if(video.thumbnail) {
        await removeImagesFromCloudinary(video.thumbnail)
    }

    if(!video) {
        throw new ApiError(404, "Video not found")
    }


    const updateVideoDetails = await Video.findByIdAndUpdate(videoId, 
        {
            $set: {
                title: title,
                description: description,
                thumbnail: thumbnail.url
            }
        },
        {
            new: true
        }
    )

    return res
    .status(200)
    .json(new ApiResponse(200, updateVideoDetails, "Video details updated successfully!"))

})

const deleteVideo = asyncHandler(async (req, res) => {
    const { videoId } = req.params
    //TODO: delete video

    const video = await Video.findById(videoId)

    if(!video){
        throw new ApiError(404, "Video does not exists")
    }

    const deletedVideo = await Video.deleteOne(video)

    return res
    .status(200)
    .json(new ApiResponse(200, deletedVideo, "Video deleted successfully!"))
})

const togglePublishStatus = asyncHandler(async (req, res) => {
    const { videoId } = req.params

    const video = await Video.findById(videoId)

    if(!video) {
        throw new ApiError(404, "Video not found")
    }

    video.isPublished = !video.isPublished
    await video.save()

    return res
    .status(200)
    .json(new ApiResponse(200, video, "Publish status toggled successfully!"))
})

export {
    getAllVideos,
    publishAVideo,
    getVideoById,
    updateVideo,
    deleteVideo,
    togglePublishStatus
}
