#!/bin/bash

find . -type f -name "index.html" | while read file; do
  sed -i '' 's/\>Semaphore Docs\</><img src="https:\/\/docs.semaphoreui.com\/favicon.png\?x=" style="width:30px;transform:translateY\(6px\);margin-right:5px;opacity:0.7;"> Semaphore Docs</g' "$file"
done



