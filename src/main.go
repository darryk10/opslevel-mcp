package main

import (
	"github.com/opslevel/opslevel-mcp/cmd"
)

var (
	version = "dev"
	commit  = "none"
)

func main() {
	cmd.Execute(version, commit)
}
