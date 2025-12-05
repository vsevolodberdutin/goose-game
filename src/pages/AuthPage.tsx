import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../services/api";
import { useAuthStore } from "../store/useAuthStore";

export const AuthPage = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const setAuth = useAuthStore((state) => state.setAuth);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      const response = await api.login({ username, password });

      setAuth(response.token, response.username, response.isAdmin);

      navigate("/rounds");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Ошибка входа");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen justify-center bg-gray-50 p-4">
      <div className="w-full max-w-2xl space-y-6">
        {/* Goose Image */}
        <div className="flex justify-center m-20">
          <div className="w-[220px] rounded-lg overflow-hidden border border-gray-300 bg-white shadow-md">
            <img
              src="/images/mutant-goose.png"
              alt="Mutant Goose G-42"
              className="w-full h-full object-cover"
            />
          </div>
        </div>

        {/* Login Form */}
        <div className="w-full max-w-md mx-auto flex flex-col rounded-lg border border-gray-300 bg-white shadow-sm overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-center border-b border-gray-300 bg-gradient-to-b from-gray-50 to-white px-6 py-4">
            <h1 className="text-lg font-semibold text-gray-700">ВОЙТИ</h1>
          </div>

          {/* Form content */}
          <div className="flex-1 p-6">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label
                  htmlFor="username"
                  className="mb-2 block text-sm font-medium text-gray-700">
                  Имя пользователя:
                </label>
                <input
                  type="text"
                  id="username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  required
                  className="w-full h-10 rounded-md border border-gray-300 bg-white px-4 py-2 text-sm text-gray-900 transition-colors duration-150 placeholder:text-gray-400 focus:border-lime-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                  placeholder=""
                />
              </div>

              <div>
                <label
                  htmlFor="password"
                  className="mb-2 block text-sm font-medium text-gray-700">
                  Пароль:
                </label>
                <input
                  type="password"
                  id="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="w-full h-10 rounded-md border border-gray-300 bg-white px-4 py-2 text-sm text-gray-900 transition-colors duration-150 placeholder:text-gray-400 focus:border-lime-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                  placeholder=""
                />
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full h-10 rounded-md bg-lime-600 px-4 py-2 text-sm font-medium text-white shadow-sm transition-colors duration-150 hover:bg-lime-600 active:bg-lime-700 disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:bg-lime-500">
                {isLoading ? "Вход..." : "Войти"}
              </button>

              {error && (
                <div className="rounded-md border border-red-300 bg-red-50 px-3 py-2 animate-shake">
                  <p className="text-center text-sm text-red-700">{error}</p>
                </div>
              )}
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};
