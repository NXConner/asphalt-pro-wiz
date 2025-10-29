#!/bin/sh
if [ -z "$husky_skip_init" ]; then
  debug () {
    [ "$HUSKY_DEBUG" = "1" ] && echo "$1"
  }

  readonly hook_name="$(basename "$0")"
  debug "husky:debug $hook_name hook started"

  if [ "$HUSKY" = "0" ]; then
    debug "husky:debug HUSKY env variable is set to 0, skipping hook"
    exit 0
  fi

  if [ -f ~/.huskyrc ]; then
    debug "husky:debug sourcing ~/.huskyrc"
    . ~/.huskyrc
  fi

  export readonly husky_skip_init=1
  sh -e "$0" "$@"
  exitCode="$?"
  debug "husky:debug $hook_name hook exited with code $exitCode"
  exit "$exitCode"
fi
