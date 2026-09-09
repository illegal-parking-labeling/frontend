export type ImageStatus = 'pending' | 'predicted' | 'labeled'
export type VehicleType = 'car' | 'truck' | 'motorcycle'
export type ParkingStatus = 'normal' | 'illegal'
export type LaneType = 'sidewalk' | 'crosswalk' | 'bus_only' | 'none'

export interface Prediction {
  id: number
  class_name: VehicleType
  confidence: number
  x1: number
  y1: number
  x2: number
  y2: number
}

export interface ImageItem {
  id: number
  filename: string
  width: number
  height: number
  status: ImageStatus
  uploaded_at: string
  predictions: Prediction[]
}

export interface LabelPayload {
  prediction_id: number | null
  labeler_name: string
  x1: number
  y1: number
  x2: number
  y2: number
  vehicle_type: VehicleType
  parking_status: ParkingStatus
  lane_type: LaneType
  matched_ai: boolean
}

export interface LabelOut {
  id: number
  image_id: number
  prediction_id: number | null
  x1: number
  y1: number
  x2: number
  y2: number
  vehicle_type: VehicleType
  parking_status: ParkingStatus
  lane_type: LaneType
  matched_ai: boolean
}

export interface LeaderboardEntry {
  labeler_name: string
  label_count: number
}

export interface AiStats {
  total_predictions: number
  matched_labels: number
  acceptance_rate: number
}
