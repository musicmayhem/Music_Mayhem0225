import React from "react";
import StartPage from "../components/StartPage";
import Login from "../components/Login";
import Header from "../components/Header";
import SeriesTable from "../components/SeriesTable";
import Registration from "../components/Registration";
import Leaderboard from "../components/Leaderboard";
import FinalLeaderboard from "../components/FinalLeaderboard";
import Advertisement from "../components/Advertisement";
import Index from "../components/Index";
import PlayerCareer from "../components/PlayerCareer";
import RegistrationWelcome from "../components/RegistrationWelcome";
import GameHistory from "../components/GameHistory";
import PurchasePlan from "../components/PurchasePlan";
import Plan from "../components/Plan";
import ConfirmOTP from "../components/ConfirmOtp";
import ChangePassword from "../components/ChangePassword";
import ResetPasswordEmail from "../components/ResetPasswordEmail";
import AccountSetting from "../components/AccountSetting";
import SoloGame from "../components/SoloGame";
import Timer from "../components/Timer";
import Help from "../components/Help";
import Setting from "../components/Setting";
import PlayerGuessScreen from "../components/PlayerGuessScreen";
import MusicMayhemGame from "../components/MusicMayhemGame";
import MusicMayhemClient from "../components/MusicMayhemClient";
import PlayGameAs from "../components/PlayGameAs";
import PlayerSongEnd from "../components/PlayerSongEnd";
import PlayerGameEnd from "../components/PlayerGameEnd";
import Loader from "../components/Loader";
import GameConfiguration from "../components/GameConfiguration";
import GameRemote from "../components/GameRemote";
import Appliance from "../components/Appliance";
import SessionList from "../components/SessionList";
import ConfirmationPage from "../components/ConfirmationPage";
import PlayerScore from "../components/PlayerScore";
import GameCode from "../components/Monitor/GameCode";
import MusicMayhemMirror from "../components/Monitor/MusicMayhemMirror";
import StandardTriviaGame from "../components/StandardTriviaGame";
import MayhemMatesGame from "../components/MayhemMatesGame";
import LiveGifting from "../components/PPTS/LiveGifting";
import SlotMachine from "../components/slotMachine/SlotMachine";
import SeriesSummary from "../components/SeriesSummary";
import CenteredVideoPlayer from "../components/CenteredVideoPlayer";
import { BrowserRouter as Router, Route } from "react-router-dom";

class Routes extends React.Component {
  render() {
    return (
      <Router>
        <div>
          <Route component={Header} />
          <Route exact path="/" component={StartPage} />
          <Route
            {...this.props}
            path="/player_song_end"
            component={PlayerSongEnd}
          />
          <Route
            {...this.props}
            path="/player_game_end"
            component={PlayerGameEnd}
          />
          <Route {...this.props} path="/login" component={Login} />
          <Route {...this.props} path="/accounts/sign_in" component={Login} />
          <Route {...this.props} path="/sign_up" component={Registration} />
          <Route {...this.props} path="/index" component={Index} />
          <Route {...this.props} path="/countdown" component={Timer} />
          <Route
            {...this.props}
            path="/welcome"
            component={RegistrationWelcome}
          />
          <Route {...this.props} path="/confirm-otp" component={ConfirmOTP} />
          <Route {...this.props} path="/career" component={PlayerCareer} />
          <Route {...this.props} path="/history" component={GameHistory} />
          <Route {...this.props} path="/leaderboard" component={Leaderboard} />
          <Route
            {...this.props}
            path="/final_result"
            component={FinalLeaderboard}
          />
          <Route {...this.props} path="/ad" component={Advertisement} />
          <Route {...this.props} path="/plan" component={Plan} />
          <Route {...this.props} path="/buy_plan" component={PurchasePlan} />
          <Route
            {...this.props}
            path="/accounts/password/edit"
            component={ChangePassword}
          />
          <Route
            {...this.props}
            path="/reset_password_email"
            component={ResetPasswordEmail}
          />
          <Route
            {...this.props}
            path="/accounts/setting"
            component={AccountSetting}
          />
          <Route {...this.props} path="/solo" component={SoloGame} />
          <Route {...this.props} path="/help" component={Help} />
          <Route {...this.props} path="/setting" component={Setting} />
          <Route
            {...this.props}
            path="/games/:game_code"
            component={MusicMayhemGame}
          />
          <Route
            {...this.props}
            path="/config/:game_code"
            component={GameConfiguration}
          />
          <Route
            {...this.props}
            path="/player/:game_code"
            component={MusicMayhemClient}
          />
          <Route {...this.props} path="/guess" component={PlayerGuessScreen} />
          <Route
            {...this.props}
            exact
            path="/players/:game_code"
            component={PlayGameAs}
          />
          <Route
            {...this.props}
            exact
            path="/remote/:game_code"
            component={GameRemote}
          />
          <Route {...this.props} path="/demo" component={StartPage} />
          <Route
            {...this.props}
            path="/vdemo"
            component={CenteredVideoPlayer}
          />
          <Route {...this.props} path="/loader" component={Loader} />
          <Route {...this.props} path="/appliance" component={Appliance} />
          <Route {...this.props} exact path="/series" component={SessionList} />
          <Route {...this.props} path="/my_score" component={PlayerScore} />
          <Route
            {...this.props}
            path="/table/:game_code"
            component={SeriesTable}
          />
          <Route {...this.props} path="/confirm" component={ConfirmationPage} />
          <Route
            {...this.props}
            path="/gifting/:game_code"
            component={LiveGifting}
          />
          <Route
            {...this.props}
            path="/slot/:game_code"
            component={SlotMachine}
          />
          <Route
            {...this.props}
            path="/trivia/:game_code"
            component={StandardTriviaGame}
          />
          <Route
            {...this.props}
            path="/mayhem_mates/:game_code"
            component={MayhemMatesGame}
          />
          <Route
            {...this.props}
            path="/trivia_player/:game_code"
            component={Help}
          />
          <Route {...this.props} path="/monitor" component={GameCode} />
          <Route
            {...this.props}
            path="/mirror/:game_code"
            component={MusicMayhemMirror}
          />
          <Route
            {...this.props}
            exact
            path="/series/:series_name"
            component={SeriesSummary}
          />
        </div>
      </Router>
    );
  }
}

export default Routes;
