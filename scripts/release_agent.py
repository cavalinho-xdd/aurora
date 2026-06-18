import asyncio
import subprocess
from google.antigravity import Agent, LocalAgentConfig
from google.antigravity.types import TemplatedSystemInstructions

async def main():
    # 1. Definice Persony
    persona = TemplatedSystemInstructions(
        identity=(
            "Jsi expert na komunikaci s komunitou pro projekt Aurora (Pomodoro appka). "
            "Dostaneš seznam technických úprav, které vývojář udělal (výstup z git log). "
            "Tvým úkolem je sepsat z toho krásný a motivující Release Notes (seznam novinek) "
            "v markdownu. Vymysli i vtipný název pro tuto aktualizaci. Odpovídej v češtině."
        )
    )

    agent_config = LocalAgentConfig(system_instructions=persona)
    
    # 2. Získání reálných dat (vytáhneme si posledních 5 commitů z tvého gitu)
    try:
        # Použijeme běžný pythoní subprocess pro spuštění příkazu v terminálu
        git_log = subprocess.check_output(["git", "log", "-n", "5", "--oneline"]).decode("utf-8")
    except Exception as e:
        git_log = "Nepodařilo se načíst git log. Testovací data: přidán dark mode, oprava chyb."

    print("Načtené poslední commity z gitu:")
    print(git_log)
    print("Agent přemýšlí a píše release notes...\n")
    
    # 3. Spuštění agenta
    async with Agent(agent_config) as agent:
        # Pošleme mu načtený git log a počkáme na odpověď
        response = await agent.chat(f"Tady jsou změny pro novou verzi: {git_log}")
        
        print("===== VÝSLEDEK =====")
        print(await response.text())

if __name__ == "__main__":
    asyncio.run(main())
