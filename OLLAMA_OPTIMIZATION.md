# Optimisation Ollama pour Mac Mini M4

## Problème
Le container Ollama consommait jusqu'à 1045% CPU (>10 cœurs) lors de l'inférence, ce qui saturait complètement le Mac Mini M4.

## Solutions appliquées

### 1. Limitations de ressources Docker
```yaml
deploy:
  resources:
    limits:
      cpus: '4.0'      # Max 4 CPUs (40% des 10 disponibles)
      memory: 4G       # Max 4GB RAM
```

### 2. Configuration Ollama optimisée
- `OLLAMA_NUM_PARALLEL=1` : Une seule requête à la fois
- `OLLAMA_NUM_THREADS=4` : Limite les threads CPU (cohérent avec cpus: 4.0)
- `OLLAMA_KEEP_ALIVE=5m` : Décharge le modèle après 5 minutes d'inactivité

### 3. Redémarrage requis
```bash
docker compose down
docker compose up -d
```

## Résultats attendus
- ✅ CPU plafonné à ~400% maximum (4 cœurs)
- ✅ Réactivité système préservée
- ✅ Modèle déchargé automatiquement quand inutilisé
- ⚠️ Inférence légèrement plus lente (compromis acceptable)

## Ajustements possibles

### Plus restrictif (CPU < 200%)
```yaml
environment:
  - OLLAMA_NUM_THREADS=2
deploy:
  resources:
    limits:
      cpus: '2.0'
```

### Plus permissif (CPU < 600%)
```yaml
environment:
  - OLLAMA_NUM_THREADS=6
deploy:
  resources:
    limits:
      cpus: '6.0'
```

## Modèles recommandés

Pour développement local sur Mac Mini M4 :
- `mistral:7b-instruct` (recommandé, bon équilibre)
- `phi3:mini` (plus léger, ~3.8GB)
- `tinyllama` (très léger, ~637MB, moins précis)

Pour changer de modèle :
```bash
docker exec -it easycook-ollama ollama pull phi3:mini
# Puis mettre à jour OLLAMA_MODEL=phi3:mini dans .env
```

## Monitoring

Vérifier la consommation :
```bash
docker stats easycook-ollama
```

Voir les modèles chargés :
```bash
docker exec easycook-ollama ollama ps
```
