/**
 * Utility untuk memproses dan mengompres file gambar (PNG, JPG, JPEG, WEBP)
 * Membaca file dan mengoptimalkan resolusinya (maksimal 1000px)
 * agar hemat memori di LocalStorage & Supabase, serta kompatibel 100% offline.
 */
export const processImageFile = (
  file,
  maxWidth = 1000,
  maxHeight = 1000,
  quality = 0.85,
) => {
  return new Promise((resolve, reject) => {
    if (!file) {
      return reject(new Error('File gambar tidak ditemukan.'))
    }

    const validTypes = ['image/png', 'image/jpeg', 'image/jpg', 'image/webp']
    if (!validTypes.includes(file.type.toLowerCase())) {
      return reject(
        new Error('Format file tidak didukung. Harap unggah file PNG, JPG, atau WEBP.'),
      )
    }

    // Batas ukuran maksimal file mentah: 10MB
    if (file.size > 10 * 1024 * 1024) {
      return reject(new Error('Ukuran file terlalu besar. Maksimal 10MB.'))
    }

    const reader = new FileReader()
    reader.onerror = () => reject(new Error('Gagal membaca file gambar.'))
    reader.onload = (event) => {
      const img = new Image()
      img.onerror = () => reject(new Error('Gagal memuat format gambar untuk diproses.'))
      img.onload = () => {
        let width = img.width
        let height = img.height

        // Skala proporsional
        if (width > maxWidth || height > maxHeight) {
          if (width > height) {
            height = Math.round((height * maxWidth) / width)
            width = maxWidth
          } else {
            width = Math.round((width * maxHeight) / height)
            height = maxHeight
          }
        }

        const canvas = document.createElement('canvas')
        canvas.width = width
        canvas.height = height

        const ctx = canvas.getContext('2d')
        ctx.drawImage(img, 0, 0, width, height)

        // Gunakan format aslinya atau JPEG berkualitas tinggi
        const outputType = file.type === 'image/png' ? 'image/png' : 'image/jpeg'
        const dataUrl = canvas.toDataURL(outputType, quality)

        resolve({
          dataUrl,
          name: file.name,
          size: Math.round(dataUrl.length * 0.75),
          type: outputType,
          width,
          height,
        })
      }
      img.src = event.target.result
    }

    reader.readAsDataURL(file)
  })
}

