import os
import re

file_path = 'src/features/dashboard/Dashboard.tsx'

with open(file_path, 'r', encoding='utf-8') as f:
    content = f.read()

start_marker = '{/* Actions Row - NodeImage Sliding Effect */}'
# New content to insert
new_block = '''{/* Actions Row - Discrete Buttons Style */}
                                            <div className="flex items-center justify-between gap-1 px-1">
                                                {(['url', 'html', 'markdown', 'bbcode'] as const).map((fmt) => (
                                                    <button
                                                        key={fmt}
                                                        onClick={() => setCopyFormats(prev => ({ ...prev, [file.key]: fmt }))}
                                                        className={`h-9 flex-1 flex items-center justify-center rounded-xl transition-all duration-300 font-medium ${
                                                            activeFormat === fmt 
                                                                ? 'bg-[#FF7043] text-white shadow-lg shadow-orange-500/30 scale-100' 
                                                                : 'bg-transparent text-gray-400 hover:bg-gray-50 dark:hover:bg-zinc-800 scale-95 hover:scale-100'
                                                        }`}
                                                        title={fmt.toUpperCase()}
                                                    >
                                                        {fmt === 'url' && <Link size={16} strokeWidth={2.5} />}
                                                        {fmt === 'html' && <Code size={16} strokeWidth={2.5} />}
                                                        {fmt === 'markdown' && <FileText size={16} strokeWidth={2.5} />}
                                                        {fmt === 'bbcode' && <span className="text-[10px] font-black font-sans tracking-tighter">[BB]</span>}
                                                    </button>
                                                ))}
                                            </div>'''

# Find start
start_idx = content.find(start_marker)
if start_idx == -1:
    print("Start marker not found! Aborting.")
    exit(1)

# Find end. We want to replace ensuring we capture the whole <div>...</div> block.
# We know the block ends before the closing of the card body.
# The card body closes with:
#                                         </div>
#                                     </div>
# (multiple spaces)

# Let's verify what comes after the start marker to ensure we are replacing the right thing.
# We expect <div className="relative flex items-center...
# We simply scan forward for "</div>" until we find the one that closes the relative flex container.
# The container has ONE nested div (relative flex-1).
# So we expect <div> ... <div> ... </div> ... </div>.
# Two </div> tags.

current_idx = start_idx
div_count = 0
# Scan until we find the start of the first div
while content[current_idx] != '<':
    current_idx += 1

if content[current_idx:current_idx+4] != '<div':
    print("Expected <div after marker, found something else")
    exit(1)

# Now we track nesting
balance = 0
found_first_div = False
end_idx = -1

for i in range(current_idx, len(content)):
    if content[i:i+4] == '<div':
        balance += 1
        found_first_div = True
    elif content[i:i+5] == '</div':
        balance -= 1
    
    if found_first_div and balance == 0:
        # We found the closing tag of the main container
        # The closing tag is </div>. We want to include it in the replacement range.
        end_idx = i + 6 # len('</div>')
        break

if end_idx == -1:
    print("Could not find closing div")
    exit(1)

# Construct new content
# We need to preserve the indentation of the start_marker? 
# The new_block already has some indentation, let's hope it aligns reasonably well.
# We simply replace content[start_idx:end_idx]
final_content = content[:start_idx] + new_block + content[end_idx:]

with open(file_path, 'w', encoding='utf-8') as f:
    f.write(final_content)

print("Successfully replaced content using Python script.")
