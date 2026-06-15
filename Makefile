# Lohkokirja - kehityskomennot.
# Aja "make help" nähdäksesi kaikki komennot.
# Jokaisen kohteen alla näkyy taustalla ajettava npm-komento.

.DEFAULT_GOAL := help
.PHONY: help install dev test test-unit test-integration typecheck lint format check

help: ## Näytä tämä ohje
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | awk 'BEGIN {FS = ":.*?## "}; {printf "  make %-17s %s\n", $$1, $$2}'

install: ## Asenna riippuvuudet
	npm install

dev: ## Käynnistä palvelin watch-tilassa (portti 3000)
	npm run dev

test: ## Aja koko testistö
	npm test

test-unit: ## Aja vain yksikkötestit
	npm run test:unit

test-integration: ## Aja vain integraatiotestit
	npm run test:integration

typecheck: ## Tarkista TypeScript-tyypit
	npm run typecheck

lint: ## Aja ESLint
	npm run lint

format: ## Muotoile koodi (Prettier)
	npm run format

check: typecheck lint test ## Aja kaikki tarkistukset ennen valmista
	@echo "Kaikki tarkistukset lapi."
