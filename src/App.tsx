import React from "react";
import logo from "./logo.svg";
import "./App.css";

import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import UserSearch from "./components/UserSearch";
// import UserRepos from './components/UserRepos';
import RepoIssues from "./components/RepoIssues";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<UserSearch />} />
        {/* <Route path="/user/:username" element={<UserRepos />} /> */}
        {/* <Route path="/user/:username/repo/:reponame" element={<RepoIssues />} /> */}
        <Route path="/repo-issue" element={<RepoIssues />} />
      </Routes>
    </Router>
  );
}

export default App;
