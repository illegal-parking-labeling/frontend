import { useEffect, useState } from 'react'
import { Link, useOutletContext, useParams } from 'react-router-dom'
import BBoxCanvas, { type CanvasBox } from '../components/BBoxCanvas'
import { createLabel, deleteLabel, getImage, imageUrl, updateLabel } from '../api'
import type { AppContext } from '../App'
import type { ImageItem, LaneType, ParkingStatus, VehicleType } from '../types'

interface DraftLabel {
  id: string
  labelId: number | null
  predictionId: number | null
  x1: number
  y1: number
  x2: number
  y2: number
  vehicleType: VehicleType
  parkingStatus: ParkingStatus | ''
  laneType: LaneType
  aiClassName: VehicleType | null
  aiConfidence: number | null
  saved: boolean
}

const VEHICLE_OPTIONS: { value: VehicleType; label: string }[] = [
  { value: 'car', label: '승용차' },
  { value: 'truck', label: '트럭' },
  { value: 'motorcycle', label: '오토바이' },
]

const PARKING_OPTIONS: { value: ParkingStatus; label: string }[] = [
  { value: 'normal', label: '정상' },
  { value: 'illegal', label: '불법' },
]

const LANE_OPTIONS: { value: LaneType; label: string }[] = [
  { value: 'sidewalk', label: '인도' },
  { value: 'crosswalk', label: '횡단보도' },
  { value: 'bus_only', label: '버스전용' },
  { value: 'none', label: '해당없음' },
]

