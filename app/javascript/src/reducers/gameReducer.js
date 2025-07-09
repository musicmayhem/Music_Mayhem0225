import {
  GET_PLAYLIST_AND_AD_CAMP,
  GET_PLAYLIST_AND_AD_CAMP_FAIL,
  GET_PLAYLIST_AND_AD_CAMP_SUCCESS,
  GAME_SUCCESS,
  START_GAME,
  GAME_FAIL,
  UPDATE_REQUEST,
  UPDATE_REQUEST_FAIL,
  UPDATE_REQUEST_SUCCESS,
  STARTING_ROUND_SUCCESS,
  STARTING_ROUND_FAIL,
  STARTING_ROUND,
  LOADING_SONG_FAIL,
  LOADING_SONG,
  LOADING_SONG_SUCCESS,
  STARTING_NEW_GAME,
  STARTING_NEW_GAME_FAIL,
  STARTING_NEW_GAME_SUCCESS,
  GAME_DATA_FAIL,
  GAME_DATA_SUCCESS,
  GET_GAME_DATA,
  GET_GAME_PROFILES,
  GET_GAME_PROFILES_FAIL,
  GET_GAME_PROFILES_SUCCESS,
  UPDATING_GAME,
  UPDATING_GAME_FAIL,
  UPDATING_GAME_SUCCESS,
  ADD_NEW_ROUND,
  ADD_NEW_ROUND_SUCCESS,
  ADD_NEW_ROUND_FAIL,
  GET_OPEN_SESSION_LIST,
  GET_OPEN_SESSION_LIST_FAIL,
  GET_OPEN_SESSION_LIST_SUCCESS,
  CLOSING_OPEN_SESSION,
  CLOSING_OPEN_SESSION_FAIL,
  CLOSING_OPEN_SESSION_SUCCESS,
  GET_OPEN_SERIES_LIST_SUCCESS,
  GET_SERIES_DETAIL,
  CLOSING_OPEN_SERIES_SUCCESS,
  CLOSING_SERIES_SESSION_SUCCESS,
  GET_SERIES_SCORE,
  RESET_GAME_CONFIGURATION,
  START_DEMO_GAME,
  START_DEMO_GAME_FROM_HEADER,
  GETTING_REMOTE_DATA,
  GETTING_REMOTE_DATA_FAIL,
  GETTING_REMOTE_DATA_SUCCESS,
  SKIP_SONG_SUCCESS,
  SKIP_SONG,
  RESET_GAME_DATA,
  START_APPLIANCE_GAME,
  GET_SERIES_GAMES,
  CREATE_GAME_FROM_HEADER,
  RESET_GAME,
  GAME_PLAYERS,
  GIFTING_DATA,
  GAME_LEADERBOARD,
  CURRENT_POINTS,
  GET_SONG_DATA,
  POSTING,
  SELECTED_SONG_SKIPPED,
  ADD_FEEDBACK,
  GIFT_TICKETS,
  UPDATE_APPLIANCE,
  GET_TRIVIA_ASSETS,
} from '../constants/gameConstants'

import { GETTING_DATA, GETTING_FAILED } from '../constants/routeConstants'
const initialState = {
  message: null,
  game: null,
}

