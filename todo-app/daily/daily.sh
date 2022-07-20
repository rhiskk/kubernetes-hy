#!/usr/bin/env bash
set -e
if [ $URL ]
then
    TEXT="$(curl -w '"Read %{redirect_url}"' -o /dev/null -s https://en.wikipedia.org/wiki/Special:Random)"
    TODO='{ "text": '"$TEXT"', "done": false }'
    echo "Adding todo..."
    curl -X POST -H "Content-Type: application/json" -d "$TODO" $URL
fi