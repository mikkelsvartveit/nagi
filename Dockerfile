# SvelteKit build step
FROM node:20-alpine AS vite-build

WORKDIR /app

RUN npm install -g pnpm

COPY package.json pnpm-lock.yaml ./

RUN pnpm install --frozen-lockfile
COPY . .
RUN pnpm run build

# Production image
FROM alpine:latest

ARG PB_VERSION=0.36.1

RUN apk add --no-cache \
    wget \
    unzip \
    ca-certificates

# Detect architecture and download the appropriate PocketBase binary
RUN ARCH=$(uname -m); \
    case "$ARCH" in \
        x86_64) PB_ARCH="amd64" ;; \
        aarch64) PB_ARCH="arm64" ;; \
        arm64) PB_ARCH="arm64" ;; \
        armv7l) PB_ARCH="armv7" ;; \
        *) echo "Unsupported architecture: $ARCH" && exit 1 ;; \
    esac && \
    wget https://github.com/pocketbase/pocketbase/releases/download/v${PB_VERSION}/pocketbase_${PB_VERSION}_linux_${PB_ARCH}.zip -O /tmp/pb.zip

RUN unzip /tmp/pb.zip -d /pb/ && \
    rm /tmp/pb.zip

COPY --from=vite-build /app/build /pb/pb_public
COPY --from=vite-build /app/pocketbase/pb_migrations* /pb/pb_migrations
COPY --from=vite-build /app/pocketbase/pb_hooks* /pb/pb_hooks

EXPOSE 8080

CMD ["/pb/pocketbase", "serve", "--http=0.0.0.0:8080"]
