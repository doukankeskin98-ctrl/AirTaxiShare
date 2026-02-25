#!/bin/bash

OUTPUT_FILE="ai_context.txt"
rm -f $OUTPUT_FILE
echo "# AirTaxiShare Project Context" > $OUTPUT_FILE
echo "This is the complete source code for AirTaxiShare, a mobile app and backend API for ride-sharing to specific destinations (like airports or business districts). Please review the code for any remaining bugs, logic errors, or architectural flaws. The frontend uses React Native (Expo) and the backend uses NestJS with PostgreSQL and WebSockets (Socket.io)." >> $OUTPUT_FILE
echo "" >> $OUTPUT_FILE

echo "## Directory Structure" >> $OUTPUT_FILE
echo "\`\`\`" >> $OUTPUT_FILE
tree -I 'node_modules|dist|.git|.expo|ios|android' >> $OUTPUT_FILE
echo "\`\`\`" >> $OUTPUT_FILE
echo "" >> $OUTPUT_FILE

find apps/api/src apps/mobile/src -type f \( -name "*.ts" -o -name "*.tsx" -o -name "*.json" \) ! -name "*.spec.ts" ! -name "package-lock.json" | sort | while read -r file; do
    echo "---" >> $OUTPUT_FILE
    echo "### File: $file" >> $OUTPUT_FILE
    echo "\`\`\`typescript" >> $OUTPUT_FILE
    cat "$file" >> $OUTPUT_FILE
    echo "\`\`\`" >> $OUTPUT_FILE
    echo "" >> $OUTPUT_FILE
done

echo "Context file generated at $OUTPUT_FILE"
