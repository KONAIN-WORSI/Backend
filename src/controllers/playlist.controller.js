import mongoose, {isValidObjectId} from "mongoose"
import {Playlist} from "../models/playlists.model.js"
import {ApiError} from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"


const createPlaylist = asyncHandler(async (req, res) => {
    const {name, description} = req.body

    //TODO: create playlist
    const userId = req.user._id

    if(!name || !description || name.trim() === "" || description.trim() === ""){
        throw new ApiError(400, "Name and description are required")
    }

    if(!isValidObjectId(userId)){
        throw new ApiError(400, "Invalid user id")
    }

    const newPlaylist = new Playlist({
        name: name.trim(),
        description: description.trim(),
        owner: userId
    })

    await newPlaylist.save()

    return res.status(201).json(new ApiResponse(201, newPlaylist, "Playlist created successfully"))
})

const getUserPlaylists = asyncHandler(async (req, res) => {
    const {userId} = req.params
    //TODO: get user playlists
    if(!isValidObjectId(userId)){
        throw new ApiError(400, "Invalid user id")
    }

    const playlists = await Playlist.find({owner: userId}).populate("videos").exec()
    return res.status(200).json(new ApiResponse(200, playlists, "User playlists fetched successfully"))
})

const getPlaylistById = asyncHandler(async (req, res) => {
    const {playlistId} = req.params
    //TODO: get playlist by id
    const userId = req.user._id

    if(!isValidObjectId(userId)){
        throw new ApiError(400, "Invalid user id")
    }

    if(!isValidObjectId(playlistId)){
        throw new ApiError(400, "Invalid playlist id")
    }

    const playlist = await Playlist.findById(playlistId).populate("videos").exec()
    if(!playlist){
        throw new ApiError(404, "Playlist not found")
    }

    return res.status(200).json(new ApiResponse(200, playlist, "Playlist fetched successfully"))
})

const addVideoToPlaylist = asyncHandler(async (req, res) => {
    const {playlistId, videoId} = req.params
    const userId = req.user._id

    if(!isValidObjectId(userId)){
        throw new ApiError(400, "Invalid user id")
    }
    if(!isValidObjectId(playlistId)){
        throw new ApiError(400, "Invalid playlist id")
    }
    if(!isValidObjectId(videoId)){
        throw new ApiError(400, "Invalid video id")
    }

    const playlist = await Playlist.findById(playlistId.toString()).exec()
    if(!playlist){
        throw new ApiError(404, "Playlist not found")
    }

    if(!playlist.owner){
        playlist.owner = userId
        await playlist.save()
    }

    if(playlist.owner.toString() !== userId.toString()){
        throw new ApiError(403, "You are not the owner of this playlist")
    }

    await Playlist.findByIdAndUpdate(playlistId, {$addToSet: {videos: videoId.toString()}}, {new: true}).exec()

    return res.status(200).json(new ApiResponse(200, null, "Video added to playlist successfully"))

})

const removeVideoFromPlaylist = asyncHandler(async (req, res) => {
    const {playlistId, videoId} = req.params
    // TODO: remove video from playlist
    const userId = req.user._id

    if(!isValidObjectId(userId)){
        throw new ApiError(400, "Invalid user id")
    }
    if(!isValidObjectId(playlistId)){
        throw new ApiError(400, "Invalid playlist id")
    }
    if(!isValidObjectId(videoId)){
        throw new ApiError(400, "Invalid video id")
    }

    const playlist = await Playlist.findById(playlistId.toString()).exec()

    if(!playlist){
        throw new ApiError(404, "Playlist not found")
    }

    if(playlist.owner.toString() !== userId.toString()){
        throw new ApiError(403, "You are not the owner of this playlist")
    }

    await Playlist.findByIdAndUpdate(playlistId, {$pull: {videos: videoId}}, {new: true}).exec()

    return res.status(200).json(new ApiResponse(200, null, "Video removed from playlist successfully"))
})

const deletePlaylist = asyncHandler(async (req, res) => {
    const {playlistId} = req.params
    // TODO: delete playlist
    const userId = req.user._id

    if(!isValidObjectId(userId)){
        throw new ApiError(400, "Invalid user id")
    }
    if(!isValidObjectId(playlistId)){
        throw new ApiError(400, "Invalid playlist id")
    }

    const playlist = await Playlist.findById(playlistId.toString()).exec()

    if(!playlist){
        throw new ApiError(404, "Playlist not found")
    }

    if(playlist.owner.toString() !== userId.toString()){
        throw new ApiError(403, "You are not the owner of this playlist")
    }

    await Playlist.findByIdAndDelete(playlistId).exec()

    return res.status(200).json(new ApiResponse(200, null, "Playlist deleted successfully"))
})

const updatePlaylist = asyncHandler(async (req, res) => {
    const {playlistId} = req.params
    const {name, description} = req.body
    //TODO: update playlist
    const userId = req.user._id

    if(!isValidObjectId(userId)){
        throw new ApiError(400, "Invalid user id")
    }
    if(!isValidObjectId(playlistId)){
        throw new ApiError(400, "Invalid playlist id")
    }
    if(!name || !description || name.trim() === "" || description.trim() === ""){
        throw new ApiError(400, "Name and description are required")
    }

    const playlist = await Playlist.findById(playlistId.toString()).exec()

    if(!playlist){
        throw new ApiError(404, "Playlist not found")
    }
    if(playlist.owner.toString() !== userId.toString()){
        throw new ApiError(403, "You are not the owner of this playlist")
    }

    await Playlist.findByIdAndUpdate(playlistId, {name: name.trim(), description: description.trim()}, {new: true}).exec()
    return res.status(200).json(new ApiResponse(200, null, "Playlist updated successfully"))
})

export {
    createPlaylist,
    getUserPlaylists,
    getPlaylistById,
    addVideoToPlaylist,
    removeVideoFromPlaylist,
    deletePlaylist,
    updatePlaylist
}
