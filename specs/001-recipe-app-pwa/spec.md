# Feature Specification: Application PWA de Recettes pour Robots Cuisiniers

**Feature Branch**: `001-recipe-app-pwa`
**Created**: 2025-11-21
**Status**: Draft
**Input**: User description: "J'aimerai créer une petite application pour mobile (genre pwa) qui proposerait des recettes de cuisine pas-à-pas pour les robots cuisinier du marché style thermomix, cookeo, monsieur cuisine etc. fais l'analyse du site https://www.cookomix.com car il reprend la plupart des fonctionnalités que je souhaites développer. on aurait un écran de listing des recettes, quand on sélectionne une recette, on a un récapitulatif des ingrédients, des proportions et un aperçu global de la recette. on peut ajuster la quantité de personne et les proportions s'ajustent automatiquement. Ensuite, on peut déclencher la recette pas-à-pas. on a alors un affichage simplifié en fullscreen qui nous guide au fur et à mesure. côté backend, il faudrait pouvoir gérer l'import de recette dans un champ via copier/coller. Ensuite on traite le texte pour le découper en étapes pas à pas pour l'afficher côté front. pourquoi ne pas utiliser n8n pour parser la recette importée avec IA locale (ollama avec un llm léger) puis la traiter pour avoir un format défini. Voici les grandes lignes de l'app."

## User Scenarios & Testing

### User Story 1 - Consulter et Ajuster une Recette (Priority: P1)

Un utilisateur possédant un robot cuisinier (Thermomix, Cookeo, Monsieur Cuisine) souhaite trouver et consulter une recette adaptée à son appareil. Il veut pouvoir ajuster facilement les quantités selon le nombre de convives sans recalculer manuellement les proportions.

**Why this priority**: C'est le cœur de la valeur ajoutée de l'application. Sans cette fonctionnalité, l'application n'a pas de raison d'être. Cette user story constitue un MVP viable qui peut être testé et déployé indépendamment.

**Independent Test**: Peut être entièrement testée en naviguant dans le catalogue de recettes, en sélectionnant une recette, et en modifiant le nombre de personnes. Le succès est atteint si toutes les quantités d'ingrédients sont recalculées correctement et instantanément.

**Acceptance Scenarios**:

1. **Given** l'utilisateur est sur l'écran d'accueil, **When** il consulte la liste des recettes, **Then** il voit un catalogue de recettes avec titre, photo, temps de préparation et type de robot compatible
2. **Given** l'utilisateur consulte une recette prévue pour 4 personnes, **When** il modifie le nombre de personnes à 6, **Then** toutes les quantités d'ingrédients sont automatiquement ajustées proportionnellement
3. **Given** l'utilisateur consulte une recette, **When** il visualise les ingrédients, **Then** il voit chaque ingrédient avec sa quantité, son unité et son nom
4. **Given** l'utilisateur consulte une recette, **When** il lit l'aperçu global, **Then** il voit le temps total, la difficulté, le type de robot compatible et une description

---

### User Story 2 - Mode Pas-à-Pas Guidé (Priority: P2)

Un utilisateur en train de cuisiner souhaite être guidé étape par étape tout en gardant les mains libres ou salies. Il a besoin d'un affichage simplifié en plein écran qui lui permet de naviguer facilement entre les étapes sans quitter des yeux sa préparation.

**Why this priority**: Cette fonctionnalité différencie l'application d'un simple site de recettes en offrant une expérience optimisée pour la cuisine active. Elle peut être développée et testée indépendamment une fois que la consultation de recettes (P1) fonctionne.

**Independent Test**: Peut être testée en ouvrant une recette, en déclenchant le mode pas-à-pas, et en naviguant entre les étapes. Le succès est atteint si l'affichage est clair, lisible à distance, et la navigation est intuitive même avec des mains mouillées ou sales.

**Acceptance Scenarios**:

1. **Given** l'utilisateur consulte une recette, **When** il déclenche le mode pas-à-pas, **Then** l'écran passe en mode fullscreen avec un affichage simplifié de la première étape
2. **Given** l'utilisateur est en mode pas-à-pas, **When** il consulte une étape, **Then** il voit le numéro de l'étape, la description, les ingrédients nécessaires pour cette étape, et les paramètres du robot (température, temps, vitesse)
3. **Given** l'utilisateur est en mode pas-à-pas sur l'étape 2/5, **When** il passe à l'étape suivante, **Then** l'étape 3 s'affiche avec un indicateur de progression clair
4. **Given** l'utilisateur est en mode pas-à-pas, **When** il souhaite revenir à une étape précédente, **Then** il peut naviguer en arrière sans perdre sa progression
5. **Given** l'utilisateur est en mode pas-à-pas, **When** il termine la dernière étape, **Then** il voit un écran de félicitation avec la possibilité de quitter le mode ou de recommencer

