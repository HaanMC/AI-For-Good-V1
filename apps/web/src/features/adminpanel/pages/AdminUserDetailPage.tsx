import React, { useEffect, useMemo, useState } from 'react';
import { useParams } from 'react-router-dom';
import { apiGet } from '../../../shared/services/apiClient';

type UserRecord = {
  id: string;
  uid: string;
  username: string;
  displayName?: string;
  role?: string;
  createdAt?: { seconds: number } | string;
  lastLoginAt?: { seconds: number } | string;
};

type ProfileRecord = {
  weaknesses?: Record<string, number>;
  scores?: {
    history?: number[];
    average?: number | null;
  };
};

type SubmissionRecord = {
  id: string;
  type?: string;
  content?: string;
  feedback?: string;
  score?: number | null;
  weaknessesExtracted?: string[];
  createdAt?: { seconds: number } | string;
};

const formatDate = (value?: { seconds?: number; _seconds?: number } | string) => {
  if (!value) return '—';
  if (typeof value === 'string') return new Date(value).toLocaleString();
  if ('seconds' in value && typeof value.seconds === 'number') {
    return new Date(value.seconds * 1000).toLocaleString();
  }
  if ('_seconds' in value && typeof value._seconds === 'number') {
    return new Date(value._seconds * 1000).toLocaleString();
  }
  return '—';
};

const AdminUserDetailPage: React.FC = () => {
  const { uid } = useParams();
  const [user, setUser] = useState<UserRecord | null>(null);
  const [profile, setProfile] = useState<ProfileRecord | null>(null);
  const [submissions, setSubmissions] = useState<SubmissionRecord[]>([]);
  const [selectedSubmissionId, setSelectedSubmissionId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      if (!uid) return;
      try {
        const response = await apiGet<{
          user: UserRecord;
          profile: ProfileRecord | null;
          submissions: SubmissionRecord[];
        }>(`/api/admin/user/${uid}`);
        setUser(response.user);
        setProfile(response.profile);
        setSubmissions(response.submissions);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [uid]);

  useEffect(() => {
    const title = user?.displayName || user?.username;
    document.title = title ? `Admin Panel — ${title}` : 'Admin Panel — User';
  }, [user]);

  const weaknesses = useMemo(() => {
    const entries = Object.entries(profile?.weaknesses ?? {});
    return entries.sort((a, b) => b[1] - a[1]);
  }, [profile]);

  if (loading) {
    return <p className="text-sm text-stone-500">Đang tải...</p>;
  }

  if (!user) {
    return <p className="text-sm text-stone-500">Không tìm thấy học sinh.</p>;
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold text-stone-900">{user.displayName || user.username}</h2>
        <p className="text-sm text-stone-500">Username: {user.username}</p>
        <div className="mt-2 flex flex-wrap gap-4 text-xs text-stone-500">
          <span>Role: {user.role || 'student'}</span>
          <span>Created: {formatDate(user.createdAt)}</span>
          <span>Last login: {formatDate(user.lastLoginAt)}</span>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="rounded-2xl border border-stone-200 p-4">
          <h3 className="text-sm font-semibold text-stone-900">Weakness summary</h3>
          {weaknesses.length ? (
            <ul className="mt-3 space-y-2 text-sm text-stone-600">
              {weaknesses.map(([key, value]) => (
                <li key={key} className="flex items-center justify-between">
                  <span>{key}</span>
                  <span className="font-medium text-stone-900">{value}</span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="mt-3 text-sm text-stone-500">Chưa có dữ liệu điểm yếu.</p>
          )}
        </div>

        <div className="rounded-2xl border border-stone-200 p-4">
          <h3 className="text-sm font-semibold text-stone-900">Score summary</h3>
          <p className="mt-2 text-sm text-stone-600">
            Average: {profile?.scores?.average ?? '—'}
          </p>
          {profile?.scores?.history?.length ? (
            <div className="mt-3 flex flex-wrap gap-2 text-xs text-stone-500">
              {profile.scores.history.map((score, index) => (
                <span key={`${score}-${index}`} className="rounded-full bg-stone-100 px-3 py-1">
                  {score}
                </span>
              ))}
            </div>
          ) : (
            <p className="mt-3 text-sm text-stone-500">Chưa có lịch sử điểm.</p>
          )}
        </div>
      </div>

      <div className="space-y-3">
        <h3 className="text-sm font-semibold text-stone-900">Recent submissions</h3>
        {submissions.length ? (
          <div className="space-y-3">
            {submissions.map((submission) => {
              const isOpen = selectedSubmissionId === submission.id;
              return (
                <div key={submission.id} className="rounded-2xl border border-stone-200 p-4">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="text-sm text-stone-700">
                      <span className="font-medium text-stone-900">{submission.type || 'unknown'}</span>
                      <span className="ml-2 text-xs text-stone-500">{formatDate(submission.createdAt)}</span>
                    </div>
                    <div className="flex items-center gap-3 text-xs text-stone-500">
                      <span>Score: {submission.score ?? '—'}</span>
                      <button
                        onClick={() => setSelectedSubmissionId(isOpen ? null : submission.id)}
                        className="rounded-full border border-stone-200 px-3 py-1 text-xs hover:bg-stone-50"
                      >
                        {isOpen ? 'Ẩn' : 'Xem'}
                      </button>
                    </div>
                  </div>
                  {isOpen && (
                    <div className="mt-4 space-y-3 text-sm text-stone-600">
                      <div>
                        <p className="text-xs font-semibold text-stone-500">Content</p>
                        <p className="mt-1 whitespace-pre-wrap">{submission.content || '—'}</p>
                      </div>
                      <div>
                        <p className="text-xs font-semibold text-stone-500">Feedback</p>
                        <p className="mt-1 whitespace-pre-wrap">{submission.feedback || '—'}</p>
                      </div>
                      {submission.weaknessesExtracted?.length ? (
                        <div className="flex flex-wrap gap-2 text-xs text-stone-500">
                          {submission.weaknessesExtracted.map((weakness) => (
                            <span key={weakness} className="rounded-full bg-stone-100 px-3 py-1">
                              {weakness}
                            </span>
                          ))}
                        </div>
                      ) : null}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        ) : (
          <p className="text-sm text-stone-500">Chưa có bài nộp nào.</p>
        )}
      </div>
    </div>
  );
};

export default AdminUserDetailPage;
