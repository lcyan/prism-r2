import os

file_path = 'src/features/dashboard/Dashboard.tsx'

with open(file_path, 'r', encoding='utf-8') as f:
    content = f.read()

# The exact block we want to replace might be hard to match due to whitespace.
# Let's find the start and end markers.
start_marker = '{/* Actions Row - NodeImage Sliding Effect */}'
end_marker_context = '</div>\n                                        </div>\n                                    </div>'

start_index = content.find(start_marker)
if start_index == -1:
    print("Start marker not found")
    exit(1)

# Inspect the indentation before the start marker
# We want to keep the same indentation level for the new content
# But for now let's just find where the actual div block ends.
# It ends at the </div> before the closing tags of the map return.
# The map return closes with:
#                                         </div>
#                                     </div>
#                                 )
#                             })}

# So we are looking for the closing </div> of the 'Actions Row' container.
# It seems it is a <div> wrapping the map.

# Let's verify the content structure around the start marker
print(f"Found marker at {start_index}")

# We want to replace from start_marker until the matching closing div of the "relative flex" container.
# The container opens right after the comment.
# <div className="relative flex items-center bg-gray-50 ... h-11">
#    <div className="relative flex-1 ...">
#       ... map ...
#    </div>
# </div>

# So we need to match until the second </div> after the map?
# Actually, replacing by exact string matching the *old* content I "know" is there is risky if I don't know the whitespace.
# Let's print the 500 chars after the marker to debug.
print(repr(content[start_index:start_index+500]))
