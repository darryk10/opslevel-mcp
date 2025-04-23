FROM golang:1.24.2-alpine AS builder

RUN apk add --no-cache curl git bash && \
    curl -sL https://taskfile.dev/install.sh | sh

WORKDIR /app

COPY .git .git
COPY Taskfile.yml .
COPY src src

RUN task setup

WORKDIR /app/src
RUN go build -v -o /app/opslevel-mcp ./main.go

FROM alpine:latest

RUN apk add --no-cache ca-certificates

COPY --from=builder /app/opslevel-mcp /opslevel-mcp

CMD ["/opslevel-mcp"]
