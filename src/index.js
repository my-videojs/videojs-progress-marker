import videojs from 'video.js'


const UPDATE_REFRESH_INTERVAL = 30;
// default setting
const defaultSetting = {
  markerStyle: {
    'width': '7px',
    'border-radius': '30%',
    'background-color': 'red'
  },
  markerTip: {
    display: true,
    text: function (marker) {
      return 'Break: ' + marker.text
    },
    time: function (marker) {
      return marker.time
    }
  },
  breakOverlay: {
    display: false,
    displayTime: 3,
    text: function (marker) {
      return 'Break overlay: ' + marker.overlayText
    },
    style: {
      'width': '100%',
      'height': '20%',
      'background-color': 'rgba(0,0,0,0.7)',
      'color': 'white',
      'font-size': '17px'
    }
  },
  onMarkerClick: function (marker) {},
  onMarkerReached: function (marker, index) {},
  markers: []
}
function isPlain (value) {
  return !!value && typeof value === 'object' &&
    toString.call(value) === '[object Object]' &&
    value.constructor === Object
}
function mergeOptions (source1, source2) {
  const result = {}
  const sources = [source1, source2]
  sources.forEach(source => {
    if (!source) {
      return
    }
    Object.keys(source).forEach(key => {
      const value = source[key]
      if (!isPlain(value)) {
        result[key] = value
        return
      }
      if (!isPlain(result[key])) {
        result[key] = {}
      }
      result[key] = mergeOptions(result[key], value)
    })
  })
  return result
}
// create a non-colliding random number
function generateUUID () {
  let d = new Date().getTime()
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (d + Math.random() * 16) % 16 | 0
    d = Math.floor(d / 16)
    return (c === 'x' ? r : (r & 0x3 | 0x8)).toString(16)
  })
}

/**
 * Returns the size of an element and its position
 * a default Object with 0 on each of its properties
 * its return in case there's an error
 * @param  {Element} element  el to get the size and position
 * @return {DOMRect|Object}   size and position of an element
 */
function getElementBounding (element) {
  let elementBounding
  const defaultBoundingRect = {
    top: 0,
    bottom: 0,
    left: 0,
    width: 0,
    height: 0,
    right: 0
  }

  try {
    elementBounding = element.getBoundingClientRect()
  } catch (e) {
    elementBounding = defaultBoundingRect
  }

  return elementBounding
}

const NULL_INDEX = -1

