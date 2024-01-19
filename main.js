const getResults = async (event, pageNo = 1) => {
  if (event.key === "Enter") {
    let name = document.getElementById("inputName").value;
    let reposElement = document.getElementById("reposContainer");
    let userElement = document.getElementById("userContainer");

    userElement.innerHTML = `
    <div class="spinnerContainer">
    <div class="spinner"></div>
    </div>
    `;

    reposElement.innerHTML = "";

    try {
      let userResponse = await fetch(`https://api.github.com/users/${name}`);
      if (!userResponse || !userResponse.ok) {
        userElement.innerHTML = `
        <p>No Data found!</p>
        `;
        return;
      }
      let userData = await userResponse.json();
      if (!userData) {
        userElement.innerHTML = `
        <p>No Data found!</p>
        `;
        return;
      }
      userElement.innerHTML = `
      <img class="githubAvatar" src="${userData.avatar_url}" />
      <div class="userContentContainer">
    <p class="userName">${userData.name}</p>
    <p>${userData.company !== null ? userData.company : ""}</p>
    <p>${userData.bio !== null ? userData.bio : ""}</p>
    <p>${userData.location !== null ? userData.location : ""}</p>
    <a href="${userData.html_url}">Go to Profile</a>
    </div>
    `;
      let reposResponse = await fetch(
        `https://api.github.com/users/${name}/repos?per_page=10&page=${pageNo}`
      );
      const linkHeader = reposResponse.headers.get("Link");
      const paginationInfo = parseLinkHeader(linkHeader);
      let reposData = await reposResponse.json();
      let responseRepos = "";
      for (let elem of reposData) {
        const topicsList = elem.topics
          .map((topic) => `<button class="topicBtn">${topic}</button>`)
          .join("");
        responseRepos += `
        <div class="repoBoxContainer">
        <p class="repoName">${elem.name}</p>
        <p>${elem.description !== null ? elem.description : ""}</p>
        <div class="topicsContainer">
        ${topicsList}
        </div>
        </div>
        `;
      }
      reposElement.innerHTML = `
        <div class="repoInnerContainer">
        ${responseRepos}
        <div class="paginationContainer">
        <button class="paginationButtons ${
          paginationInfo.prevPage === undefined ? "disable" : "able"
        }" ${
        paginationInfo.prevPage === undefined ? "disabled" : null
      } onclick="getResults({key: 'Enter'}, ${pageNo - 1})">${
        paginationInfo.prevPage === undefined
          ? "No previous page"
          : "Previous page"
      }</button>
        <button class="paginationButtons ${
          paginationInfo.nextPage === undefined ? "disable" : "able"
        }" ${
        paginationInfo.nextPage === undefined ? "disabled" : null
      } onclick="getResults({key: 'Enter'}, ${pageNo + 1})">${
        paginationInfo.nextPage === undefined ? "No next page" : "Next page"
      }</button>
        </div>
        </div>
        
        `;
    } catch (error) {
      console.log(error);
      alert("Error occurred");
    }
  }
};

const parseLinkHeader = (linkHeader) => {
  const result = {};
  if (!linkHeader) return result;

  linkHeader.split(",").forEach((part) => {
    const match = part.match(/<([^>]+)>;\s*rel="([^"]+)"/);
    if (match) {
      const [, url, rel] = match;
      if (rel === "first") result.firstPage = url;
      if (rel === "prev") result.prevPage = url;
      if (rel === "next") result.nextPage = url;
      if (rel === "last") result.lastPage = url;
    }
  });
  return result;
};
