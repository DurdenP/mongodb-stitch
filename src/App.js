import React, { Component } from "react";
import {
  Stitch,
  AnonymousCredential,
  RemoteMongoClient
} from "mongodb-stitch-browser-sdk";
import "./App.css";

const MONGO_SERVICE_NAME = "mongodb-atlas"
const MONGO_DATABASE= "stitch"
const MONGO_COLLECTION = "movies"
const MONGO_CLIENT_APP_ID = "workshoptest-tznks"

class App extends Component {
    constructor() {
        super();
        this.state = {
            movieTitles: [],
            value: ""
        };
        this.handleChange = this.handleChange.bind(this);
        this.displayTitles = this.displayTitles.bind(this);
        this.addMovieTitle = this.addMovieTitle.bind(this);
    }

    componentDidMount() {
        // Initialize the App Client
        this.client = Stitch.initializeDefaultAppClient(MONGO_CLIENT_APP_ID);
        // Get a MongoDB Service Client
        // This is used for logging in and communicating with Stitch
        const mongodb = this.client.getServiceClient(
            RemoteMongoClient.factory,
            MONGO_SERVICE_NAME
        );
        // Get a reference to the stitch database
        this.db = mongodb.db(MONGO_DATABASE);
        this.displayRulesOnLoad();
    }

    displayTitles() {
        // query the remote DB and update the component state
        this.db
            .collection(MONGO_COLLECTION)
            .find({}, { limit: 1000 })
            .asArray()
            .then(movieTitles => {
                this.setState({movieTitles});
            });
    }

    displayRulesOnLoad() {
        // Anonymously log in and display comments on load
        this.client.auth
            .loginWithCredential(new AnonymousCredential())
            .then(this.displayTitles)
            .catch(console.error);
    }
    addMovieTitle(event) {
        event.preventDefault();
        const { value } = this.state;
        // insert the movie title into the remote Stitch DB
        // then re-query the DB and display the new movieTitles
        this.db
            .collection(MONGO_COLLECTION)
            .insertOne({
                owner_id: this.client.auth.user.id,
                Title: value
            })
            .then(this.displayTitles)
            .catch(console.error);
    }

    handleChange(event) {
        this.setState({ value: event.target.value });
    }

    render() {
        return (
            <div className="App">
                <h3>This is a todo app</h3>
                <hr />
                <p>Add a Todo Item:</p>
                <form onSubmit={this.addMovieTitle}>
                    <label>
                        <input
                            type="text"
                            value={this.state.value}
                            onChange={this.handleChange}
                        />
                    </label>
                    <input type="submit" value="Submit" />
                </form>
                <ul>
                    {/* Map over the movieTitles from our remote DB */}
                    {this.state.movieTitles.map((movie, i) => {
                        return <li key={i}>{movie.Title}</li>;
                    })}
                </ul>
            </div>
        );
    }
}
export default App;