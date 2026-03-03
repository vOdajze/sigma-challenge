import secrets
import shutil
import os

ENV_FILE = ".env"
ENV_EXAMPLE = ".env.example"

def generate_env():
    if os.path.exists(ENV_FILE):
        print(".env já existe — nenhuma alteração feita.")
        return

    shutil.copy(ENV_EXAMPLE, ENV_FILE)

    db_password = secrets.token_urlsafe(32)
    secret_key  = secrets.token_urlsafe(64)

    with open(ENV_FILE, "r") as f:
        content = f.read()

    content = content.replace("__DB_PASSWORD__", db_password)
    content = content.replace("__SECRET_KEY__",  secret_key)

    with open(ENV_FILE, "w") as f:
        f.write(content)

    print(".env gerado com sucesso!")
    print("Rode agora: docker compose up --build")

if __name__ == "__main__":
    generate_env()
