import json
import re

file_path = 'client/src/locales/en/translation.json'

with open(file_path, 'r') as f:
    content = f.read()

# Find the last added inventory block (the one I added at the end)
# It looks like: "inventory": { ... }
# I'll use regex to find all "inventory": { ... } blocks
# But since JSON structure is nested, regex is tricky.
# However, I know I added it at the end, so it should be near the end of the file.

# Let's try to find the last occurrence of "inventory": {
last_inventory_index = content.rfind('"inventory": {')

# The main inventory block starts around line 1264.
# The one I added is around line 2479.

if last_inventory_index > 20000: # approximate char position
    print("Found the last inventory block")
    
    # Extract the content of the last inventory block
    # It ends with },
    
    start_index = last_inventory_index
    # Find the matching closing brace
    brace_count = 0
    end_index = start_index
    found_start = False
    
    for i in range(start_index, len(content)):
        if content[i] == '{':
            brace_count += 1
            found_start = True
        elif content[i] == '}':
            brace_count -= 1
            
        if found_start and brace_count == 0:
            end_index = i + 1
            break
            
    new_inventory_block_str = content[start_index:end_index]
    print(f"Extracted block: {new_inventory_block_str}")
    
    # Parse this block to get the keys
    # Wrap in braces to make it valid JSON
    try:
        new_inventory_data = json.loads('{' + new_inventory_block_str + '}')['inventory']
        print("Parsed new keys successfully")
    except Exception as e:
        print(f"Error parsing new block: {e}")
        exit(1)

    # Remove the last block from content
    # We also need to remove the preceding comma if it exists
    # content = content[:start_index].rstrip().rstrip(',') + content[end_index:]
    
    # Actually, let's just remove the block. The comma handling might be tricky.
    # I'll remove the block and then fix the JSON structure if needed.
    
    # But wait, I can't just parse the whole file because it has duplicate keys.
    # So I have to do text manipulation.
    
    # 1. Remove the last inventory block.
    content_without_last = content[:start_index] + content[end_index:]
    
    # Clean up trailing comma if any (before the closing brace of the main object)
    # The file ends with `  }\n}` usually.
    # If I inserted before the last `}`, there might be a comma.
    
    # 2. Find the main inventory block (around line 1264)
    # It's the second occurrence of "inventory": { usually (first is inside reports)
    
    # Let's find the "inventory": { that is at the root level (indentation 2 spaces)
    # The one inside reports has indentation 4 spaces.
    
    main_inventory_match = re.search(r'^\s{2}"inventory": \{', content_without_last, re.MULTILINE)
    
    if main_inventory_match:
        main_start = main_inventory_match.start()
        print(f"Found main inventory block at {main_start}")
        
        # Find the end of this block
        brace_count = 0
        main_end = main_start
        found_start = False
        
        for i in range(main_start, len(content_without_last)):
            if content_without_last[i] == '{':
                brace_count += 1
                found_start = True
            elif content_without_last[i] == '}':
                brace_count -= 1
                
            if found_start and brace_count == 0:
                main_end = i
                break
        
        # Insert the new keys into the main block
        # We need to format them as JSON entries
        
        # Filter out keys that already exist in the main block to avoid duplicates?
        # Or just append them? JSON allows duplicates but it's bad practice.
        # Ideally we merge.
        
        main_block_content = content_without_last[main_start:main_end+1]
        try:
            main_data = json.loads('{' + main_block_content + '}')['inventory']
        except:
            print("Could not parse main block, appending blindly")
            main_data = {}

        # Merge
        # We want new keys to override or be added.
        # Let's just generate the string for new keys.
        
        new_keys_str = ""
        for k, v in new_inventory_data.items():
            if k not in main_data:
                 new_keys_str += f',\n    "{k}": "{v}"'
            else:
                print(f"Key {k} already exists, skipping")

        # Insert before the closing brace of main block
        updated_content = content_without_last[:main_end] + new_keys_str + content_without_last[main_end:]
        
        # Now write back
        with open(file_path, 'w') as f:
            f.write(updated_content)
            
        print("Successfully merged inventory keys")
        
    else:
        print("Could not find main inventory block")

else:
    print("Could not find the added inventory block at the end")