---

### User Story 3 - Rechercher et Filtrer des Recettes (Priority: P3)

Un utilisateur possédant un type spécifique de robot cuisinier souhaite trouver rapidement des recettes compatibles avec son appareil ou correspondant à des critères spécifiques (temps de préparation, difficulté, type de plat).

**Why this priority**: Améliore l'expérience utilisateur mais n'est pas bloquant pour un MVP. Peut être ajouté une fois que le catalogue et la consultation fonctionnent.

**Independent Test**: Peut être testée en utilisant les filtres de recherche et en vérifiant que seules les recettes correspondantes sont affichées. Le succès est atteint si les résultats sont pertinents et rapides.

**Acceptance Scenarios**:

1. **Given** l'utilisateur est sur l'écran de listing, **When** il filtre par type de robot "Thermomix", **Then** seules les recettes compatibles Thermomix sont affichées
2. **Given** l'utilisateur est sur l'écran de listing, **When** il filtre par temps de préparation "moins de 30 minutes", **Then** seules les recettes rapides sont affichées
3. **Given** l'utilisateur est sur l'écran de listing, **When** il recherche "poulet", **Then** toutes les recettes contenant du poulet apparaissent dans les résultats
4. **Given** l'utilisateur a appliqué plusieurs filtres, **When** il réinitialise les filtres, **Then** toutes les recettes sont à nouveau visibles

---

### User Story 4 - Importer et Parser une Recette (Priority: P4)

Un administrateur souhaite enrichir le catalogue de recettes en important rapidement de nouvelles recettes depuis d'autres sources. Il copie le texte d'une recette et le système le structure automatiquement en étapes exploitables.

**Why this priority**: Fonctionnalité backend/admin qui facilite la gestion du contenu mais n'est pas visible des utilisateurs finaux. Peut être développée en parallèle ou après les fonctionnalités utilisateur.

**Independent Test**: Peut être testée en copiant une recette depuis un site externe, en la collant dans l'interface d'import, et en vérifiant que le système extrait correctement les ingrédients, quantités et étapes. Le succès est atteint si le parsing est correct dans plus de 90% des cas.

**Acceptance Scenarios**:

1. **Given** un administrateur est sur l'interface d'import, **When** il colle le texte d'une recette formatée, **Then** le système identifie automatiquement les sections (ingrédients, étapes, infos générales)
2. **Given** le système a parsé une recette, **When** l'administrateur visualise le résultat, **Then** il voit les ingrédients structurés avec quantités et unités, les étapes numérotées, et les métadonnées extraites
3. **Given** le système a parsé une recette, **When** l'administrateur corrige manuellement des erreurs de parsing, **Then** il peut éditer chaque champ individuellement avant validation
4. **Given** une recette parsée est validée, **When** l'administrateur enregistre la recette, **Then** elle apparaît immédiatement dans le catalogue utilisateur
5. **Given** le système parse une recette ambiguë ou mal formatée, **When** le parsing échoue, **Then** l'administrateur reçoit un message clair indiquant les sections problématiques

---

### Edge Cases

- **Proportions zéro ou négatives** : Que se passe-t-il si l'utilisateur entre 0 ou un nombre négatif de personnes ? Le système doit bloquer la saisie ou afficher un message d'erreur.
- **Recette sans robot spécifique** : Comment gérer les recettes compatibles avec tous les robots ou aucun robot en particulier ? Afficher un tag "Tous robots" ou "Manuel".
- **Ingrédients non divisibles** : Comment ajuster "1 œuf" pour 1,5 personne ? Arrondir intelligemment (1 œuf pour 1-2 personnes, 2 œufs pour 3-4, etc.).
- **Étapes longues en mode pas-à-pas** : Comment afficher une étape avec beaucoup de texte en fullscreen ? Permettre le scroll ou découper en sous-étapes.
- **Navigation pendant la cuisson** : Que se passe-t-il si l'utilisateur quitte le mode pas-à-pas en plein milieu ? Proposer de reprendre où il en était.
- **Mode offline** : Les recettes doivent-elles être disponibles sans connexion internet ? Le système doit mettre en cache les recettes consultées récemment.
- **Import de formats variés** : Comment gérer des recettes avec des formats très différents (listes à puces, paragraphes, tableaux) ? Le système IA doit être assez robuste pour s'adapter.
- **Unités de mesure multiples** : Comment gérer les conversions entre grammes, millilitres, cuillères à soupe, etc. ? Standardiser en unités métriques ou permettre le choix de l'utilisateur.

## Requirements

### Functional Requirements

**Catalogue et Consultation**

