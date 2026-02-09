#!/bin/bash

echo "[info] Instalando novas dependêcias"
pnpm install

echo "[info] Reiniciando aplicação..."
launchctl stop com.treinavaga.app
sleep 2

launchctl start com.treinavaga.app
sleep 20

tail -20 ~/Library/Logs/treinavaga-app-stdout.log
echo "[info] Deploy concluído!"