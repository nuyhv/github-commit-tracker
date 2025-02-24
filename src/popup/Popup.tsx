import React, { useState, useEffect } from "react";

const Popup = () => {
  const [githubUsername, setGithubUsername] = useState("");
  const [commitCount, setCommitCount] = useState<number | null>(null);

  // 저장된 GitHub 계정 불러오기
  useEffect(() => {
    chrome.storage.sync.get(["githubUsername"], (result) => {
      if (result.githubUsername) {
        setGithubUsername(result.githubUsername);
        fetchCommitData(result.githubUsername); // 데이터 가져오기
      }
    });
  }, []);

  // GitHub 계정 입력 핸들러
  const handleUsernameChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setGithubUsername(event.target.value);
  };

  // 저장 버튼 클릭 시 계정 저장
  const handleSaveUsername = () => {
    chrome.storage.sync.set({ githubUsername }, () => {
      console.log("GitHub username saved:", githubUsername);
      fetchCommitData(githubUsername);
    });
  };

  // GitHub Contribution 데이터 가져오기
  const fetchCommitData = async (username: string) => {
    try {
      const response = await fetch(`https://github.com/users/${username}/contributions`);
      const text = await response.text();

      // 오늘 커밋 개수 추출
      const match = text.match(/data-count="(\d+)" data-date="[\d-]+"/g);
      if (match) {
        const todayCommitCount = parseInt(
          match[match.length - 1].match(/data-count="(\d+)"/)![1],
          10
        );
        setCommitCount(todayCommitCount);
      } else {
        setCommitCount(0);
      }
    } catch (error) {
      console.error("Failed to fetch commit data:", error);
      setCommitCount(null);
    }
  };

  return (
    <div className="p-4 w-64">
      <h1 className="text-lg font-bold">GitHub Commit Tracker</h1>
      <input
        type="text"
        value={githubUsername}
        onChange={handleUsernameChange}
        placeholder="GitHub Username"
        className="w-full p-2 border rounded mt-2"
      />
      <button
        onClick={handleSaveUsername}
        className="mt-2 w-full bg-blue-500 text-white p-2 rounded"
      >
        저장
      </button>

      <div className="mt-4">
        {commitCount !== null ? (
          <p>
            오늘의 커밋: <strong>{commitCount}개</strong>
          </p>
        ) : (
          <p>커밋 데이터를 불러오는 중...</p>
        )}
      </div>
    </div>
  );
};

export default Popup;
