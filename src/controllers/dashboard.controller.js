import mongoose from "mongoose"
import {Video} from "../models/video.model.js"
import {Subscription} from "../models/subscription.model.js"
import {Like} from "../models/like.model.js"
import {ApiError} from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"

const getChannelStats = asyncHandler(async (req, res) => {
    const channelId = req.user._id

    const [[videoStats], totalSubscribers] = await Promise.all([
        Video.aggregate([
            {$match: {owner: channelId}},
            {
                $group: {
                    _id: null,
                    totalVideos: {$sum: 1},
                    totalViews: {$sum: "$views"},
                    videoIds: {$push: "$_id"}
                }
            },
            {
                $lookup: {
                    from: "likes",
                    let: {videoIds: "$videoIds"},
                    pipeline: [
                        {$match: {$expr: {$in: ["$video", "$$videoIds"]}}},
                        {$count: "count"}
                    ],
                    as: "likes"
                }
            },
            {
                $project: {
                    _id: 0,
                    totalVideos: 1,
                    totalViews: 1,
                    totalLikes: {$ifNull: [{$arrayElemAt: ["$likes.count", 0]}, 0]}
                }
            }
        ]),
        Subscription.countDocuments({channel: channelId})
    ])

    return res.status(200).json(
        new ApiResponse(200, {
            totalVideos: videoStats?.totalVideos ?? 0,
            totalViews: videoStats?.totalViews ?? 0,
            totalLikes: videoStats?.totalLikes ?? 0,
            totalSubscribers
        }, "Channel stats fetched successfully")
    )
})

const getChannelVideos = asyncHandler(async (req, res) => {
    const videos = await Video.find({owner: req.user._id})
        .sort({createdAt: -1})
        .lean()

    return res.status(200).json(
        new ApiResponse(200, videos, "Channel videos fetched successfully")
    )
})

export {
    getChannelStats, 
    getChannelVideos
    }
