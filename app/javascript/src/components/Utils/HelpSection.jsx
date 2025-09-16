import Swal from 'sweetalert2'
export function HelpSection() {
  return Swal.fire({
    title: 'Host Help',
    html:
      '<h4>Game Operations</h4>' +
      'Game Basics <br />' +
      '<p style="color:black; font-weight:600">' +
      '1️⃣ <b>Configure & Start </b><br />' +
      ' <i> Change it up from round to round</i> <br />' +
      '2️⃣ <b>Narrate & Engage</b> <br />' +
      ' <i> Call out events, get audience involved</i> <br />' +
      '3️⃣ <b>Draw & Reward</b><br />' +
      ' <i> Draw at the END of the round, celebrate</i> <br />' +
      '4️⃣ <b>Repeat/Reveal</b> <br />' +
      ' <i> Add another round or end & reveal</i>  <br />' +
      '</p>' +
      'Game Format <br />' +
      '<p style="color:black; font-weight:600">' +
      '<b>Games consist of 5 escalating rounds:</b><br />' +
      '</p>' +
      '<table border=1 style="color:black; font-weight:600">' +
      '<tr><td>&nbsp;</td><td>Songs</td><td>Points</td><td>Timer</td><td>Advance</td><td>Prizes</td><td>Break</td></tr>' +
      '<tr><td><b> 1 </b></td><td>11</td><td>100</td><td>80</td><td>⏸</td><td>🎰</td><td>10m</td></tr>' +
      '<tr><td><b> 2 </b></td><td>8</td><td>125</td><td>75</td><td>⏸</td><td>🎰</td><td>10m</td></tr>' +
      '<tr><td><b> 3 </b></td><td>5</td><td>150</td><td>70</td><td>⏸</td><td>🎰</td><td>5m</td></tr>' +
      '<tr><td><b> 4 </b></td><td>3</td><td>200</td><td>60</td><td>⏸</td><td>&nbsp;</td><td>&nbsp;</td></tr>' +
      '<tr><td><b> 5 </b></td><td>1</td><td>500</td><td>50</td><td>⏹</td><td>🎰🏆</td><td>&nbsp;</td></tr>' +
      '</table>' +
      '<p style="color:black; font-weight:600">' +
      '<b>Legend: </b> [⏸ Manual Advance] [▶️ Auto Advance] [⏹ Game End] [🎰 Drawing] [🏆 Final Scores] <br /> ' +
      '</p>' +
      '<h4>Troubleshooting</h4>' +
      'Game not working as expected? We got ya! <br />' +
      '<p style="color:black; font-weight:600">' +
      'Use options from GAME RESCUE on the remote control <br />' +
      '<i class="fa fa-repeat"> 1)</i> REFRESH - refreshes your hosting interface <br />' +
      '<i class="fa fa-refresh"> 2)</i> RECOVER - refreshes the game interface <br />' +
      '<i class="fa fa-sign-in"> 3)</i> RECONFIG - pushes a new config to current round <br />' +
      '<i class="fa fa-power-off"> 4)</i> RESET - kills current game and starts a new one*.  </p>' +
      '<div style="background:#ddd; color:red; font-weight:600">' +
      '*If you reset, make sure to select <b>EXISTING SESSION</b> to keep points and tickets! <br />Tell players about new game code.<br />' +
      '**If you are using a Mayhem Appliance and nothing above works, <b>REBOOT</b> the device. </div>' +
      '<p style="color:black; font-weight:600"> Still down? No worries, call or text Andrew at <a href="tel:6125985788">612.598.5788</a></p>' +
      'Common Player Problems <br />' +
      '<p style="color:black; font-weight:600">' +
      '<b>1) Refresh</b> - have player refresh their browser <br />' +
      '<b>2) Rejoin</b> - have player re-enter game code <br />' +
      '<b>3) Check Browser</b> - make sure they are only using one browser. sometimes phones open up different ones after clicking on mail links. <br />' +
      '<b>4) Login</b> - have them close the tab/browser and start over from gomayhem.com  <br />' +
      '</p>' +
      '<h4>Hosting Tips</h4>' +
      'Audience engagement is the key to growing your audience! <br />' +
      '<p style="color:black; font-weight:600">' +
      '⭐️ Ask bonus questions to give out extra Picks and Tickets (i.e. what year was this song released?) <br />' +
      '⭐️ Use <a href="https://songfacts.com" target=_blank>SongFacts.com</a> to find interesting tidbits about artists and songs <br />' +
      '⭐️ During configuration, use different Game Profiles to change the game pace <br />' +
      '⭐️ Ask audience members what music they like and adjust accordingly <br />' +
      '⭐️ Make the audience part of your show by asking questions and teasing <br />' +
      '⭐️ Use suspense to get attention - who is going to win?? <br />' +
      '⭐️ Call out good-natured rivalries and inter-team drama  <br />' +
      '⭐️ Publicly give out extra Tickets and Picks to people who do good things like bring new players or add extra trivia tidbits <br />' +
      '⭐️ Celebrate new players on the leaderboard <br />' +
      '⭐️ Watch for players who are struggling and give them a little help or extra hints <br />' +
      '</p>' +
      "Good Talk, now go get 'em, Tiger!",
    showCloseButton: true,
    confirmButtonColor: '#3085d6',
    confirmButtonText: 'Close',
  })
}
