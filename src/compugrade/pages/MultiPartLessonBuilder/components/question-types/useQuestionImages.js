import { useState, useEffect } from 'react'

export function useQuestionImages(question) {
  const [questionImages, setQuestionImages] = useState(() => {
    if (Array.isArray(question.image_url) && question.image_url.length > 0) {
      return question.image_url
        .map((url, idx) => {
          const name = Array.isArray(question.image_name)
            ? question.image_name[idx]
            : question.image_name

          if (!name || name.trim() === '') return null

          return {
            url,
            name,
            fileName: name
          }
        })
        .filter(Boolean)
    }

    if (
      question.image_url &&
      typeof question.image_url === 'string' &&
      !question.image_url.startsWith('blob:') &&
      question.image_name &&
      question.image_name.trim() !== ''
    ) {
      return [{
        url: question.image_url,
        name: question.image_name,
        fileName: question.image_name
      }]
    }

    return []
  })

  useEffect(() => {
    if (Array.isArray(question.image_url)) {
      const images = question.image_url
        .map((url, idx) => {
          const name = Array.isArray(question.image_name)
            ? question.image_name[idx]
            : question.image_name

          if (!name || name.trim() === '') return null

          return {
            url,
            name,
            fileName: name
          }
        })
        .filter(Boolean)

      setQuestionImages(images)
    } else if (
      question.image_url &&
      typeof question.image_url === 'string' &&
      !question.image_url.startsWith('blob:') &&
      question.image_name &&
      question.image_name.trim() !== ''
    ) {
      setQuestionImages([{
        url: question.image_url,
        name: question.image_name,
        fileName: question.image_name
      }])
    } else {
      setQuestionImages([])
    }
  }, [question.image_url, question.image_name])

  const handleQuestionImageSelect = (file, record, onQuestionChange) => {
    setQuestionImages((currentImages) => {
      const url = record?.url || URL.createObjectURL(file)

      const newImage = {
        url,
        name: file.name,
        fileName: file.name,
        file
      }

      const updatedImages = [...currentImages, newImage]

      const imageUrls = updatedImages.map(img => img.url)
      const imageNames = updatedImages.map(img => img.name)

      onQuestionChange({
        ...question,
        image_url: imageUrls,
        image_name: imageNames
      })

      return updatedImages
    })
  }

  const handleQuestionImageRemoveAt = (index, onQuestionChange) => {
    setQuestionImages((currentImages) => {
      const imageToRemove = currentImages[index]

      if (imageToRemove?.url?.startsWith('blob:')) {
        URL.revokeObjectURL(imageToRemove.url)
      }

      const updatedImages = currentImages.filter((_, i) => i !== index)

      onQuestionChange({
        ...question,
        image_url: updatedImages.map(img => img.url),
        image_name: updatedImages.map(img => img.name)
      })

      return updatedImages
    })
  }

  return {
    questionImages,
    handleQuestionImageSelect,
    handleQuestionImageRemoveAt
  }
}
