# The Last Hope

Plataforma 2D side-scrolling de ficção científica ambiental. O protagonista **Zion** atravessa ruínas industriais devastadas, relitga geradores e restaura um sistema de irrigação morto para devolver vida a um corredor agrícola destruído.

**Jogo online:** [https://the-last-hope.vercel.app](https://the-last-hope.vercel.app)  
**Repositório:** [https://github.com/gabrielmiranda-droid/the-last-Hope](https://github.com/gabrielmiranda-droid/the-last-Hope)

---

## Tecnologias

| Camada | Tecnologia |
|--------|-----------|
| Framework | React 18 |
| Linguagem | TypeScript 5 |
| Bundler | Vite 5 |
| Renderização | Canvas API (sem engine externa) |
| Deploy | Vercel |

---

## Como rodar localmente

**Pré-requisitos:** Node.js 20+ e npm 10+

```bash
# 1. Clonar o repositório
git clone https://github.com/gabrielmiranda-droid/the-last-Hope.git
cd the-last-Hope

# 2. Instalar dependências
npm install

# 3. Rodar em modo desenvolvimento
npm run dev
```

Acesse em: `http://localhost:5173`

---

## Build de produção

```bash
npm run build    # gera a pasta dist/
npm run preview  # serve o build localmente para testar
```

---

## Deploy na Vercel

### Pela interface web (recomendado)

1. Acesse [vercel.com](https://vercel.com) e faça login com GitHub
2. Clique em **"Add New Project"**
3. Selecione o repositório `the-last-Hope`
4. Configure:
   - **Framework Preset:** `Vite`
   - **Build Command:** `npm run build`
   - **Output Directory:** `dist`
   - **Install Command:** `npm install`
5. Clique em **"Deploy"**

O deploy automático acontece a cada `git push` na branch `main`.

### Pela CLI da Vercel

```bash
npm install -g vercel
vercel login
vercel --prod
```

---

## Controles

| Tecla | Ação |
|-------|------|
| `A` / `D` ou `←` `→` | Mover |
| `Espaço` / `W` / `↑` | Pular (duplo pulo disponível) |
| `Shift` | Dash |
| `E` | Interagir |
| `Esc` | Pause |

---

## Estrutura do projeto

```
the-last-hope/
├── public/
│   └── assets/          # sprites, tiles, audio
├── src/
│   ├── components/
│   │   └── GameShell.tsx
│   ├── game/
│   │   ├── data/        # level1.ts, level2.ts, level3.ts
│   │   ├── systems/     # TrapSystem.ts
│   │   ├── GameEngine.ts
│   │   ├── constants.ts
│   │   ├── types.ts
│   │   └── assets.ts
│   ├── styles/
│   │   └── global.css
│   ├── App.tsx
│   └── main.tsx
├── index.html
├── vite.config.ts
├── tsconfig.app.json
└── package.json
```

---

## Fases

| Fase | Nome | Mecânicas principais |
|------|------|---------------------|
| 1 | Região da Seca | Plataformas quebradiças, timed, falsas, lasers, drone rush, crusher |
| 2 | Instalação de Energia | Plataformas timed, lasers, espinhos ocultos |
| 3 | Bosque da Restauração | Plataformas móveis, slippery, misto de mecânicas |

---

## Mecânicas implementadas

- Movimento com aceleração/desaceleração diferenciada (chão vs ar)
- Pulo duplo e coyote time
- Dash com cooldown
- Checkpoints com respawn e fade
- Plataformas: estáticas, quebradiças, falsas, temporizadas, móveis, escorregadias
- Hazards: lasers piscantes, drones de patrulha, drones de rush, crushers
- Espinhos ocultos ativados por trigger zones
- Wind zones com força X/Y e gravityScale
- 3 geradores + console de irrigação por fase
- HUD: energia, logs, objetivo, prompt de interação
- Logs narrativos colecionáveis
- Menu, opções, pause e tela de vitória
