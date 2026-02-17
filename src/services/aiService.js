const axios = require("axios");

class AIService {
  constructor() {
    this.apiKey = process.env.NANOBANANA_API_KEY;
    this.apiUrl = process.env.NANOBANANA_API_URL;
  }

  getStylePrompt(style) {
    const prompts = {
      minimalist_white:
        "professional product photography, clean white background, studio lighting, high quality, sharp focus, commercial photography",
      lifestyle:
        "lifestyle product photography, natural setting, soft natural light, modern interior, casual atmosphere, realistic scene",
      premium_dark:
        "luxury product photography, dark elegant background, dramatic lighting, premium feel, sophisticated, high-end commercial",
      pastel:
        "product photography, soft pastel background, gentle lighting, aesthetic composition, dreamy atmosphere, soft colors",
      natural_wood:
        "product photography, natural wood texture background, warm organic lighting, rustic aesthetic, natural materials",
      studio_pro:
        "professional studio photography, gradient background, studio lights, commercial quality, perfect lighting, seamless backdrop",
    };
    return prompts[style] || prompts.minimalist_white;
  }

  getDimensions(aspectRatio) {
    const dimension = {
      "1:1": { width: 1024, height: 1024 },
      "9:16": { width: 576, height: 1024 },
      "16:9": { width: 1024, height: 576 },
      "4:5": { width: 820, height: 1024 },
    };
    return dimension[aspectRatio] || dimension["1:1"];
  }

  async createPrediction(imageUrl, style, aspectRatio) {
    try {
      const prompt = this.getStylePrompt(style);
      const dimension = this.getDimensions(aspectRatio);

      console.log("Sending Nanobanana request");

      const response = await axios.post(
        this.apiUrl,
        { // NanoBanana'nın model versiyonu
          input: {
            image: imageUrl,
            prompt: prompt,
            width: dimension.width,
            height: dimension.height,
            num_inference_steps: 30,
            guidance_scale: 7.5,
            negative_prompt:
              "blurry, low quality, distorted, ugly, bad composition",
          },
        },
        {
          headers: {
            Authorization: `Bearer ${this.apiKey}`,
            "Content-Type": "application/json",
          },
        },
      );
      console.log("Prediction created:", response.data.id || response.data.uuid);
      return response.data;
    } catch (error) {
      console.error(
        "Nanobanana request error:",
        error.response?.data || error.message,
      );
      throw new Error(
        "AI işleme başlatılamadı: " +
          (error.response?.data?.detail || error.message),
      );
    }
  }

  async getPrediction(predictionId) {
    try {
      const response = await axios.get(
        `${this.apiUrl}${predictionId}`,
        {
          headers: {
            Authorization: `Bearer ${this.apiKey}`,
          },
        },
      );

      return response.data;
    } catch (error) {
      console.error(
        "Get prediction error:",
        error.response?.data || error.message,
      );
      throw new Error("Status could not be queried");
    }
  }

  async waitForCompletion(predictionId, maxAttempts = 60) {
    let attempts = 0;

    while (attempts < maxAttempts) {
      const prediction = await this.getPrediction(predictionId);

      console.log(
        `Status: ${prediction.status} (${attempts + 1}/${maxAttempts})`,
      );

      if (prediction.status === "succeeded") {
        console.log("Process completed");
        return prediction.output;
      }

      if (prediction.status === "failed" || prediction.status === "canceled") {
        throw new Error(
          "AI işleme başarısız: " + (prediction.error || "Unknown error"),
        );
      }

      // 3 saniye bekle
      await new Promise((resolve) => setTimeout(resolve, 3000));
      attempts++;
    }

    throw new Error("İşleme zaman aşımı (60 saniye)");
  }

  // URL'den fotoğrafı indir (buffer olarak)
  async downloadImage(url) {
    try {
      const response = await axios.get(url, {
        responseType: "arraybuffer",
      });
      return Buffer.from(response.data);
    } catch (error) {
      throw new Error("Fotoğraf indirilemedi: " + error.message);
    }
  }
}

module.exports = new AIService();