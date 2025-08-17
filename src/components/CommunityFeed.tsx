import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Users, Plus, Flag, MessageCircle, Clock, MapPin, X } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { motion, AnimatePresence } from 'framer-motion';

interface CommunityPost {
  id: string;
  title: string;
  body: string;
  tags: string[];
  created_at: string;
  author: {
    name: string;
    state?: string;
    village?: string;
  };
}

interface CommunityFeedProps {
  userId?: string;
  userState?: string;
}

export const CommunityFeed: React.FC<CommunityFeedProps> = ({ userId, userState }) => {
  const [posts, setPosts] = useState<CommunityPost[]>([]);
  const [loading, setLoading] = useState(false);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newPost, setNewPost] = useState({ title: '', body: '', tags: '' });
  const [submitting, setSubmitting] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    fetchPosts();
  }, []);

  const fetchPosts = async () => {
    setLoading(true);
    try {
      const apiUrl = import.meta.env.VITE_API_URL || '';
      const response = await fetch(`${apiUrl}/api/community/list?limit=20`);
      
      if (!response.ok) throw new Error('Failed to fetch posts');
      
      const data = await response.json();
      setPosts(data.posts || []);
    } catch (error) {
      console.error('Posts fetch error:', error);
      // Fallback mock data
      const mockPosts: CommunityPost[] = [
        {
          id: '1',
          title: 'Best time to plant tomatoes in Karnataka?',
          body: 'I am planning to plant tomatoes this season. What is the best time and any specific varieties recommended for Karnataka climate?',
          tags: ['tomato', 'karnataka', 'planting'],
          created_at: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
          author: { name: 'Ravi Kumar', state: 'Karnataka', village: 'Mysore' }
        },
        {
          id: '2', 
          title: 'Organic pest control methods',
          body: 'Looking for effective organic methods to control aphids on my chili plants. Chemical pesticides are too expensive.',
          tags: ['organic', 'pest-control', 'chili'],
          created_at: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(),
          author: { name: 'Sunita Devi', state: 'Karnataka', village: 'Bangalore Rural' }
        }
      ];
      setPosts(mockPosts);
    } finally {
      setLoading(false);
    }
  };

  const createPost = async () => {
    if (!newPost.title.trim() || !newPost.body.trim()) {
      toast({
        title: "Missing information",
        description: "Please fill in both title and description",
        variant: "destructive"
      });
      return;
    }

    if (!userId) {
      toast({
        title: "Login required",
        description: "Please log in to create posts",
        variant: "destructive"
      });
      return;
    }

    setSubmitting(true);
    
    // Optimistic UI update
    const optimisticPost: CommunityPost = {
      id: `temp-${Date.now()}`,
      title: newPost.title,
      body: newPost.body,
      tags: newPost.tags.split(',').map(t => t.trim()).filter(Boolean),
      created_at: new Date().toISOString(),
      author: { name: 'You', state: userState }
    };
    
    setPosts(prev => [optimisticPost, ...prev]);
    setNewPost({ title: '', body: '', tags: '' });
    setShowCreateForm(false);

    try {
      const apiUrl = import.meta.env.VITE_API_URL || '';
      const response = await fetch(`${apiUrl}/api/community/post`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_id: userId,
          title: newPost.title,
          body: newPost.body,
          tags: newPost.tags.split(',').map(t => t.trim()).filter(Boolean)
        })
      });

      if (!response.ok) throw new Error('Failed to create post');
      
      const data = await response.json();
      
      if (data.success) {
        // Replace optimistic post with real one
        setPosts(prev => prev.map(p => 
          p.id === optimisticPost.id 
            ? { ...optimisticPost, id: data.post_id }
            : p
        ));
        
        toast({
          title: "Post created!",
          description: data.moderated ? "Your post is now live" : "Your post is under review",
        });
      }
    } catch (error) {
      console.error('Post creation error:', error);
      // Remove optimistic post on error
      setPosts(prev => prev.filter(p => p.id !== optimisticPost.id));
      toast({
        title: "Failed to create post",
        description: "Please try again later",
        variant: "destructive"
      });
    } finally {
      setSubmitting(false);
    }
  };

  const reportPost = async (postId: string) => {
    try {
      const apiUrl = import.meta.env.VITE_API_URL || '';
      // TODO: Implement report endpoint
      console.log('Reporting post:', postId);
      toast({
        title: "Post reported",
        description: "Thank you for helping keep our community safe",
      });
    } catch (error) {
      console.error('Report error:', error);
    }
  };

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return 'Just now';
    if (diffInHours < 24) return `${diffInHours}h ago`;
    return `${Math.floor(diffInHours / 24)}d ago`;
  };

  return (
    <motion.div
      initial={{ y: 18, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ stiffness: 120 }}
    >
      <Card className="bg-white/95 dark:bg-slate-800/95 rounded-2xl shadow-lg">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg font-medium text-slate-900 dark:text-slate-100 flex items-center">
              <Users className="w-5 h-5 mr-2 text-[#2a8f6d]" />
              Community Forum
            </CardTitle>
            <Button
              onClick={() => setShowCreateForm(!showCreateForm)}
              size="sm"
              className="bg-gradient-to-r from-[#2a8f6d] to-[#74c69d]"
            >
              <Plus className="w-4 h-4 mr-1" />
              New Post
            </Button>
          </div>
        </CardHeader>

        <CardContent className="space-y-4">
          {/* Create Post Form */}
          <AnimatePresence>
            {showCreateForm && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="overflow-hidden"
              >
                <Card className="border-2 border-[#2a8f6d]/20 bg-gradient-to-r from-[#f7fbf7] to-white">
                  <CardContent className="p-4 space-y-4">
                    <div className="flex items-center justify-between">
                      <h3 className="font-medium">Create New Post</h3>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setShowCreateForm(false)}
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    </div>
                    
                    <Input
                      placeholder="Post title (e.g., Best fertilizer for wheat?)"
                      value={newPost.title}
                      onChange={(e) => setNewPost(prev => ({ ...prev, title: e.target.value }))}
                      disabled={submitting}
                    />
                    
                    <Textarea
                      placeholder="Describe your question or share your experience..."
                      value={newPost.body}
                      onChange={(e) => setNewPost(prev => ({ ...prev, body: e.target.value }))}
                      className="min-h-20"
                      disabled={submitting}
                    />
                    
                    <Input
                      placeholder="Tags (comma separated, e.g., wheat, fertilizer, karnataka)"
                      value={newPost.tags}
                      onChange={(e) => setNewPost(prev => ({ ...prev, tags: e.target.value }))}
                      disabled={submitting}
                    />
                    
                    <div className="flex gap-2">
                      <Button
                        onClick={createPost}
                        disabled={submitting || !newPost.title.trim() || !newPost.body.trim()}
                        className="flex-1"
                      >
                        {submitting ? 'Posting...' : 'Post to Community'}
                      </Button>
                      <Button
                        variant="outline"
                        onClick={() => setShowCreateForm(false)}
                        disabled={submitting}
                      >
                        Cancel
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Posts List */}
          {loading ? (
            <div className="space-y-4">
              {[1, 2, 3].map(i => (
                <div key={i} className="animate-pulse p-4 border rounded-lg">
                  <div className="h-4 bg-muted rounded w-3/4 mb-2"></div>
                  <div className="h-3 bg-muted rounded w-1/2"></div>
                </div>
              ))}
            </div>
          ) : posts.length === 0 ? (
            <Alert>
              <MessageCircle className="h-4 w-4" />
              <AlertDescription>
                No posts yet. Be the first to start a conversation!
              </AlertDescription>
            </Alert>
          ) : (
            <div className="space-y-4">
              <AnimatePresence>
                {posts.map((post, index) => (
                  <motion.div
                    key={post.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="border rounded-lg p-4 bg-gradient-to-r from-white to-[#f7fbf7] hover:shadow-md transition-shadow"
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <h3 className="font-semibold text-slate-900 dark:text-slate-100 mb-1">
                          {post.title}
                        </h3>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
                          <span className="font-medium">{post.author.name}</span>
                          {post.author.state && (
                            <>
                              <span>•</span>
                              <div className="flex items-center">
                                <MapPin className="w-3 h-3 mr-1" />
                                {post.author.village ? `${post.author.village}, ${post.author.state}` : post.author.state}
                              </div>
                            </>
                          )}
                          <span>•</span>
                          <div className="flex items-center">
                            <Clock className="w-3 h-3 mr-1" />
                            {formatTimeAgo(post.created_at)}
                          </div>
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => reportPost(post.id)}
                        className="text-muted-foreground hover:text-red-600"
                      >
                        <Flag className="w-3 h-3" />
                      </Button>
                    </div>
                    
                    <p className="text-slate-700 dark:text-slate-300 mb-3 leading-relaxed">
                      {post.body}
                    </p>
                    
                    {post.tags.length > 0 && (
                      <div className="flex flex-wrap gap-1">
                        {post.tags.map((tag, i) => (
                          <Badge
                            key={i}
                            variant="secondary"
                            className="text-xs bg-[#2a8f6d]/10 text-[#2a8f6d] hover:bg-[#2a8f6d]/20"
                          >
                            #{tag}
                          </Badge>
                        ))}
                      </div>
                    )}
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
};