ansible-galaxy collection install -r requirements.yml
ansible-playbook -i invs/$1/hosts $2.yml --vault-password-file ~/semaphore_pass --extra-vars=@~/semaphore_vars.json
