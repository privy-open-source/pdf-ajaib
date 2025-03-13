<script lang="ts">
import { pAspectRatio } from '@/directives/aspect-ratio'
import { syncRef, templateRef, useToggle, useToNumber, useVModel, watchDebounced } from '@vueuse/core'
import type { PropType } from 'vue-demi'
import { computed, defineComponent, onMounted, provide, toRef, watch } from 'vue-demi'
import PdfObjects from '../pdf-object/PdfObjects.vue'
import type { LayoutVariant } from './main'
import { PDF_VIEWER_CONTEXT } from './main'
import PdfError from './PdfError.vue'
import PdfLoading from './PdfLoading.vue'
import PdfNavigation from './PdfNavigation.vue'
import { useIdle } from './utils/use-idle'
import { useSticky } from './utils/use-sticky'
import { useViewer } from './utils/use-viewer'

export default defineComponent({
  directives: { pAspectRatio },
  components: {
    PdfObjects,
    PdfNavigation,
    PdfLoading,
    PdfError
  },
  props: {
    src: {
      type: String,
      default: ''
    },
    page: {
      type: Number,
      default: 1
    },
    scale: {
      type: Number,
      default: 1
    },
    password: {
      type: String,
      default: undefined
    },
    layout: {
      type: String as PropType<LayoutVariant>,
      default: 'fixed'
    },
    ratio: {
      type: [Number, String],
      default: 210 / 297
    },
    offsetTop: {
      type: [Number, String],
      default: 0
    },
    noNavigation: {
      type: Boolean,
      default: false,
    },
    workerSrc: {
      type: String,
    }
  },
  emits: ['ready', 'loaded', 'error', 'error-password', 'update:page', 'update:scale'],
  setup(props, { emit, expose }) {
    const root = templateRef<HTMLDivElement>('root')
    const container = templateRef<HTMLDivElement>('container')
    const viewer = templateRef<HTMLDivElement>('viewer')
    const idle = useIdle(container)

    const vPage = useVModel(props, 'page')
    const vScale = useVModel(props, 'scale')
    const [isReady, toggleReady] = useToggle()
    const [isLoaded, toggleLoaded] = useToggle()

    const offsetTop = useToNumber(toRef(props, 'offsetTop'), {
      nanToZero: true
    })
    const enableSticky = useSticky(root, { offsetTop: offsetTop })

    const classNames = computed(() => {
      const result: string[] = []

      if (props.layout) result.push(`pdf-viewer--layout-${props.layout}`)

      return result
    })

    const {
      page: pdfPage,
      scale: pdfScale,
      totalPage,
      openDoc,
      closeDoc,
      pdfDoc,
      pdfJS,
      loading,
      error,
      onLoaded,
      onError,
      onReady
    } = useViewer(container, viewer)

    watchDebounced(
      () => [props.src, props.password],
      ([src, password]) => {
        if (src) {
          openDoc(src, password, props.workerSrc)
        }
      },
      { debounce: 500 }
    )

    watch(
      () => props.layout,
      (layout) => {
        enableSticky.value = layout === 'fit'
      },
      { immediate: true }
    )

    onMounted(async () => {
      if (props.src) openDoc(props.src, props.password, props.workerSrc)
    })

    onLoaded((doc) => {
      toggleLoaded(true)
      emit('loaded', doc)
    })

    onError((error_) => {
      if (error_.name === 'PasswordException') emit('error-password', error_)
      else emit('error', error_)
    })

    onReady((pdfViewer) => {
      toggleReady(true)
      emit('ready', pdfViewer)
    })

    provide(PDF_VIEWER_CONTEXT, {
      page: pdfPage,
      scale: pdfScale,
      totalPage
    })

    syncRef(pdfPage, vPage)
    syncRef(pdfScale, vScale)

    function pdfZoomIn() {
      pdfScale.value = Math.round(pdfScale.value / 0.1) * 0.1 + 0.1
    }

    function pdfZoomOut() {
      pdfScale.value = Math.round(pdfScale.value / 0.1) * 0.1 - 0.1
    }

    function pdfNextPage() {
      pdfPage.value++
    }

    function pdfPrevPage() {
      pdfPage.value--
    }

    const calculatedScale = computed<number>(() => {
      return Number((pdfScale.value * 100).toFixed(0))
    })

    expose({
      idle,
      page: pdfPage,
      scale: calculatedScale,
      totalPage,
      zoomIn: pdfZoomIn,
      zoomOut: pdfZoomOut,
      next: pdfNextPage,
      prev: pdfPrevPage,
      isReady,
      isLoaded,
    })

    return {
      calculatedScale,
      pdfPage,
      pdfScale,
      classNames,
      totalPage,
      openDoc,
      closeDoc,
      pdfDoc,
      pdfJS,
      idle,
      loading,
      error,
      pdfZoomIn,
      pdfZoomOut,
      pdfNextPage,
      pdfPrevPage,
    }
  }
})
</script>

