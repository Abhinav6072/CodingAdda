import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageSquare, ThumbsUp, Send, User, ChevronLeft, Plus, Clock } from 'lucide-react';
import axiosClient from '../utils/axiosClient';
import { useSelector } from 'react-redux';

const Discussions = ({ problemId }) => {
  const { user } = useSelector((state) => state.auth);
  const [discussions, setDiscussions] = useState([]);
  const [view, setView] = useState('list'); // 'list', 'thread', 'create'
  const [activeThread, setActiveThread] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Form states
  const [newTitle, setNewTitle] = useState('');
  const [newContent, setNewContent] = useState('');
  const [newComment, setNewComment] = useState('');

  useEffect(() => {
    fetchDiscussions();
  }, [problemId]);

  const fetchDiscussions = async () => {
    try {
      setLoading(true);
      const res = await axiosClient.get(`/discussion/problem/${problemId}`);
      setDiscussions(res.data);
    } catch (error) {
      console.error("Error fetching discussions:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreatePost = async (e) => {
    e.preventDefault();
    if (!newTitle.trim() || !newContent.trim()) return;

    try {
      setLoading(true);
      const res = await axiosClient.post(`/discussion/create/${problemId}`, {
        title: newTitle,
        content: newContent
      });
      setDiscussions([res.data, ...discussions]);
      setNewTitle('');
      setNewContent('');
      setError(null);
      setView('list');
    } catch (error) {
      console.error("Error creating post:", error);
      setError(error.response?.data?.message || "Failed to create post");
    } finally {
      setLoading(false);
    }
  };

  const hasUserPosted = user && discussions.some(d => d.userId?._id === user._id);

  const handleToggleUpvote = async (discussionId) => {
    if (!user) return; // Must be logged in

    try {
      const res = await axiosClient.post(`/discussion/upvote/${discussionId}`);
      
      // Update local state
      const { upvotes, hasUpvoted } = res.data;
      
      const updateThread = (thread) => {
        if (thread._id !== discussionId) return thread;
        let newUpvotes = [...thread.upvotes];
        if (hasUpvoted) {
          newUpvotes.push(user._id);
        } else {
          newUpvotes = newUpvotes.filter(id => id !== user._id);
        }
        return { ...thread, upvotes: newUpvotes };
      };

      setDiscussions(discussions.map(updateThread));
      if (activeThread && activeThread._id === discussionId) {
        setActiveThread(updateThread(activeThread));
      }
    } catch (error) {
      console.error("Error toggling upvote:", error);
    }
  };

  const handleAddComment = async (e) => {
    e.preventDefault();
    if (!newComment.trim() || !activeThread) return;

    try {
      setLoading(true);
      const res = await axiosClient.post(`/discussion/comment/${activeThread._id}`, {
        text: newComment
      });
      
      const updatedComments = res.data;
      const updatedThread = { ...activeThread, comments: updatedComments };
      
      setActiveThread(updatedThread);
      setDiscussions(discussions.map(d => d._id === updatedThread._id ? updatedThread : d));
      setNewComment('');
    } catch (error) {
      console.error("Error adding comment:", error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  return (
    <div className="h-full flex flex-col space-y-4">
      
      {/* Header section based on view */}
      <div className="flex items-center justify-between pb-2 border-b border-white/10 shrink-0">
        <div className="flex items-center gap-2">
          {view !== 'list' && (
            <button 
              onClick={() => setView('list')}
              className="p-1 hover:bg-white/10 rounded-lg text-gray-400 hover:text-white transition-colors"
            >
              <ChevronLeft size={20} />
            </button>
          )}
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <MessageSquare className="text-blue-500" />
            {view === 'list' && "Community Discussions"}
            {view === 'create' && "New Post"}
            {view === 'thread' && "Thread"}
          </h2>
        </div>
        
        {view === 'list' && !hasUserPosted && (
          <button 
            onClick={() => {
              setError(null);
              setView('create');
            }}
            className="flex items-center gap-1 px-3 py-1.5 bg-blue-500/20 text-blue-400 hover:bg-blue-500/30 rounded-lg text-sm font-medium transition-colors border border-blue-500/30"
          >
            <Plus size={16} /> New Post
          </button>
        )}
      </div>

      {/* Main Content Area */}
      <div className="flex-1 overflow-y-auto custom-scrollbar">
        <AnimatePresence mode="wait">
          
          {/* List View */}
          {view === 'list' && (
            <motion.div 
              key="list"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              className="space-y-3"
            >
              {loading && discussions.length === 0 ? (
                <div className="flex justify-center py-10"><span className="loading loading-spinner text-blue-500"></span></div>
              ) : discussions.length === 0 ? (
                <div className="text-center py-12 text-gray-500 bg-white/5 rounded-xl border border-white/10">
                  <MessageSquare size={48} className="mx-auto mb-3 opacity-20" />
                  <p>No discussions yet. Be the first to start one!</p>
                </div>
              ) : (
                discussions.map(discussion => (
                  <div 
                    key={discussion._id}
                    onClick={() => {
                      setActiveThread(discussion);
                      setView('thread');
                    }}
                    className="bg-white/5 border border-white/10 rounded-xl p-4 hover:bg-white/10 hover:border-white/20 transition-all cursor-pointer group"
                  >
                    <h3 className="text-lg font-bold text-gray-200 group-hover:text-white mb-2">{discussion.title}</h3>
                    <div className="flex items-center gap-4 text-xs text-gray-500">
                      <div className="flex items-center gap-1">
                        <User size={14} />
                        {discussion.userId?.firstName} {discussion.userId?.lastName}
                      </div>
                      <div className="flex items-center gap-1">
                        <ThumbsUp size={14} />
                        {discussion.upvotes?.length || 0}
                      </div>
                      <div className="flex items-center gap-1">
                        <MessageSquare size={14} />
                        {discussion.comments?.length || 0}
                      </div>
                      <div className="flex items-center gap-1">
                        <Clock size={14} />
                        {formatDate(discussion.createdAt)}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </motion.div>
          )}

          {/* Create View */}
          {view === 'create' && (
            <motion.div 
              key="create"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="bg-white/5 border border-white/10 rounded-xl p-5"
            >
              {error && (
                <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-3 rounded-lg mb-4 text-sm font-medium">
                  {error}
                </div>
              )}
              <form onSubmit={handleCreatePost} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-1">Title</label>
                  <input 
                    type="text"
                    value={newTitle}
                    onChange={(e) => setNewTitle(e.target.value)}
                    placeholder="e.g. O(N) Time and O(1) Space Approach in C++"
                    className="w-full bg-black/40 border border-white/10 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-blue-500/50"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-1">Content / Code Explanation</label>
                  <textarea 
                    value={newContent}
                    onChange={(e) => setNewContent(e.target.value)}
                    placeholder="Explain your approach or paste your code here..."
                    className="w-full bg-black/40 border border-white/10 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-blue-500/50 min-h-[200px] font-mono text-sm resize-y"
                    required
                  />
                </div>
                <div className="flex justify-end gap-3 pt-2">
                  <button 
                    type="button" 
                    onClick={() => setView('list')}
                    className="px-4 py-2 rounded-lg text-gray-400 hover:text-white hover:bg-white/5 transition-colors text-sm"
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit"
                    disabled={loading || !newTitle.trim() || !newContent.trim()}
                    className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-500 transition-colors text-sm font-medium disabled:opacity-50"
                  >
                    {loading ? <span className="loading loading-spinner loading-xs"></span> : <Send size={16} />}
                    Post Discussion
                  </button>
                </div>
              </form>
            </motion.div>
          )}

          {/* Thread View */}
          {view === 'thread' && activeThread && (
            <motion.div 
              key="thread"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-6"
            >
              {/* Original Post */}
              <div className="bg-white/5 border border-white/10 rounded-xl p-5 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/5 blur-3xl rounded-full pointer-events-none" />
                
                <h3 className="text-xl font-bold text-white mb-3 leading-tight">{activeThread.title}</h3>
                
                <div className="flex items-center gap-4 text-xs text-gray-500 mb-6 pb-4 border-b border-white/10">
                  <div className="flex items-center gap-1 bg-black/40 px-2 py-1 rounded-full">
                    <User size={12} className="text-gray-400" />
                    <span className="font-medium text-gray-300">{activeThread.userId?.firstName} {activeThread.userId?.lastName}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Clock size={12} />
                    {formatDate(activeThread.createdAt)}
                  </div>
                </div>

                <div className="prose prose-invert max-w-none text-sm text-gray-300 mb-6">
                  <pre className="bg-black/60 p-4 rounded-lg overflow-x-auto text-blue-200 border border-white/5 whitespace-pre-wrap font-mono">
                    {activeThread.content}
                  </pre>
                </div>

                <div className="flex items-center gap-4 pt-4">
                  <button 
                    onClick={() => handleToggleUpvote(activeThread._id)}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg border text-sm font-medium transition-all ${
                      activeThread.upvotes?.includes(user?._id) 
                      ? 'bg-blue-500/20 border-blue-500/40 text-blue-400' 
                      : 'bg-white/5 border-white/10 text-gray-400 hover:bg-white/10 hover:text-gray-200'
                    }`}
                  >
                    <ThumbsUp size={16} className={activeThread.upvotes?.includes(user?._id) ? 'fill-blue-400' : ''} />
                    {activeThread.upvotes?.length || 0} Upvotes
                  </button>
                  <span className="text-sm text-gray-500 flex items-center gap-1">
                    <MessageSquare size={16} /> {activeThread.comments?.length || 0} Comments
                  </span>
                </div>
              </div>

              {/* Comments Section */}
              <div className="space-y-4 pl-4 md:pl-8 border-l border-white/10">
                <h4 className="text-sm font-bold text-gray-400 uppercase tracking-wider">Discussion</h4>
                
                {/* Existing Comments */}
                <div className="space-y-3">
                  {activeThread.comments?.map((comment, index) => (
                    <div key={index} className="bg-black/40 border border-white/5 rounded-xl p-4">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <div className="w-6 h-6 rounded-full bg-blue-500/20 flex items-center justify-center text-[10px] font-bold text-blue-400">
                            {comment.userId?.firstName?.charAt(0)}
                          </div>
                          <span className="text-sm font-medium text-gray-300">
                            {comment.userId?.firstName} {comment.userId?.lastName}
                          </span>
                        </div>
                        <span className="text-xs text-gray-600">{formatDate(comment.createdAt)}</span>
                      </div>
                      <p className="text-sm text-gray-400 pl-8">{comment.text}</p>
                    </div>
                  ))}
                  {(!activeThread.comments || activeThread.comments.length === 0) && (
                    <div className="text-sm text-gray-600 italic pl-2">No comments yet.</div>
                  )}
                </div>

                {/* Add Comment Form */}
                <form onSubmit={handleAddComment} className="pt-4 flex gap-3 relative">
                  <div className="w-8 h-8 rounded-full bg-white/10 shrink-0 flex items-center justify-center font-bold text-gray-400 text-xs mt-1">
                    {user?.firstName?.charAt(0) || '?'}
                  </div>
                  <div className="flex-1 relative">
                    <textarea
                      value={newComment}
                      onChange={(e) => setNewComment(e.target.value)}
                      placeholder="Add a comment..."
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-blue-500/50 min-h-[80px] resize-y"
                    />
                    <button 
                      type="submit"
                      disabled={loading || !newComment.trim()}
                      className="absolute bottom-3 right-3 p-2 bg-blue-600 text-white rounded-lg hover:bg-blue-500 transition-colors disabled:opacity-50"
                    >
                      {loading ? <span className="loading loading-spinner loading-xs"></span> : <Send size={14} />}
                    </button>
                  </div>
                </form>
              </div>

            </motion.div>
          )}

        </AnimatePresence>
      </div>
    </div>
  );
};

export default Discussions;
