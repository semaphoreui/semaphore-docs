#!/bin/bash

find . -type f -name "index.html" | while read file; do
  sed -i '' 's/\>Semaphore Docs\</><img src="https:\/\/docs.semaphoreui.com\/favicon.png\?x=" class="menu-icon"> Semaphore Docs</g' "$file"
done



