const { Image } = require("../models");
const storageService = require("../services/storageService");

exports.uploadImage = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "Image required" });
    }

    const uploadResult = await storageService.uploadImage(
      req.file.buffer,
      "originals",
    );

    const image = await Image.create({
      userId: req.user.id,
      originalUrl: uploadResult.url,
      originalPublicId: uploadResult.publicId,
      status: "uploaded",
    });

    res.status(201).json({
      success: true,
      data: {
        imageId: image.id,
        originalUrl: image.originalUrl,
        status: image.status,
      },
    });
  } catch (error) {
    console.error("Upload error:", error);
    res.status(500).json({ error: "Upload failed" });
  }
};

exports.listImages = async (req, res) => {
  try {
    const images = await Image.findAll({
      where: { userId: req.user.id },
      order: [["createdAt", "DESC"]],
      limit: 50,
    });

    res.json({
      success: true,
      data: images,
    });
  } catch (error) {
    res.status(500).json({ error: "List cant fetch" });
  }
};

exports.processImage = async (req, res) => {
  try {
    const { imageId } = req.params;
    const { style, aspectRatio } = req.body;

    const validStyles = [
      "minimalist_white",
      "lifestyle",
      "premium_dark",
      "pastel",
      "natural_wood",
      "studio_pro",
    ];
    const validRatios = ["1:1", "9:16", "16:9", "4:5"];

    if (!style || !validStyles.includes(style)) {
      return res.status(400).json({ error: "Select valid style" });
    }

    if (!aspectRatio || !validRatios.includes(aspectRatio)) {
      return res.status(400).json({ error: "Select valid size" });
    }

    const image = await Image.findOne({
      where: {
        id: imageId,
        userId: req.user.id,
      },
    });

    if (!image) {
      return res.status(404).json({ error: "Image not found" });
    }

    if (image.status === "processing") {
      return res.status(400).json({
        error: "Image already processing..",
        imageId: image.id,
        status: image.status,
      });
    }

    if (image.status === "completed") {
      return res.status(400).json({
        error: "Image already processed",
        processedUrl: image.processedUrl,
      });
    }

    await image.update({
      style,
      aspectRatio,
      status: "processing",
    });

    processImageAsync(image.id, req.user.id);

    res.json({
      success: true,
      message: "Process started",
      data: {
        imageId: image.id,
        status: "processing",
        style: image.style,
        aspectRatio: image.aspectRatio,
      },
    });
  } catch (error) {
    console.error("Process error:", error);
    res.status(500).json({ error: "Process failed to start" });
  }
};

async function processImageAsync(imageId, userId) {
  const { Image, User } = require("../models");
  const aiService = require("../services/aiService");
  const storageService = require("../services/storageService");
  const startTime = Date.now();

  try {
    console.log(`Process started: ${imageId}`);

    const image = await Image.findByPk(imageId);

    const prediction = await aiService.createPrediction(
      image.originalUrl,
      image.style,
      image.aspectRatio,
    );

    const outputUrl = await aiService.waitForCompletion(prediction.id);

    const processedImageBuffer = await aiService.downloadImage(
      Array.isArray(outputUrl) ? outputUrl[0] : outputUrl
    );

    const uploadResult = await storageService.uploadImage(
      processedImageBuffer,
      'processed'
    );

    await image.update({
      processedUrl: uploadResult.url,
      processedPublicId: uploadResult.publicId,
      status: "completed",
      processingTime: Date.now() - startTime,
    });

    await User.increment("dailyUsed", {
      by: 1,
      where: { id: userId },
    });

    console.log(`✅ Process completed: ${imageId} (${Date.now() - startTime}ms)`);
  } catch (error) {
    console.error(`Process failed: ${imageId}`, error);

    await Image.update(
      {
        status: "failed",
        errorMessage: error.message,
      },
      { where: { id: imageId } },
    );
  }
}

exports.getImageStatus = async (req, res) => {
  try {
    const { imageId } = req.params;
    const image = await Image.findOne({
      where: {
        id: imageId,
        userId: req.user.id,
      },
      attributes: [
        "id",
        "status",
        "originalUrl",
        "processedUrl",
        "style",
        "aspectRatio",
        "processingTime",
        "errorMessage",
        "createdAt",
      ],
    });

    if (!image) {
      return res.status(404).json({ error: "Image not found" });
    }

    res.json({
      success: true,
      data: image,
    });
  } catch (error) {
    res.status(500).json({ error: "Could not get status" });
  }
};

exports.deleteImage = async (req, res) => {
  try {
    const { imageId } = req.params;

    const image = await Image.findOne({
      where: {
        id: imageId,
        userId: req.user.id,
      },
    });

    if (!image) {
      return res.status(404).json({ error: "Image not found" });
    }

    // Cloudinary'den sil (varsa)
    const storageService = require("../services/storageService");
    if (image.originalPublicId) {
      await storageService.deleteImage(image.originalPublicId);
    }
    if (image.processedPublicId) {
      await storageService.deleteImage(image.processedPublicId);
    }

    // Database'den sil
    await image.destroy();

    res.json({
      success: true,
      message: "Image deleted",
    });
  } catch (error) {
    console.error("Delete error:", error);
    res.status(500).json({ error: "Deletion failed" });
  }
};
