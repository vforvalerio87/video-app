(() => {
  'use strict'

  const root = document.getElementById('root')
  const initialUrl = document.location.pathname
  window.history.replaceState({state: 'initialState'}, '', initialUrl)
  window.onpopstate = (e) => { goToUrl(e.target.location.pathname) }

  goToUrl(initialUrl)

  function goToUrl(url) {
    if (url === '/') getIndexPage()
    else getSingleVideoPage(url)
  }

  function clearPage() { while (root.hasChildNodes()) root.removeChild(root.firstChild) }

  function loadElement(element) { root.appendChild(element) }

  async function getIndexPage() { try {
    clearPage()
    const [indexResponse, titleResponse] = await Promise.all([
      fetch('./api/index.json'),
      fetch('http://quotesondesign.com/wp-json/posts?filter[orderby]=rand&filter[posts_per_page]=1')
    ])
    if (indexResponse.status >= 400) throw indexResponse.status
    const [indexJSON, titleJSON] = await Promise.all([
      indexResponse.json(),
      titleResponse.json()
    ])
    const { content: quote, title: author } = titleJSON.find(element => element)
    const div = document.createElement('div')
    if (quote) {
      div.appendChild(document.createElement('h1')).innerHTML = 'Quote of the day'
      div.appendChild(document.createElement('h2')).innerHTML = quote
      if (author) div.appendChild(document.createElement('h3')).innerHTML = author
    } else { div.appendChild(document.createElement('h1')).innerHTML = 'No quote today :(' }
    indexJSON.data.forEach(videoDataObject => {
      div.appendChild(createGoToVideoButton('/' + videoDataObject.id, videoDataObject.poster))
    })
    loadElement(div)
  } catch (e) { getErrorPage(e) } }

  async function getSingleVideoPage(url) { try {
    clearPage()
    const response = await fetch(`./api${url}.json`)
    if (response.status >= 400) throw response.status
    const videoData = (await response.json()).data
    const div = document.createElement('div')
    div.appendChild(document.createElement('h1')).innerHTML = url.substring(1)
    div.appendChild(createVideoComponent(videoData))
    div.appendChild(createGoToIndexButton())
    loadElement(div)
    window.videojs(document.getElementById(videoData.id))
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
})()
