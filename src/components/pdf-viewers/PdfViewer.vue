<script lang="ts">
import type { PropType} from 'vue-demi';
import { computed, defineComponent, onMounted, provide, toRef, watch } from 'vue-demi'
import { pAspectRatio } from '@/directives/aspect-ratio'
import { templateRef, useToNumber, useVModel, watchDebounced, syncRef } from '@vueuse/core'
import type { LayoutVariant} from './main';
import { PDF_VIEWER_CONTEXT } from './main'
import { useSticky } from './utils/use-sticky'
import PdfNavigation from './PdfNavigation.vue'
import PdfLoading from './PdfLoading.vue'
import PdfError from './PdfError.vue'
import { useIdle } from './utils/use-idle'
import PdfObjects from '../pdf-object/PdfObjects.vue'
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
    }
  },
  emits: ['ready', 'loaded', 'error', 'error-password', 'update:page', 'update:scale'],
  setup(props, { emit }) {
    const root = templateRef<HTMLDivElement>('root')
    const container = templateRef<HTMLDivElement>('container')
    const viewer = templateRef<HTMLDivElement>('viewer')
    const idle = useIdle(container)

    const vPage = useVModel(props, 'page')
    const vScale = useVModel(props, 'scale')

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
          openDoc(src, password)
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
      if (props.src) openDoc(props.src, props.password)
    })

    onLoaded((doc) => {
      emit('loaded', doc)
    })

    onError((error_) => {
      if (error_.name === 'PasswordException') emit('error-password', error_)
      else emit('error', error_)
    })

    onReady((pdfViewer) => {
      emit('ready', pdfViewer)
    })

    provide(PDF_VIEWER_CONTEXT, {
      page: pdfPage,
      scale: pdfScale,
      totalPage
    })

    syncRef(pdfPage, vPage)
    syncRef(pdfScale, vScale)

    return {
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
      error
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
        <pdf-navigation v-show="!idle" />
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
}
</style>
