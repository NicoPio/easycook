# Configuration et Diagnostic Ollama

Ce guide vous aide à configurer et diagnostiquer Ollama pour le parsing IA des recettes.

## 🚀 Démarrage Rapide

### 1. Démarrer le container Ollama

```bash
docker-compose up -d ollama
```

### 2. Vérifier que le container fonctionne

```bash
docker ps | grep ollama
```

Vous devriez voir quelque chose comme :
```
easycook-ollama   Up 2 minutes   0.0.0.0:11434->11434/tcp
```

### 3. Télécharger le modèle Mistral

```bash
docker exec easycook-ollama ollama pull mistral
```

### 4. Configurer les variables d'environnement

Créez un fichier `.env` à la racine du projet (ou copiez `.env.example`) :

```bash
cp .env.example .env
```

Assurez-vous que ces variables sont définies :

```env
OLLAMA_BASE_URL=http://localhost:11434
OLLAMA_MODEL=mistral
```

### 5. Tester la connexion

```bash
curl http://localhost:11434/api/tags
```

Vous devriez voir une réponse JSON avec la liste des modèles.

## 🔍 Diagnostic

### Script automatique

Exécutez le script de diagnostic pour vérifier l'état complet :

```bash
bash scripts/check-ollama.sh
```

### Vérifications manuelles

1. **Le container est-il démarré ?**
   ```bash
   docker ps | grep ollama
   ```

2. **Le port 11434 est-il exposé ?**
   ```bash
   docker port easycook-ollama
   ```
   Devrait afficher : `11434/tcp -> 0.0.0.0:11434`

3. **L'API répond-elle ?**
   ```bash
   curl http://localhost:11434/api/tags
   ```

4. **Le modèle Mistral est-il disponible ?**
   ```bash
   docker exec easycook-ollama ollama list
   ```

5. **Vérifier les logs du container**
   ```bash
   docker logs easycook-ollama
   ```

### Endpoint de santé

Une fois le serveur de dev lancé, vous pouvez vérifier l'état d'Ollama via :

```bash
curl http://localhost:3000/api/admin/health/ollama
```

## ❌ Problèmes courants

### "Connection refused" sur localhost:11434

**Cause** : Le container Ollama n'est pas démarré ou le port n'est pas exposé.

**Solution** :
```bash
# Redémarrer le container
docker-compose restart ollama

# Ou le démarrer s'il n'est pas actif
docker-compose up -d ollama
```

### "Model not found"

**Cause** : Le modèle Mistral n'a pas été téléchargé.

**Solution** :
```bash
docker exec easycook-ollama ollama pull mistral
```

### "Service unavailable" dans l'admin

**Cause** : Les variables d'environnement ne sont pas configurées ou le container n'est pas accessible.

**Solutions** :
1. Vérifiez que `.env` existe et contient `OLLAMA_BASE_URL=http://localhost:11434`
2. Redémarrez le serveur de dev après avoir modifié `.env`
3. Vérifiez que le container Ollama fonctionne

### Performance lente

**Cause** : Ollama utilise le CPU au lieu du GPU.

**Solution** : Si vous avez un GPU NVIDIA, utilisez le profil GPU :

```bash
docker-compose --profile gpu up -d ollama-gpu
```

## 🐳 Configuration Docker

### Mode CPU (par défaut)

```bash
docker-compose up -d ollama
```

Limites :
- 4 CPU cores maximum
- 4GB RAM maximum

### Mode GPU (nécessite NVIDIA GPU)

```bash
docker-compose --profile gpu up -d ollama-gpu
```

Avantages :
- Parsing beaucoup plus rapide
- Meilleure capacité de traitement

## 📝 Logs et Debug

### Activer les logs détaillés

Les logs Ollama apparaissent automatiquement dans la console du serveur Nuxt avec le préfixe `[Ollama]`.

### Logs du container

```bash
# Logs en temps réel
docker logs -f easycook-ollama

# Dernières 100 lignes
docker logs --tail 100 easycook-ollama
```

## 🔧 Commandes utiles

```bash
# Status des containers
docker-compose ps

# Redémarrer Ollama
docker-compose restart ollama

# Arrêter Ollama
docker-compose stop ollama

# Supprimer et recréer
docker-compose down
docker-compose up -d ollama

# Entrer dans le container
docker exec -it easycook-ollama bash

# Lister les modèles
docker exec easycook-ollama ollama list

# Tester un modèle
docker exec -it easycook-ollama ollama run mistral "Hello"
```

## 📚 Resources

- [Documentation Ollama](https://github.com/ollama/ollama)
- [Modèles disponibles](https://ollama.com/library)
- [Docker Compose reference](https://docs.docker.com/compose/)
