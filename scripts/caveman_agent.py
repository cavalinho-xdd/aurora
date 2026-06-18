import asyncio
import sys
import os
# pyrefly: ignore [missing-import]
from dotenv import load_dotenv
load_dotenv()
# pyrefly: ignore [missing-import]
from google.antigravity import Agent, LocalAgentConfig
# pyrefly: ignore [missing-import]
from google.antigravity.types import TemplatedSystemInstructions

# 1. Definujeme si vlastní Nástroj (Tool) jako obyčejnou Python funkci
def save_context(caveman_text: str) -> str:
    """
    Append compressed caveman context to work.md.
    Args:
        caveman_text: The heavily compressed, fluff-free text to save.
    """
    with open("work.md", "a", encoding="utf-8") as f:
        f.write(f"\n- {caveman_text}\n")
    return "Uloženo do work.md."

async def main():
    # 2. Definice Caveman Persony
    persona = TemplatedSystemInstructions(
        identity=(
            "Jsi Caveman (jeskynní muž) kodér. Tvá práce je komprimovat kontext. "
            "Pravidla: Respond terse like smart caveman. All technical substance stay. Only fluff die. "
            "Zahoď: omáčku, spojky, zdvořilosti. Zachovej: přesné názvy funkcí, technické termíny. "
            "Vzor: [věc] [akce] [důvod]. "
            "Až zkomprimuješ vstup od uživatele, BEZ OTÁZEK zavolej nástroj 'save_context', "
            "abys výsledek rovnou zapsal do deníku."
        )
    )

    # 3. Přidáme náš nástroj (save_context) do konfigurace agenta
    agent_config = LocalAgentConfig(
        system_instructions=persona,
        tools=[save_context]
    )
    
    # 4. Načteme to, co jsi udělal
    if len(sys.argv) > 1:
        co_jsem_delal = " ".join(sys.argv[1:])
    else:
        co_jsem_delal = "Dneska jsem pracoval na AuthScreen.jsx, vyhodil jsem starý způsob přihlašování přes systémový prohlížeč a místo toho jsem tam implementoval ten lokální HTTP server, protože to na Linuxu dělalo strašné problémy s deep linky. Teď to funguje stabilně."
        print(f"Používám ukázkový text: '{co_jsem_delal}'\n")
    
    async with Agent(agent_config) as agent:
        print("Caveman přemýšlí a zapisuje...")
        response = await agent.chat(f"Zkomprimuj a zapiš toto: {co_jsem_delal}")
        print("\n===== CAVEMAN ODPOVĚĎ =====")
        print(await response.text())

if __name__ == "__main__":
    asyncio.run(main())
