(() => {
  'use strict'

  const root = document.getElementById('root')

  function goToUrl (url) {
    if (url === '/') getIndexPage()
    else getSingleVideoPage(url)
  }

  window.onpopstate = (e) => { goToUrl(e.target.location.pathname) }

  function loadElement (element) { root.appendChild(element) }

  function clearPage () { while (root.hasChildNodes()) root.removeChild(root.firstChild) }

  function createGoToIndexButton () {
    const button = document.createElement('button')
    button.innerHTML = 'Go to index'
    button.addEventListener('click', (e) => {
      e.preventDefault()
      goToUrl('/')
      window.history.pushState(null, '', '/')
    })
    return button
  }

  function createGoToVideoButton (url, poster) {
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

  function createVideoComponent (videoData) {
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

  async function getIndexPage () { try {
    clearPage()
    const response = await fetch('./api/index.json')
    if (response.status !== 200) throw response.status
    const responseJSON = await response.json()
    const title = document.createElement('h1')
    const div = document.createElement('div')
    div.appendChild(title).innerHTML = 'Welcome to my site'
    responseJSON.data.forEach(videoDataObject => {
      div.appendChild(createGoToVideoButton('/' + videoDataObject.id, videoDataObject.poster))
    })
    loadElement(div)
  } catch (e) {
    if (e === 404) { get404Page() }
    throw new Error(e)
  } }

  async function getSingleVideoPage (url) { try {
    clearPage()
    const response = await fetch(`/api${url}.json`)
    if (response.status !== 200) throw response.status
    const videoData = (await response.json()).data
    const title = document.createElement('h1')
    const div = document.createElement('div')
    div.appendChild(title).innerHTML = url.substring(1)
    div.appendChild(createVideoComponent(videoData))
    div.appendChild(createGoToIndexButton())
    loadElement(div)
    window.videojs(document.getElementById(videoData.id))
  } catch(e) {
    if (e === 404) { get404Page() }
    throw new Error(e)
  } }

  function get404Page () {
    clearPage()
    const notFound = document.createElement('h1')
    const div = document.createElement('div')
    div.appendChild(notFound).innerHTML = '404'
    div.appendChild(createGoToIndexButton())
    loadElement(div)
  }

  const initialUrl = document.location.pathname
  window.history.replaceState({state: 'initialState'}, '', initialUrl)
  goToUrl(initialUrl)
})()
