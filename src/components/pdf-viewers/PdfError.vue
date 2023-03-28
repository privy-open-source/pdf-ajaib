<script lang="ts">
import type * as PDFJS from 'pdfjs-dist'
import { pAspectRatio } from '../aspect-ratio'
import type { PropType } from 'vue-demi';
import { defineComponent } from 'vue-demi'

export default defineComponent({
  directives: { pAspectRatio },
  props: {
    url: {
      type: String,
      default: ''
    },
    pdfJs: {
      type: Object as PropType<typeof PDFJS>,
      default: () => ({})
    },
    error: {
      type: Object as PropType<Error>,
      default: () => ({} as Error)
    }
  },
  setup() {
    return {}
  }
})
</script>

<template>
  <div v-p-aspect-ratio="1122 / 793" data-testid="pdf-error" class="pdf__error">
    <h3 class="text-error">Failed to load PDF</h3>
    <dl class="mt-7">
      <dt>URL:</dt>
      <dd class="truncate">
        <a :href="url" target="_blank">
          <code>{{ url }}</code>
        </a>
      </dd>
      <dt>Reason:</dt>
      <dd>
        <code>{{ error.message }}</code>
      </dd>
      <dt>PDFJS Version:</dt>
      <dd>
        <code>{{ pdfJs.version }}</code>
      </dd>
    </dl>
  </div>
</template>

<style lang="scss">
.pdf__error {
  margin-left: auto;
  margin-right: auto;
  margin-bottom: 1rem;
  height: 100%;
  width: 100%;
  max-width: 793px;
  padding: 1.5rem;
  background-color: rgb(254, 245, 244);
}
</style>
