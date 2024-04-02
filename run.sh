#!/bin/bash

echo 'Starting main server...'
cd server_main
node out/index.js > /tmp/node_server_main.log &
echo 'Main server log: /tmp/node_server_main.log'
echo 'Starting workers...'

cd ..
cd server_worker

HTTP_PORT=8081 MPID='1' node out/index.js > /tmp/node_server_worker1.log &
HTTP_PORT=8082 MPID='2' node out/index.js > /tmp/node_server_worker2.log &
HTTP_PORT=8083 MPID='3' node out/index.js > /tmp/node_server_worker2.log &
HTTP_PORT=8084 MPID='4' node out/index.js > /tmp/node_server_worker2.log &
HTTP_PORT=8085 MPID='5' node out/index.js > /tmp/node_server_worker2.log &

echo 'Workers logs: /tmp/node_server_worker[1-5].log'
echo 'Done'