import { GET_MIRROR_DATA } from '../constants/mirror'

const initialState = {
  data: false,
}

export default function reducer(state = initialState, action) {
  switch (action.type) {
    case GET_MIRROR_DATA:
      return {
        ...state,
        game: action.result.game,
        round_count: action.result.round_count,
        already_played_song_ids: action.result.already_played_song_ids,
        current_session: action.result.current_session,
        players_count: action.result.players_count,
        rounds: action.result.rounds,
        songs_url: action.result.songs_url,
        advertise_time: action.result.advertise_time,
        advertise_images: action.result.advertise_images,
        total_songs_count: action.result.total_songs_count,
        current_profile: action.result.currentProfile,
        series_name: action.result.series_name,
        data: true,
      }
    default:
      return state
  }
}
