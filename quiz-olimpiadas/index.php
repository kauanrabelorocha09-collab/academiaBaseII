<?php
// le o arquivo json com as perguntas
$json = file_get_contents("perguntas.json");
$perguntas = json_decode($json, true);

$letras = array("A", "B", "C", "D");
$acertos = 0;
$enviou = false;

// se o formulario foi enviado
if ($_SERVER["REQUEST_METHOD"] == "POST") {
    $enviou = true;
    for ($i = 0; $i < count($perguntas); $i++) {
        if (isset($_POST["p$i"]) && $_POST["p$i"] == $perguntas[$i]["correta"]) {
            $acertos++;
        }
    }
}
?>
<!DOCTYPE html>
<html lang="pt-br">
<head>
    <meta charset="UTF-8">
    <title>Quiz das Olimpiadas</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            max-width: 700px;
            margin: 20px auto;
        }
        .pergunta {
            border: 1px solid #000;
            padding: 10px;
            margin-bottom: 10px;
        }
        .placar {
            border: 2px solid #000;
            padding: 10px;
            margin-bottom: 20px;
        }
    </style>
</head>
<body>

<h1>Quiz das Olimpiadas</h1>

<?php if ($enviou) { ?>
    <div class="placar">
        <h2>Placar: <?php echo $acertos; ?> de <?php echo count($perguntas); ?></h2>
    </div>
<?php } ?>

<form method="post">
<?php for ($i = 0; $i < count($perguntas); $i++) { ?>
    <div class="pergunta">
        <p><b><?php echo ($i + 1) . ") " . $perguntas[$i]["pergunta"]; ?></b></p>

        <?php for ($j = 0; $j < 4; $j++) { ?>
            <label>
                <input type="radio" name="p<?php echo $i; ?>" value="<?php echo $j; ?>"
                    <?php if (isset($_POST["p$i"]) && $_POST["p$i"] == $j) echo "checked"; ?>>
                <?php echo $letras[$j] . ") " . $perguntas[$i]["opcoes"][$j]; ?>
            </label><br>
        <?php } ?>

        <?php
        if ($enviou) {
            $certa = $perguntas[$i]["correta"];
            if (isset($_POST["p$i"]) && $_POST["p$i"] == $certa) {
                echo "<p>Acertou!</p>";
            } else {
                echo "<p>Errou! A resposta certa era: " . $perguntas[$i]["opcoes"][$certa] . "</p>";
            }
        }
        ?>
    </div>
<?php } ?>

    <button type="submit">Enviar</button>
</form>

</body>
</html>
