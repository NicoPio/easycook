# Guide de dépannage Ollama

Ce guide vous aide à résoudre les problèmes courants avec l'intégration Ollama.

## 🔴 Erreur 404 Not Found

### Symptôme

```json
{
  "status": "error",
  "errors": [
    "Tentative 1/3: Échec de la génération après 3 tentatives: Ollama API error: 404 Not Found",
    "Tentative 2/3: Échec de la génération après 3 tentatives: Ollama API error: 404 Not Found",
    "Tentative 3/3: Échec de la génération après 3 tentatives: Ollama API error: 404 Not Found"
  ]
}
```

### Cause

L'erreur 404 signifie que le modèle spécifié dans `OLLAMA_MODEL` **n'existe pas** dans votre instance Ollama.

### Solution rapide

#### 1. Lancer le script de diagnostic

```bash
bash scripts/diagnose-ollama-model.sh
```

Ce script va :
- ✅ Vérifier que le container Ollama est actif
- ✅ Lister tous les modèles disponibles
- ✅ Comparer avec votre configuration
- ✅ Suggérer la correction exacte

#### 2. Diagnostic manuel

Si vous préférez diagnostiquer manuellement :

**a) Lister les modèles disponibles dans Ollama :**

```bash
# Trouver le nom du container
docker ps | grep ollama

# Lister les modèles (remplacez <container-name> par le nom de votre container)
docker exec <container-name> ollama list
```

**b) Vérifier votre configuration :**

```bash
# Voir la valeur actuelle
grep OLLAMA_MODEL .env
```

**c) Comparer les deux noms**

Le nom doit correspondre **EXACTEMENT** (majuscules/minuscules, tirets, etc.)

### Solutions possibles

#### Solution 1 : Corriger le nom du modèle

Si le modèle existe mais le nom ne correspond pas exactement :

```bash
# Dans .env, remplacez par le nom exact (exemple)
OLLAMA_MODEL=openllm-france/lucie-7b-instruct
```

**Exemples courants de noms :**
- ❌ `OpenLLM-France/Lucie-7B-Instruct:latest`
- ✅ `openllm-france/lucie-7b-instruct:latest`

ou

- ❌ `qwen:latest`
- ✅ `qwen2.5:latest`

#### Solution 2 : Télécharger le modèle manquant

Si le modèle n'existe pas du tout dans Ollama :

```bash
# Pull le modèle dans le container
docker exec <container-name> ollama pull <model-name>

# Exemple pour Lucie
docker exec easycook-ollama ollama pull openllm-france/lucie-7b-instruct

# Exemple pour Qwen
docker exec easycook-ollama ollama pull qwen2.5
```

**⏱️ Attention :** Le téléchargement peut prendre plusieurs minutes selon la taille du modèle.

#### Solution 3 : Utiliser un modèle alternatif

Si vous voulez simplement que ça fonctionne rapidement :

```bash
# Télécharger un modèle léger et rapide
docker exec easycook-ollama ollama pull mistral

# Puis configurer dans .env
OLLAMA_MODEL=mistral
```

Modèles recommandés :
- `mistral` - Léger, performant (7B paramètres)
- `qwen2.5` - Très bon pour le français
- `llama3.2` - Dernière version de Meta

### Vérification finale

Une fois corrigé, testez avec le health check :

```bash
# Via curl
curl http://localhost:3000/api/health/ollama

# Ou dans votre navigateur
http://localhost:3000/api/health/ollama
```

Réponse attendue :

```json
{
  "status": "healthy",
  "healthy": true,
  "message": "✅ Ollama is healthy and ready with model \"your-model\""
}
```

## 🔴 Timeout après X secondes

### Symptôme

```
Timeout après 180 secondes. Le modèle met peut-être du temps à se charger (première requête).
```

### Cause

Le modèle n'est pas encore chargé en mémoire. **La première requête peut prendre 60-120 secondes.**

### Solution

1. **Patienter** - La première génération peut être longue
2. **Augmenter le timeout** dans `.env` :

```bash
OLLAMA_TIMEOUT=300000  # 5 minutes
```

3. **Pré-charger le modèle** au démarrage du container :

```bash
# Générer une requête de test
docker exec easycook-ollama ollama run <model-name> "Hello"
```

## 🔴 Service non disponible

### Symptôme

```
❌ Service d'IA Ollama non disponible
```

### Solutions

#### 1. Vérifier que le container est actif

```bash
docker ps | grep ollama
```

Si absent, démarrer :

```bash
docker-compose up -d ollama
```

#### 2. Vérifier le port

```bash
docker port <container-name>
# Devrait afficher : 11434/tcp -> 0.0.0.0:11434
```

#### 3. Tester la connectivité

```bash
# Depuis votre machine hôte
curl http://localhost:11434/api/tags

# Si ça ne fonctionne pas, vérifier OLLAMA_BASE_URL dans .env
```

#### 4. Vérifier OLLAMA_BASE_URL

Dans `.env` :
- **En local** : `OLLAMA_BASE_URL=http://localhost:11434`
- **Dans Docker Compose** : `OLLAMA_BASE_URL=http://ollama:11434`

## 🛠️ Commandes utiles

### Gestion des modèles

```bash
# Lister les modèles
docker exec <container> ollama list

# Pull un modèle
docker exec <container> ollama pull <model>

# Supprimer un modèle
docker exec <container> ollama rm <model>

# Renommer/copier un modèle
docker exec <container> ollama cp <source> <destination>
```

### Logs et debugging

```bash
# Voir les logs du container
docker logs <container-name> -f

# Voir les logs de l'application
npm run dev
# Regarder les lignes commençant par [Ollama]
```

### Tests

```bash
# Test de génération simple
docker exec <container> ollama run <model> "Bonjour, écris une recette courte"

# Health check API
curl http://localhost:3000/api/health/ollama
```

## 📋 Checklist complète

Si rien ne fonctionne, vérifiez dans l'ordre :

- [ ] Container Ollama est running : `docker ps | grep ollama`
- [ ] Port 11434 est exposé : `docker port <container>`
- [ ] Service répond : `curl http://localhost:11434/api/tags`
- [ ] Modèle existe : `docker exec <container> ollama list`
- [ ] OLLAMA_MODEL dans .env correspond au nom exact
- [ ] OLLAMA_BASE_URL est correct (localhost:11434 ou ollama:11434)
- [ ] Health check OK : `curl http://localhost:3000/api/health/ollama`

## 🆘 Besoin d'aide ?

Si le problème persiste :

1. **Lancez le diagnostic** : `bash scripts/diagnose-ollama-model.sh`
2. **Vérifiez les logs** : `docker logs <container> | tail -100`
3. **Créez une issue** avec les logs et la sortie du diagnostic

## 📚 Ressources

- [Documentation Ollama](https://github.com/ollama/ollama)
- [Liste des modèles disponibles](https://ollama.com/library)
- [Docker Compose Ollama](https://hub.docker.com/r/ollama/ollama)
