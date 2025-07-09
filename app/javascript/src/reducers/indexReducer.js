import {
  CAREER_DATA_SUCCESS,
  INDEX_LOADING,
  GET_INDEX_DATA_SUCCESS,
  INDEX_FAIL,
  INDEX_SUCCESS,
  INVITATION_SUCCESS,
  INVITATION_FAIL,
  INVITATION_SENDING,
  ACCOUNT_SETTING,
  GAME_HISTORY,
} from '../constants/indexConstants'
const initialState = {
  message: null,
  getting_data: false,
}

export default function reducer(state = initialState, action) {
  switch (action.type) {
    case CAREER_DATA_SUCCESS:
      return {
        ...state,
        getting_data: true,
        username: action.result.username,
        logo: action.result.current_account_logo,
        played_games: action.result.played_games,
        points: action.result.total_points,
        games_won: action.result.games_won,
        avg_points: action.result.avg_points,
        games_played_count: action.result.games_played_count,
        winning_percentage: action.result.winning_percentage,
        best_era: action.result.best_era,
        best_genre: action.result.best_genre,
        max_score: action.result.max_score,
        muted: action.result.muted,
        userEra: action.result.userEra,
        userGenre: action.result.userGenre,
      }
    case GET_INDEX_DATA_SUCCESS:
      return {
        ...state,
        getting_data: true,
        username: action.result.username,
        logo: action.result.current_account_logo,
        played_games: action.result.played_games,
        points: action.result.total_points,
        games_won: action.result.games_won,
        avg_points: action.result.avg_points,
        plan: action.result.plan,
        games_played_count: action.result.games_played_count,
      }
    case INDEX_LOADING:
      return { ...state, indexLoading: true, indexLoaded: false }
    case ACCOUNT_SETTING:
      return {
        ...state,
        current_account: action.result.current_account,
        current_account_logo: action.result.current_account_logo,
        percent: action.result.percent,
        userEra: action.result.userEra,
        userGenre: action.result.userGenre,
      }
    case GAME_HISTORY:
      return { ...state, getting_data: true, played_games: action.result.played_games }
    case INDEX_SUCCESS:
      var account = action.result
      return {
        ...state,
        indexLoading: false,
        indexLoaded: true,
        username: account.username,
        logo: account.profile,
        played_games: account.played_games,
        points: account.total_points,
        games_won: account.games_won,
        avg_points: account.avg_points,
        plan: account.plan,
        games_played_count: account.games_played_count,
        best_era: account.best_era,
        best_genre: account.best_genre,
        winning_percentage: account.winning_percentage,
        max_score: account.max_score,
        current_account: account.current_account,
        percent: account.percent,
        current_account_logo: account.current_account_logo,
      }
    case INDEX_FAIL:
      return { ...state, indexLoading: false, indexLoaded: false }
    case INVITATION_SENDING:
      return { ...state, inviteSending: true, inviteSend: false }
    case INVITATION_SUCCESS:
      return { ...state, inviteSending: false, inviteSend: true, response: action.result }
    case INVITATION_FAIL:
      return { ...state, inviteSending: false, inviteSend: false }
    default:
      return state
  }
}
