export const uploadImageToImgBB = async (file: File | Blob): Promise<string> => {
  const imgbbApiKey = process.env.NEXT_PUBLIC_IMGBB_API_KEY || '5750d8e64e0b691f245a402c24f73944';
  const cloudinaryCloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
  const cloudinaryUploadPreset = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET;

  try {
    // 1. Try uploading to Cloudinary First (Primary Strategy for Speed and Reliability)
    if (cloudinaryCloudName && cloudinaryUploadPreset) {
      try {
        console.log("Attempting upload to Cloudinary (Primary)...");
        const cloudinaryFormData = new FormData();
        
        // Cloudinary accepts binary files directly, which is faster and cleaner
        cloudinaryFormData.append('file', file);
        cloudinaryFormData.append('upload_preset', cloudinaryUploadPreset);

        const cloudinaryResponse = await fetch(`https://api.cloudinary.com/v1_1/${cloudinaryCloudName}/image/upload`, {
          method: 'POST',
          body: cloudinaryFormData,
        });

        const cloudinaryData = await cloudinaryResponse.json();
        
        if (cloudinaryResponse.ok && cloudinaryData.secure_url) {
          return cloudinaryData.secure_url;
        }
        
        console.warn("Cloudinary upload failed, falling back to ImgBB...", cloudinaryData);
      } catch (cloudinaryError) {
        console.warn("Cloudinary network error, falling back to ImgBB...", cloudinaryError);
      }
    }

    // 2. Fallback to ImgBB (if Cloudinary fails or is not configured)
    console.log("Attempting Fallback upload to ImgBB...");
    const base64Clean = await new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        const result = reader.result as string;
        const clean = result.split(',')[1] || result;
        resolve(clean);
      };
      reader.onerror = (err) => reject(err);
      reader.readAsDataURL(file);
    });

    const formData = new FormData();
    formData.append('image', base64Clean);

    const response = await fetch(`https://api.imgbb.com/1/upload?key=${imgbbApiKey}`, {
      method: 'POST',
      body: formData,
    });

    const data = await response.json();
    if (data.success && data.data?.url) {
      return data.data.url;
    }
    
    throw new Error(data.error?.message || 'Both Cloudinary and ImgBB uploads failed.');
  } catch (error) {
    console.error('Error uploading image:', error);
    throw error;
  }
};