- **FR-001**: Le système DOIT afficher une liste de toutes les recettes disponibles avec pour chaque recette : titre, image, temps de préparation total, difficulté et type(s) de robot(s) compatible(s)
- **FR-002**: Le système DOIT permettre à l'utilisateur de sélectionner une recette pour voir son détail complet
- **FR-003**: Le système DOIT afficher pour chaque recette détaillée : titre, description, temps de préparation, temps de cuisson, difficulté, nombre de personnes par défaut, type de robot, liste des ingrédients avec quantités et unités, aperçu global des étapes
- **FR-004**: Le système DOIT permettre à l'utilisateur de modifier le nombre de personnes pour une recette (entre 1 et 20 personnes)
- **FR-005**: Le système DOIT recalculer automatiquement toutes les quantités d'ingrédients proportionnellement au nombre de personnes sélectionné
- **FR-006**: Le système DOIT afficher les quantités d'ingrédients avec leur unité appropriée (g, ml, c.à.s, pincée, etc.)

**Mode Pas-à-Pas**

- **FR-007**: Le système DOIT permettre à l'utilisateur de déclencher un mode pas-à-pas depuis la page de détail d'une recette
- **FR-008**: Le système DOIT afficher le mode pas-à-pas en plein écran (fullscreen) avec un affichage simplifié et épuré
- **FR-009**: Le système DOIT afficher pour chaque étape : numéro de l'étape, description textuelle, ingrédients nécessaires pour cette étape, paramètres du robot (température, vitesse, temps), et indicateur de progression global
- **FR-010**: Le système DOIT permettre à l'utilisateur de naviguer entre les étapes (suivante, précédente) avec des contrôles tactiles larges et accessibles
- **FR-011**: Le système DOIT empêcher la mise en veille de l'écran pendant le mode pas-à-pas
- **FR-012**: Le système DOIT permettre à l'utilisateur de quitter le mode pas-à-pas à tout moment

**Recherche et Filtrage**

