import React, { createContext, useContext } from 'react'

export const ImagesContext = createContext({ addImage: () => null, addImageWithScope: () => null })

export function ImagesProvider({ children, images, setImages, nextImageId, setNextImageId }) {
  const allocateId = () => {
    const id = nextImageId
    setNextImageId(id + 1)
    return id
  }

  const addImage = (file) => {
    if (!file) return null
    const id = allocateId()
    const url = URL.createObjectURL(file)
    const record = { id, file, url, name: file.name }
    setImages((prev) => [...prev, record])
    return record
  }

  // config: { file: File, questionId: string, kind: 'question'|'option'|'answer'|'item'|'blank'|'pair-term'|'pair-definition'|'category', refId?: string, role?: string }
  const addImageWithScope = (config) => {
    if (!config || !config.file || !config.questionId) return null
    const { file, questionId, kind, refId, role } = config
    const id = allocateId()
    const url = URL.createObjectURL(file)
    const node = { id, file, url, name: file.name, refId: refId || null, role: role || null, kind }

    setImages((prev) => {
      let found = false
      const updated = prev.map((q) => {
        if (q && q.questionId === questionId) {
          found = true
          const bucket = ensureBuckets(q)
          pushIntoBucket(bucket, kind, node)
          return { ...bucket }
        }
        return q
      })
      if (!found) {
        const base = createEmptyQuestionBucket(questionId)
        pushIntoBucket(base, kind, node)
        return [...prev, base]
      }
      return updated
    })

    return node
  }

  const createEmptyQuestionBucket = (questionId) => ({
    questionId,
    question: [],
    options: [],
    items: [],
    blanks: [],
    pairs: [],
    categories: [],
  })

  const ensureBuckets = (bucket) => ({
    questionId: bucket.questionId,
    question: bucket.question || [],
    options: bucket.options || [],
    items: bucket.items || [],
    blanks: bucket.blanks || [],
    pairs: bucket.pairs || [],
    categories: bucket.categories || [],
  })

  const pushIntoBucket = (bucket, kind, node) => {
    if (kind === 'question') {
      bucket.question.push(node)
    } else if (kind === 'option' || kind === 'answer' || kind === 'blank' || kind === 'item' || kind =='pair-term' || kind === 'pair-definition' || kind === 'category') {
      bucket.options.push(node)
    }
    // } else if (kind === 'item') {
    //   bucket.items.push(node)
    // } else if (kind === 'pair-term' || kind === 'pair-definition') {
    //   bucket.pairs.push(node)
    // } else if (kind === 'category') {
    //   bucket.categories.push(node)
    // } else {
    //   bucket.question.push(node)
    // }
  }

  return (
    <ImagesContext.Provider value={{ addImage, addImageWithScope }}>
      {children}
    </ImagesContext.Provider>
  )
}

export function useImages() {
  return useContext(ImagesContext)
}


