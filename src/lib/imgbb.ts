export const uploadImageToImgBB = async (file: File): Promise<string> => {
  const formData = new FormData();
  formData.append('image', file);

  const apiKey = process.env.NEXT_PUBLIC_IMGBB_API_KEY;
  if (!apiKey) {
    throw new Error('ImgBB API Key is not configured.');
  }

  try {
    const response = await fetch(`https://api.imgbb.com/1/upload?key=${apiKey}`, {
      method: 'POST',
      body: formData,
    });

    const data = await response.json();
    if (data.success) {
      return data.data.url;
    } else {
      throw new Error(data.error?.message || 'Failed to upload image to ImgBB');
    }
  } catch (error) {
    console.error('Error uploading image:', error);
    throw error;
  }
};
