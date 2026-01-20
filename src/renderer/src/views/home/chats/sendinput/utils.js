export function getVideoCoverFile(file, seekTime = 0.1) {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file)

    const video = document.createElement('video')
    video.src = url
    video.muted = true
    video.playsInline = true
    video.crossOrigin = 'anonymous'

    video.onloadedmetadata = () => {
      const t = Math.min(seekTime, video.duration || seekTime)
      video.currentTime = t
    }

    video.onseeked = async () => {
      try {
        const canvas = document.createElement('canvas')
        canvas.width = video.videoWidth
        canvas.height = video.videoHeight

        const ctx = canvas.getContext('2d')
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height)

        // ✅ 关键：canvas -> blob -> File
        canvas.toBlob(
          (blob) => {
            if (!blob) {
              URL.revokeObjectURL(url)
              return reject(new Error('canvas toBlob failed'))
            }

            const coverFile = new File([blob], 'cover.jpg', {
              type: 'image/jpeg'
            })

            URL.revokeObjectURL(url)
            resolve(coverFile)
          },
          'image/jpeg',
          0.9
        )
      } catch (err) {
        URL.revokeObjectURL(url)
        reject(err)
      }
    }

    video.onerror = (e) => {
      URL.revokeObjectURL(url)
      reject(e)
    }
  })
}
export const getImageSize = (file) => {
  return new Promise((resolve, reject) => {
    const img = new Image()
    const url = URL.createObjectURL(file)

    img.onload = () => {
      resolve({
        width: img.naturalWidth,
        height: img.naturalHeight
      })
      URL.revokeObjectURL(url)
    }

    img.onerror = reject
    img.src = url
  })
}
