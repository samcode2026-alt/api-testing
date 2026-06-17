#!/bin/bash
echo ""
echo " =========================================="
echo "  OMS API Testing Tool - Starting Server"
echo " =========================================="
echo ""
cd "$(dirname "$0")"
node server.js