export default function reducer(state = initialState, action) {
  switch (action.type) {
    case GIFT_TICKETS:
      return { ...state }
    case ADD_FEEDBACK:
      return { ...state, feedbackUpdated: true }
    case POSTING:
      return { ...state, skipping: true }
    case SELECTED_SONG_SKIPPED:
      return {
        ...state,
        songsData: action.result.songsData,
        song_order_ids: action.result.songsList,
        rounds: action.result.roundData,
        totalSongCount: action.result.totalSongCount,
        currentSongCount: action.result.currentSongCount,
        songCount: action.result.songCount,
        skipping: false,
      }
    case GET_SONG_DATA:
      return {
        ...state,
        songsData: action.result.songsData,
        song_order_ids: action.result.songsList,
        rounds: action.result.roundData,
        totalSongCount: action.result.totalSongCount,
        currentSongCount: action.result.currentSongCount,
        songCount: action.result.songCount,
        feedbackUpdated: false,
      }
    case CURRENT_POINTS:
      return { ...state, players: action.result.players, points: action.result.points }
    case GAME_LEADERBOARD:
      return { ...state, leaderboard: action.result.leaderboard, songWinners: action.result.songWinners }
    case GIFTING_DATA:
      return { ...state, series: action.result.series, players: action.result.players, game: action.result.game }
    case RESET_GAME:
      return {
        ...state,
        new_code: action.result.new_code,
        game: action.result.game,
        songs_url: action.result.songs_url,
        rounds: action.result.round,
        state: action.result.state,
      }
    case GAME_PLAYERS:
      return { ...state, gamePlayers: action.result.game_players, allPlayers: action.result.allPlayers }
    case GET_SERIES_GAMES:
      return { ...state, series_data: action.result.series }
    case START_APPLIANCE_GAME:
      return {
        ...state,
        game: action.result.game,
        songs_url: action.result.songs_url,
        rounds: action.result.round,
        state: action.result.state,
      }
    case START_DEMO_GAME_FROM_HEADER:
      return {
        ...state,
        startPage: false,
        header: true,
        demoGame: action.result.game,
        demoPlayer: action.result.demo_player,
        gettingData: false,
      }
    case START_DEMO_GAME:
      return {
        ...state,
        startPage: true,
        header: false,
        demoGame: action.result.game,
        demoPlayer: action.result.demo_player,
        gettingData: false,
      }
    case RESET_GAME_DATA:
      return {
        ...state,
        loaded_song: null,
        state: null,
        reveal_sequence: null,
        song_order_ids: null,
        game: null,
        songs_url: null,
        rounds: null,
        already_played_song_ids: null,
        songSkipped: true,
      }
    case GET_SERIES_SCORE:
      return {
        ...state,
        gettingSeriesScore: false,
        seriesScoreRecieved: true,
        seriesScore: action.result.series_score,
        seriesWiseScore: action.result.series_wise_score,
      }
    case CLOSING_SERIES_SESSION_SUCCESS:
      return {
        ...state,
        closingSeriesSessions: false,
        seriesSessionsClosed: true,
        seriesSessions: action.result.session_list,
        series: action.result.series,
        sessionList: action.result.session_list,
      }
    case CLOSING_OPEN_SERIES_SUCCESS:
      return {
        ...state,
        closingOpenSeries: false,
        openSeriesCLosed: true,
        seriesSessions: null,
        seriesList: action.result.series_list,
        series: action.result.series,
        sessionList: action.result.session_list,
      }
    case GET_SERIES_DETAIL:
      return {
        ...state,
        gettingSeriesData: false,
        gotSeriesData: true,
        seriesData: action.result.series,
        seriesSessions: action.result.series_sessions,
      }
    case GETTING_DATA:
      return { ...state, gettingData: true, gotData: false }
    case GETTING_FAILED:
      return {
        ...state,
        gettingData: false,
        gotData: false,
        errors: action.result.error
          ? action.result.error
          : Object.entries(action.result.errors)
              .map(m => m.join(' '))[0]
              .replace('_', ' '),
      }
    case GET_OPEN_SERIES_LIST_SUCCESS:
      return { ...state, gettingOpenSeriesList: false, gotOpenSeriesList: true, seriesList: action.result.series_list }
    case CLOSING_OPEN_SESSION:
      return { ...state, closingOpenSession: true, openSessionCLosed: false }
    case CLOSING_OPEN_SESSION_SUCCESS:
      return { ...state, closingOpenSession: false, openSessionCLosed: true, sessionList: action.result.session_list }
    case CLOSING_OPEN_SESSION_FAIL:
      return {
        ...state,
        closingOpenSession: false,
        openSessionCLosed: false,
        errors: action.result.error
          ? action.result.error
          : Object.entries(action.result.errors)
              .map(m => m.join(' '))[0]
              .replace('_', ' '),
      }
    case GET_OPEN_SESSION_LIST:
      return { ...state, gettingOpenSessionsList: true, gotOpenSessionList: false }
    case GET_TRIVIA_ASSETS:
      return { ...state, trivia_assets: action.result.trivia_assets }
    case GET_OPEN_SESSION_LIST_SUCCESS:
      return {
        ...state,
        gettingOpenSessionsList: false,
        gotOpenSessionList: true,
        sessionList: action.result.session_list,
        seriesList: action.result.series_list,
      }
    case GET_OPEN_SESSION_LIST_FAIL:
      return {
        ...state,
        gettingOpenSessionsList: false,
        gotOpenSessionList: false,
        errors: action.result.error
          ? action.result.error
          : Object.entries(action.result.errors)
              .map(m => m.join(' '))[0]
              .replace('_', ' '),
      }
    case ADD_NEW_ROUND:
      return { ...state, addingNewRound: true, roundAdded: false }
    case ADD_NEW_ROUND_SUCCESS:
      return { ...state, addingNewRound: false, roundAdded: true }
    case ADD_NEW_ROUND_FAIL:
      return {
        ...state,
        addingNewRound: false,
        roundAdded: false,
        errors: action.result.error
          ? action.result.error
          : Object.entries(action.result.errors)
              .map(m => m.join(' '))[0]
              .replace('_', ' '),
      }
    case SKIP_SONG:
      return { ...state, skippingSong: true, songSkipped: false, current_song: null, next_song: null, skipping: true }
    case SKIP_SONG_SUCCESS:
      return {
        ...state,
        skippingSong: false,
        songSkipped: true,
        game: action.result.game,
        current_song: action.result.current_song,
        next_song: action.result.next_song,
        skipping: false,
        song_order_ids: action.result.songOrderIds,
      }
    case GETTING_REMOTE_DATA:
      return { ...state, gettingRemoteData: true, remoteDataRecieved: false }
    case GETTING_REMOTE_DATA_SUCCESS:
      return {
        ...state,
        gettingRemoteData: false,
        remoteDataRecieved: true,
        game: action.result.game,
        current_song: action.result.current_song,
        next_song: action.result.next_song,
      }
    case GETTING_REMOTE_DATA_FAIL:
      return {
        ...state,
        gettingRemoteData: false,
        remoteDataRecieved: false,
        errors: action.result.error
          ? action.result.error
          : Object.entries(action.result.errors)
              .map(m => m.join(' '))[0]
              .replace('_', ' '),
      }
    case UPDATING_GAME:
      return { ...state, updatingGame: true, gameUpdated: false }
    case RESET_GAME_CONFIGURATION:
      return { ...state, updatingGame: false, gameUpdated: false }
    case UPDATING_GAME_SUCCESS:
      return {
        ...state,
        updatingGame: false,
        gameUpdated: true,
        game: action.result.game,
        songs_url: action.result.songs_url,
        rounds: action.result.rounds,
      }
    case UPDATING_GAME_FAIL:
      return {
        ...state,
        updatingGame: false,
        gameUpdated: false,
        errors: action.result.error
          ? action.result.error
          : Object.entries(action.result.errors)
              .map(m => m.join(' '))[0]
              .replace('_', ' '),
      }
    case GET_GAME_PROFILES:
      return { ...state, gettingGameProfiles: true, gameProfileRecieved: false }
    case GET_GAME_PROFILES_SUCCESS:
      return { ...state, gettingGameProfiles: false, gameProfileRecieved: true, profile: action.result.profile }
    case GET_GAME_PROFILES_FAIL:
      return {
        ...state,
        gettingGameProfiles: false,
        gameProfileRecieved: false,
        errors: action.result.error
          ? action.result.error
          : Object.entries(action.result.errors)
              .map(m => m.join(' '))[0]
              .replace('_', ' '),
      }
    case GET_GAME_DATA:
      return { ...state, gettingGameData: true, gameDataRecieved: false }
    case GAME_DATA_SUCCESS:
      return {
        ...state,
        gettingGameData: false,
        gameDataRecieved: true,
        game: action.result.game,
        songs_url: action.result.songs_url,
        rounds: action.result.rounds,
        current_account_games_played: action.result.current_account_games_played,
        round_count: action.result.round_count,
        total_songs_count: action.result.total_songs_count,
        state: action.result.state,
        already_played_song_ids: action.result.already_played_song_ids,
        adv_images: action.result.advertise_images,
        advertise_time: action.result.advertise_time,
        current_session: action.result.current_session,
        current_profile: action.result.current_profile,
        player_limit_exceeds: action.result.player_limit_exceeds,
        series_name: action.result.series_name,
      }
    case GAME_DATA_FAIL:
      return {
        ...state,
        gettingGameData: false,
        gameDataRecieved: false,
        errors: action.result.error
          ? action.result.error
          : Object.entries(action.result.errors)
              .map(m => m.join(' '))[0]
              .replace('_', ' '),
      }
    case GET_PLAYLIST_AND_AD_CAMP:
      return { ...state, gettingPlaylist: true, playlistGenerated: false }
    case GET_PLAYLIST_AND_AD_CAMP_SUCCESS:
      return {
        ...state,
        gettingPlaylist: false,
        playlistGenerated: true,
        playlist: action.result.playlists,
        playlistData: action.result.playlist_data,
        campaign: action.result.campaign,
        state: action.result.state,
      }
    case GET_PLAYLIST_AND_AD_CAMP_FAIL:
      return {
        ...state,
        gettingPlaylist: false,
        playlistGenerated: false,
        errors: action.result.error
          ? action.result.error
          : Object.entries(action.result.errors)
              .map(m => m.join(' '))[0]
              .replace('_', ' '),
      }
    case START_GAME:
      return { ...state, startingGame: true, gameStarted: false, game: null }
    case CREATE_GAME_FROM_HEADER:
      return {
        ...state,
        indexPage: false,
        header: true,
        startingGame: false,
        gameStarted: true,
        game: action.result.game,
        songs_url: action.result.songs_url,
        rounds: action.result.round,
        state: action.result.state,
      }
    case GAME_SUCCESS:
      return {
        ...state,
        indexPage: true,
        header: false,
        startingGame: false,
        gameStarted: true,
        game: action.result.game,
        songs_url: action.result.songs_url,
        rounds: action.result.round,
        state: action.result.state,
      }
    case GAME_FAIL:
      return {
        ...state,
        startingGame: false,
        gameStarted: false,
        errors: action.result.error
          ? action.result.error
          : Object.entries(action.result.errors)
              .map(m => m.join(' '))[0]
              .replace('_', ' '),
      }
    case UPDATE_REQUEST:
      return { ...state, updatingRequest: true, updatedRequest: false }
    case UPDATE_REQUEST_SUCCESS:
      return {
        ...state,
        updatingRequest: false,
        updatedRequest: true,
        game: action.result.game,
        rounds: action.result.rounds,
        state: action.result.state,
      }
    case UPDATE_REQUEST_FAIL:
      return {
        ...state,
        updatingRequest: false,
        updatedRequest: false,
        errors: action.result.error
          ? action.result.error
          : Object.entries(action.result.errors)
              .map(m => m.join(' '))[0]
              .replace('_', ' '),
      }
    case STARTING_ROUND:
      return { ...state, startingRound: true, startedRound: false }
    case UPDATE_APPLIANCE:
      return { ...state, appliance_updated: action.result.appliance_updated }
    case STARTING_ROUND_SUCCESS:
      return {
        ...state,
        startingRound: false,
        startedRound: true,
        game: action.result.game,
        rounds: action.result.round,
        state: action.result.state,
      }
    case STARTING_ROUND_FAIL:
      return {
        ...state,
        startingRound: false,
        startedRound: false,
        errors: action.result.error
          ? action.result.error
          : Object.entries(action.result.errors)
              .map(m => m.join(' '))[0]
              .replace('_', ' '),
      }
    case LOADING_SONG:
      return { ...state, loadingSong: true, songLoaded: false }
    case LOADING_SONG_SUCCESS:
      return {
        ...state,
        loadingSong: false,
        songLoaded: true,
        loaded_song: action.result.loaded_song,
        state: action.result.state,
        reveal_sequence: action.result.reveal_sequence,
        song_order_ids: action.result.song_order_ids,
      }
    case LOADING_SONG_FAIL:
      return {
        ...state,
        loadingSong: false,
        songLoaded: false,
        errors: action.result.error
          ? action.result.error
          : Object.entries(action.result.errors)
              .map(m => m.join(' '))[0]
              .replace('_', ' '),
      }
    case STARTING_NEW_GAME:
      return { ...state, startingNewGame: true, startedNewGame: false }
    case STARTING_NEW_GAME_SUCCESS:
      return {
        ...state,
        startingNewGame: false,
        startedNewGame: true,
        game: action.result.game,
        songs_url: action.result.songs_url,
        rounds: action.result.round,
        state: action.result.state,
      }
    case STARTING_NEW_GAME_FAIL:
      return {
        ...state,
        startingNewGame: false,
        startedNewGame: false,
        errors: action.result.error
          ? action.result.error
          : Object.entries(action.result.errors)
              .map(m => m.join(' '))[0]
              .replace('_', ' '),
      }
    default:
      return state
  }
}
