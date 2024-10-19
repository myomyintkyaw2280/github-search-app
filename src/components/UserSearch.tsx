import React, { useState } from "react";
import { useLazyQuery, gql } from "@apollo/client";
import Table from "react-bootstrap/Table";
import Pagination from "react-bootstrap/Pagination";
import { Link, useNavigate } from "react-router-dom";
import "./css/SearchBar.css";
import UserList from "./UserList";
// import UserRepos from "./UserRepos";
import RepoIssues from "./RepoIssues";

const SEARCH_USERS = gql`
  query SearchUsers($query: String!) {
    search(query: $query, type: USER, first: 10) {
      edges {
        node {
          ... on User {
            login
            avatarUrl
            url
          }
        }
      }
    }
  }
`;

const USER_REPOS = gql`
  query UserRepos($login: String!, $after: String) {
    user(login: $login) {
      repositories(first: 10, after: $after) {
        edges {
          node {
            name
            url
            stargazerCount
            watchers {
              totalCount
            }
          }
        }
        pageInfo {
          hasNextPage
          endCursor
        }
      }
    }
  }
`;

const UserSearch: React.FC = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");
  const [searchUsers, { loading, data, error }] = useLazyQuery(SEARCH_USERS);
  const [selectedUser, setSelectedUser] = useState<string | null>(null);
  const [
    fetchRepos,
    { data: repoData, loading: loadingRepos, error: repoError },
  ] = useLazyQuery(USER_REPOS);
  const [status, setStatus] = useState<boolean>(false);
  const [username, setUsername] = useState<any>("");
  const [reponame, setReponame] = useState<any>("");

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6; // Set to 6 items per page

  const handleSearch = () => {
    if (searchTerm.trim() !== "") {
      setStatus(false);
      searchUsers({ variables: { query: searchTerm } });
      setSelectedUser(null); // Reset selected user when searching
      setCurrentPage(1); // Reset current page on new search
    }
  };

  const handleUserClick = (login: string) => {
    console.log("User clicked:", login);
    if (selectedUser === login) {
      // console.log('User Selected:', login);
      setSelectedUser(null);
    } else {
      // console.log('Else User Selected:', login);
      setSelectedUser(login);
      setCurrentPage(1); // Reset current page when a new user is selected
      fetchRepos({ variables: { login } });
    }
  };

  // Total number of repositories
  const totalRepos = repoData?.user.repositories.edges.length || 0;
  const totalPages = Math.ceil(totalRepos / itemsPerPage); // Calculate total pages

  // Calculate start index for the current page
  const startIndex = (currentPage - 1) * itemsPerPage;
  const currentRepos =
    repoData?.user.repositories.edges.slice(
      startIndex,
      startIndex + itemsPerPage
    ) || [];

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const detailRepoClick = (uname: any, nodname: any) => {
    console.log(
      "username in user search : ",
      uname + "Repo name in user search : ",
      nodname
    );
    // navigate("/repo-issue");
    setUsername(uname);
    setReponame(nodname);
    setStatus(true);
  };

  return (
    <>
      <div className="container">
        <div className="search-bar">
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search GitHub Users"
            aria-label="Search GitHub Users"
          />
          <button onClick={handleSearch} aria-label="Search">
            Search
          </button>
        </div>

        {loading && <p>Loading users...</p>}
        {error && <p>Error: {error.message}</p>}
        {/* {data && (
          <UserList users={data.search.edges} onUserClick={handleUserClick} />
        )} */}

        {data && status === false && (
          <UserList users={data.search.edges} onUserClick={handleUserClick} />
        )}

        {/* {selectedUser && ( */}
        {selectedUser && status === false && (
          <div className="mt-5 mb-5">
            <h2 className="mb-5">Repositories for {selectedUser}</h2>
            {loadingRepos && <p>Loading repositories...</p>}
            {repoError && <p>Error: {repoError.message}</p>}

            {repoData && (
              <>
                <Table hover>
                  <thead>
                    <tr>
                      <th>Repository Name</th>
                      {/* <th>View Issue</th> */}
                      <th>Stars / Watchers</th>
                    </tr>
                  </thead>
                  <tbody>
                    {currentRepos.length > 0 ? (
                      currentRepos.map(({ node }: { node: any }) => (
                        <tr key={node.name}>
                          {/* <td>
                          <a href={node.url} target="_blank" rel="noopener noreferrer">
                            {node.name}
                          </a>
                        </td> */}
                          <td>
                            {/* <Link to={`/user/${selectedUser}/repo/${node.name}`}>{node.name}</Link> */}
                            <div
                              onClick={() =>
                                detailRepoClick(selectedUser, node.name)
                              }
                            >
                              {node.name}
                            </div>
                          </td>
                          <td>
                            {node.stargazerCount} stars /{" "}
                            {node.watchers.totalCount} watchers
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={2} className="text-center">
                          No repositories found for {selectedUser}.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </Table>
                {currentRepos.length > 0 ? (
                  // Pagination
                  <Pagination className="justify-content-center">
                    <Pagination.Prev
                      onClick={() =>
                        setCurrentPage((prev) => Math.max(prev - 1, 1))
                      }
                      disabled={currentPage === 1}
                    />
                    {Array.from({ length: totalPages }, (_, index) => (
                      <Pagination.Item
                        key={index + 1}
                        active={index + 1 === currentPage}
                        onClick={() => handlePageChange(index + 1)}
                      >
                        {index + 1}
                      </Pagination.Item>
                    ))}
                    <Pagination.Next
                      onClick={() =>
                        setCurrentPage((prev) => Math.min(prev + 1, totalPages))
                      }
                      disabled={currentPage === totalPages}
                    />
                  </Pagination>
                ) : null}
              </>
            )}
          </div>
        )}
      </div>
      {status === true && <RepoIssues usrname={username} reponame={reponame} />}
      {/* {status === true &&
        console.log(
          "username within condition : ",
          username + "\n reponame within condition : ",
          reponame
        )} */}
    </>
  );
};

export default UserSearch;
