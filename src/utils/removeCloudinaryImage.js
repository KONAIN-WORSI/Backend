import {v2 as cloudinary} from "cloudinary"
import { asyncHandler } from "./asyncHandler.js";
import { ApiError } from "./ApiError.js";

// Extract public_id from Cloudinary URL
const extractPublicIdFromUrl = (cloudinaryUrl) => {
    if (!cloudinaryUrl) return null
    
    // URL format: https://res.cloudinary.com/{cloud_name}/image/upload/{version}/{public_id}.{format}
    const parts = cloudinaryUrl.split('/')
    const lastPart = parts[parts.length - 1] // Gets "publicId.format"
    const publicId = lastPart.split('.')[0] // Removes file extension
    
    return publicId
}

// Delete images from Cloudinary by URL
const removeImagesFromCloudinary = asyncHandler( async (cloudinaryUrl) => {
    try {
        if (!cloudinaryUrl) return null
        
        const publicId = extractPublicIdFromUrl(cloudinaryUrl)
        
        if (!publicId) {
            throw new ApiError(400, "Invalid Cloudinary URL")
        }
        
        const result = await cloudinary.uploader.destroy(publicId)
        return result
        
    } catch (error) {
        throw new ApiError(400, "Something went wrong while deleting the image from cloudinary")
    }
})


export { removeImagesFromCloudinary, extractPublicIdFromUrl }