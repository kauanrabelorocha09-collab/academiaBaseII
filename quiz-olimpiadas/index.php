<?php
// Lê o arquivo JSON e converte em um vetor associativo
$conteudo = file_get_contents(__DIR__ . '/perguntas.json');
$perguntas = json_decode($conteudo, true);

if (!is_array($perguntas)) {
    die('Erro ao ler o arquivo perguntas.json.');
}

$letras = ['A', 'B', 'C', 'D'];
$enviado = $_SERVER['REQUEST_METHOD'] === 'POST';
$respostas = [];
$acertos = 0;

// Processa as respostas enviadas pelo formulário (método POST)
if ($enviado) {
    $respostas = $_POST['resposta'] ?? [];

    foreach ($perguntas as $i => $p) {
        if (isset($respostas[$i]) && (int) $respostas[$i] === $p['correta']) {
            $acertos++;
        }
    }

    $total = count($perguntas);
    $percentual = round($acertos / $total * 100);

    if ($percentual >= 80) {
        $mensagem = 'Medalha de ouro! Você é um verdadeiro campeão olímpico. 🥇';
    } elseif ($percentual >= 60) {
        $mensagem = 'Medalha de prata! Ótimo desempenho. 🥈';
    } elseif ($percentual >= 40) {
        $mensagem = 'Medalha de bronze! Dá para melhorar. 🥉';
    } else {
        $mensagem = 'Continue treinando! Na próxima você sobe ao pódio. 💪';
    }
}

function e($texto)
{
    return htmlspecialchars($texto, ENT_QUOTES, 'UTF-8');
}
?>
<!DOCTYPE html>
<html lang="pt-BR">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Quiz das Olimpíadas</title>
    <link rel="stylesheet" href="style.css">
</head>
<body>
    <header class="topo">
        <div class="aneis" aria-hidden="true">
            <span class="anel azul"></span>
            <span class="anel preto"></span>
            <span class="anel vermelho"></span>
            <span class="anel amarelo"></span>
            <span class="anel verde"></span>
        </div>
        <h1>Quiz das Olimpíadas</h1>
        <p>Teste seus conhecimentos com <?= count($perguntas) ?> perguntas sobre os Jogos Olímpicos.</p>
    </header>

    <main class="container">
        <?php if ($enviado): ?>
            <section class="placar">
                <div class="circulo" style="--pct: <?= $percentual ?>">
                    <span><?= $acertos ?>/<?= $total ?></span>
                </div>
                <div class="placar-texto">
                    <h2>Seu placar: <?= $percentual ?>%</h2>
                    <p><?= $mensagem ?></p>
                    <p class="resumo">
                        <span class="tag certo"><?= $acertos ?> acertos</span>
                        <span class="tag errado"><?= $total - $acertos ?> erros</span>
                    </p>
                </div>
            </section>
        <?php endif; ?>

        <form method="POST" action="">
            <?php foreach ($perguntas as $i => $p): ?>
                <?php
                $escolhida = isset($respostas[$i]) ? (int) $respostas[$i] : null;
                $classeCard = '';
                if ($enviado) {
                    $classeCard = $escolhida === $p['correta'] ? 'acertou' : 'errou';
                }
                ?>
                <fieldset class="card <?= $classeCard ?>">
                    <legend>
                        <span class="numero"><?= $i + 1 ?></span>
                        <?= e($p['pergunta']) ?>
                    </legend>

                    <div class="opcoes">
                        <?php foreach ($p['opcoes'] as $j => $opcao): ?>
                            <?php
                            $classeOpcao = '';
                            if ($enviado) {
                                if ($j === $p['correta']) {
                                    $classeOpcao = 'correta';
                                } elseif ($j === $escolhida) {
                                    $classeOpcao = 'incorreta';
                                }
                            }
                            ?>
                            <label class="opcao <?= $classeOpcao ?>">
                                <input type="radio"
                                       name="resposta[<?= $i ?>]"
                                       value="<?= $j ?>"
                                       <?= $escolhida === $j ? 'checked' : '' ?>
                                       <?= $enviado ? 'disabled' : 'required' ?>>
                                <span class="letra"><?= $letras[$j] ?></span>
                                <span class="texto"><?= e($opcao) ?></span>
                            </label>
                        <?php endforeach; ?>
                    </div>

                    <?php if ($enviado): ?>
                        <p class="feedback">
                            <?php if ($escolhida === $p['correta']): ?>
                                ✔ Resposta correta!
                            <?php elseif ($escolhida === null): ?>
                                ✘ Sem resposta. A correta era: <strong><?= e($p['opcoes'][$p['correta']]) ?></strong>
                            <?php else: ?>
                                ✘ Resposta errada. A correta era: <strong><?= e($p['opcoes'][$p['correta']]) ?></strong>
                            <?php endif; ?>
                        </p>
                    <?php endif; ?>
                </fieldset>
            <?php endforeach; ?>

            <div class="acoes">
                <?php if ($enviado): ?>
                    <a class="botao" href="index.php">Jogar novamente</a>
                <?php else: ?>
                    <button class="botao" type="submit">Enviar respostas</button>
                <?php endif; ?>
            </div>
        </form>
    </main>

    <footer class="rodape">Quiz das Olimpíadas &middot; PHP + JSON</footer>
</body>
</html>