function registerVideoJsMarkersPlugin (options) {
  // copied from video.js/src/js/utils/merge-options.js since
  // videojs 4 doens't support it by defualt.
  if (!videojs.mergeOptions) {
    videojs.mergeOptions = mergeOptions
  }

  if (!videojs.dom.createEl) {
    videojs.dom.createEl = function (tagName, props, attrs) {
      const el = videojs.Player.prototype.dom.createEl(tagName, props)
      if (!!attrs) {
        Object.keys(attrs).forEach(key => {
          el.setAttribute(key, attrs[key])
        })
      }
      return el
    }
  }

  /**
   * register the markers plugin (dependent on jquery)
   */
  const setting = videojs.mergeOptions(defaultSetting, options)
  const markersMap = {}
  const markersList = [] // list of markers sorted by time
  let currentMarkerIndex = NULL_INDEX
  const player = this
  let markerTip = null
  let breakOverlay = null
  let overlayIndex = NULL_INDEX

  function sortMarkersList () {
    // sort the list by time in asc order
    markersList.sort((a, b) => {
      return setting.markerTip.time(a) - setting.markerTip.time(b)
    })
  }

  function addMarkers (newMarkers) {
    newMarkers.forEach((marker) => {
      marker.key = generateUUID()

      player.el().querySelector('.vjs-progress-holder')
        .appendChild(createMarkerDiv(marker))

      // store marker in an internal hash map
      markersMap[marker.key] = marker
      markersList.push(marker)
    })

    sortMarkersList()
  }

  function getPosition (marker) {
    return (setting.markerTip.time(marker) / player.duration()) * 100
  }

  function setMarkderDivStyle (marker, markerDiv) {
    markerDiv.className = `vjs-marker ${marker.class || ''}`

    const markerPoint = markerDiv.querySelector('.vjs-marker-point')

    Object.keys(setting.markerStyle).forEach(key => {
      markerPoint.style[key] = setting.markerStyle[key]
    })

    // hide out-of-bound markers
    const ratio = marker.time / player.duration()
    if (ratio < 0 || ratio > 1) {
      markerDiv.style.display = 'none'
    }

    // set position
    markerDiv.style.left = getPosition(marker) + '%'
    if (marker.duration) {
      markerDiv.style.width = (marker.duration / player.duration()) * 100 + '%'
      markerDiv.style.marginLeft = '0px'
    } else {
      // todo: 设置marginLeft的时候markerDiv还没有插入dom，获取到的参数都是0
      // const markerDivBounding = getElementBounding(markerDiv)
      // markerDiv.style.marginLeft = markerDivBounding.width / 2 + 'px'
    }
  }

  function createMarkerDiv (marker) {
    const markerDiv = videojs.dom.createEl('div', {}, {
      'data-marker-key': marker.key,
      'data-marker-time': setting.markerTip.time(marker)
    })

    const markerPoint = videojs.dom.createEl('div', {className: 'vjs-marker-point'})
    markerDiv.appendChild(markerPoint)

    setMarkderDivStyle(marker, markerDiv)

    // bind click event to seek to marker time
    markerDiv.addEventListener('click', function (e) {
      let preventDefault = false
      if (typeof setting.onMarkerClick === 'function') {
        // if return false, prevent default behavior
        preventDefault = setting.onMarkerClick(marker) === false
      }

      if (!preventDefault) {
        const key = this.getAttribute('data-marker-key')
        player.currentTime(setting.markerTip.time(markersMap[key]))
      }
    })

    // bind mouseover event to seek to marker time
    markerDiv.addEventListener('mouseover', function (e) {
      var preventDefault = false;
      if (typeof setting.onMarkerMouseOver === 'function') {
        // if return false, prevent default behavior
        preventDefault = setting.onMarkerMouseOver(marker) === false;
      }
    });
    
    if (setting.markerTip.display) {
      const markerTip = videojs.dom.createEl('div', {
        className: 'vjs-tip',
        innerHTML: `<div class='vjs-tip-inner'>${setting.markerTip.text(marker)}</div>
                    <div class='vjs-tip-arrow'><div class='arrow'></div></div>`
      })
      markerTip.addEventListener('mousedown', function(e) {
        e.stopPropagation()
      })
      markerTip.addEventListener('click', function(e) {
        e.stopPropagation()
      })
      markerDiv.appendChild(markerTip)
      registerMarkerTipHandler(markerDiv)
    }

    return markerDiv
  }

  function updateMarkers (force) {
    // update UI for markers whose time changed
    markersList.forEach((marker) => {
      const markerDiv = player.el().querySelector(".vjs-marker[data-marker-key='" + marker.key + "']")
      const markerTime = setting.markerTip.time(marker)

      if (force || markerDiv.getAttribute('data-marker-time') !== markerTime) {
        setMarkderDivStyle(marker, markerDiv)
        markerDiv.setAttribute('data-marker-time', markerTime)
      }
    })
    sortMarkersList()
  }

  function removeMarkers (indexArray) {
    // reset overlay
    if (!!breakOverlay) {
      overlayIndex = NULL_INDEX
      breakOverlay.style.visibility = 'hidden'
    }
    currentMarkerIndex = NULL_INDEX

    const deleteIndexList = []
    indexArray.forEach((index) => {
      const marker = markersList[index]
      if (marker) {
        // delete from memory
        delete markersMap[marker.key]
        deleteIndexList.push(index)

        // delete from dom
        const el = player.el().querySelector(".vjs-marker[data-marker-key='" + marker.key + "']")
        el && el.parentNode.removeChild(el)
      }
    })

    // clean up markers array
    deleteIndexList.reverse()
    deleteIndexList.forEach((deleteIndex) => {
      markersList.splice(deleteIndex, 1)
    })

    // sort again
    sortMarkersList()
  }

  // attach hover event handler
  function registerMarkerTipHandler (markerDiv) {
    const markerTip = markerDiv.querySelector('.vjs-tip')

    markerDiv.addEventListener('mouseover', () => {
      if (!!markerTip) {
        const markerDivBounding = getElementBounding(markerDiv)
        markerTip.style.marginLeft = (markerDivBounding.width / 2) + 'px'
        markerTip.style.visibility = 'visible'
      }
    })

    markerDiv.addEventListener('mouseout', () => {
      if (!!markerTip) {
        markerTip.style.visibility = 'hidden'
      }
    })
  }


  // show or hide break overlays
  function updateBreakOverlay () {
    if (!setting.breakOverlay.display || currentMarkerIndex < 0) {
      return
    }

    const currentTime = player.currentTime()
    const marker = markersList[currentMarkerIndex]
    const markerTime = setting.markerTip.time(marker)

    if (
      currentTime >= markerTime &&
      currentTime <= (markerTime + setting.breakOverlay.displayTime)
    ) {
      if (overlayIndex !== currentMarkerIndex) {
        overlayIndex = currentMarkerIndex
        if (breakOverlay) {
          breakOverlay.querySelector('.vjs-break-overlay-text').innerHTML = setting.breakOverlay.text(marker)
        }
      }

      if (breakOverlay) {
        breakOverlay.style.visibility = 'visible'
      }
    } else {
      overlayIndex = NULL_INDEX
      if (breakOverlay) {
        breakOverlay.style.visibility = 'hidden'
      }
    }
  }

  // problem when the next marker is within the overlay display time from the previous marker
  function initializeOverlay () {
    breakOverlay = videojs.dom.createEl('div', {
      className: 'vjs-break-overlay',
      innerHTML: "<div class='vjs-break-overlay-text'></div>"
    })
    Object.keys(setting.breakOverlay.style).forEach(key => {
      if (breakOverlay) {
        breakOverlay.style[key] = setting.breakOverlay.style[key]
      }
    })
    player.el().appendChild(breakOverlay)
    overlayIndex = NULL_INDEX
  }

  function onTimeUpdate () {
    onUpdateMarker()
    updateBreakOverlay()
    options.onTimeUpdateAfterMarkerUpdate && options.onTimeUpdateAfterMarkerUpdate()
  }

  function onUpdateMarker () {
    /*
      check marker reached in between markers
      the logic here is that it triggers a new marker reached event only if the player
      enters a new marker range (e.g. from marker 1 to marker 2).
      Thus, if player is on marker 1 and user clicked on marker 1 again, no new reached event is triggered)
    */
    if (!markersList.length) {
      return
    }

    const getNextMarkerTime = (index) => {
      if (index < markersList.length - 1) {
        return setting.markerTip.time(markersList[index + 1])
      }
      // next marker time of last marker would be end of video time
      return player.duration()
    }
    const currentTime = player.currentTime()
    let newMarkerIndex = NULL_INDEX

    if (currentMarkerIndex !== NULL_INDEX) {
      // check if staying at same marker
      const nextMarkerTime = getNextMarkerTime(currentMarkerIndex)
      if (
        currentTime >= setting.markerTip.time(markersList[currentMarkerIndex]) &&
        currentTime < nextMarkerTime
      ) {
        return
      }

      // check for ending (at the end current time equals player duration)
      if (
        currentMarkerIndex === markersList.length - 1 &&
        currentTime === player.duration()
      ) {
        return
      }
    }

    // check first marker, no marker is selected
    if (currentTime < setting.markerTip.time(markersList[0])) {
      newMarkerIndex = NULL_INDEX
    } else {
      // look for new index
      for (let i = 0; i < markersList.length; i++) {
        const nextMarkerTime = getNextMarkerTime(i)
        if (
          currentTime >= setting.markerTip.time(markersList[i]) &&
          currentTime < nextMarkerTime
        ) {
          newMarkerIndex = i
          break
        }
      }
    }

    // set new marker index
    if (newMarkerIndex !== currentMarkerIndex) {
      // trigger event if index is not null
      if (newMarkerIndex !== NULL_INDEX && options.onMarkerReached) {
        options.onMarkerReached(markersList[newMarkerIndex], newMarkerIndex)
      }
      currentMarkerIndex = newMarkerIndex
    }
  }

  // setup the whole thing
  function initialize () {
    // remove existing markers if already initialized
    player.markers.removeAll()
    addMarkers(setting.markers)

    if (setting.breakOverlay.display) {
      initializeOverlay()
    }
    // 不使用timeupdate做更新，频率太低导致和进度条位置对不上
    // 使用videojs的逻辑https://github.com/videojs/video.js/blob/70a71ae81e/src/js/control-bar/progress-control/seek-bar.js#L64
    // player.on('timeupdate', onTimeUpdate)

    let updateInterval = null;
    player.on('playing', () => {
      player.clearInterval(updateInterval)

      updateInterval = player.setInterval(() => {
        player.requestAnimationFrame(() => {
          onTimeUpdate()
        })
      }, UPDATE_REFRESH_INTERVAL)
    });
    player.on(['ended', 'pause', 'waiting'], () => {
      player.clearInterval(updateInterval)
    })
    player.off('loadedmetadata')
  }

  // setup the plugin after we loaded video's meta data
  player.on('loadedmetadata', function () {
    initialize()
  })

  // exposed plugin API
  player.markers = {
    getMarkers: function () {
      return markersList
    },
    next: function () {
      // go to the next marker from current timestamp
      const currentTime = player.currentTime()
      for (let i = 0; i < markersList.length; i++) {
        const markerTime = setting.markerTip.time(markersList[i])
        if (markerTime > currentTime) {
          player.currentTime(markerTime)
          break
        }
      }
    },
    prev: function () {
      // go to previous marker
      const currentTime = player.currentTime()
      for (let i = markersList.length - 1; i >= 0; i--) {
        const markerTime = setting.markerTip.time(markersList[i])
        // add a threshold
        if (markerTime + 0.5 < currentTime) {
          player.currentTime(markerTime)
          return
        }
      }
    },
    add: function (newMarkers) {
      // add new markers given an array of index
      addMarkers(newMarkers)
    },
    remove: function (indexArray) {
      // remove markers given an array of index
      removeMarkers(indexArray)
    },
    removeAll: function () {
      const indexArray = []
      for (let i = 0; i < markersList.length; i++) {
        indexArray.push(i)
      }
      removeMarkers(indexArray)
    },
    // force - force all markers to be updated, regardless of if they have changed or not.
    updateTime: function (force) {
      // notify the plugin to update the UI for changes in marker times
      updateMarkers(force)
    },
    reset: function (newMarkers) {
      // remove all the existing markers and add new ones
      player.markers.removeAll()
      addMarkers(newMarkers)
    },
    destroy: function () {
      // unregister the plugins and clean up even handlers
      player.markers.removeAll()
      breakOverlay && breakOverlay.remove()
      markerTip && markerTip.remove()
      player.off('timeupdate', updateBreakOverlay)
      delete player.markers
    }
  }
}

videojs.registerPlugin('markers', registerVideoJsMarkersPlugin)
