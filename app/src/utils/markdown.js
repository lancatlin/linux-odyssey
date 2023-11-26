import { marked } from 'marked'
import DOMPurify from 'dompurify'

export default function markdown2HTML(markdown) {
  const html = marked.parse(markdown)
  return DOMPurify.sanitize(html)
}
