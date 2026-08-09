import { useEffect, useRef, useState } from 'react'

export interface CanvasBox {
  id: string
  x1: number
  y1: number
  x2: number
  y2: number
  label: string
  color: string
}

interface Props {
  imageSrc: string
  naturalWidth: number
  naturalHeight: number
  boxes: CanvasBox[]
  selectedId: string | null
  onSelect: (id: string) => void
  onDrawNew: (box: { x1: number; y1: number; x2: number; y2: number }) => void
}

const MAX_DISPLAY_WIDTH = 800

function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max)
}

export default function BBoxCanvas({
  imageSrc,
  naturalWidth,
  naturalHeight,
  boxes,
  selectedId,
  onSelect,
  onDrawNew,
}: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const imgRef = useRef<HTMLImageElement | null>(null)
  // 드래그 시작점은 ref로 동기 추적한다 - state만 쓰면 React 배칭/리렌더 타이밍에 따라
  // mouseup 핸들러가 최신 값을 못 읽는 경우가 생긴다 (빠른 드래그에서 실제로 발생).
  const dragStartRef = useRef<{ startX: number; startY: number } | null>(null)
  const [imgLoaded, setImgLoaded] = useState(false)
  const [drag, setDrag] = useState<{ startX: number; startY: number; x: number; y: number } | null>(null)

  const scale = naturalWidth > 0 ? Math.min(MAX_DISPLAY_WIDTH / naturalWidth, 1) : 1
  const displayWidth = naturalWidth * scale
  const displayHeight = naturalHeight * scale

  useEffect(() => {
    setImgLoaded(false)
    const img = new Image()
    img.onload = () => {
      imgRef.current = img
      setImgLoaded(true)
    }
    img.src = imageSrc
  }, [imageSrc])

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas || !imgLoaded || !imgRef.current) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    ctx.clearRect(0, 0, displayWidth, displayHeight)
    ctx.drawImage(imgRef.current, 0, 0, displayWidth, displayHeight)

    for (const box of boxes) {
      const isSelected = box.id === selectedId
      const x = box.x1 * scale
      const y = box.y1 * scale
      const w = (box.x2 - box.x1) * scale
      const h = (box.y2 - box.y1) * scale

      ctx.strokeStyle = isSelected ? '#ff3b30' : box.color
      ctx.lineWidth = isSelected ? 3 : 2
      ctx.strokeRect(x, y, w, h)

      ctx.font = '12px sans-serif'
      const textWidth = ctx.measureText(box.label).width
      ctx.fillStyle = isSelected ? '#ff3b30' : box.color
      ctx.fillRect(x, Math.max(0, y - 18), textWidth + 8, 18)
      ctx.fillStyle = '#fff'
      ctx.fillText(box.label, x + 4, Math.max(12, y - 5))
    }

    if (drag) {
      const x = Math.min(drag.startX, drag.x) * scale
      const y = Math.min(drag.startY, drag.y) * scale
      const w = Math.abs(drag.x - drag.startX) * scale
      const h = Math.abs(drag.y - drag.startY) * scale
      ctx.strokeStyle = '#34c759'
      ctx.setLineDash([6, 4])
      ctx.strokeRect(x, y, w, h)
      ctx.setLineDash([])
    }
  }, [imgLoaded, boxes, selectedId, drag, displayWidth, displayHeight, scale])

  // 캔버스는 CSS(max-width:100%)로 실제 렌더 크기가 줄어들 수 있어서 rect.width가 캔버스의
  // 내부 해상도(displayWidth)와 다르다. 여기서 바로 원본 이미지 좌표로 변환해 이 차이를 흡수한다.
  function toNaturalPos(clientX: number, clientY: number) {
    const rect = canvasRef.current!.getBoundingClientRect()
    const ratio = naturalWidth / rect.width
    return {
      x: clamp((clientX - rect.left) * ratio, 0, naturalWidth),
      y: clamp((clientY - rect.top) * ratio, 0, naturalHeight),
    }
  }

  function findBoxAt(x: number, y: number) {
    return boxes.find((box) => x >= box.x1 && x <= box.x2 && y >= box.y1 && y <= box.y2)
  }

  // 드래그 중에는 캔버스 밖으로 나가도(빠르게 움직이거나 경계 밖에서 놓아도) 계속 추적하도록
  // 캔버스 자체가 아니라 window에 mousemove/mouseup을 붙인다.
  useEffect(() => {
    function handleWindowMouseMove(e: MouseEvent) {
      if (!dragStartRef.current) return
      const pos = toNaturalPos(e.clientX, e.clientY)
      setDrag({ startX: dragStartRef.current.startX, startY: dragStartRef.current.startY, x: pos.x, y: pos.y })
    }

    function handleWindowMouseUp(e: MouseEvent) {
      const start = dragStartRef.current
      if (!start) return
      dragStartRef.current = null
      setDrag(null)
      const pos = toNaturalPos(e.clientX, e.clientY)
      const x1 = Math.min(start.startX, pos.x)
      const y1 = Math.min(start.startY, pos.y)
      const x2 = Math.max(start.startX, pos.x)
      const y2 = Math.max(start.startY, pos.y)
      if (x2 - x1 < 5 || y2 - y1 < 5) return
      onDrawNew({ x1, y1, x2, y2 })
    }

    window.addEventListener('mousemove', handleWindowMouseMove)
    window.addEventListener('mouseup', handleWindowMouseUp)
    return () => {
      window.removeEventListener('mousemove', handleWindowMouseMove)
      window.removeEventListener('mouseup', handleWindowMouseUp)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [naturalWidth, naturalHeight, onDrawNew])

  function handleMouseDown(e: React.MouseEvent<HTMLCanvasElement>) {
    const pos = toNaturalPos(e.clientX, e.clientY)
    const clicked = findBoxAt(pos.x, pos.y)
    if (clicked) {
      onSelect(clicked.id)
      return
    }
    dragStartRef.current = { startX: pos.x, startY: pos.y }
    setDrag({ startX: pos.x, startY: pos.y, x: pos.x, y: pos.y })
  }

  return (
    <canvas
      ref={canvasRef}
      width={displayWidth || 1}
      height={displayHeight || 1}
      className="bbox-canvas"
      onMouseDown={handleMouseDown}
    />
  )
}
