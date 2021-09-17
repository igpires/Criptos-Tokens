// difinição dos atributos do svg
//margem, largura e altura

const margin = { top: 100, left: 100, right: 800, bottom: 100 };
const width = 600;
const height = 500;

const svg = d3.select("#graph")
      .append("svg")
      .attr("width", width + margin.left + margin.right)
      .attr("height", height + margin.top + margin.bottom)
      .append("g")
      .attr("transform", `translate(${margin.left}, ${margin.top})`);

const xScale = d3.scaleBand()
      .range([0, width])
      .padding(0.5);

const xAxis = svg.append("g")
      .attr("transform", `translate(0, ${height})`);

const yScale = d3.scaleLinear()
      .range([height, 0]);

const yAxis = svg.append("g");

// legendas laterias 
svg.append("text")
      .attr("x", (width + 400))
      .attr("y", height - 500)
      .attr("font-size", "22px")
      .attr("text-anchor", "middle")
      .text("> High: Maior preço unitário de negociação das últimas 24 horas.")

svg.append("text")
      .attr("x", (width + 400))
      .attr("y", height - 400)
      .attr("font-size", "22px")
      .attr("text-anchor", "middle")
      .text("> Low: Menor preço unitário de negociação das últimas 24 horas.")

svg.append("text")
      .attr("x", (width + 400))
      .attr("y", height - 300)
      .attr("font-size", "22px")
      .attr("text-anchor", "middle")
      .text("> Last: Preço unitário da última negociação")

svg.append("text")
      .attr("x", (width + 400))
      .attr("y", height - 200)
      .attr("font-size", "22px")
      .attr("text-anchor", "middle")
      .text("> Buy: Maior preço de oferta de compra das últimas 24 horas.")

svg.append("text")
      .attr("x", (width + 400))
      .attr("y", height - 100)
      .attr("font-size", "22px")
      .attr("text-anchor", "middle")
      .text("> Sell: Menor preço de oferta de venda das últimas 24 horas.")

svg.append("text")
      .attr("class", "texto1")
      .attr("x", (width / 2))
      .attr("y", height + (margin.bottom / 2))
      .attr("font-size", "22px")
      .attr("text-anchor", "middle")

svg.append("text")
      .attr("class", "texto2")
      .attr("x", (width / 2))
      .attr("y", -50)
      .attr("font-size", "22px")
      .attr("text-anchor", "middle")

svg.selectAll("text")
      .style('fill', 'blue')

// funçao pra formatar data era unix0

function dataFormat(minhaData) {
      var parse = d3.timeParse("%s")
      var time = parse(minhaData)
      return time
}


//funcao para formatar moeda em real
function real(value) {
      num = d3.format(".2f")(value)
      if (num >= 1000) {
            num = num / 1000
            return ('R$ ' + num.toLocaleString('pt-BR') + ' Mil')
      } else return ('R$ ' + num.toLocaleString('pt-BR'))

}
console.log(real(255500.555));

//Funcao geradora de url basedo nas informacoes selecionadas na DOM
// doc api https://www.mercadobitcoin.com.br/api-doc/
function criaUrl() {
      let coin = getSelect()
      let url = "https://www.mercadobitcoin.net/api/" + coin + "/" + "ticker"
      return url
}

//Funçao que pega o que esta selecionado No dropdown menu
function getSelect() {
      let select = document.getElementById('coinselect');
      let value = select.options[select.selectedIndex].value;
      return value
}

//funçao que fica "escutando o html" e gera o grafico baseado na moeda escolhida pelo usuario
coinselect.addEventListener("change", () => {
      update()
});

function update() {

      d3.json(criaUrl()).then(data => {
            console.log(data.ticker);

            // gera um array amigavel de duas posições, no indece [0] fica o tipo da variavel
            // no indece [1] fica seu valo
            meudado = [
                  ['high', data.ticker.high],
                  ['low', data.ticker.low],
                  ['last', data.ticker.last],
                  ['buy', data.ticker.buy],
                  ['sell', data.ticker.sell]
            ]
            let volume = d3.format(".2f")(data.ticker.vol)
            let horario = dataFormat(data.ticker.date)
            console.log(horario);
            console.table(meudado);

            //legenda com o horario da consulta, atualiza sempre que a moeda muda
            var texto1 = svg.select(".texto1")
            texto1.join("text")
                  .transition()
                  .duration(1000)
                  .attr("x", (width / 2))
                  .attr("y", height + (margin.bottom / 2))
                  .attr("font-size", "22px")
                  .attr("text-anchor", "middle")
                  .text("Data da Consulta: " + horario);

            // Legenda Com iformaçoes da ultimas negociacoes 
            var texto2 = svg.select(".texto2")
            texto2.join("text")
                  .transition()
                  .duration(1000)
                  .attr("x", (width / 2))
                  .attr("y", -50)
                  .attr("font-size", "22px")
                  .attr("text-anchor", "middle")
                  .text("Quantidade negociada nas últimas 24 horas: " + volume);

            //cor da escala 
            const colorScale = d3.scaleLinear()
                  .domain([d3.min(meudado, d => d[1]), d3.max(meudado, d => d[1])])
                  .range(d3.schemeDark2);

            xScale.domain(meudado.map(d => d[0])) //mapea o nome das variaveis e carrega na escala de X
            const xAxisCall = d3.axisBottom(xScale);
            xAxis.transition()
                  .duration(1000)
                  .call(xAxisCall);

            // A escale de Y  
            yScale.domain([
                  //inicio do daminio
                  d3.min(meudado, d => d[1] * 0.95), //Começa:  Com um valor 5% menor que o meu menor dado no array 
                  //fim do dominio
                  d3.max(meudado, d => d[1]) * 1.01 //Termina: Com um valor 1% maior que o maior dado do meu array
            ]);

            yAxisCall = d3.axisLeft(yScale);                                                       
            yAxis.transition()
                  .duration(1000)
                  .call(yAxisCall);

            var rects = svg.selectAll("rect")
                  .data(meudado);

            rects.join("rect")
                  .transition()
                  .duration(1000)
                  .attr("x", d => xScale(d[0]))
                  .attr("y", d => yScale(d[1]))
                  .attr("width", xScale.bandwidth())
                  .attr("height", d => height - yScale(d[1]))
                  .attr("fill", d => colorScale(d[1]));

            const tip = d3.tip()
                  .attr('class', 'd3-tip')
                  .html(function (event, d) {
                        return "<span>" + "<font color='red'>" + JSON.stringify(real(d[1])); + "</font>" + "</span>"
                  });
            svg.call(tip);


            rects.on('mouseenter.tip', tip.show)
                  .on('mouseleave.tip', tip.hide);

      });
}

update()