// console.log( "service worker inside sw.js registered" )

return

const cacheName = "app-shell-rs-rs-v4"
const dynamicCacheName = "dynamic-cache-v1"

const assets = [
  '/',
  'index.html',
  'js/app.js',
  'js/common.js',
  'js/materialize.min.js',
  'css/styles.css',
  'css/materialize.min.css',
  'img/pkcontacts.png',
  '/favicon.ico',
  'https://fonts.googleapis.com/icon?family=Material+Icons',
  'pages/default.html'
]

const limitCacheSize = (name, size) => {
  caches.open(name).then( cache => {
    cache.keys().then( keys => {
      if(keys.length > size ) {
        cache.delete(keys[0]).then( limitCacheSize( name, size ) )
      }
    })
  })
}

self.addEventListener( 'install' , evt => {
  console.log('service worker has been instaled.' )

  evt.waitUntil(
    caches.open(cacheName).then( (cache) => {
      console.log( "Caching assets")
      cache.addAll( assets )
    })
  )
})

self.addEventListener( 'activate' , evt => {
  console.log('service worker has been activated.')
  evt.waitUntil(
    caches.keys().then(keys => {
      return Promise.all(keys
        .filter( key => key !== cacheName )
        .map(key => caches.delete(key) )
      )
    })
  )
})

self.addEventListener( 'fetch', evt => {

  console.log(evt)

  evt.respondWith(
    caches.match( evt.request ).then( cacheRes => {
      return cacheRes || fetch(evt.request).then( fetchRes => {
        return caches.open(dynamicCacheName).then( cache => {
          cache.put( evt.request.url, fetchRes.clone() )
          limitCacheSize( dynamicCacheName, 15 )
          return fetchRes
        })
      })
    }).catch(() => {
      if(evt.request.url.indexOf(".html") > -1 ) {
        return caches.match('pages/default.html')
      }
    })
  )

})
