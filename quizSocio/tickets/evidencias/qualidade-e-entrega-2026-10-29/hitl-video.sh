#!/usr/bin/env bash
# Human-in-the-loop reproduction loop.
# Copy this file, edit the steps below, and run it.
# The agent runs the script; the user follows prompts in their terminal.
#
# Usage:
#   bash hitl-loop.template.sh
#
# Two helpers:
#   step "<instruction>"          → show instruction, wait for Enter
#   capture VAR "<question>"      → show question, read response into VAR
#
# At the end, captured values are printed as KEY=VALUE for the agent to parse.
#
# `capture` prints its value back to the terminal, where the agent reads it,
# so capture observations, and leave signing in to the user as a `step`.

set -euo pipefail

step() {
  printf '\n>>> %s\n' "$1"
  read -r -p "    [Enter when done] " _
}

capture() {
  local var="$1" question="$2" answer
  printf '\n>>> %s\n' "$question"
  read -r -p "    > " answer
  printf -v "$var" '%s' "$answer"
}

# --- edit below ---------------------------------------------------------

step "Abra http://localhost:5173/.scratch/perf/browser-report.html no navegador em que o quiz trava."
step "Clique em Medir por 20 segundos. Use o quiz e role a página normalmente, mantendo a aba visível. Aguarde a medição terminar."
step "Marque se percebeu travadas, clique em Ver relatório e copie o JSON técnico para a conversa. Não cole HAR, cookies ou credenciais."
capture ERRORED "Você percebeu travadas durante a medição? (sim/nao)"
capture ERROR_MSG "Aconteceu em repouso, navegando, rolando ou em todos esses momentos?"

# --- edit above ---------------------------------------------------------

printf '\n--- Captured ---\n'
printf 'ERRORED=%s\n' "$ERRORED"
printf 'ERROR_MSG=%s\n' "$ERROR_MSG"
