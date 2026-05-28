#!/usr/bin/env bash

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_DIR="$SCRIPT_DIR"
TARGET_DIR_WIN='D:\VM丟資料區\ETSurge' # 本地開發的話這邊可以改成自家放目錄的位置

if command -v cygpath >/dev/null 2>&1; then
    TARGET_DIR="$(cygpath -u "$TARGET_DIR_WIN")"
    PROJECT_DIR_WIN="$(cygpath -w "$PROJECT_DIR")"
    TARGET_DIR_WIN_POWERSHELL="$(cygpath -w "$TARGET_DIR")"
else
    TARGET_DIR="$TARGET_DIR_WIN"
    PROJECT_DIR_WIN="$PROJECT_DIR"
    TARGET_DIR_WIN_POWERSHELL="$TARGET_DIR_WIN"
fi

echo "[1/3] Building project..."
cd "$PROJECT_DIR"
npm run build

if [ ! -d "$PROJECT_DIR/dist" ]; then
    echo "Build failed: dist directory not found."
    exit 1
fi

echo "[2/3] Preparing target directory: $TARGET_DIR"

echo "[3/3] Creating dist.zip in target directory..."
PROJECT_DIR_WIN="$PROJECT_DIR_WIN" TARGET_DIR_WIN="$TARGET_DIR_WIN_POWERSHELL" powershell.exe -NoProfile -ExecutionPolicy Bypass -Command '& { $projectDist = $env:PROJECT_DIR_WIN + "\\dist"; $targetDir = $env:TARGET_DIR_WIN; New-Item -ItemType Directory -Force -Path $targetDir | Out-Null; Compress-Archive -Path $projectDist -DestinationPath (Join-Path $targetDir "dist.zip") -Force }'

echo "Done. Archive created at: $TARGET_DIR/dist.zip"
