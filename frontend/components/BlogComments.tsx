// components/BlogComments.tsx
"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { MessageCircle, User, Calendar, Send } from "lucide-react";

interface Comment {
  id: string;
  content: string;
  createdAt: string;
  author: {
    id: string;
    username: string | null;
    email: string;
  };
  replies: Comment[];
}

interface BlogCommentsProps {
  slug: string;
  initialComments: Comment[];
}

export default function BlogComments({
  slug,
  initialComments,
}: BlogCommentsProps) {
  const [comments, setComments] = useState<Comment[]>(initialComments);
  const [newComment, setNewComment] = useState("");
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [replyContent, setReplyContent] = useState("");
  const [loading, setLoading] = useState(false);

  const submitComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim()) return;

    setLoading(true);
    try {
      const response = await fetch(`/api/v1/blogs/${slug}/comments`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          content: newComment,
          parentId: replyingTo,
        }),
      });

      const result = await response.json();

      if (result.success) {
        setNewComment("");
        setReplyingTo(null);
        setReplyContent("");
        // Refresh comments
        const refreshResponse = await fetch(`/api/v1/blogs/${slug}/comments`);
        const refreshResult = await refreshResponse.json();
        if (refreshResult.success) {
          setComments(refreshResult.data);
        }
      }
    } catch (error) {
      console.error("Error posting comment:", error);
    } finally {
      setLoading(false);
    }
  };

  const submitReply = async (parentId: string) => {
    if (!replyContent.trim()) return;

    setLoading(true);
    try {
      const response = await fetch(`/api/v1/blogs/${slug}/comments`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          content: replyContent,
          parentId,
        }),
      });

      const result = await response.json();

      if (result.success) {
        setReplyContent("");
        setReplyingTo(null);
        // Refresh comments
        const refreshResponse = await fetch(`/api/v1/blogs/${slug}/comments`);
        const refreshResult = await refreshResponse.json();
        if (refreshResult.success) {
          setComments(refreshResult.data);
        }
      }
    } catch (error) {
      console.error("Error posting reply:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* Comment Count */}
      <div className="flex items-center gap-2">
        <MessageCircle className="w-5 h-5 text-gray-600" />
        <h3 className="text-xl font-semibold text-gray-900">
          Comments ({comments.length})
        </h3>
      </div>

      {/* Add Comment Form */}
      <Card>
        <CardContent className="p-6">
          <form onSubmit={submitComment} className="space-y-4">
            <Textarea
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              placeholder="Share your thoughts..."
              rows={4}
              className="resize-none"
              required
            />
            <div className="flex justify-end">
              <Button
                type="submit"
                disabled={loading || !newComment.trim()}
                className="flex items-center gap-2"
              >
                <Send className="w-4 h-4" />
                {loading ? "Posting..." : "Post Comment"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      {/* Comments List */}
      <div className="space-y-6">
        {comments.map((comment) => (
          <Card key={comment.id} className="overflow-hidden">
            <CardContent className="p-6">
              {/* Main Comment */}
              <div className="space-y-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                      <User className="w-4 h-4 text-white" />
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900">
                        {comment.author.username || comment.author.email}
                      </p>
                      <p className="text-sm text-gray-500 flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        {new Date(comment.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                </div>

                <p className="text-gray-700 whitespace-pre-wrap pl-11">
                  {comment.content}
                </p>

                {/* Reply Button */}
                <div className="pl-11">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() =>
                      setReplyingTo(
                        replyingTo === comment.id ? null : comment.id
                      )
                    }
                    className="text-blue-600 hover:text-blue-700"
                  >
                    Reply
                  </Button>
                </div>

                {/* Reply Form */}
                {replyingTo === comment.id && (
                  <div className="pl-11 pt-4 border-l-2 border-gray-200 ml-4">
                    <div className="space-y-3">
                      <Textarea
                        value={replyContent}
                        onChange={(e) => setReplyContent(e.target.value)}
                        placeholder="Write a reply..."
                        rows={2}
                        className="resize-none"
                      />
                      <div className="flex gap-2">
                        <Button
                          onClick={() => submitReply(comment.id)}
                          disabled={loading || !replyContent.trim()}
                          size="sm"
                        >
                          {loading ? "Posting..." : "Post Reply"}
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setReplyingTo(null);
                            setReplyContent("");
                          }}
                        >
                          Cancel
                        </Button>
                      </div>
                    </div>
                  </div>
                )}

                {/* Replies */}
                {comment.replies.length > 0 && (
                  <div className="pl-11 space-y-4 mt-4 border-l-2 border-gray-200 ml-4">
                    {comment.replies.map((reply) => (
                      <div key={reply.id} className="pt-4">
                        <div className="flex items-center gap-3 mb-2">
                          <div className="w-6 h-6 bg-gradient-to-r from-green-500 to-blue-600 rounded-full flex items-center justify-center">
                            <User className="w-3 h-3 text-white" />
                          </div>
                          <div>
                            <p className="font-medium text-gray-900 text-sm">
                              {reply.author.username || reply.author.email}
                            </p>
                            <p className="text-xs text-gray-500 flex items-center gap-1">
                              <Calendar className="w-3 h-3" />
                              {new Date(reply.createdAt).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                        <p className="text-gray-700 text-sm whitespace-pre-wrap pl-9">
                          {reply.content}
                        </p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        ))}

        {comments.length === 0 && (
          <Card>
            <CardContent className="p-8 text-center">
              <MessageCircle className="w-12 h-12 text-gray-300 mx-auto mb-4" />
              <h4 className="text-lg font-semibold text-gray-600 mb-2">
                No comments yet
              </h4>
              <p className="text-gray-500">
                Be the first to share your thoughts on this blog post!
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
