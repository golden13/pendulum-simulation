#!/bin/bash

echo 'Building main server...'
cd server_main
npm run build

echo 'Building workers...'

cd ..
cd server_worker
npm run build

echo 'Done'
echo 'Now you can run them: ./run.sh'
