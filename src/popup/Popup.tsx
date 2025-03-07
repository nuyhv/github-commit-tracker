import React, { useState, useEffect } from "react";
import ReactDOM from "react-dom/client";
import "./popup.css";
import ContributionGrid from "../components/ContributionGrid";
import { fetchContributionData } from "../utils/github";
import DiscordWebhook from "../components/DiscordWebhook";
import { transformDate } from "../utils/transformDate";

const Popup = () => {
  const [githubUsername, setGithubUsername] = useState("");
  const [commitCount, setCommitCount] = useState<number | null>(null); // 오늘의 커밋 수
  const [contributions, setContributions] = useState<{ date: string; count: number }[]>([]); // 커밋 데이터
  const [lastUpdate, setlastUpdate] = useState<string | null>(null); // 커밋 데이터
  const [isSetting, setIsSetting] = useState<boolean>(false);
  const [avatar, setAvatar] = useState<string | undefined>();

  // 저장된 GitHub 계정 불러오기
  useEffect(() => {
    chrome.storage.sync.get(["githubUsername"], (result) => {
      if (result.githubUsername) {
        setGithubUsername(result.githubUsername);
        fetchCommitData(result.githubUsername);
      }
    });
  }, []);

  // 디스코드 웹훅 세팅 페이지 토글
  const handleSetting = () => {
    setIsSetting(!isSetting);
  };

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
      const {
        contributions: contributionsData,
        totalCommitsToday,
        lastUpdated,
        avatarURL,
      } = await fetchContributionData(username);
      setContributions(contributionsData);

      // 아바타 설정
      setAvatar(avatarURL);
      // 오늘의 커밋 수 설정
      setCommitCount(totalCommitsToday);
      setlastUpdate(lastUpdated);
    } catch (error) {
      console.error("Failed to fetch commit data:", error);
      setCommitCount(null);
    }
  };

  return (
    <div className="p-4 w-72 bg-gray-100 rounded-lg shadow-md">
      <header className="flex gap-2 items-center justify-end">
        <h1 className="text-lg font-bold text-center text-blue-600">GitHub Commit Tracker</h1>
        <button onClick={handleSetting} className="cursor-pointer">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
          >
            <path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z" />
            <circle cx="12" cy="12" r="3" />
          </svg>
        </button>
      </header>
      {!isSetting ? (
        <>
          {/* github avatar url */}
          <div className="flex flex-col justify-center items-center gap-2 mt-2">
            <div className="rounded-full overflow-hidden w-20 h-20 border-4">
              <img src={avatar} className="" />
            </div>
            <div className="text-center text-sm">
              <strong>{githubUsername}님</strong>, 환영합니다!
            </div>
          </div>
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
              <>
                <p className="text-gray-700">
                  {lastUpdate ? (
                    <>
                      최근 갱신: <strong>{String(transformDate(lastUpdate))}</strong>
                    </>
                  ) : (
                    "최근 90일 이내 활동이 없습니다."
                  )}
                </p>
                <p className="text-gray-700">
                  오늘의 커밋: <strong>{commitCount}개</strong>
                </p>
                <p className="text-gray-500 text-xs">공개(public) 레포지토리 기준입니다.</p>
              </>
            ) : (
              <p className="text-gray-500">커밋 데이터를 불러오는 중...</p>
            )}
          </div>
          <ContributionGrid contributions={contributions} />
        </>
      ) : (
        <DiscordWebhook />
      )}
    </div>
  );
};

export default Popup;
ReactDOM.createRoot(document.getElementById("root")!).render(<Popup />);
