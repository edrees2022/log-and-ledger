import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  MessageSquare,
  Send,
  MoreHorizontal,
  Edit2,
  Trash2,
  Pin,
  PinOff,
  Reply,
  Heart,
  Check,
  Loader2,
  Clock,
  User,
  FileText,
  AlertCircle,
} from "lucide-react";
import { format, formatDistanceToNow } from "date-fns";
import { ar, enUS } from "date-fns/locale";
import { useToast } from "@/hooks/use-toast";

interface Note {
  id: string;
  content: string;
  createdAt: Date;
  updatedAt?: Date;
  createdBy: {
    id: string;
    name: string;
    avatar?: string;
  };
  isPinned?: boolean;
  isPrivate?: boolean;
  mentions?: string[];
  attachments?: {
    id: string;
    name: string;
    type: string;
    url: string;
  }[];
  replies?: Note[];
  reactions?: {
    type: string;
    count: number;
    users: string[];
  }[];
}

interface NotesSystemProps {
  entityType: "invoice" | "contact" | "item" | "project" | "expense" | "journal";
  entityId: string | number;
  maxHeight?: string;
  allowReplies?: boolean;
  allowReactions?: boolean;
  allowPinning?: boolean;
}

export default function NotesSystem({
  entityType,
  entityId,
  maxHeight = "400px",
  allowReplies = true,
  allowReactions = true,
  allowPinning = true,
}: NotesSystemProps) {
  const { t, i18n } = useTranslation();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const isRTL = i18n.language === "ar";
  const dateLocale = i18n.language === "ar" ? ar : enUS;

  const [newNote, setNewNote] = useState("");
  const [editingNote, setEditingNote] = useState<string | null>(null);
  const [editContent, setEditContent] = useState("");
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [replyContent, setReplyContent] = useState("");

  // Mock notes - in real app, fetch from API
  const [notes, setNotes] = useState<Note[]>([
    {
      id: "1",
      content: "تم التواصل مع العميل وتأكيد تفاصيل الفاتورة",
      createdAt: new Date(Date.now() - 1000 * 60 * 30),
      createdBy: { id: "1", name: "أحمد محمد" },
      isPinned: true,
    },
    {
      id: "2",
      content: "العميل طلب تأجيل الدفع لمدة أسبوع",
      createdAt: new Date(Date.now() - 1000 * 60 * 60 * 2),
      createdBy: { id: "2", name: "سارة أحمد" },
      reactions: [{ type: "👍", count: 2, users: ["1", "3"] }],
    },
  ]);

  const [isSubmitting, setIsSubmitting] = useState(false);

  // Add note
  const handleAddNote = async () => {
    if (!newNote.trim()) return;

    setIsSubmitting(true);
    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 500));

      const note: Note = {
        id: `note-${Date.now()}`,
        content: newNote,
        createdAt: new Date(),
        createdBy: { id: "current", name: "أنت" },
      };

      setNotes((prev) => [note, ...prev]);
      setNewNote("");

      toast({
        title: t("notes.added"),
        description: t("notes.addedDesc"),
      });
    } catch (error) {
      toast({
        variant: "destructive",
        title: t("notes.addFailed"),
        description: t("notes.addFailedDesc"),
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Edit note
  const handleEditNote = async (noteId: string) => {
    if (!editContent.trim()) return;

    try {
      setNotes((prev) =>
        prev.map((n) =>
          n.id === noteId
            ? { ...n, content: editContent, updatedAt: new Date() }
            : n
        )
      );
      setEditingNote(null);
      setEditContent("");

      toast({
        title: t("notes.updated"),
      });
    } catch (error) {
      toast({
        variant: "destructive",
        title: t("notes.updateFailed"),
      });
    }
  };

  // Delete note
  const handleDeleteNote = async (noteId: string) => {
    try {
      setNotes((prev) => prev.filter((n) => n.id !== noteId));
      toast({
        title: t("notes.deleted"),
      });
    } catch (error) {
      toast({
        variant: "destructive",
        title: t("notes.deleteFailed"),
      });
    }
  };

  // Toggle pin
  const handleTogglePin = (noteId: string) => {
    setNotes((prev) =>
      prev.map((n) =>
        n.id === noteId ? { ...n, isPinned: !n.isPinned } : n
      )
    );
  };

  // Add reply
  const handleAddReply = async (parentId: string) => {
    if (!replyContent.trim()) return;

    try {
      const reply: Note = {
        id: `reply-${Date.now()}`,
        content: replyContent,
        createdAt: new Date(),
        createdBy: { id: "current", name: "أنت" },
      };

      setNotes((prev) =>
        prev.map((n) =>
          n.id === parentId
            ? { ...n, replies: [...(n.replies || []), reply] }
            : n
        )
      );

      setReplyingTo(null);
      setReplyContent("");
    } catch (error) {
      toast({
        variant: "destructive",
        title: t("notes.replyFailed"),
      });
    }
  };

  // Add reaction
  const handleAddReaction = (noteId: string, reaction: string) => {
    setNotes((prev) =>
      prev.map((n) => {
        if (n.id !== noteId) return n;

        const existingReaction = n.reactions?.find((r) => r.type === reaction);
        if (existingReaction) {
          if (existingReaction.users.includes("current")) {
            // Remove reaction
            return {
              ...n,
              reactions: n.reactions
                ?.map((r) =>
                  r.type === reaction
                    ? {
                        ...r,
                        count: r.count - 1,
                        users: r.users.filter((u) => u !== "current"),
                      }
                    : r
                )
                .filter((r) => r.count > 0),
            };
          } else {
            // Add to existing
            return {
              ...n,
              reactions: n.reactions?.map((r) =>
                r.type === reaction
                  ? { ...r, count: r.count + 1, users: [...r.users, "current"] }
                  : r
              ),
            };
          }
        } else {
          // New reaction
          return {
            ...n,
            reactions: [
              ...(n.reactions || []),
              { type: reaction, count: 1, users: ["current"] },
            ],
          };
        }
      })
    );
  };

  // Format time
  const formatTime = (date: Date) => {
    return formatDistanceToNow(date, { addSuffix: true, locale: dateLocale });
  };

  // Sort notes (pinned first, then by date)
  const sortedNotes = [...notes].sort((a, b) => {
    if (a.isPinned && !b.isPinned) return -1;
    if (!a.isPinned && b.isPinned) return 1;
    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
  });

  return (
    <div className="space-y-4" dir={isRTL ? "rtl" : "ltr"}>
      {/* Add Note */}
      <div className="space-y-2">
        <Textarea
          value={newNote}
          onChange={(e) => setNewNote(e.target.value)}
          placeholder={t("notes.placeholder")}
          className="min-h-[80px] resize-none"
        />
        <div className="flex justify-end">
          <Button
            onClick={handleAddNote}
            disabled={!newNote.trim() || isSubmitting}
          >
            {isSubmitting ? (
              <Loader2 className="h-4 w-4 animate-spin mr-2" />
            ) : (
              <Send className="h-4 w-4 mr-2" />
            )}
            {t("notes.add")}
          </Button>
        </div>
      </div>

      <Separator />

      {/* Notes List */}
      <ScrollArea style={{ maxHeight }}>
        {sortedNotes.length === 0 ? (
          <div className="text-center py-8">
            <MessageSquare className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <p className="text-muted-foreground">{t("notes.empty")}</p>
          </div>
        ) : (
          <div className="space-y-4">
            {sortedNotes.map((note) => (
              <NoteItem
                key={note.id}
                note={note}
                isRTL={isRTL}
                formatTime={formatTime}
                editingNote={editingNote}
                editContent={editContent}
                setEditingNote={setEditingNote}
                setEditContent={setEditContent}
                replyingTo={replyingTo}
                replyContent={replyContent}
                setReplyingTo={setReplyingTo}
                setReplyContent={setReplyContent}
                onEdit={handleEditNote}
                onDelete={handleDeleteNote}
                onTogglePin={handleTogglePin}
                onAddReply={handleAddReply}
                onAddReaction={handleAddReaction}
                allowReplies={allowReplies}
                allowReactions={allowReactions}
                allowPinning={allowPinning}
                t={t}
              />
            ))}
          </div>
        )}
      </ScrollArea>
    </div>
  );
}

// Note Item Component
function NoteItem({
  note,
  isRTL,
  formatTime,
  editingNote,
  editContent,
  setEditingNote,
  setEditContent,
  replyingTo,
  replyContent,
  setReplyingTo,
  setReplyContent,
  onEdit,
  onDelete,
  onTogglePin,
  onAddReply,
  onAddReaction,
  allowReplies,
  allowReactions,
  allowPinning,
  t,
}: any) {
  const reactions = ["👍", "❤️", "😊", "🎉", "🤔", "👀"];

  return (
    <div
      className={`p-4 rounded-lg border ${
        note.isPinned ? "border-yellow-500/50 bg-yellow-500/5" : ""
      }`}
    >
      <div className="flex gap-3">
        <Avatar className="h-8 w-8">
          <AvatarImage src={note.createdBy.avatar} />
          <AvatarFallback>
            {note.createdBy.name.substring(0, 2)}
          </AvatarFallback>
        </Avatar>

        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="font-medium text-sm">{note.createdBy.name}</span>
              <span className="text-xs text-muted-foreground">
                {formatTime(new Date(note.createdAt))}
              </span>
              {note.isPinned && (
                <Badge variant="outline" className="text-xs gap-1">
                  <Pin className="h-3 w-3" />
                  {t("notes.pinned")}
                </Badge>
              )}
              {note.updatedAt && (
                <span className="text-xs text-muted-foreground">
                  ({t("notes.edited")})
                </span>
              )}
            </div>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align={isRTL ? "start" : "end"}>
                <DropdownMenuItem
                  onClick={() => {
                    setEditingNote(note.id);
                    setEditContent(note.content);
                  }}
                >
                  <Edit2 className="h-4 w-4 mr-2" />
                  {t("common.edit")}
                </DropdownMenuItem>
                {allowPinning && (
                  <DropdownMenuItem onClick={() => onTogglePin(note.id)}>
                    {note.isPinned ? (
                      <>
                        <PinOff className="h-4 w-4 mr-2" />
                        {t("notes.unpin")}
                      </>
                    ) : (
                      <>
                        <Pin className="h-4 w-4 mr-2" />
                        {t("notes.pin")}
                      </>
                    )}
                  </DropdownMenuItem>
                )}
                <DropdownMenuItem
                  className="text-destructive"
                  onClick={() => onDelete(note.id)}
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  {t("common.delete")}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          {/* Content */}
          {editingNote === note.id ? (
            <div className="mt-2 space-y-2">
              <Textarea
                value={editContent}
                onChange={(e) => setEditContent(e.target.value)}
                className="min-h-[60px]"
              />
              <div className="flex gap-2">
                <Button size="sm" onClick={() => onEdit(note.id)}>
                  <Check className="h-4 w-4 mr-1" />
                  {t("common.save")}
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setEditingNote(null)}
                >
                  {t("common.cancel")}
                </Button>
              </div>
            </div>
          ) : (
            <p className="mt-2 text-sm whitespace-pre-wrap">{note.content}</p>
          )}

          {/* Reactions */}
          {allowReactions && note.reactions && note.reactions.length > 0 && (
            <div className="flex flex-wrap gap-1 mt-2">
              {note.reactions.map((reaction: any) => (
                <Button
                  key={reaction.type}
                  variant="outline"
                  size="sm"
                  className={`h-7 px-2 text-xs ${
                    reaction.users.includes("current")
                      ? "bg-primary/10 border-primary"
                      : ""
                  }`}
                  onClick={() => onAddReaction(note.id, reaction.type)}
                >
                  {reaction.type} {reaction.count}
                </Button>
              ))}
            </div>
          )}

          {/* Actions */}
          <div className="flex items-center gap-2 mt-3">
            {allowReactions && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm" className="h-7 px-2">
                    <Heart className="h-3 w-3 mr-1" />
                    {t("notes.react")}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  <div className="flex gap-1 p-1">
                    {reactions.map((r) => (
                      <Button
                        key={r}
                        variant="ghost"
                        size="sm"
                        className="h-8 w-8 p-0 text-lg"
                        onClick={() => onAddReaction(note.id, r)}
                      >
                        {r}
                      </Button>
                    ))}
                  </div>
                </DropdownMenuContent>
              </DropdownMenu>
            )}
            {allowReplies && (
              <Button
                variant="ghost"
                size="sm"
                className="h-7 px-2"
                onClick={() => setReplyingTo(note.id)}
              >
                <Reply className="h-3 w-3 mr-1" />
                {t("notes.reply")}
              </Button>
            )}
          </div>

          {/* Reply Input */}
          {replyingTo === note.id && (
            <div className="mt-3 space-y-2">
              <Textarea
                value={replyContent}
                onChange={(e) => setReplyContent(e.target.value)}
                placeholder={t("notes.replyPlaceholder")}
                className="min-h-[60px]"
              />
              <div className="flex gap-2">
                <Button size="sm" onClick={() => onAddReply(note.id)}>
                  <Send className="h-4 w-4 mr-1" />
                  {t("notes.sendReply")}
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setReplyingTo(null)}
                >
                  {t("common.cancel")}
                </Button>
              </div>
            </div>
          )}

          {/* Replies */}
          {note.replies && note.replies.length > 0 && (
            <div className="mt-4 space-y-3 border-l-2 border-muted pl-4">
              {note.replies.map((reply: Note) => (
                <div key={reply.id} className="flex gap-2">
                  <Avatar className="h-6 w-6">
                    <AvatarFallback className="text-xs">
                      {reply.createdBy.name.substring(0, 2)}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-xs">
                        {reply.createdBy.name}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        {formatTime(new Date(reply.createdAt))}
                      </span>
                    </div>
                    <p className="text-sm mt-1">{reply.content}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
