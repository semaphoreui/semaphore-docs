ansible-galaxy collection install -r requirements.yml
ansible-playbook -i invs/yc/hosts deploy.yml --vault-password-file ~/semaphore_pass --extra-vars=@~/semaphore_yc_vars.json
