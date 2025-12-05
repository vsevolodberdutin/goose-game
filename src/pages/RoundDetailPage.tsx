import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { api } from "../services/api";
import { RoundDetail, RoundStats } from "../types";
import { useAuthStore } from "../store/useAuthStore";

export function RoundDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [round, setRound] = useState<RoundDetail | null>(null);
  const [stats, setStats] = useState<RoundStats | null>(null);
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

      if (currentStatus === "scheduled") {
        // Time until round starts
        const remaining = Math.max(0, Math.floor((startTime - now) / 1000));
        setTimeRemaining(remaining);
      } else if (currentStatus === "active") {
        // Time until round ends
        const remaining = Math.max(0, Math.floor((endTime - now) / 1000));
        setTimeRemaining(remaining);

        if (remaining === 0 && !stats) {
          loadStats();
        }
      }
    };

    updateTimer();
    const interval = setInterval(updateTimer, 1000);

    return () => clearInterval(interval);
  }, [round, stats]);

  const loadRound = async () => {
    try {
      setIsLoading(true);
      const data = await api.getRoundById(token!, id!);
      setRound(data);

      // Check if round is completed and load stats
      const now = new Date().getTime();
      const endTime = new Date(data.endTime).getTime();
      if (now >= endTime) {
        await loadStats();
      }
    } catch (err) {
      setError("Failed to load round");
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const loadStats = async () => {
    try {
      const statsData = await api.getRoundStats(token!, id!);
      setStats(statsData);
    } catch (err) {
      console.error("Failed to load stats:", err);
    }
  };

  const handleTapGoose = async () => {
    if (!round || getRoundStatus() !== "active" || isTapping) return;

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

  const getRoundStatus = () => {
    if (!round) return "";

    const now = new Date().getTime();
    const startTime = new Date(round.startTime).getTime();
    const endTime = new Date(round.endTime).getTime();

    if (now < startTime) return "scheduled";
    if (now >= startTime && now < endTime) return "active";
    return "completed";
  };

  const getStatusTitle = () => {
    if (!round) return "";
    const currentStatus = getRoundStatus();
    if (currentStatus === "scheduled") return "Cooldown";
    if (currentStatus === "active") return "Раунды";
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
                    currentStatus === "active"
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
            {currentStatus === "scheduled" && (
              <div className="space-y-2 text-center">
                <p className="text-lg font-semibold text-gray-700">Cooldown</p>
                <p className="text-sm text-gray-600">
                  до начала раунда {formatTime(timeRemaining)}
                </p>
              </div>
            )}

            {/* Active State */}
            {currentStatus === "active" && (
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
            {currentStatus === "completed" && stats && (
              <div className="space-y-3">
                <div className="border-t border-gray-300 pt-3">
                  <div className="flex justify-between py-2">
                    <span className="text-sm text-gray-600">Всего</span>
                    <span className="text-sm font-medium text-gray-800">
                      {stats.totalTaps}
                    </span>
                  </div>
                  <div className="flex justify-between py-2">
                    <span className="text-sm text-gray-600">
                      Победитель - {stats.winner}
                    </span>
                    <span className="text-sm font-medium text-gray-800">
                      {stats.personalScore}
                    </span>
                  </div>
                  <div className="flex justify-between py-2">
                    <span className="text-sm text-gray-600">Мои очки</span>
                    <span className="text-sm font-medium text-gray-800">
                      {score}
                    </span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
