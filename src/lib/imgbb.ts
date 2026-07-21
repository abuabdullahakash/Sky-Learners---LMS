export const uploadImageToImgBB = async (file: File | Blob): Promise<string> => {
  const apiKey = process.env.NEXT_PUBLIC_IMGBB_API_KEY || '5750d8e64e0b691f245a402c24f73944';

  try {
    // 1. Convert File/Blob to Base64 string (ImgBB API native & 100% reliable for clipboard screenshots)
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

    const response = await fetch(`https://api.imgbb.com/1/upload?key=${apiKey}`, {
      method: 'POST',
      body: formData,
    });

    const data = await response.json();
    if (data.success && data.data?.url) {
      return data.data.url;
    }

    // 2. Fallback to direct binary FormData upload with explicit filename if base64 attempt responded with error
    const fallbackData = new FormData();
    fallbackData.append('image', file, (file as File).name || 'screenshot.png');

    const fallbackRes = await fetch(`https://api.imgbb.com/1/upload?key=${apiKey}`, {
      method: 'POST',
      body: fallbackData,
    });

    const fallbackDataJson = await fallbackRes.json();
    if (fallbackDataJson.success && fallbackDataJson.data?.url) {
      return fallbackDataJson.data.url;
    }

    throw new Error(data.error?.message || fallbackDataJson.error?.message || 'Failed to upload image to ImgBB');
  } catch (error) {
    console.error('Error uploading image to ImgBB:', error);
    throw error;
  }
};
