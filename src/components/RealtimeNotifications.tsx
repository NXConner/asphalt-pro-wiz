import { Bell, Radio } from 'lucide-react';
import { useEffect, useState } from 'react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { cn } from '@/lib/utils';

interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
  read: boolean;
  created_at: string;
}

export function RealtimeNotifications() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const { toast } = useToast();

  useEffect(() => {
    // Fetch initial notifications
    const fetchNotifications = async () => {
      const { data } = await supabase
        .from('notifications')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(20);

      if (data) {
        setNotifications(data as Notification[]);
        setUnreadCount(data.filter((n) => !n.read).length);
      }
    };

    fetchNotifications();

    // Subscribe to real-time updates
    const channel = supabase
      .channel('notifications_realtime')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'notifications',
        },
        (payload) => {
          const newNotification = payload.new as Notification;
          setNotifications((prev) => [newNotification, ...prev]);
          setUnreadCount((prev) => prev + 1);

          // Show toast for new notification
          toast({
            title: newNotification.title,
            description: newNotification.message,
            variant: newNotification.type === 'error' ? 'destructive' : 'default',
          });
        },
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [toast]);

  const markAsRead = async (id: string) => {
    await supabase.from('notifications').update({ read: true }).eq('id', id);

    setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, read: true } : n)));
    setUnreadCount((prev) => Math.max(0, prev - 1));
  };

  const markAllAsRead = async () => {
    const unreadIds = notifications.filter((n) => !n.read).map((n) => n.id);
    if (unreadIds.length === 0) return;

    await supabase.from('notifications').update({ read: true }).in('id', unreadIds);

    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    setUnreadCount(0);
  };

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="relative border-white/10 bg-white/5 hover:bg-white/10 hover:border-orange-400/30 transition-all duration-300"
        >
          <Bell className="h-5 w-5 text-slate-200" />
          {unreadCount > 0 && (
            <Badge
              variant="destructive"
              className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs shadow-[0_0_12px_rgba(248,113,113,0.6)] animate-pulse"
            >
              {unreadCount}
            </Badge>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80 border-white/20 bg-slate-950/95 backdrop-blur-xl" align="end">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Radio className="h-4 w-4 text-orange-400 animate-pulse" />
            <h3 className="font-semibold text-slate-50 font-mono uppercase tracking-wider text-sm">
              Live Notifications
            </h3>
          </div>
          {unreadCount > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={markAllAsRead}
              className="text-xs text-slate-200/80 hover:text-slate-50"
            >
              Mark all read
            </Button>
          )}
        </div>
        <ScrollArea className="h-[400px]">
          {notifications.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-8">No notifications</p>
          ) : (
            <div className="space-y-2">
              {notifications.map((notification) => (
                <button
                  key={notification.id}
                  type="button"
                  className={cn(
                    'group relative w-full text-left p-3 rounded-xl border transition-all duration-300',
                    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-400/50 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950',
                    notification.read
                      ? 'border-white/10 bg-white/5 hover:border-white/20 hover:bg-white/10'
                      : 'border-orange-400/30 bg-orange-400/10 hover:border-orange-400/50 hover:bg-orange-400/15 hover:shadow-[0_0_16px_rgba(251,146,60,0.3)]',
                  )}
                  onClick={() => !notification.read && markAsRead(notification.id)}
                  onKeyDown={(event) => {
                    if ((event.key === 'Enter' || event.key === ' ') && !notification.read) {
                      event.preventDefault();
                      markAsRead(notification.id);
                    }
                  }}
                >
                  <span
                    className="absolute inset-0 bg-[linear-gradient(130deg,rgba(255,255,255,0.1)_10%,transparent_60%)] opacity-0 transition-opacity duration-300 group-hover:opacity-100 rounded-xl"
                    aria-hidden
                  />
                  <div className="relative flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-sm text-slate-50 font-mono uppercase tracking-wide">
                        {notification.title}
                      </p>
                      <p className="text-sm text-slate-200/80 line-clamp-2 mt-1">
                        {notification.message}
                      </p>
                      <p className="text-xs text-slate-200/60 mt-2 font-mono">
                        {new Date(notification.created_at).toLocaleString()}
                      </p>
                    </div>
                    {!notification.read && (
                      <span
                        className="w-2.5 h-2.5 rounded-full bg-orange-400 flex-shrink-0 mt-1 shadow-[0_0_8px_rgba(251,146,60,0.8)] animate-pulse"
                        aria-hidden
                      />
                    )}
                  </div>
                </button>
              ))}
            </div>
          )}
        </ScrollArea>
      </PopoverContent>
    </Popover>
  );
}
