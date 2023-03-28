<script lang="ts">
import { defineComponent } from 'vue-demi'
import PDF_LOADING_IMG from './assets/pdf-loading.svg'

export default defineComponent({
  setup() {
    return { PDF_LOADING_IMG }
  }
})
</script>

<template>
  <div data-testid="pdf-loading" class="pdf__loading">
    <img :src="PDF_LOADING_IMG" width="793" height="1122" />
  </div>
</template>

<style lang="scss">
.pdf__loading {
  margin-left: auto;
  margin-right: auto;
  margin-bottom: 1rem;
  max-width: 793px;
  background-color: white;
  padding: 1rem;

  > img {
    height: auto;
    max-width: 100%;
    object-fit: contain;
    display: block;
  }
}
</style>
