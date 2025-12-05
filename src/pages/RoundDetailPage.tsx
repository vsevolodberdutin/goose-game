import { useEffect, useState } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { api } from '../services/api';
import { RoundDetail, RoundStats } from '../types';
import { useAuthStore } from '../store/useAuthStore';

const GOOSE_ASCII = `
    __
   >(' )
    )/
   ( (
    ||
    ||
  ~~~~~~~
`;

export function RoundDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [round, setRound] = useState<RoundDetail | null>(null);
  const [stats, setStats] = useState<RoundStats | null>(null);
  const [score, setScore] = useState(0);
  const [timeRemaining, setTimeRemaining] = useState<number>(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [isTapping, setIsTapping] = useState(false);
  const navigate = useNavigate();

  const token = useAuthStore((state) => state.token);

  useEffect(() => {
    if (!token) {
      navigate('/');
      return;
    }

    loadRound();
  }, [id, token, navigate]);

  useEffect(() => {
    if (!round) return;

    const interval = setInterval(() => {
      const now = new Date().getTime();
      const endTime = new Date(round.endTime).getTime();
      const remaining = Math.max(0, Math.floor((endTime - now) / 1000));

      setTimeRemaining(remaining);

      if (remaining === 0 && round.status === 'active' && !stats) {
        loadStats();
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [round, stats]);

  const loadRound = async () => {
    try {
      setIsLoading(true);
      const data = await api.getRoundById(token!, id!);
      setRound(data);

      if (data.status === 'completed') {
        await loadStats();
      }
    } catch (err) {
      setError('Failed to load round');
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
      console.error('Failed to load stats:', err);
    }
  };

  const handleTapGoose = async () => {
    if (!round || round.status !== 'active' || isTapping) return;

    try {
      setIsTapping(true);
      const response = await api.tapGoose(token!, id!);
      setScore(response.score);
    } catch (err) {
      console.error('Failed to tap goose:', err);
    } finally {
      setIsTapping(false);
    }
  };

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getRoundStatus = () => {
    if (!round) return '';

    const now = new Date().getTime();
    const startTime = new Date(round.startTime).getTime();
    const endTime = new Date(round.endTime).getTime();

    if (now < startTime) return 'scheduled';
    if (now >= startTime && now < endTime) return 'active';
    return 'completed';
  };

  if (isLoading) {
    return (
      <div
        className="flex min-h-screen items-center justify-center
          bg-gradient-to-br from-blue-50 to-indigo-100"
      >
        <div className="text-xl text-gray-700">Loading round...</div>
      </div>
    );
  }

  if (error || !round) {
    return (
      <div
        className="flex min-h-screen items-center justify-center
          bg-gradient-to-br from-blue-50 to-indigo-100"
      >
        <div className="text-xl text-red-600">{error || 'Round not found'}</div>
      </div>
    );
  }

  const currentStatus = getRoundStatus();

  return (
    <div
      className="min-h-screen
        bg-gradient-to-br from-blue-50 to-indigo-100
        px-4 py-8"
    >
      <div className="mx-auto max-w-4xl">
        <div className="mb-6">
          <Link
            to="/rounds"
            className="inline-flex items-center text-indigo-600
              hover:text-indigo-700
              transition duration-200
              no-underline font-medium"
          >
            ← Back to Rounds
          </Link>
        </div>

        <div
          className="rounded-2xl bg-white p-8 shadow-lg
            border border-gray-200"
        >
          <div className="mb-6 text-center">
            <h1 className="text-3xl font-bold text-gray-800">
              Round #{id}
            </h1>
            <div className="mt-2">
              <span
                className={`rounded-full px-4 py-2 text-sm font-semibold
                  ${currentStatus === 'active' ? 'bg-green-100 text-green-800' : ''}
                  ${currentStatus === 'completed' ? 'bg-gray-100 text-gray-800' : ''}
                  ${currentStatus === 'scheduled' ? 'bg-blue-100 text-blue-800' : ''}`}
              >
                {currentStatus.toUpperCase()}
              </span>
            </div>
          </div>

          {currentStatus === 'active' && (
            <div className="mb-6 text-center">
              <div className="text-4xl font-bold text-indigo-600">
                {formatTime(timeRemaining)}
              </div>
              <div className="text-sm text-gray-600">Time Remaining</div>
            </div>
          )}

          {currentStatus === 'scheduled' && (
            <div className="mb-6 text-center">
              <div className="text-lg text-gray-700">
                Round starts at: {new Date(round.startTime).toLocaleString()}
              </div>
            </div>
          )}

          <div
            className="mb-6 flex justify-center
              rounded-xl bg-gray-50 p-8
              border border-gray-200"
          >
            <pre
              className={`font-mono text-4xl
                ${currentStatus === 'active' ? 'cursor-pointer select-none hover:scale-110' : 'cursor-not-allowed opacity-50'}
                transition-transform duration-200`}
              onClick={handleTapGoose}
            >
              {GOOSE_ASCII}
            </pre>
          </div>

          {currentStatus === 'active' && (
            <div className="mb-6 text-center">
              <div className="text-3xl font-bold text-gray-800">{score}</div>
              <div className="text-sm text-gray-600">Your Score</div>
            </div>
          )}

          {currentStatus === 'completed' && stats && (
            <div className="space-y-4">
              <h2 className="text-2xl font-bold text-center text-gray-800">
                Round Statistics
              </h2>

              <div
                className="grid grid-cols-1 gap-4 md:grid-cols-3
                  rounded-xl bg-gradient-to-br from-indigo-50 to-blue-50 p-6
                  border border-indigo-200"
              >
                <div className="text-center">
                  <div className="text-3xl font-bold text-indigo-600">
                    {stats.totalTaps}
                  </div>
                  <div className="text-sm text-gray-600">Total Taps</div>
                </div>

                <div className="text-center">
                  <div className="text-3xl font-bold text-green-600">
                    {stats.winner}
                  </div>
                  <div className="text-sm text-gray-600">Winner</div>
                </div>

                <div className="text-center">
                  <div className="text-3xl font-bold text-purple-600">
                    {stats.personalScore}
                  </div>
                  <div className="text-sm text-gray-600">Your Score</div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
