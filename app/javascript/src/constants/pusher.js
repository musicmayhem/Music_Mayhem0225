/*global document Pusher */
let pusherAppKey = document.querySelector('meta[name="pusher-key"]').content
const pusher = new Pusher(pusherAppKey, {
  wsHost: 'ws.pusherapp.com',
  httpHost: 'sockjs.pusher.com',
  encrypted: true,
})

export default pusher
