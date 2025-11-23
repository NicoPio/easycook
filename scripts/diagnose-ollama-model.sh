#!/bin/bash

# Script de diagnostic pour identifier le problème du modèle Ollama
# Usage: bash scripts/diagnose-ollama-model.sh

set -e

echo "================================================"
echo "🔍 DIAGNOSTIC OLLAMA - Recherche du modèle"
echo "================================================"
echo ""

# Couleurs
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# 1. Vérifier que le container est running
echo -e "${BLUE}[1/5]${NC} Vérification du container Ollama..."
if ! docker ps | grep -q ollama; then
    echo -e "${RED}❌ Le container Ollama n'est pas en cours d'exécution${NC}"
    echo ""
    echo "Démarrez-le avec:"
    echo "  docker-compose up -d ollama"
    exit 1
fi
echo -e "${GREEN}✓ Container Ollama actif${NC}"
echo ""

# 2. Lister tous les modèles disponibles dans Ollama
echo -e "${BLUE}[2/5]${NC} Liste des modèles disponibles dans Ollama:"
echo ""
MODELS=$(docker exec $(docker ps -q --filter "name=ollama") ollama list 2>/dev/null || echo "")

if [ -z "$MODELS" ]; then
    echo -e "${RED}❌ Impossible de lister les modèles${NC}"
    exit 1
fi

echo "$MODELS"
echo ""

# 3. Extraire juste les noms (première colonne)
echo -e "${BLUE}[3/5]${NC} Noms de modèles détectés:"
echo ""
MODEL_NAMES=$(echo "$MODELS" | tail -n +2 | awk '{print $1}')
echo "$MODEL_NAMES" | while read -r model; do
    echo -e "  ${GREEN}•${NC} $model"
done
echo ""

# 4. Vérifier la variable d'environnement actuelle
echo -e "${BLUE}[4/5]${NC} Configuration actuelle:"
echo ""
if [ -f .env ]; then
    OLLAMA_MODEL=$(grep "^OLLAMA_MODEL=" .env | cut -d '=' -f 2 || echo "")
    if [ -n "$OLLAMA_MODEL" ]; then
        echo -e "  OLLAMA_MODEL=${YELLOW}${OLLAMA_MODEL}${NC}"
    else
        echo -e "  ${YELLOW}⚠️  OLLAMA_MODEL non défini dans .env${NC}"
        OLLAMA_MODEL="mistral"
        echo -e "  Valeur par défaut: ${YELLOW}${OLLAMA_MODEL}${NC}"
    fi
else
    echo -e "  ${YELLOW}⚠️  Fichier .env non trouvé${NC}"
    OLLAMA_MODEL="mistral"
    echo -e "  Valeur par défaut: ${YELLOW}${OLLAMA_MODEL}${NC}"
fi
echo ""

# 5. Vérifier si le modèle configuré existe
echo -e "${BLUE}[5/5]${NC} Vérification de la correspondance:"
echo ""
if echo "$MODEL_NAMES" | grep -q "^${OLLAMA_MODEL}$"; then
    echo -e "${GREEN}✅ Le modèle '${OLLAMA_MODEL}' existe dans Ollama${NC}"
    echo ""
    echo -e "${GREEN}🎉 Tout est OK !${NC}"
else
    echo -e "${RED}❌ Le modèle '${OLLAMA_MODEL}' n'existe PAS dans Ollama${NC}"
    echo ""
    echo -e "${YELLOW}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo -e "${YELLOW}💡 SOLUTION:${NC}"
    echo ""

    # Suggérer des modèles similaires
    SIMILAR_MODEL=$(echo "$MODEL_NAMES" | grep -i "lucie\|qwen" | head -1 || echo "")

    if [ -n "$SIMILAR_MODEL" ]; then
        echo "Option 1: Utiliser un modèle existant similaire:"
        echo -e "  ${GREEN}$SIMILAR_MODEL${NC}"
        echo ""
        echo "  Commande pour mettre à jour .env:"
        if [ -f .env ]; then
            echo -e "    ${BLUE}sed -i 's/^OLLAMA_MODEL=.*/OLLAMA_MODEL=${SIMILAR_MODEL}/' .env${NC}"
        else
            echo -e "    ${BLUE}echo 'OLLAMA_MODEL=${SIMILAR_MODEL}' >> .env${NC}"
        fi
    fi

    echo ""
    echo "Option 2: Télécharger le modèle manquant:"
    echo -e "  ${BLUE}docker exec \$(docker ps -q --filter \"name=ollama\") ollama pull ${OLLAMA_MODEL}${NC}"
    echo ""
    echo -e "${YELLOW}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
fi

echo ""
echo "================================================"
echo "Diagnostic terminé"
echo "================================================"
