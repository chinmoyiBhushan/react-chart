import React from 'react'
import {createMuiTheme} from "@material-ui/core/styles";
import {ThemeProvider} from "@material-ui/styles";
import AppBar from "@material-ui/core/AppBar";
import Toolbar from "@material-ui/core/Toolbar";
import Typography from "@material-ui/core/Typography";
import MenuItem from "@material-ui/core/MenuItem";
import TextField from "@material-ui/core/TextField";
import Breadcrumbs from "@material-ui/core/Breadcrumbs";
import Link from "@material-ui/core/Link";
// import Button from "@material-ui/core/Button";
import IconButton from "@material-ui/core/IconButton";
import MenuIcon from "@material-ui/icons/Menu";
import NavigateNextIcon from "@material-ui/icons/NavigateNext";
import Chart from 'react-apexcharts'
import {withStyles} from '@material-ui/core/styles';
import "./App.css";

const theme = createMuiTheme({
  palette: {
    type: "dark",
  },
});

const useStyles = theme => ({
  root: {
    flexGrow: 1,
  },
  menuButton: {
    marginRight: theme.spacing(2),
  },
  title: {
    flexGrow: 1,
  },
  season: {
    width: '5em',
  },
});

class App extends React.Component {
  years = Array(10).fill(0).map((_, i) => 2021 - i*5)
  constructor(props) {
    super(props);
    this.state = {
      year: '',
      currTeam: '',
      teams: [],
      players: [],
    }
    
    // Bind `this` to all methods
    ;['handleYearChange', 'getTeamsForYear', 'generateTeamCard', 'goBack'].forEach(meth => this[meth] = this[meth].bind(this));
  }
  async componentDidMount() {
    if (this.state.players.length) return
    const players = await window.fetch('http://lookup-service-prod.mlb.com/json/named.search_player_all.bam?sport_code=%27mlb%27&active_sw=%27Y%27&name_part=%27%25%27')
      .then(resp => resp.json())
      .then(json => json.search_player_all.queryResults.row)
    this.setState({players})
  }
  async handleYearChange(event) {
    const year = event.target.value
    const teams = await this.getTeamsForYear(year)
    this.setState({year, teams});
  }
  getTeamsForYear(year) {
    return window.fetch(`https://lookup-service-prod.mlb.com/json/named.team_all_season.bam?sport_code=%27mlb%27&all_star_sw=%27N%27&sort_order=name_asc&season=%27${year}%27`)
      .then(resp => resp.json())
      .then(json => json.team_all_season.queryResults.row)
  }
  generateTeamCard(team) {
    const {name_display_full, phone_number, name_abbrev, state} = team
    return (
      <article key={name_abbrev} className="team" onClick={this.openTeam.bind(this, name_abbrev)}>
        <img src={`/flags/${state}.png`} alt={`Flag for ${state}`}></img>
        <header className="content">
          <span className="name">{name_display_full}</span>
          <span className="phone">{phone_number}</span>
          <span className="abbrev">{name_abbrev}</span>
        </header>
      </article>
    )
  }
  openTeam(team) {
    this.setState({currTeam: team})
  }
  inchesToHumanHeight(inch) {
    const ft = Math.floor(inch / 12)
    inch = inch % 12
    return `${ft}' ${inch}''`
  }
  generateTeamInfo() {
    const {inchesToHumanHeight} = this
    const teamPlayers = this.state.players.filter(p => p.team_abbrev === this.state.currTeam)
    const series = [{
      name: 'height',
      data: teamPlayers.map(({weight, height_feet, height_inches}) => [+weight, Number(height_feet)*12 + Number(height_inches), {height_feet, height_inches}]),
    }]
    const chartOps = {
      chart: {
        id: 'apexchart-example',
        height: 350,
        type: 'scatter',
      },
      xaxis: {
        tickAmount: 10,
      },
      yaxis: {
        tickAmount: 7
      },
      tooltip: {
        theme: 'dark',
        custom: function({series, seriesIndex, dataPointIndex}) {
          return `<div class="arrow_box">
            <aside class="player-name">${teamPlayers[dataPointIndex].name_display_last_first}</aside>
            <b>Height:</b> <span>${inchesToHumanHeight(series[seriesIndex][dataPointIndex])}</span>
          </div>`
        },
      }
    }
    return (
      <>
        <h3>Lifetime Players on Team: {teamPlayers.length}</h3>
        <Chart options={chartOps} series={series} type="scatter" />
        {teamPlayers.map(p => <aside className="player" key={p.player_id}>{p.name_display_last_first}</aside>)}
      </>
    )
  }
  goBack() {
    this.setState({currTeam: ''})
  }
  render() {
    const {classes} = this.props;
    return (
      <ThemeProvider theme={theme}>
        <AppBar position="static">
          <Toolbar>
            <IconButton
              edge="start"
              className={classes.menuButton}
              color="inherit"
              aria-label="menu"
            >
              <MenuIcon />
            </IconButton>
            <img className="logo" src="/mlb.png" alt="MLB Logo"></img>
            <Typography variant="h6" className={classes.title}>
              MLB Stats
            </Typography>
            <TextField className={classes.season} label="Season" value={this.state.year} onChange={this.handleYearChange} select>
              {this.years.map((yr, i) => <MenuItem key={i} value={yr}>{yr}</MenuItem>)}
            </TextField>
          </Toolbar>
        </AppBar>
        {!this.state.currTeam ? (
          <section className="teams-area">
            {this.state.teams.map(this.generateTeamCard)}
          </section>
        ) : (
          <section className="team-details">
            <Breadcrumbs separator={<NavigateNextIcon fontSize="small" />} aria-label="breadcrumb">
              <Link color="inherit" onClick={this.goBack}>
                Teams
              </Link>
              <Typography color="textPrimary">{this.state.currTeam}</Typography>
            </Breadcrumbs>
            {this.generateTeamInfo()}
          </section>
        )}
      </ThemeProvider>
    );
  }
}

export default withStyles(useStyles)(App);