- **FR-013**: Le système DOIT permettre de filtrer les recettes par type de robot cuisinier (Thermomix, Cookeo, Monsieur Cuisine, Tous)
- **FR-014**: Le système DOIT permettre de filtrer les recettes par temps de préparation total (moins de 30 min, 30-60 min, plus d'1h)
- **FR-015**: Le système DOIT permettre de filtrer les recettes par difficulté (facile, moyen, difficile)
- **FR-016**: Le système DOIT permettre de rechercher des recettes par mot-clé dans le titre ou la description

**Mode Offline (PWA)**

- **FR-017**: L'application DOIT fonctionner en tant que Progressive Web App installable sur mobile
- **FR-018**: Le système DOIT mettre en cache les recettes consultées récemment pour permettre leur consultation hors ligne
- **FR-019**: Le système DOIT indiquer clairement à l'utilisateur quand il est en mode hors ligne
- **FR-020**: Le système DOIT synchroniser les nouvelles recettes dès que la connexion est rétablie

**Import et Parsing de Recettes (Backend/Admin)**

- **FR-021**: Le système DOIT fournir une interface d'administration pour importer de nouvelles recettes
- **FR-022**: Le système DOIT permettre à un administrateur de coller le texte brut d'une recette dans un champ de saisie
- **FR-023**: Le système DOIT parser automatiquement le texte importé pour extraire : titre, description, temps, difficulté, nombre de personnes, liste des ingrédients (nom, quantité, unité), étapes numérotées avec descriptions
- **FR-024**: Le système DOIT utiliser un modèle d'IA pour structurer le texte importé selon un schéma défini
- **FR-025**: Le système DOIT permettre à l'administrateur de visualiser et corriger le résultat du parsing avant validation
- **FR-026**: Le système DOIT enregistrer la recette validée et la rendre immédiatement disponible dans le catalogue utilisateur

### Key Entities

- **Recette**: Représente une recette de cuisine complète. Attributs principaux : identifiant unique, titre, description courte, description complète, temps de préparation (minutes), temps de cuisson (minutes), difficulté (facile/moyen/difficile), nombre de personnes par défaut, type de robot compatible (Thermomix/Cookeo/Monsieur Cuisine/Manuel/Tous), image principale, date de création. Relations : contient plusieurs Ingrédients et plusieurs Étapes.

- **Ingrédient**: Représente un ingrédient nécessaire pour une recette. Attributs principaux : nom de l'ingrédient, quantité de base (pour le nombre de personnes par défaut de la recette), unité de mesure (g, ml, pièce, c.à.s, c.à.c, pincée, etc.), ordre d'affichage, optionnel (oui/non). Relations : appartient à une Recette, peut être associé à plusieurs Étapes.

- **Étape**: Représente une étape de préparation dans une recette. Attributs principaux : numéro de l'étape (ordre), description textuelle complète, durée estimée (minutes), température (°C), vitesse du robot, paramètres spécifiques au robot, ingrédients utilisés dans cette étape. Relations : appartient à une Recette, utilise plusieurs Ingrédients.

- **Robot Cuisinier**: Représente un type de robot cuisinier supporté. Attributs principaux : nom (Thermomix, Cookeo, Monsieur Cuisine), fabricant, paramètres supportés (température, vitesse, modes spécifiques). Relations : associé à plusieurs Recettes.

## Success Criteria

### Measurable Outcomes

- **SC-001**: Un utilisateur peut parcourir le catalogue, sélectionner une recette et consulter tous ses détails en moins de 10 secondes
- **SC-002**: L'ajustement des proportions d'ingrédients se fait instantanément (moins de 500ms) après modification du nombre de personnes
- **SC-003**: Le mode pas-à-pas est navigable d'une seule main avec des zones tactiles d'au moins 44x44px (recommandation d'accessibilité mobile)
- **SC-004**: L'application fonctionne hors ligne et permet de consulter au moins les 10 dernières recettes vues sans connexion internet
- **SC-005**: L'application peut être installée sur l'écran d'accueil mobile et se lance en moins de 3 secondes
- **SC-006**: 90% des recettes importées sont correctement parsées automatiquement avec tous les champs structurés (ingrédients, quantités, étapes)
- **SC-007**: Le temps nécessaire pour importer et publier une nouvelle recette est réduit de 80% par rapport à une saisie manuelle complète
- **SC-008**: Les filtres de recherche retournent des résultats pertinents en moins de 1 seconde même avec 500+ recettes dans le catalogue
- **SC-009**: L'écran reste allumé pendant toute la durée du mode pas-à-pas sans intervention manuelle de l'utilisateur
- **SC-010**: 95% des utilisateurs complètent une recette en mode pas-à-pas sans revenir à l'écran de détail

## Assumptions

1. **Format des recettes sources** : Les recettes importées proviennent de sources francophones avec un format texte relativement standard (section ingrédients suivie de section étapes).

2. **Authentification** : Le MVP ne nécessite pas d'authentification utilisateur. Les fonctionnalités comme les favoris ou l'historique pourront être ajoutées dans une version ultérieure. L'interface d'administration est protégée par authentification basique.

3. **Hébergement IA** : Le parsing des recettes utilise un modèle IA hébergé localement (Ollama avec un LLM léger) pour garantir la confidentialité des données et réduire les coûts. L'orchestration se fait via n8n.

4. **Langue** : L'application est en français uniquement dans le MVP. Le support multilingue pourra être ajouté ultériurement.

5. **Types de robots** : Le MVP supporte initialement les trois robots les plus populaires en France (Thermomix, Cookeo, Monsieur Cuisine). D'autres robots pourront être ajoutés facilement via la base de données.

6. **Unités de mesure** : Le système utilise le système métrique (grammes, millilitres) comme standard. Les conversions vers d'autres systèmes (impérial) ne sont pas prévues dans le MVP.

7. **Images** : Les images de recettes sont fournies lors de l'import (URL ou upload). Le système ne génère pas d'images automatiquement.

8. **Modération** : Les recettes sont validées manuellement par un administrateur avant publication. Il n'y a pas de système de contribution communautaire dans le MVP.

9. **Capacité** : Le catalogue contiendra entre 50 et 500 recettes dans un premier temps. L'architecture doit supporter une montée en charge jusqu'à 5000 recettes sans dégradation de performance.

10. **Plateforme** : L'application cible prioritairement les smartphones (iOS et Android) via PWA. La version desktop est fonctionnelle mais non optimisée.

## Constraints

- L'application doit respecter les standards PWA pour être installable (HTTPS, Service Worker, manifest.json)
- L'interface doit être utilisable avec des mains mouillées ou sales (zones tactiles larges, peu de gestes complexes)
- Le parsing IA doit fonctionner avec un modèle léger (< 7B paramètres) pour des raisons de performance et de coût
- L'application doit fonctionner sur des smartphones de milieu de gamme (2Go RAM minimum)
- Le temps de chargement initial de l'application ne doit pas excéder 5 secondes sur une connexion 3G

## Out of Scope

- Système de notation et commentaires des recettes
- Partage social des recettes (Facebook, Instagram, etc.)
- Génération automatique de liste de courses
- Intégration avec des services de livraison de courses
- Calcul de valeurs nutritionnelles (calories, macros)
- Gestion de régimes alimentaires (végétarien, sans gluten, etc.) - peut être ajouté via filtres ultérieurement
- Conversion automatique vers d'autres unités de mesure (cups, oz, etc.)
- Vidéos de recettes
- Mode vocal / commandes vocales
- Planification de menus hebdomadaires
- Synchronisation entre appareils (nécessiterait des comptes utilisateurs)
- Traduction automatique de recettes depuis d'autres langues
- Import automatique depuis des sites externes (scraping)
