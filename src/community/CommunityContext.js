import { createContext, useCallback, useContext, useMemo, useRef, useState } from 'react';

import {
  COMMUNITY_PAGE_SIZE,
  createCommunityQuestion,
  getCommunityQuestions,
} from './communityQuestionsService';
import { createCommunityReply, getCommunityReplies } from './communityRepliesService';

const CommunityContext = createContext(null);

export function CommunityProvider({ children }) {
  const [questions, setQuestions] = useState([]);
  const questionsRef = useRef([]);
  const [category, setCategoryState] = useState(null);
  const [loading, setLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [loadError, setLoadError] = useState(null);
  const [submittingQuestion, setSubmittingQuestion] = useState(false);
  const [submittingReply, setSubmittingReply] = useState(false);
  const [selectedQuestionId, setSelectedQuestionId] = useState(null);
  const [repliesByQuestion, setRepliesByQuestion] = useState({});
  const [replyErrors, setReplyErrors] = useState({});
  const [loadingReplies, setLoadingReplies] = useState({});
  const requestId = useRef(0);

  const loadQuestions = useCallback(async ({ nextCategory = null, append = false } = {}) => {
    const offset = append ? questionsRef.current.length : 0;
    const currentRequest = ++requestId.current;
    setCategoryState(nextCategory);
    setLoadError(null);
    if (append) setLoadingMore(true);
    else if (offset === 0) setLoading(true);
    try {
      const result = await getCommunityQuestions(nextCategory, offset);
      if (currentRequest !== requestId.current) return result;
      if (result.error) throw result.error;
      const rows = result.data ?? [];
      setQuestions((current) => {
        const next = append ? [...current, ...rows] : rows;
        questionsRef.current = next;
        return next;
      });
      setHasMore(rows.length === COMMUNITY_PAGE_SIZE);
      return { data: rows, error: null };
    } catch (error) {
      if (currentRequest === requestId.current) setLoadError(error);
      return { data: null, error };
    } finally {
      if (currentRequest === requestId.current) {
        setLoading(false);
        setLoadingMore(false);
        setRefreshing(false);
      }
    }
  }, []);

  const refreshQuestions = useCallback(async () => {
    setRefreshing(true);
    return loadQuestions({ nextCategory: category, append: false });
  }, [category, loadQuestions]);

  const selectCategory = useCallback((nextCategory) => {
    const selected = category === nextCategory ? null : nextCategory;
    questionsRef.current = [];
    setQuestions([]);
    setHasMore(true);
    setLoadError(null);
    setCategoryState(selected);
  }, [category]);

  const loadMoreQuestions = useCallback(async () => {
    if (loading || loadingMore || !hasMore) return { data: [], error: null };
    return loadQuestions({ nextCategory: category, append: true });
  }, [category, hasMore, loadQuestions, loading, loadingMore]);

  const submitQuestion = useCallback(async (values) => {
    setSubmittingQuestion(true);
    try {
      const result = await createCommunityQuestion(values);
      if (result.error) return result;
      questionsRef.current = [];
      setQuestions([]);
      setCategoryState(values.category);
      setHasMore(true);
      await loadQuestions({ nextCategory: values.category, append: false });
      return result;
    } finally {
      setSubmittingQuestion(false);
    }
  }, [loadQuestions]);

  const toggleQuestion = useCallback(async (questionId) => {
    if (selectedQuestionId === questionId) {
      setSelectedQuestionId(null);
      return { data: repliesByQuestion[questionId] ?? [], error: null };
    }
    setSelectedQuestionId(questionId);
    if (repliesByQuestion[questionId]) return { data: repliesByQuestion[questionId], error: null };
    setLoadingReplies((current) => ({ ...current, [questionId]: true }));
    setReplyErrors((current) => ({ ...current, [questionId]: null }));
    try {
      const result = await getCommunityReplies(questionId);
      if (result.error) throw result.error;
      setRepliesByQuestion((current) => ({ ...current, [questionId]: result.data ?? [] }));
      return result;
    } catch (error) {
      setReplyErrors((current) => ({ ...current, [questionId]: error }));
      return { data: null, error };
    } finally {
      setLoadingReplies((current) => ({ ...current, [questionId]: false }));
    }
  }, [repliesByQuestion, selectedQuestionId]);

  const refreshReplies = useCallback(async (questionId) => {
    setLoadingReplies((current) => ({ ...current, [questionId]: true }));
    setReplyErrors((current) => ({ ...current, [questionId]: null }));
    try {
      const result = await getCommunityReplies(questionId);
      if (result.error) throw result.error;
      setRepliesByQuestion((current) => ({ ...current, [questionId]: result.data ?? [] }));
      return result;
    } catch (error) {
      setReplyErrors((current) => ({ ...current, [questionId]: error }));
      return { data: null, error };
    } finally {
      setLoadingReplies((current) => ({ ...current, [questionId]: false }));
    }
  }, []);

  const submitReply = useCallback(async ({ questionId, body }) => {
    setSubmittingReply(true);
    try {
      const result = await createCommunityReply({ questionId, body });
      if (result.error) return result;
      await refreshReplies(questionId);
      return result;
    } finally {
      setSubmittingReply(false);
    }
  }, [refreshReplies]);

  const value = useMemo(() => ({
    questions, category, loading, loadingMore, refreshing, hasMore, loadError,
    submittingQuestion, submittingReply, selectedQuestionId, repliesByQuestion,
    replyErrors, loadingReplies, loadQuestions, refreshQuestions,
    selectCategory, loadMoreQuestions, submitQuestion, toggleQuestion,
    refreshReplies, submitReply,
  }), [questions, category, loading, loadingMore, refreshing, hasMore, loadError,
    submittingQuestion, submittingReply, selectedQuestionId, repliesByQuestion,
    replyErrors, loadingReplies, loadQuestions, refreshQuestions, selectCategory,
    loadMoreQuestions, submitQuestion, toggleQuestion, refreshReplies, submitReply]);

  return <CommunityContext.Provider value={value}>{children}</CommunityContext.Provider>;
}

export function useCommunity() {
  const value = useContext(CommunityContext);
  if (!value) throw new Error('useCommunity must be used within CommunityProvider');
  return value;
}
