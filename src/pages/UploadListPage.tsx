import { useCallback, useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { imageUrl, listImages, uploadImage } from '../api'
import type { ImageItem } from '../types'

const STATUS_LABEL: Record<string, string> = {
  pending: '예측 없음',
  predicted: 'AI 예측 완료',
  labeled: '라벨링 완료',
}

export default function UploadListPage() {
  const [images, setImages] = useState<ImageItem[]>([])
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const navigate = useNavigate()

  const refresh = useCallback(() => {
    listImages()
      .then(setImages)
      .catch((e) => setError(String(e)))
  }, [])

  useEffect(() => {
    refresh()
  }, [refresh])

  async function handleFiles(files: FileList | null) {
    if (!files || files.length === 0) return
    setUploading(true)
    setError(null)
    try {
      for (const file of Array.from(files)) {
        await uploadImage(file)
      }
      refresh()
    } catch (e) {
      setError(String(e))
    } finally {
      setUploading(false)
      if (fileInputRef.current) fileInputRef.current.value = ''
    }
  }

  return (
    <div className="page">
      <h1>불법 주정차 라벨링</h1>

      <div className="upload-box">
        <input
          ref={fileInputRef}
          type="file"
          accept="image/jpeg,image/png"
          multiple
          onChange={(e) => handleFiles(e.target.files)}
          disabled={uploading}
        />
        {uploading && <span>업로드 중... (첫 업로드는 AI 모델 로딩 때문에 다소 걸릴 수 있어요)</span>}
        {error && <p className="error">{error}</p>}
      </div>

      <div className="image-grid">
        {images.map((img) => (
          <button key={img.id} type="button" className="image-card" onClick={() => navigate(`/label/${img.id}`)}>
            <img src={imageUrl(img.filename)} alt={img.filename} />
            <div className="image-card-meta">
              <span className={`status-badge status-${img.status}`}>{STATUS_LABEL[img.status]}</span>
              <span>{img.predictions.length}개 예측</span>
            </div>
          </button>
        ))}
        {images.length === 0 && <p className="empty">업로드된 이미지가 없습니다. 사진을 올려보세요.</p>}
      </div>
    </div>
  )
}
