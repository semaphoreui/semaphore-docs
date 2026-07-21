#!/bin/bash

UV_PYTHON="$(uv tool dir)/ansible-core/bin/python"

EXTRA_ARGS=()
if [ -x "$UV_PYTHON" ]; then
  EXTRA_ARGS+=(-e ansible_python_interpreter="$UV_PYTHON")
fi

ansible-playbook \
  -i invs/$1/hosts $2.yml \
  --vault-password-file ~/semaphore_pass \
  --extra-vars=@~/semaphore_vars.json \
  -vvvv \
  "${EXTRA_ARGS[@]}"
