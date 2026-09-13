cd scripts

./build-parallel.sh

cd ../deploy
if [ -f ~/venv/bin/activate ]; then
    echo "Activating virtual environment"
    source ~/venv/bin/activate
fi

./run.sh aws deploy
