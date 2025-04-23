FROM alpine:latest

RUN apk add --no-cache ca-certificates

COPY --from=public.ecr.aws/opslevel/mcp:latest /usr/local/bin/opslevel-mcp /bin/opslevel-mcp

ENTRYPOINT ["/opslevel-mcp"]
