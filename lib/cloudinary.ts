
export async function uploadToCloudinary(
  base64Data: string,
  filterType: 'bw' | 'color'
): Promise<string | null> {
  const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME
  const uploadPreset = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET

  if (!cloudName || !uploadPreset) {
    console.error('Cloudinary env vars missing')
    return null
  }

  const formData = new FormData()
  formData.append('file', base64Data)
  formData.append('upload_preset', uploadPreset)
  formData.append('folder', 'doodlebooth')
  formData.append('tags', `photobooth,${filterType}`)

  try {
    const response = await fetch(
      `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
      {
        method: 'POST',
        body: formData,
      }
    )
    const data = await response.json()

    if (data.secure_url) {
      return data.secure_url
    } else {
      console.error('Cloudinary upload failed:', data)
      return null
    }
  } catch (err) {
    console.error('Cloudinary network error:', err)
    return null
  }
}
