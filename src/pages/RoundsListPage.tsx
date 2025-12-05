import { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { api } from "../services/api";
import { Round, RoundsResponse } from "../types";
import { useAuthStore } from "../store/useAuthStore";

export function RoundsListPage() {
  const [rounds, setRounds] = useState<Round[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [error, setError] = useState("");
  const [nextCursor, setNextCursor] = useState<string | undefined>(undefined);
  const [hasMore, setHasMore] = useState(false);
  const navigate = useNavigate();

  const { token, username, isAdmin, clearAuth } = useAuthStore();

  useEffect(() => {
    if (!token) {
      navigate("/");
      return;
    }

    loadRounds();
  }, [token, navigate]);

  const loadRounds = async () => {
    try {
      setIsLoading(true);
      const response: RoundsResponse = await api.getRounds(token!);

      // Set initial rounds
      setRounds(response.data || []);
      setNextCursor(response.pagination.nextCursor);
      setHasMore(response.pagination.hasMore || false);
    } catch (err) {
      setError("Failed to load rounds");
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const loadMoreRounds = async () => {
    if (!nextCursor || isLoadingMore) return;

    try {
      setIsLoadingMore(true);
      const response: RoundsResponse = await api.getRounds(token!, nextCursor);

      // Append new rounds to existing list
      setRounds((prevRounds) => [...prevRounds, ...(response.data || [])]);
      setNextCursor(response.pagination.nextCursor);
      setHasMore(response.pagination.hasMore || false);
    } catch (err) {
      setError("Failed to load more rounds");
      console.error(err);
    } finally {
      setIsLoadingMore(false);
    }
  };

  const handleCreateRound = async () => {
    try {
      const newRound = await api.createRound(token!);
      navigate(`/rounds/${newRound.id}`);
    } catch (err) {
      setError("Failed to create round");
      console.error(err);
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

  const getStatus = (round: Round) => {
    const now = new Date().getTime();
    const start = new Date(round.startTime).getTime();
    const end = new Date(round.endTime).getTime();

    if (now < start) return { text: "Запланирован", color: "text-blue-600" };
    if (now >= start && now < end)
      return { text: "Активен", color: "text-green-600" };
    return { text: "Cooldown", color: "text-gray-600" };
  };

  const formatDateTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString("ru-RU", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    });
  };

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50">
        <div className="text-lg text-gray-700">Загрузка...</div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 p-4">
      <div className="w-full max-w-4xl">
        {/* Main Container */}
        <div className="flex flex-col rounded-lg border border-gray-300 bg-white shadow-sm overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between border-b border-gray-300 bg-gradient-to-b from-gray-50 to-white px-6 py-4">
            <h1 className="text-lg font-semibold text-gray-700">
              Список РАУНДОВ
            </h1>
            <div className="flex items-center gap-4">
              <span className="text-sm text-gray-600">{username}</span>
              <button
                onClick={handleLogout}
                className="rounded-md border cursor-pointer border-gray-300 bg-white px-3 py-1.5 text-sm text-gray-700 transition-colors duration-150 hover:bg-gray-50">
                Выйти
              </button>
            </div>
          </div>

          {/* Content */}
          <div className="flex-1 p-6">
            {/* Create Round Button - only visible for admins */}
            {isAdmin && (
              <div className="mb-4">
                <button
                  onClick={handleCreateRound}
                  className="rounded-md border cursor-pointer border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 transition-colors duration-150 hover:bg-gray-50">
                  Создать раунд
                </button>
              </div>
            )}

            {error && (
              <div className="mb-4 rounded-md border border-red-300 bg-red-50 px-3 py-2">
                <p className="text-sm text-red-700">{error}</p>
              </div>
            )}

            <div className="space-y-4">
              {rounds.length === 0 ? (
                <p className="text-center text-sm text-gray-500">
                  Нет доступных раундов
                </p>
              ) : (
                <>
                  {rounds.map((round) => {
                    const status = getStatus(round);
                    return (
                      <Link
                        key={round.id}
                        to={`/rounds/${round.id}`}
                        className="block rounded-lg border border-gray-300 bg-white p-4 no-underline transition-all duration-150 hover:border-gray-400 hover:bg-gray-50">
                        <div className="flex items-start gap-2">
                          <span className="mt-1 text-gray-400">●</span>
                          <div className="flex-1">
                            <p className="mb-3 text-sm font-medium text-gray-800">
                              Round ID: {round.id}
                            </p>

                            <div className="space-y-1 text-sm text-gray-600">
                              <p>Start: {formatDateTime(round.startTime)}</p>
                              <p>End: {formatDateTime(round.endTime)}</p>
                            </div>

                            <div className="my-3 border-t border-gray-200"></div>

                            <p
                              className={`text-sm font-medium ${status.color}`}>
                              Статус: {status.text}
                            </p>
                          </div>
                        </div>
                      </Link>
                    );
                  })}

                  {/* Load More Button */}
                  {hasMore && (
                    <div className="mt-4 flex justify-center">
                      <button
                        onClick={loadMoreRounds}
                        disabled={isLoadingMore}
                        className="rounded-md border cursor-pointer border-gray-300 bg-white px-6 py-2 text-sm font-medium text-gray-700 transition-colors duration-150 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50">
                        {isLoadingMore ? "Загрузка..." : "Показать ещё"}
                      </button>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
