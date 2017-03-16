(() => {
  'use strict'

  const root = document.getElementById('root')

  const goToUrl = (url) => {
    if (url === '/') getIndexPage()
    else getSingleVideoPage(url)
  }

  window.onpopstate = (e) => { goToUrl(e.target.location.pathname) }

  const loadElement = (element) => { root.appendChild(element) }

  const clearPage = () => { while (root.hasChildNodes()) root.removeChild(root.firstChild) }

  const createGoToIndexButton = () => {
    const button = document.createElement('button')
    button.innerHTML = 'Go to index'
    button.addEventListener('click', (e) => {
      e.preventDefault()
      goToUrl('/')
      window.history.pushState(null, '', '/')
    })
    return button
  }

  const createGoToVideoButton = (url, poster) => {
    const div = document.createElement('div')
    const a = document.createElement('a')
    const videoThumb = document.createElement('img')
    videoThumb.setAttribute('src', poster)
    videoThumb.setAttribute('width', '640')
    videoThumb.setAttribute('height', 'auto')
    videoThumb.style.maxWidth = '100%'
    videoThumb.style.maxHeight = '264'
    a.setAttribute('href', url)
    a.addEventListener('click', (e) => {
      e.preventDefault()
      goToUrl(url)
      window.history.pushState(null, '', url)
    })
    a.appendChild(videoThumb)
    div.appendChild(a)
    return div
  }

  const createVideoComponent = (videoData) => {
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

  const getIndexPage = async () => {
    clearPage()
    const div = document.createElement('div')
    const title = document.createElement('h1')
    title.innerHTML = 'Welcome to my site'
    div.appendChild(title)
    const responseJSON = await (await fetch('./api/index.json')).json()
    responseJSON.data.forEach(videoDataObject => {
      div.appendChild(createGoToVideoButton('/' + videoDataObject.id, videoDataObject.poster))
    })
    loadElement(div)
  }

  const getSingleVideoPage = async (url) => {
    clearPage()
    const div = document.createElement('div')
    const title = document.createElement('h1')
    title.innerHTML = url.substring(1)
    div.appendChild(title)
    const videoData = (await (await fetch('/api' + url + '.json')).json()).data
    div.appendChild(createVideoComponent(videoData))
    div.appendChild(createGoToIndexButton())
    loadElement(div)
    window.videojs(document.getElementById(videoData.id))
  }

  const initialUrl = document.location.pathname
  window.history.replaceState({state: 'initialState'}, '', initialUrl)
  goToUrl(initialUrl)
})()
