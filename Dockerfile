FROM --platform=linux/amd64 node:22-alpine AS deps
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci

FROM --platform=linux/amd64 node:22-alpine AS builder
WORKDIR /app
ENV NEXT_TELEMETRY_DISABLED=1
ARG API_BASE_URL
ARG CMS_URL
ARG NEXT_PUBLIC_FORMS_URL
ENV API_BASE_URL=$API_BASE_URL
ENV CMS_URL=$CMS_URL
ENV NEXT_PUBLIC_FORMS_URL=$NEXT_PUBLIC_FORMS_URL
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN test -n "$API_BASE_URL" \
    && test -n "$CMS_URL" \
    && test -n "$NEXT_PUBLIC_FORMS_URL" \
    && npx next build --webpack

FROM --platform=linux/amd64 node:22-alpine
WORKDIR /app
ENV NODE_ENV=production NEXT_TELEMETRY_DISABLED=1 PORT=3000 HOSTNAME=0.0.0.0
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
EXPOSE 3000
CMD ["node", "server.js"]
