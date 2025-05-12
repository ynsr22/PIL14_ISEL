# -------------------------
# ÉTAPE 1 : Build Optimisé
# -------------------------
FROM oven/bun:1.2.12-alpine AS builder

# Définir le répertoire de travail
WORKDIR /app

# Récupérer l'argument VITE_API_URL passé depuis Docker Compose
ARG VITE_API_URL
# Définir l'environnement pour Vite (au build)
ENV VITE_API_URL=$VITE_API_URL

# Copier uniquement les fichiers de dépendances pour optimiser le cache
COPY package.json bun.lock ./

# Installer les dépendances (y compris dev)
RUN bun install

# Copier le reste des fichiers
COPY . .

# Build de l'application (script "build" doit générer un dossier "dist")
ENV NODE_ENV=production
RUN bun run build
    
# -------------------------
# ÉTAPE 2 : Runner Léger (avec Nginx)
# -------------------------
FROM nginx:alpine AS runner

# Copier le build statique vers le dossier de Nginx
COPY --from=builder /app/dist /usr/share/nginx/html

# Copier ta configuration personnalisée pour gérer le fallback et autres règles
COPY nginx.conf /etc/nginx/nginx.conf

# Exposer le port 80
EXPOSE 80

# Démarrage de Nginx en mode premier plan
CMD ["nginx", "-g", "daemon off;"]
    