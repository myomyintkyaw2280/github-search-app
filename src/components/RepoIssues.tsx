import React from "react";
import { useParams } from "react-router-dom";
import { useQuery, gql } from "@apollo/client";
import { Button, Form, InputGroup, Badge } from "react-bootstrap";
import IssueList from "./IssueList";
import "bootstrap/dist/css/bootstrap.css";
import UserSearch from "./UserSearch";
import CreateIssueModal from "./CreateIssueModal";

const GET_REPO_ISSUES = gql`
  query GetRepoIssues($owner: String!, $repo: String!) {
    repository(owner: $owner, name: $repo) {
      stargazerCount
      watchers {
        totalCount
      }
      issues(states: OPEN, first: 20) {
        totalCount
        edges {
          node {
            title
            number
            url
            createdAt
            author {
              login
            }
          }
        }
      }
    }
  }
`;

// const RepoIssues: React.FC = (username, reponame) => {
const RepoIssues = ({ usrname, reponame }: any) => {
  console.log("Username in issue : ", usrname + "\nreponame in issue: ", reponame);
  // const { usrname, reponame } = useParams<{ usrname?: string; reponame?: string }>();
  const { loading, error, data, refetch } = useQuery(GET_REPO_ISSUES, {
    variables: { owner: usrname!, repo: reponame! },
    skip: !usrname || !reponame,
  });

  const [isModalOpen, setIsModalOpen] = React.useState(false);
  const [isModalOpenSimple, setIsModalOpenSimple] = React.useState(false);
  const [isCreateModalOpen, setIsCreateModalOpen] = React.useState(false);

  if (!usrname || !reponame) {
    return <p>Invalid repository details.</p>;
  }

  if (loading) return <p className="text-center mt-5 h4">Loading...</p>;
  if (error) return <p>Error: {error.message}</p>;

  const repository = data.repository;
  const openIssueCount = repository.issues.totalCount;

  return (
    <div className="container mt-4">

      {/* Repository Info */}
      <div
        className="justify-content-between mt-5 mb-5 mx-auto col-9 "
        style={{ display: "flex" }}
      >
        <p
          className="mb-3 h2"
          style={{ fontFamily: "Comic Sans MS, cursive", float: "left" }}
        >
          {reponame}
        </p>
        <p className="pt-4" style={{ float: "right" }}>
          <strong>{repository.stargazerCount} stars</strong> /{" "}
          <strong>{repository.watchers.totalCount} watching</strong>
        </p>
      </div>

      <div className="d-flex justify-content-between align-items-center mx-auto col-9">
        {/* Open Issues */}
        <h4>
          Open Issues{" "}
          <Badge bg="warning" text="dark" pill className="ms-2">
            {/* {openIssueCount} */}
          </Badge>
        </h4>

        {/* New Issue Button */}

        <button
          className="btn btn-success text-white"
          onClick={() => setIsCreateModalOpen(true)}
        >
          New Issue
        </button>
      </div>

      <IssueList issues={repository.issues.edges} />
      <CreateIssueModal
        isOpen={isCreateModalOpen}
        onRequestClose={() => setIsCreateModalOpen(false)}
        owner={usrname}
        repo={reponame}
        onIssueCreated={() => {
          setIsCreateModalOpen(false);
          refetch();
        }}
      />
    </div>
  );
};

export default RepoIssues;
