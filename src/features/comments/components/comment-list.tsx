import { useState, useEffect, useCallback } from "react";
import { Send, Trash2, MessageSquare, Loader2, Pencil, Check, X } from "lucide-react";
import { Button } from "@/shared/components/ui/button";
import { Textarea } from "@/shared/components/ui/textarea";
import { commentService } from "../services/comment.service";
import type { TaskComment } from "../types/comment.types";
import { logger } from "@/shared/lib/logger";
import { formatDistanceToNow } from "date-fns";

interface CommentListProps {
  taskId: string;
  userId: string;
}

export function CommentList({ taskId, userId }: CommentListProps) {
  const [comments, setComments] = useState<TaskComment[]>([]);
  const [newComment, setNewComment] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editContent, setEditContent] = useState("");

  const loadComments = useCallback(async () => {
    setIsLoading(true);
    try {
      const data = await commentService.getComments(taskId);
      setComments(data);
    } finally {
      setIsLoading(false);
    }
  }, [taskId]);

  useEffect(() => {
    loadComments();
  }, [loadComments]);

  const handleSubmit = async () => {
    if (!newComment.trim() || isSending) return;
    setIsSending(true);
    try {
      const comment = await commentService.addComment(taskId, userId, newComment.trim());
      setComments((prev) => [comment, ...prev]);
      setNewComment("");
    } catch (error) {
      logger.error("Error adding comment", { error });
    } finally {
      setIsSending(false);
    }
  };

  const handleDelete = async (commentId: string) => {
    try {
      await commentService.deleteComment(commentId);
      setComments((prev) => prev.filter((c) => c.id !== commentId));
    } catch (error) {
      logger.error("Error deleting comment", { error });
    }
  };

  const handleStartEdit = (comment: TaskComment) => {
    setEditingId(comment.id);
    setEditContent(comment.content);
  };

  const handleSaveEdit = async () => {
    if (!editingId || !editContent.trim()) return;
    try {
      const updated = await commentService.updateComment(editingId, editContent.trim());
      setComments((prev) => prev.map((c) => (c.id === editingId ? updated : c)));
      setEditingId(null);
      setEditContent("");
    } catch (error) {
      logger.error("Error updating comment", { error });
    }
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setEditContent("");
  };

  return (
    <div className="pt-3 border-t">
      <div className="flex items-center gap-2 mb-3">
        <MessageSquare className="size-4 text-muted-foreground" />
        <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
          Comments
        </span>
        {comments.length > 0 && (
          <span className="text-xs text-muted-foreground">({comments.length})</span>
        )}
      </div>

      {/* Add comment */}
      <div className="flex gap-2 mb-3 pl-6">
        <Textarea
          value={newComment}
          onChange={(e) => setNewComment(e.target.value)}
          placeholder="Add a comment..."
          className="min-h-16 resize-none text-sm"
          onKeyDown={(e) => {
            if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) {
              handleSubmit();
            }
          }}
        />
        <Button
          size="icon"
          variant="ghost"
          className="shrink-0 mt-auto"
          disabled={!newComment.trim() || isSending}
          onClick={handleSubmit}
          aria-label="Send comment"
        >
          {isSending ? <Loader2 className="size-4 animate-spin" /> : <Send className="size-4" />}
        </Button>
      </div>

      {/* Comments list */}
      {isLoading ? (
        <div className="flex items-center justify-center py-4">
          <Loader2 className="size-4 animate-spin text-muted-foreground" />
        </div>
      ) : (
        <div className="space-y-3 pl-6">
          {comments.map((comment) => (
            <div key={comment.id} className="group flex gap-2">
              <div className="flex-1 rounded-lg bg-muted/50 p-2.5">
                {editingId === comment.id ? (
                  <div className="space-y-2">
                    <Textarea
                      value={editContent}
                      onChange={(e) => setEditContent(e.target.value)}
                      className="min-h-16 resize-none text-sm"
                      autoFocus
                      onKeyDown={(e) => {
                        if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) handleSaveEdit();
                        if (e.key === "Escape") handleCancelEdit();
                      }}
                    />
                    <div className="flex gap-1 justify-end">
                      <Button size="icon" variant="ghost" className="size-6" onClick={handleCancelEdit} aria-label="Cancel editing">
                        <X className="size-3.5" />
                      </Button>
                      <Button
                        size="icon"
                        variant="ghost"
                        className="size-6 text-brand"
                        disabled={!editContent.trim()}
                        onClick={handleSaveEdit}
                        aria-label="Save comment"
                      >
                        <Check className="size-3.5" />
                      </Button>
                    </div>
                  </div>
                ) : (
                  <>
                    <p className="text-sm whitespace-pre-wrap break-words">{comment.content}</p>
                    <span className="text-xs text-muted-foreground mt-1 block">
                      {formatDistanceToNow(new Date(comment.createdAt), { addSuffix: true })}
                    </span>
                  </>
                )}
              </div>
              {editingId !== comment.id && (
                <div className="flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-opacity shrink-0 mt-1">
                  <button onClick={() => handleStartEdit(comment)}>
                    <Pencil className="size-3.5 text-muted-foreground hover:text-foreground" />
                  </button>
                  <button onClick={() => handleDelete(comment.id)}>
                    <Trash2 className="size-3.5 text-muted-foreground hover:text-destructive" />
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
