import { useState, useEffect } from 'react'

export function useQuestionImages(question) {
  // Initialize question images array from question.image_url (array or string) or question.image_urls (backward compat)
  const [questionImages, setQuestionImages] = useState(() => {
    // Check for image_urls first (backward compatibility)
    // if (Array.isArray(question.image_urls) && question.image_urls.length > 0) {
    //   return question.image_urls.map((url, idx) => ({
    //     url: url,
    //     name: question.image_names?.[idx] || `image-${idx + 1}`,
    //     fileName: question.image_names?.[idx] || `image-${idx + 1}`
    //   }))
    // }
    // Check for image_url as array
    if (Array.isArray(question.image_url) && question.image_url.length > 0) {
      return question.image_url.map((url, idx) => ({
        url: url,
        name: (Array.isArray(question.image_name) ? question.image_name[idx] : question.image_name) || `image-${idx + 1}`,
        fileName: (Array.isArray(question.image_name) ? question.image_name[idx] : question.image_name) || `image-${idx + 1}`
      }))
    }
    // Check for image_url as string
    if (question.image_url && typeof question.image_url === 'string' && !question.image_url.startsWith('blob:')) {
      return [{
        url: question.image_url,
        name: question.image_name || 'image',
        fileName: question.image_name || 'image'
      }]
    }
    return []
  })

  // Sync questionImages when question prop changes
  useEffect(() => {
    // Check for image_url as array (including empty array)
    if (Array.isArray(question.image_url)) {
      if (question.image_url.length > 0) {
        const images = question.image_url.map((url, idx) => ({
          url: url,
          name: (Array.isArray(question.image_name) ? question.image_name[idx] : question.image_name) || `image-${idx + 1}`,
          fileName: (Array.isArray(question.image_name) ? question.image_name[idx] : question.image_name) || `image-${idx + 1}`
        }))
        setQuestionImages(images)
      } else {
        // Empty array - clear images
        setQuestionImages([])
      }
    }
    // Check for image_url as string
    else if (question.image_url && typeof question.image_url === 'string' && !question.image_url.startsWith('blob:')) {
      setQuestionImages([{
        url: question.image_url,
        name: question.image_name || 'image',
        fileName: question.image_name || 'image'
      }])
    } 
    // No image_url at all
    else if (!question.image_url) {
      setQuestionImages([])
    }
  }, [question.image_url, question.image_urls, question.image_names, question.image_name])

  const handleQuestionImageSelect = (file, record, onQuestionChange) => {
    // Use the blob URL from images context (record.url) to ensure it matches what's stored in the context
    // This is critical for matching images correctly when converting to base64
    const url = record?.url || URL.createObjectURL(file)
    const newImage = {
      url: url,
      name: file.name,
      fileName: file.name,
      file: file
    }
    const updatedImages = [...questionImages, newImage]
    setQuestionImages(updatedImages)
    
    // Update question with image_url and image_name as arrays (consistent variable names)
    const imageUrls = updatedImages.map(img => img.url)
    const imageNames = updatedImages.map(img => img.name)
    onQuestionChange({ 
      ...question, 
      // Use image_url and image_name as arrays (same variable names for both array and string)
      image_url: imageUrls,
      image_name: imageNames,
      // Keep backward compatibility fields
      image_urls: imageUrls,
      image_names: imageNames
    })
  }
  
  const handleQuestionImageRemoveAt = (index, onQuestionChange) => {
    setQuestionImages((currentImages) => {
      // Revoke blob URL if it's a blob URL to prevent memory leaks
      const imageToRemove = currentImages[index]
      if (imageToRemove?.url && imageToRemove.url.startsWith('blob:')) {
        URL.revokeObjectURL(imageToRemove.url)
      }
      
      const updatedImages = currentImages.filter((_, i) => i !== index)
      
      const imageUrls = updatedImages.map(img => img.url)
      const imageNames = updatedImages.map(img => img.name)
      
      // Update question immediately
      onQuestionChange({ 
        ...question, 
        // Use image_url and image_name as arrays (same variable names for both array and string)
        image_url: imageUrls,
        image_name: imageNames,
        // Keep backward compatibility fields
        image_urls: imageUrls,
        image_names: imageNames
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
