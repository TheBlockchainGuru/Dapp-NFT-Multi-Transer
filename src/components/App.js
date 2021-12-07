import React, {Component} from 'react';
import TopNav from './TopNav.js';
import './App.css'
import Display from './Display.js';
import {
    BrowserRouter as Router,
} from "react-router-dom";

class App extends Component {
    async componentWillMount() {     
    }

    render () {
        return (
            <div>
                <Router>
                    <TopNav />
                    <div className = "row">
                        <div className = "col-1"></div>
                        <div className = "col-10"><Display /></div>
                        <div className = "col-1"></div>
                    </div>
                </Router>
            </div>
        );
    }
}

export default App;