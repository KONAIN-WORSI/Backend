import {isValidObjectId} from "mongoose"
import {User} from "../models/user.model.js"
import { Subscription } from "../models/subscription.model.js"
import {ApiError} from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"


const toggleSubscription = asyncHandler(async (req, res) => {
    const {channelId} = req.params
    const subscriberId = req.user._id

    if (!isValidObjectId(channelId)) {
        throw new ApiError(400, "Invalid channel ID")
    }

    if (channelId === subscriberId.toString()) {
        throw new ApiError(400, "You cannot subscribe to your own channel")
    }

    const channel = await User.findById(channelId)

    if(!channel) {
        throw new ApiError(404, "Channel not found")
    }

    const existingSubscription = await Subscription.findOne({
        subscriber: subscriberId,
        channel: channelId,
    })

    if (existingSubscription) {
        await existingSubscription.deleteOne()

        return res.status(200).json(
            new ApiResponse(200, null, "Unsubscribed successfully")
        )
    }

    const subscription = await Subscription.create({
        subscriber: subscriberId,
        channel: channelId,
    })

    return res.status(201).json(
        new ApiResponse(201, subscription, "Subscribed successfully")
    )
})

// controller to return subscriber list of a channel
const getUserChannelSubscribers = asyncHandler(async (req, res) => {
    const {channelId} = req.params

    if (!isValidObjectId(channelId)) {
        throw new ApiError(400, "Invalid channel ID")
    }

    const channel = await User.findById(channelId)

    if(!channel) {
        throw new ApiError(404, "Channel not found")
    }

    const subscribers = await Subscription.find({channel: channelId})
        .populate("subscriber", "username fullName avatar")

    return res.status(200).json(new ApiResponse(200, subscribers, "Subscriber list retrieved successfully"))
})

// controller to return channel list to which user has subscribed
const getSubscribedChannels = asyncHandler(async (req, res) => {
    const { subscriberId } = req.params

    if (!isValidObjectId(subscriberId)) {
        throw new ApiError(400, "Invalid subscriber ID")
    }

    const user = await User.findById(subscriberId)

    if(!user) {
        throw new ApiError(404, "User not found")
    }

    const subscriptions = await Subscription.find({subscriber: subscriberId})
        .populate("channel", "username fullName avatar")

    return res.status(200).json(new ApiResponse(200, subscriptions, "Subscribed channels retrieved successfully"))
})

export {
    toggleSubscription,
    getUserChannelSubscribers,
    getSubscribedChannels
}
