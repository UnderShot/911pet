import React, { Component } from 'react';
import MainPage from "./app/MainPage";
import MuiThemeProvider from "material-ui/styles/MuiThemeProvider";

class App extends Component {
	render() {
		return <MuiThemeProvider>
			  <MainPage name="ZHANDOS" />
		</MuiThemeProvider>;
	}
	componentDidMount() {
		console.log("APP is Ready");
	}

	componentWillUnmount() {
		console.log("APP is fff");
	}
}

export default App;