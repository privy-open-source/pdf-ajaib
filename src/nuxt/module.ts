import { createResolver, defineNuxtModule, addComponent } from '@nuxt/kit'
export default defineNuxtModule({
  meta: {
    name: '@privyid/pdf-ajaib'
  },
  setup () {
    const { resolve } = createResolver(import.meta.url)
    // Add an API route
    addComponent({
      name: 'PdfViewer',
      filePath: resolve('./components/PdfViewer/PdfViewer.vue'),
    })
  }
})