<template>
  <div
    ref="root"
    v-p-aspect-ratio="layout === 'fixed' ? ratio : 16 / 9"
    data-testid="pdf-viewer"
    class="pdf"
    :class="classNames"
  >
    <div class="pdf__header">
      <slot name="header" :page="pdfPage" :scale="pdfScale" :total-page="totalPage" :doc="pdfDoc" />
    </div>

    <pdf-objects class="pdf__wrapper">
      <!-- Minimum PDFJS Viewer -->
      <div ref="container" class="pdf__container pdfContainer">
        <pdf-loading v-show="loading || !src" />
        <pdf-error v-show="!loading && error" :url="src" :pdf-js="pdfJS" :error="error" />
        <div ref="viewer" class="pdf__viewer pdfViewer" />
        <slot :page="pdfPage" :scale="pdfScale" :total-page="totalPage" :doc="pdfDoc" />
      </div>
      <!-- Minimum PDFJS Viewer end -->

      <slot
        name="container"
        :page="pdfPage"
        :scale="pdfScale"
        :total-page="totalPage"
        :doc="pdfDoc"
      />

      <transition name="slide-up">
        <div v-if="!noNavigation" class="pdf__navigation">
          <slot
            name="navigation"
            :idle="idle"
            :page="pdfPage"
            :scale="calculatedScale"
            :totalPage="totalPage"
            :zoom-in="pdfZoomIn"
            :zoom-out="pdfZoomOut"
            :next="pdfNextPage"
            :prev="pdfPrevPage"
            :doc="pdfDoc"
          >
            <pdf-navigation v-show="!idle" />
          </slot>
        </div>
      </transition>

      <slot name="body" :page="pdfPage" :scale="pdfScale" :total-page="totalPage" :doc="pdfDoc" />
    </pdf-objects>
    <div class="pdf__footer">
      <slot name="footer" :page="pdfPage" :scale="pdfScale" :total-page="totalPage" :doc="pdfDoc" />
    </div>
  </div>
</template>

<style lang="scss">
.pdf {
  position: relative;
  display: flex;
  width: 100%;
  flex-direction: column;
  overflow: hidden;
  z-index: 2;
  background-color: white;

  &__wrapper {
    position: relative;
    height: 100%;
    width: 100%;
    flex-grow: 1;
  }

  &__container {
    -webkit-overflow-scrolling: touch;
    position: absolute;
    top: 0px;
    right: 0px;
    bottom: 0px;
    left: 0px;
    height: 100%;
    width: 100%;
    overflow: auto;
    padding: 1rem 1rem 4rem;
  }

  &__viewer {
    .page {
      position: relative;
      overflow: visible;
      margin: 0 auto 10px;
      border: none;
    }
  }

  &__header {
    z-index: 1;
    background-color: white;
  }

  &__footer {
    z-index: 1;
    background-color: white;
  }

  &__navigation {
    z-index: 10;
  }
}
</style>
