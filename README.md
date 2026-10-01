# Rios — Navegação regional e hidrodinâmica

Laboratório de extrapolação modelo–protótipo pelos métodos de Froude e Hughes, com tema inspirado na navegação amazônica.

**Acessar:** https://purplemixcolor.github.io/navegacao-regional-hidrodinamica/

## Utilização

Escolha o modelo DTC ou o exercício de referência. Ajuste a geometria, as propriedades da água e os pares de velocidade e resistência total medidos no modelo. Os cálculos e os gráficos são atualizados automaticamente.

A seleção de um ensaio pelo controle de velocidade, pela tabela ou por um ponto do gráfico atualiza os resultados e a memória de cálculo. Os gráficos permitem escolher o eixo horizontal e alternar a exibição dos métodos. Um caso com uma única velocidade mostra pontos; curvas exigem velocidades diferentes.

A cena 3D permite girar o barco, escolher vistas, aproximar, afastar, pausar a animação e alternar a iluminação. A embarcação regional é uma ilustração; a base experimental é o modelo DTC identificado nas referências.

O botão **Planilha Excel** disponibiliza a planilha com todos os dados, cálculos, gráficos e a verificação na aba Extrapolacao. Há exportação dos resultados em CSV e impressão da memória de cálculo.

## Execução local

Abra `Aplicativo.html` na pasta extraída do pacote de entrega. Preserve os arquivos JS, CSS, a imagem, a planilha e a pasta `assets` ao lado do HTML. O aplicativo funciona inteiramente no navegador, sem instalação, cadastro ou internet. Os parâmetros não são enviados a um servidor.

## Base experimental e referências

Ould el Moctar, Shigunov e Zorn (2012). *Duisburg Test Case: Post-Panamax Container Ship for Benchmarking*. Ship Technology Research, 59(3), 50–64. Tabelas 1 e 4 e §3.3. https://doi.org/10.1179/str.2012.59.3.004

Imagem do DTC: Chiroșcă e Rusu (2021), figura 1, licença CC BY 4.0. https://doi.org/10.3390/jmse9010062

## Hipóteses e verificação

Linha de atrito ITTC-1957 nos dois métodos. Hughes mantém k = 0,094 nas duas escalas para o DTC, seguindo o procedimento do exercício. Água do protótipo: densidade 1025 kg/m³ e viscosidade 1,19×10⁻⁶ m²/s. Sem rugosidade, vento, margens de serviço ou eficiências propulsivas. A potência calculada é a potência efetiva.

O exercício produz RT = 291,783 kN e PE = 2397,244 kW por Froude; RT = 260,828 kN e PE = 2142,923 kW por Hughes. As diferenças em resistência e potência para os valores arredondados do exercício são inferiores a 0,2%.

## Dependências

Three.js 0.160.1 (MIT), Manrope e DM Serif Display (SIL Open Font License). Bibliotecas, fontes e respectivas licenças estão incluídas em `assets`. A cena 3D foi construída para este aplicativo.
