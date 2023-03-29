# PDF-Ajaib

PDF-Ajaib is a Vue 3 library with a PDF viewer component and a powerful place holder feature for precise object placement on PDF documents in Vue applications. This feature is useful for placing digital signatures and other objects accurately on PDFs. The viewer component uses PDF.js for rendering PDF documents and allows customization of page navigation, zooming, and text selection. PDF-Ajaib can also read password-protected PDFs. Overall, it's an excellent choice for Vue developers who need to display PDF documents with precise object placement.

## Install via NPM/Yarn


```sh
yarn add @privyid/pdf-ajaib
```


```sh
npm install @privyid/pdf-ajaib
```


# Usage
To use PDF-Ajaib in your Vue application, first, import it into your component:

```javascript
Copy code
import { PdfViewer } from '@privyid/pdf-ajaib'

```

Then, use the PdfViewer component in your template:

```html
<PdfViewer src="path/to/your/pdf" />
```

For more information on using PDF-Ajaib, please see the [Persona Design System documentation](https://privy-open-source.github.io/design-system/components/pdf-viewer/).
