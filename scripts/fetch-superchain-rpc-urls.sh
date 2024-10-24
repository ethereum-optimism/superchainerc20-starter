#!/bin/bash

# Define the output TOML file path
output_file="packages/contracts/foundry.toml"

# Extract existing chain IDs as a JSON array from the [rpc_endpoints] section
existing_chain_ids=$(awk '/^\[rpc_endpoints\]/ {flag=1; next} /^\[/{flag=0} flag {print $1}' "$output_file" | tr -d ' ' | jq -R . | jq -s .)

# Fetch the new RPC data, filtering out existing chain IDs
new_entries=$(curl -s "https://raw.githubusercontent.com/ethereum-optimism/superchain-registry/main/chainList.json" | 
jq --argjson existing "$existing_chain_ids" -r '
  [.[] | { id: "\"\(.identifier)\"", rpc: .rpc[0] }]
  | reduce .[] as $entry ({}; 
      ($entry.id | tostring) as $id |
      if $existing | index($id) 
      then . 
      else .[$id] = $entry.rpc 
      end)
  | to_entries | map("\(.key) = \"\(.value)\"") | join("\n")
')

# Only proceed if `new_entries` is non-empty
if [[ -n "$new_entries" ]]; then
  # Write `new_entries` to a temporary file
  tmp_file=$(mktemp)
  echo "$new_entries" > "$tmp_file"

  # Check if [rpc_endpoints] section exists in the file
  if grep -q "^\[rpc_endpoints\]" "$output_file"; then
    # Insert directly after the [rpc_endpoints] section
    awk -v tmp_file="$tmp_file" '
      BEGIN { print_once = 1 }
      /^\[rpc_endpoints\]/ { 
        print; 
        getline; 
        while($0 ~ /^[[:space:]]*$/) getline; 
        if(print_once) { 
          while ((getline line < tmp_file) > 0) print line; 
          print_once = 0 
        } 
      }
      1
    ' "$output_file" > "${output_file}.tmp" && mv "${output_file}.tmp" "$output_file"
  else
    # Append both [rpc_endpoints] and new entries if the section does not exist
    {
      echo -e "\n[rpc_endpoints]"
      cat "$tmp_file"
    } >> "$output_file"
  fi

  # Clean up the temporary file
  rm "$tmp_file"
  echo "Appended missing RPC endpoints to $output_file under [rpc_endpoints] section."
else
  echo "No new RPC endpoints to append."
fi
