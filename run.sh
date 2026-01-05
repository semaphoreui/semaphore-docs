cd deploy
if [ -f ~/venv/bin/activate ]; then
    echo "Activating virtual environment"
    source ~/venv/bin/activate
else
    echo "Use ansible without virtual environment"
fi

./run.sh aws deploy
