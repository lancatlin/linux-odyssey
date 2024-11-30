function debounce(func, delay) {
  let timeout=null
  return (...args) => {
      if(timeout) clearTimeout(timeout)

      timeout=setTimeout(() => {
          func(...args)
          timeout=null
      }, delay)
  }
}