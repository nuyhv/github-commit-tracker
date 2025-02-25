import React, { useState, useEffect } from "react";
import ReactDOM from "react-dom/client";
import "./popup.css";
import ContributionGrid from "../components/ContributionGrid";
import { fetchContributionData } from "../utils/github";
import DiscordWebhook from "../components/DiscordWebhook";

const Popup = () => {
  const [githubUsername, setGithubUsername] = useState("");
  const [commitCount, setCommitCount] = useState<number | null>(null); // 오늘의 커밋 수
  const [contributions, setContributions] = useState<{ date: string; count: number }[]>([]); // 커밋 데이터

  // 저장된 GitHub 계정 불러오기
  useEffect(() => {
    chrome.storage.sync.get(["githubUsername"], (result) => {
      if (result.githubUsername) {
        setGithubUsername(result.githubUsername);
        fetchCommitData(result.githubUsername);
      }
    });
  }, []);

  // GitHub 계정 입력 핸들러
  const handleUsernameChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setGithubUsername(event.target.value);
  };

  // 저장 버튼 클릭 시 계정 저장
  const handleSaveUsername = async () => {
    chrome.storage.sync.set({ githubUsername }, async () => {
      await fetchCommitData(githubUsername);
    });
  };

  // GitHub Contribution 데이터 가져오기
  const fetchCommitData = async (username: string) => {
    try {
      const { contributions: contributionsData, totalCommitsToday } = await fetchContributionData(
        username
      );
      setContributions(contributionsData);

      // 오늘의 커밋 수 설정
      setCommitCount(totalCommitsToday);
    } catch (error) {
      console.error("Failed to fetch commit data:", error);
      setCommitCount(null);
    }
  };

  return (
    <div className="p-4 w-64 bg-gray-100 rounded-lg shadow-md">
      <h1 className="text-lg font-bold text-center text-blue-600">GitHub Commit Tracker</h1>
      <input
        type="text"
        value={githubUsername}
        onChange={handleUsernameChange}
        placeholder="GitHub Username"
        className="w-full p-2 border border-gray-300 rounded mt-2"
      />
      <button
        onClick={handleSaveUsername}
        className="mt-2 w-full bg-blue-500 hover:bg-blue-600 text-white p-2 rounded transition cursor-pointer"
      >
        저장
      </button>
      <div className="mt-4 text-center">
        {commitCount !== null ? (
          <p className="text-gray-700">
            오늘의 커밋: <strong>{commitCount}개</strong>
          </p>
        ) : (
          <p className="text-gray-500">커밋 데이터를 불러오는 중...</p>
        )}
      </div>
      <ContributionGrid contributions={contributions} />
      <DiscordWebhook />
    </div>
  );
};

export default Popup;
ReactDOM.createRoot(document.getElementById("root")!).render(<Popup />);
