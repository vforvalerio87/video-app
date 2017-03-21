(() => {
  'use strict'

  if (window.Promise && window.fetch && Object.entries) { main() }
  else {
    const polyfills = document.createElement('script')
    polyfills.setAttribute('src', 'https://cdn.polyfill.io/v2/polyfill.min.js?features=Object.entries,Promise,fetch')
    polyfills.onload = () => { main() }
    polyfills.onerror = () => { main(new Error('Failed to load polyfills')) }
    document.head.appendChild(polyfills)
  }
  
  function main() {
    const root = document.getElementById('root')
    const initialUrl = document.location.pathname
    let quotesCache = []
    const quotesUrl = 'http://quotesondesign.com/wp-json/posts?filter[orderby]=rand&filter[posts_per_page]=10'
    window.history.replaceState({state: 'initialState'}, '', initialUrl)
    window.onpopstate = (e) => { goToUrl(e.target.location.pathname) }

    goToUrl(initialUrl)

    function goToUrl(url) {
      if (url === '/') getIndexPage()
      else getSingleVideoPage(url)
    }

    function clearPage() { while (root.hasChildNodes()) root.removeChild(root.firstChild) }

    function loadElement(element) { return root.appendChild(element) }

    function getIndexPage() {
      clearPage()
      loadElement(document.createElement('p')).innerHTML = 'Loading...'

      const titlePromise = quotesCache.length ?
        Promise.resolve(new Response(new Blob([JSON.stringify(quotesCache)], {type: 'application/json'}))) :
        fetch(quotesUrl, { cache: 'no-cache' })
      const div = document.createElement('div')

      const indexPromise = fetch('./api/index.json')
        .then((response, reject) => {
          if (response.status >= 400) reject(response.status)
          return response.json()
        })
        .then(indexJSON => new Promise(resolve => {
          resolve(
            indexJSON.data.map(videoDataObject =>
              createGoToVideoButton('/' + videoDataObject.id, videoDataObject.poster)
            )
          )
        }))
        .catch(error => getErrorPage(error))

      const quotesPromise = titlePromise
        .then(response => response.json())
        .then(titleJSON => new Promise(resolve => {
          if (!quotesCache.length) quotesCache = titleJSON
          const currentQuote = quotesCache[Math.floor(Math.random() * quotesCache.length)]
          quotesCache = quotesCache.slice(0, quotesCache.indexOf(currentQuote)).concat(quotesCache.slice(quotesCache.indexOf(currentQuote) +1, quotesCache.length))
          const { content: quote, title: author } = currentQuote
          const div = document.createElement('div')
          if (quote) {
            div.appendChild(document.createElement('h1')).innerHTML = 'Quote of the day'
            div.appendChild(document.createElement('h2')).innerHTML = quote,
            div.appendChild(document.createElement('h3')).innerHTML = author
          } else {
            div.appendChild(document.createElement('h1')).innerHTML = 'No quote today :('
          }
          resolve (div)
        }))
        .catch(error => getErrorPage(error))

      Promise.all([indexPromise, quotesPromise])
        .then(([videoDivArray, quoteDiv]) => {
          clearPage()
          div.appendChild(quoteDiv)
          videoDivArray.forEach(videoButtonElement => {
            div.appendChild(videoButtonElement)
          })
          loadElement(div)
          if (quotesCache.length < 3) fetch(quotesUrl, { cache: 'no-cache' })
            .then(response => response.json())
            .then(json => {quotesCache = json})
        })
        .catch(error => { getErrorPage(error) })
    }

    async function getSingleVideoPage(url) { try {
      clearPage()
      loadElement(document.createElement('p')).innerHTML = 'Loading...'
      const videoObject = await fetch(`./api${url}.json`).then(response => {
        if (response.status >= 400) throw response.status
        return response.json()
      })
      const div = document.createElement('div')
      div.appendChild(document.createElement('h1')).innerHTML = url.substring(1)
      div.appendChild(createVideoComponent(videoObject.data))
      div.appendChild(createGoToIndexButton())
      clearPage()
      loadElement(div)
      if (window.videojs) window.videojs(document.getElementById(videoObject.data.id))
    } catch(e) { getErrorPage(e) } }

    function getErrorPage(error) {
      clearPage()
      const div = document.createElement('div')
      div.appendChild(document.createElement('h1')).innerHTML = error
      div.appendChild(createGoToIndexButton())
      loadElement(div)
    }

    function createVideoComponent(videoData) {
      const video = document.createElement('video')
      video.setAttribute('id', videoData.id)
      video.setAttribute('poster', videoData.poster)
      video.setAttribute('width', '640')
      video.setAttribute('height', '264')
      video.setAttribute('controls', null)
      video.setAttribute('preload', 'auto')
      Object.entries(videoData.sources).forEach(([key, value]) => {
        const child = document.createElement('source')
        child.setAttribute('src', value)
        child.setAttribute('type', key)
        video.appendChild(child)
      })
      video.classList.add('video-js', 'vjs-default-skin', 'vjs-big-play-centered')
      video.style.maxWidth = '100%'
      video.style.maxHeight = '264'
      return video
    }

    function createGoToIndexButton() {
      const button = document.createElement('button')
      button.innerHTML = 'Go to index'
      button.addEventListener('click', (e) => {
        e.preventDefault()
        goToUrl('/')
        window.history.pushState(null, '', '/')
      })
      return button
    }

    function createGoToVideoButton(url, poster) {
      const videoThumb = document.createElement('img')
      videoThumb.setAttribute('src', poster)
      videoThumb.setAttribute('width', '640')
      videoThumb.setAttribute('height', 'auto')
      videoThumb.style.maxWidth = '100%'
      videoThumb.style.maxHeight = '264'
      const a = document.createElement('a')
      a.setAttribute('href', url)
      a.addEventListener('click', (e) => {
        e.preventDefault()
        goToUrl(url)
        window.history.pushState(null, '', url)
      })
      const div = document.createElement('div')
      div.appendChild(a)
        .appendChild(videoThumb)
      return div
    }
  }
})()
