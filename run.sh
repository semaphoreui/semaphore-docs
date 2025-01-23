cd deploy

source ./venv/bin/activate

ansible-playbook -i invs/yc/hosts build.yml

ansible-playbook -i invs/yc/hosts deploy.yml --vault-password-file ~/semaphore_pass