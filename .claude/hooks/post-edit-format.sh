#!/bin/bash
# Lit le JSON du tool call depuis stdin (format Claude Code PostToolUse)
INPUT=$(cat)
FILE=$(echo "$INPUT" | python3 -c "
import sys, json
try:
    d = json.load(sys.stdin)
    print(d.get('tool_input', {}).get('file_path', ''))
except:
    print('')
" 2>/dev/null)

# Ne s'applique qu'aux fichiers .js
if [[ "$FILE" == *.js ]] && [[ -f "$FILE" ]]; then
    OUTPUT=$(node --check "$FILE" 2>&1)
    EXIT=$?
    if [ $EXIT -ne 0 ]; then
        echo "ERREUR DE SYNTAXE JS dans $FILE :"
        echo "$OUTPUT"
        echo "Corrige l'erreur de syntaxe avant de continuer."
        exit 1
    fi
fi
exit 0
