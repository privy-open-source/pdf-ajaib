<script setup lang="ts">
import { reactive } from 'vue'
import PdfViewer from '@/components/pdf-viewers/PdfViewer.vue'
import PdfObject from '@/components/pdf-object/PdfObject.vue'
import type { PdfObject as IPdfObject } from '@/types/ref'

const object = reactive<IPdfObject>({
  page: undefined,
  x: undefined,
  y: undefined,
  width: undefined,
  height: undefined
})
</script>

<template>
  <div class="pdf-example">
    <pdf-viewer
      src="https://privy-open-source.github.io/design-system/assets/Calibrator-v3.e869f66c.pdf"
    >
      <pdf-object
        v-model:page="object.page"
        v-model:x="object.x"
        v-model:y="object.y"
        v-model:width="object.width"
        v-model:height="object.height"
        debug
      >
        <img
          class="w-full h-full rounded"
          src="https://via.placeholder.com/430x230/23B242/ffffff"
        />
      </pdf-object>

      <!-- <template #navigation="{ zoomIn, zoomOut, page, totalPage, next, prev }">
        <button @click="zoomOut">Zoom Out</button>
        <button @click="zoomIn">Zoom In</button>
        <div>
          Page <span>{{ page }}</span> / {{ totalPage }}
        </div>
        <button @click="prev">Prev</button>
        <button @click="next">Next</button>
      </template> -->
    </pdf-viewer>
  </div>
</template>

<style lang="scss" scoped>
.pdf-example {
  margin-left: auto;
  margin-right: auto;
  border: 1px solid #bfd9f3;
  border-radius: 8px;
  max-width: 900px;
  background: #ddd;
  padding: 0.5rem;
}
</style>
