import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { api } from "../services/api";
import { Round, RoundDetailResponse, TopStat, MyStats } from "../types";
import { useAuthStore } from "../store/useAuthStore";

export function RoundDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [round, setRound] = useState<Round | null>(null);
  const [topStats, setTopStats] = useState<TopStat[]>([]);
  const [myStats, setMyStats] = useState<MyStats | null>(null);
  const [score, setScore] = useState(0);
  const [timeRemaining, setTimeRemaining] = useState<number>(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [isTapping, setIsTapping] = useState(false);
  const navigate = useNavigate();

  const { token, username, clearAuth } = useAuthStore();

  useEffect(() => {
    if (!token) {
      navigate("/");
      return;
    }

    loadRound();
  }, [id, token, navigate]);

  useEffect(() => {
    if (!round) return;

    const updateTimer = () => {
      const now = new Date().getTime();
      const startTime = new Date(round.startTime).getTime();
      const endTime = new Date(round.endTime).getTime();
      const currentStatus = getRoundStatus();

      if (currentStatus === "COOLDOWN") {
        // Time until round starts
        const remaining = Math.max(0, Math.floor((startTime - now) / 1000));
        setTimeRemaining(remaining);
      } else if (currentStatus === "ACTIVE") {
        // Time until round ends
        const remaining = Math.max(0, Math.floor((endTime - now) / 1000));
        setTimeRemaining(remaining);

        if (remaining === 0 && topStats.length === 0) {
          loadStats();
        }
      }
    };

    updateTimer();
    const interval = setInterval(updateTimer, 1000);

    return () => clearInterval(interval);
  }, [round, topStats]);

  const loadRound = async () => {
    try {
      setIsLoading(true);
      const data: RoundDetailResponse = await api.getRoundById(token!, id!);
      console.log("Round API response:", data);

      // Backend returns { round: {...}, topStats: [...], myStats: {...} }
      setRound(data.round);
      setTopStats(data.topStats || []);
      setMyStats(data.myStats || null);

      // Set initial score from myStats
      if (data.myStats) {
        setScore(data.myStats.score);
      }
    } catch (err) {
      setError("Failed to load round");
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const loadStats = async () => {
    // Reload the round to get updated stats
    await loadRound();
  };

  const handleTapGoose = async () => {
    if (!round || getRoundStatus() !== "ACTIVE" || isTapping) return;

    try {
      setIsTapping(true);
      const response = await api.tapGoose(token!, id!);
      setScore(response.score);
    } catch (err) {
      console.error("Failed to tap goose:", err);
    } finally {
      setIsTapping(false);
    }
  };

  const handleLogout = async () => {
    try {
      await api.logout();
    } catch (err) {
      console.error("Logout error:", err);
    } finally {
      // Clear auth state regardless of API call success
      clearAuth();
      navigate("/");
    }
  };

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const getRoundStatus = (): "COOLDOWN" | "ACTIVE" | "FINISHED" | "" => {
    if (!round) return "";

    const now = new Date().getTime();
    const startTime = new Date(round.startTime).getTime();
    const endTime = new Date(round.endTime).getTime();
console.log("now", now, "startTime", startTime, "endTime", endTime);
    if (now < startTime) return "COOLDOWN";
    if (now >= startTime && now < endTime) return "ACTIVE";
    return "FINISHED";
  };

  const getStatusTitle = () => {
    if (!round) return "";
    const currentStatus = getRoundStatus();
    if (currentStatus === "COOLDOWN") return "Запланирован";
    if (currentStatus === "ACTIVE") return "Активен";
    return "Раунд завершен";
  };

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50">
        <div className="text-lg text-gray-700">Загрузка...</div>
      </div>
    );
  }

  if (error || !round) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50">
        <div className="text-lg text-red-600">{error || "Раунд не найден"}</div>
      </div>
    );
  }

  const currentStatus = getRoundStatus();


  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 p-4">
      <div className="w-full max-w-md">
        <div className="flex flex-col rounded-lg border border-gray-300 bg-white shadow-sm overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between border-b border-gray-300 bg-gradient-to-b from-gray-50 to-white px-6 py-4">
            <button
              onClick={() => navigate("/rounds")}
              className="rounded-md border cursor-pointer border-gray-300 bg-white px-3 py-1.5 text-sm text-gray-700 transition-colors duration-150 hover:bg-gray-50">
              Назад
            </button>
            <div className="flex items-center gap-4">
              <span className="text-sm text-gray-600">{username} {currentStatus}</span>
              <button
                onClick={handleLogout}
                className="rounded-md border cursor-pointer border-gray-300 bg-white px-3 py-1.5 text-sm text-gray-700 transition-colors duration-150 hover:bg-gray-50">
                Выйти
              </button>
            </div>
          </div>

          {/* Content */}
          <div className="flex-1 p-6">
            {/* Goose Image */}
            <div className="mb-6 flex justify-center">
              <div
                className={`w-[200px] rounded-lg overflow-hidden border border-gray-300 bg-white shadow-md
                  ${
                    currentStatus === "ACTIVE"
                      ? "cursor-pointer transition-transform duration-200 hover:scale-105"
                      : "cursor-not-allowed opacity-70"
                  }`}
                onClick={handleTapGoose}>
                <img
                  src="/images/mutant-goose.png"
                  alt="Mutant Goose G-42"
                  className="w-full h-full object-cover"
                />
              </div>
            </div>

            {/* Scheduled State */}
            {currentStatus === "COOLDOWN" && (
              <div className="space-y-2 text-center">
                <p className="text-lg font-semibold text-gray-700">Cooldown</p>
                <p className="text-sm text-gray-600">
                  до начала раунда {formatTime(timeRemaining)}
                </p>
              </div>
            )}

            {/* Active State */}
            {currentStatus === "ACTIVE" && (
              <div className="space-y-2 text-center">
                <p className="text-lg font-semibold text-green-600">
                  Раунд активен!
                </p>
                <p className="text-sm text-gray-600">
                  До конца осталось: {formatTime(timeRemaining)}
                </p>
                <p className="text-sm text-gray-700">Мои очки - {score}</p>
              </div>
            )}

            {/* Completed State */}
            {currentStatus === "FINISHED" && topStats.length > 0 && (
              <div className="space-y-3">
                <div className="border-t border-gray-300 pt-3">
                  <div className="flex justify-between py-2">
                    <span className="text-sm text-gray-600">Всего</span>
                    <span className="text-sm font-medium text-gray-800">
                      {round?.totalScore || 0}
                    </span>
                  </div>
                  {topStats[0] && (
                    <div className="flex justify-between py-2">
                      <span className="text-sm text-gray-600">
                        Победитель - {topStats[0].user.username}
                      </span>
                      <span className="text-sm font-medium text-gray-800">
                        {topStats[0].score}
                      </span>
                    </div>
                  )}
                  {myStats && (
                    <div className="flex justify-between py-2">
                      <span className="text-sm text-gray-600">Мои очки</span>
                      <span className="text-sm font-medium text-gray-800">
                        {myStats.score}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
