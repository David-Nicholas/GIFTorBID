import { ref } from 'vue'

export function useUpload() {
  const imagePreviews = ref<string[]>([])
  const images = ref<string[]>([])

  function compressImage(base64Str: string, callback: (result: string) => void) {
    const img = new Image()
    img.src = base64Str
    img.onload = () => {
      const canvas = document.createElement('canvas')
      const ctx = canvas.getContext('2d')
      const maxWidth = 800
      const scaleSize = maxWidth / img.width
      canvas.width = maxWidth
      canvas.height = img.height * scaleSize
      ctx?.drawImage(img, 0, 0, canvas.width, canvas.height)
      callback(canvas.toDataURL('image/jpeg', 0.7))
    }
  }

  function handleImageUpload(event: Event) {
    const files = (event.target as HTMLInputElement).files
    if (!files || files.length > 3) {
      alert('You can upload up to 3 images only.')
      return
    }

    imagePreviews.value = []
    images.value = []

    Array.from(files).forEach(file => {
      const reader = new FileReader()
      reader.readAsDataURL(file)
      reader.onload = () => {
        if (reader.result) {
          compressImage(reader.result.toString(), (compressed) => {
            images.value.push(compressed)
            imagePreviews.value.push(compressed)
          })
        }
      }
    })
  }

  return {
    imagePreviews,
    images,
    handleImageUpload
  }
}
