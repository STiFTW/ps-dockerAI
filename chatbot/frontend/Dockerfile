# Stage 1: Build the application
FROM node:23-alpine AS build
WORKDIR /app
ARG LLM_MODEL_NAME
ENV LLM_MODEL_NAME=${LLM_MODEL_NAME}
COPY package.json ./
COPY generate-config.js ./
RUN npm install
COPY . .
# RUN mkdir -p public
RUN npm run build

# Stage 2: Create a minimal production image
FROM node:23-alpine AS production
WORKDIR /app
ENV NODE_ENV=production
COPY package.json ./
RUN npm install --omit=dev
COPY --from=build /app/build ./build
COPY --from=build /app/public ./public
# RUN mkdir -p public
EXPOSE 3000
CMD ["npm", "run", "start"]