export default function LabelPage() {
  const { imageId } = useParams()
  const { labelerName } = useOutletContext<AppContext>()
  const [image, setImage] = useState<ImageItem | null>(null)
  const [drafts, setDrafts] = useState<DraftLabel[]>([])
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!imageId) return
    getImage(imageId).then((img) => {
      setImage(img)
      setDrafts(
        img.predictions.map((p) => ({
          id: `pred-${p.id}`,
          labelId: null,
          predictionId: p.id,
          x1: p.x1,
          y1: p.y1,
          x2: p.x2,
          y2: p.y2,
          vehicleType: p.class_name,
          parkingStatus: '',
          laneType: 'none',
          aiClassName: p.class_name,
          aiConfidence: p.confidence,
          saved: false,
        })),
      )
    })
  }, [imageId])

  function updateDraft(id: string, patch: Partial<DraftLabel>) {
    setDrafts((prev) => prev.map((d) => (d.id === id ? { ...d, ...patch, saved: false } : d)))
  }

  function removeDraft(id: string) {
    setDrafts((prev) => prev.filter((d) => d.id !== id))
    if (selectedId === id) setSelectedId(null)
  }

  function handleDrawNew(box: { x1: number; y1: number; x2: number; y2: number }) {
    const id = `manual-${crypto.randomUUID()}`
    const draft: DraftLabel = {
      id,
      labelId: null,
      predictionId: null,
      ...box,
      vehicleType: 'car',
      parkingStatus: '',
      laneType: 'none',
      aiClassName: null,
      aiConfidence: null,
      saved: false,
    }
    setDrafts((prev) => [...prev, draft])
    setSelectedId(id)
  }

  async function handleSave(draft: DraftLabel) {
    if (!image) return
    if (!labelerName.trim()) {
      setError('상단에 라벨러 이름을 먼저 입력해주세요.')
      return
    }
    if (!draft.parkingStatus) {
      setError('주차 상태를 선택해주세요.')
      return
    }
    setError(null)
    const payload = {
      prediction_id: draft.predictionId,
      labeler_name: labelerName.trim(),
      x1: draft.x1,
      y1: draft.y1,
      x2: draft.x2,
      y2: draft.y2,
      vehicle_type: draft.vehicleType,
      parking_status: draft.parkingStatus,
      lane_type: draft.laneType,
      matched_ai: draft.predictionId !== null && draft.vehicleType === draft.aiClassName,
    }
    try {
      if (draft.labelId != null) {
        await updateLabel(image.id, draft.labelId, payload)
        setDrafts((prev) => prev.map((d) => (d.id === draft.id ? { ...d, saved: true } : d)))
      } else {
        const created = await createLabel(image.id, payload)
        setDrafts((prev) => prev.map((d) => (d.id === draft.id ? { ...d, saved: true, labelId: created.id } : d)))
      }
    } catch (e) {
      setError(String(e))
    }
  }

  async function handleDelete(draft: DraftLabel) {
    if (!image) return
    setError(null)
    try {
      if (draft.labelId != null) {
        await deleteLabel(image.id, draft.labelId)
      }
      removeDraft(draft.id)
    } catch (e) {
      setError(String(e))
    }
  }

  if (!image) {
    return (
      <div className="page">
        <p>불러오는 중...</p>
      </div>
    )
  }

  const canvasBoxes: CanvasBox[] = drafts.map((d) => ({
    id: d.id,
    x1: d.x1,
    y1: d.y1,
    x2: d.x2,
    y2: d.y2,
    label: `${VEHICLE_OPTIONS.find((o) => o.value === d.vehicleType)?.label ?? d.vehicleType}${
      d.aiConfidence != null ? ` ${(d.aiConfidence * 100).toFixed(0)}%` : ' (직접 추가)'
    }${d.saved ? ' ✓' : ''}`,
    color: d.saved ? '#34c759' : d.aiClassName ? '#ff9500' : '#007aff',
  }))

  return (
    <div className="page label-page">
      <div className="label-page-header">
        <Link to="/">&larr; 목록으로</Link>
        <h1>{image.filename}</h1>
      </div>

      {error && <p className="error">{error}</p>}

      <div className="label-page-body">
        <div className="canvas-panel">
          <BBoxCanvas
            imageSrc={imageUrl(image.filename)}
            naturalWidth={image.width}
            naturalHeight={image.height}
            boxes={canvasBoxes}
            selectedId={selectedId}
            onSelect={setSelectedId}
            onDrawNew={handleDrawNew}
          />
          <p className="hint">빈 공간을 드래그하면 새 박스를 추가할 수 있어요. AI가 놓친 차량이 있으면 직접 그려주세요.</p>
        </div>

        <div className="draft-list">
          {drafts.length === 0 && <p className="empty">AI가 감지한 차량이 없습니다. 캔버스에서 직접 박스를 그려주세요.</p>}
          {drafts.map((draft) => (
            <div
              key={draft.id}
              className={`draft-card ${selectedId === draft.id ? 'selected' : ''} ${draft.saved ? 'saved' : ''}`}
              onClick={() => setSelectedId(draft.id)}
            >
              {draft.aiClassName ? (
                <p className="ai-tag">
                  AI 예측: {VEHICLE_OPTIONS.find((o) => o.value === draft.aiClassName)?.label} (
                  {((draft.aiConfidence ?? 0) * 100).toFixed(0)}%)
                </p>
              ) : (
                <p className="ai-tag manual">직접 추가한 박스</p>
              )}

              <fieldset>
                <legend>차종</legend>
                {VEHICLE_OPTIONS.map((opt) => (
                  <label key={opt.value}>
                    <input
                      type="radio"
                      name={`vehicle-${draft.id}`}
                      checked={draft.vehicleType === opt.value}
                      onChange={() => updateDraft(draft.id, { vehicleType: opt.value })}
                    />
                    {opt.label}
                  </label>
                ))}
              </fieldset>

              <fieldset>
                <legend>주차 상태</legend>
                {PARKING_OPTIONS.map((opt) => (
                  <label key={opt.value}>
                    <input
                      type="radio"
                      name={`parking-${draft.id}`}
                      checked={draft.parkingStatus === opt.value}
                      onChange={() => updateDraft(draft.id, { parkingStatus: opt.value })}
                    />
                    {opt.label}
                  </label>
                ))}
              </fieldset>

              <fieldset>
                <legend>차선</legend>
                {LANE_OPTIONS.map((opt) => (
                  <label key={opt.value}>
                    <input
                      type="radio"
                      name={`lane-${draft.id}`}
                      checked={draft.laneType === opt.value}
                      onChange={() => updateDraft(draft.id, { laneType: opt.value })}
                    />
                    {opt.label}
                  </label>
                ))}
              </fieldset>

              <div className="draft-actions">
                <button type="button" onClick={() => handleSave(draft)} disabled={draft.saved}>
                  {draft.saved ? '저장됨' : draft.labelId != null ? '수정 저장' : '이 라벨 저장'}
                </button>
                <button type="button" className="ghost" onClick={() => handleDelete(draft)}>
                  삭제
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
