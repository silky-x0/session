import { useState } from "react";
import {
  useInboxNotifications,
  useUnreadInboxNotificationsCount,
  useMarkInboxNotificationAsRead,
  useMarkAllInboxNotificationsAsRead,
  useDeleteInboxNotification,
  useDeleteAllInboxNotifications,
} from "@liveblocks/react/suspense";
import { InboxNotification } from "@liveblocks/react-ui";
import { ClientSideSuspense } from "@liveblocks/react/suspense";
import { ErrorBoundary } from "react-error-boundary";
import { motion, AnimatePresence } from "framer-motion";
import { Bell, Check, CheckCheck, Trash2, X } from "lucide-react";

/**
 * Notification bell button with unread count badge.
 * Opens the NotificationsPanel dropdown when clicked.
 */
export function NotificationBell() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative flex items-center justify-center w-8 h-8 rounded-lg 
                   bg-secondary/50 hover:bg-secondary transition-colors cursor-pointer"
      >
        <Bell className="w-4 h-4 text-muted-foreground" />
        <ErrorBoundary fallback={null}>
          <ClientSideSuspense fallback={null}>
            <UnreadBadge />
          </ClientSideSuspense>
        </ErrorBoundary>
      </button>

      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop */}
            <div
              className="fixed inset-0 z-40"
              onClick={() => setIsOpen(false)}
            />
            <motion.div
              initial={{ opacity: 0, y: -8, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -8, scale: 0.95 }}
              transition={{ duration: 0.15 }}
              className="absolute right-0 top-10 z-50 w-80 sm:w-96 max-h-[70vh] overflow-hidden
                         rounded-xl border border-border bg-card/95 backdrop-blur-xl shadow-2xl"
            >
              <ErrorBoundary
                fallback={
                  <div className="p-4 text-sm text-red-400">
                    Error loading notifications
                  </div>
                }
              >
                <ClientSideSuspense
                  fallback={
                    <div className="p-6 flex justify-center">
                      <div className="w-5 h-5 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                    </div>
                  }
                >
                  <NotificationsList onClose={() => setIsOpen(false)} />
                </ClientSideSuspense>
              </ErrorBoundary>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}

function UnreadBadge() {
  const { count } = useUnreadInboxNotificationsCount();

  if (!count || count === 0) return null;

  return (
    <span
      className="absolute -top-1 -right-1 min-w-[16px] h-4 flex items-center justify-center 
                 rounded-full bg-red-500 text-white text-[10px] font-bold px-1 
                 shadow-[0_0_6px_rgba(239,68,68,0.5)]"
    >
      {count > 99 ? "99+" : count}
    </span>
  );
}

function NotificationsList({ onClose }: { onClose: () => void }) {
  const {
    inboxNotifications,
    hasFetchedAll,
    fetchMore,
    isFetchingMore,
    fetchMoreError,
  } = useInboxNotifications();

  const markAsRead = useMarkInboxNotificationAsRead();
  const markAllAsRead = useMarkAllInboxNotificationsAsRead();
  const deleteNotification = useDeleteInboxNotification();
  const deleteAll = useDeleteAllInboxNotifications();

  return (
    <div className="flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-border">
        <h3 className="text-sm font-semibold text-foreground">Notifications</h3>
        <div className="flex items-center gap-1">
          <button
            onClick={() => markAllAsRead()}
            title="Mark all as read"
            className="p-1.5 rounded-md hover:bg-secondary/50 text-muted-foreground 
                       hover:text-foreground transition-colors cursor-pointer"
          >
            <CheckCheck className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => deleteAll()}
            title="Delete all"
            className="p-1.5 rounded-md hover:bg-red-500/10 text-muted-foreground 
                       hover:text-red-400 transition-colors cursor-pointer"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={onClose}
            className="p-1.5 rounded-md hover:bg-secondary/50 text-muted-foreground 
                       hover:text-foreground transition-colors cursor-pointer"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Notification list */}
      <div className="overflow-y-auto max-h-[50vh] divide-y divide-border/50">
        {inboxNotifications.length === 0 ? (
          <div className="p-8 text-center">
            <Bell className="w-8 h-8 text-muted-foreground/30 mx-auto mb-2" />
            <p className="text-sm text-muted-foreground">No notifications yet</p>
          </div>
        ) : (
          inboxNotifications.map((notification) => (
            <div
              key={notification.id}
              className="group relative hover:bg-secondary/30 transition-colors"
            >
              <InboxNotification inboxNotification={notification} />
              {/* Action buttons on hover */}
              <div
                className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1 
                           opacity-0 group-hover:opacity-100 transition-opacity"
              >
                {notification.readAt === null && (
                  <button
                    onClick={() => markAsRead(notification.id)}
                    title="Mark as read"
                    className="p-1 rounded bg-secondary/80 hover:bg-secondary text-muted-foreground 
                               hover:text-foreground transition-colors cursor-pointer"
                  >
                    <Check className="w-3 h-3" />
                  </button>
                )}
                <button
                  onClick={() => deleteNotification(notification.id)}
                  title="Delete"
                  className="p-1 rounded bg-secondary/80 hover:bg-red-500/20 text-muted-foreground 
                             hover:text-red-400 transition-colors cursor-pointer"
                >
                  <Trash2 className="w-3 h-3" />
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Load More / Footer */}
      {!hasFetchedAll && (
        <div className="p-3 border-t border-border">
          <button
            onClick={fetchMore}
            disabled={isFetchingMore}
            className="w-full py-2 text-xs text-primary hover:text-primary/80 
                       bg-primary/5 hover:bg-primary/10 rounded-lg transition-colors 
                       disabled:opacity-50 cursor-pointer"
          >
            {isFetchingMore ? "Loading…" : "Load more"}
          </button>
          {fetchMoreError && (
            <p className="text-xs text-red-400 mt-1 text-center">
              Error loading more: {fetchMoreError.message}
            </p>
          )}
        </div>
      )}
    </div>
  );
}
