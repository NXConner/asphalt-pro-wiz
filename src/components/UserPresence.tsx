import { useEffect, useState } from 'react';

import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { supabase } from '@/integrations/supabase/client';

interface PresenceState {
  [key: string]: {
    user_id: string;
    email: string;
    online_at: string;
  }[];
}

export function UserPresence() {
  const [presenceState, setPresenceState] = useState<PresenceState>({});
  const [onlineUsers, setOnlineUsers] = useState<Array<{ user_id: string; email: string }>>([]);

  useEffect(() => {
    const channel = supabase.channel('online_users');

    channel
      .on('presence', { event: 'sync' }, () => {
        const state = channel.presenceState<{
          user_id: string;
          email: string;
          online_at: string;
        }>();
        setPresenceState(state);

        // Flatten presence state to get unique users
        const users = Object.values(state)
          .flat()
          .reduce(
            (acc, presence) => {
              if (!acc.find((u) => u.user_id === presence.user_id)) {
                acc.push({ user_id: presence.user_id, email: presence.email });
              }
              return acc;
            },
            [] as Array<{ user_id: string; email: string }>,
          );

        setOnlineUsers(users);
      })
      .on('presence', { event: 'join' }, ({ newPresences }) => {
        console.log('User joined:', newPresences);
      })
      .on('presence', { event: 'leave' }, ({ leftPresences }) => {
        console.log('User left:', leftPresences);
      })
      .subscribe(async (status) => {
        if (status === 'SUBSCRIBED') {
          const {
            data: { user },
          } = await supabase.auth.getUser();
          if (user) {
            await channel.track({
              user_id: user.id,
              email: user.email || 'Anonymous',
              online_at: new Date().toISOString(),
            });
          }
        }
      });

    return () => {
      channel.unsubscribe();
    };
  }, []);

  if (onlineUsers.length === 0) return null;

  return (
    <div className="flex items-center gap-2">
      <TooltipProvider>
        <div className="flex -space-x-2">
          {onlineUsers.slice(0, 5).map((user) => (
            <Tooltip key={user.user_id}>
              <TooltipTrigger>
                <Avatar className="border-2 border-background w-8 h-8">
                  <AvatarFallback className="text-xs">
                    {user.email.charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
              </TooltipTrigger>
              <TooltipContent>
                <p>{user.email}</p>
              </TooltipContent>
            </Tooltip>
          ))}
          {onlineUsers.length > 5 && (
            <Tooltip>
              <TooltipTrigger>
                <Avatar className="border-2 border-background w-8 h-8">
                  <AvatarFallback className="text-xs">+{onlineUsers.length - 5}</AvatarFallback>
                </Avatar>
              </TooltipTrigger>
              <TooltipContent>
                <p>{onlineUsers.length - 5} more online</p>
              </TooltipContent>
            </Tooltip>
          )}
        </div>
        <Badge variant="secondary" className="ml-2">
          {onlineUsers.length} online
        </Badge>
      </TooltipProvider>
    </div>
  );
}
