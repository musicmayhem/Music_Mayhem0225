export const INTERJECTIONS = ['WOW!', 'WOOT!', 'POW!', 'BLAMMO!', 'HUZZAH!', 'BAM!', 'ZOIKS!', 'BOO-YA!', 'ZAP!', 'BOOM!', 'ZOWIE!', 'OOOOO!', 'YEAH!', 'UH HUH!', 'YUP!', 'HOORAH!', 'OLE!', 'TA-DA!', 'VIOLA!', 'YEEHAW!', 'YOWZA!', 'HEY HEY!', 'WOWEE!', 'DAAANG!', 'EGADS!', 'GADZOOKS!', 'AWESOME!', 'BADA BING!', 'BINGO!', 'BRAVO!', 'BRILLIANT!', 'COWABUNGA!', 'EXCELLENT!', 'FANTASTIC!', 'FAB!', 'GREAT BALLS OF FIRE!', 'HALLELUJA!', 'HOO-WEE!', 'KABOOM!', 'KAPOW!', 'BIFF!', 'YABBA DABBA DOO!', 'WELL WELL WELL!', 'JEAH!', 'DING DING DING!', 'A-OOOOGA!', 'WELL I\'LL BE!', 'LOOK-EE HERE!', 'SHUCKS!', 'SHOOT!', 'BLAM!', 'KA-CHOW!', 'THERE IT IS!', 'STAND BACK!'];
export const INTERJECTION = INTERJECTIONS[Math.floor(Math.random() * INTERJECTIONS.length)]

export const songFadeOut = () => {
  let player = document.getElementById('songPlayer')
  if (player && player.volume > 0.1) {
    setTimeout(() => {
      player.volume = Math.abs(Math.round((player.volume - 0.1) * 100) / 100)
      songFadeOut()
    }, 1000)
  }
 }

export const changeSongVolume = p => {
  let player = document.getElementById('songPlayer')
  let bcgPlayer = document.getElementById('backgroundSongPlayer')
  if (bcgPlayer) {
    if (p == 'volume_bcg_up' && bcgPlayer.volume < 1)
      bcgPlayer.volume = Math.abs(Math.round((bcgPlayer.volume + 0.1) * 10000) / 10000)
    else if (p == 'volume_bcg_down' && bcgPlayer.volume > 0.10000000000000014)
      bcgPlayer.volume = Math.abs(Math.round((bcgPlayer.volume - 0.1) * 10000) / 10000)
  }
  if (player) {
    if (p == 'volume_up' && player.volume < 1)
      player.volume = Math.abs(Math.round((player.volume + 0.1) * 10000) / 10000)
    else if (p == 'volume_down' && player.volume > 0.10000000000000014)
      player.volume = Math.abs(Math.round((player.volume - 0.1) * 10000) / 10000)
  }
}
