#!/bin/bash

# Define the URL to fetch the JSON data
CONFIG_URL="https://raw.githubusercontent.com/ethereum-optimism/superchain-registry/main/superchain/configs/configs.json"

# Define the output path to write the parsed data
OUTPUT_DIR="$(pwd)/packages/contracts/configs"
OUTPUT_FILE="$OUTPUT_DIR/chains.json"

# Create the output directory if it doesn't exist
mkdir -p "$OUTPUT_DIR"


# Fetch the JSON from the GitHub repository
curl -s $CONFIG_URL | jq 'reduce .superchains[] as $chain (
  {}; 
  . + { ($chain.name): (
    [ $chain.chains[]? | { name: .Name, chainId: .l2_chain_id, rpcUrl: .PublicRPC } ] 
  )}
)' > "$OUTPUT_FILE"

echo "superchain chain configs written to $OUTPUT_FILE"
