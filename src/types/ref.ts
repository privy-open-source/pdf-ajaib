import type { Ref } from 'vue'

export interface PdfObject {
  page?: number
  x?: number
  y?: number
  width?: number
  height?: number
}

export interface PdfViewerContext {
  idle: Ref<boolean>
  page: Ref<number>
  scale: Ref<number>
  totalPage: Ref<number>
  zoomIn: () => void
  zoomOut: () => void
  next: () => void
  prev: () => void
  isReady: Ref<boolean>
  isLoaded: Ref<boolean>
}
