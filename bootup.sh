#! /bin/bash
source activate kiss
cd /home/vumaasha/git_repos/kept_simple
pserve development.ini --reload &
cd /home/vumaasha/git_repos/kept_simple/kiss/static/js
./node_modules/webpack/bin/webpack.js --progress --colors --watch
