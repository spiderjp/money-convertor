// Obtendo as Opções (Options) de moedas dos Selects

/*El em currencyOneEl é apenas uma convenção para nomear Elementos DOM em JS, enquanto
data-js é um seletor CSS*/

const currencyOneEl = document.querySelector('[data-js="currency-one"]')
const currencyTwoEl = document.querySelector('[data-js="currency-two"]')
const currenciesEl = document.querySelector('[data-js="currencies-container"]')
const convertedValueEl = document.querySelector('[data-js="converted-value"]')
const valuePrecisionEl = document.querySelector('[data-js="conversion-precision"]')
const timesCurrencyOneEl = document.querySelector('[data-js="currency-one-times"]')

const api_key = KEY_API.env

let internalExchangeRate = {}

console.log(currencyOneEl,currencyTwoEl)

//Populando os Selects de maneira estática para testar

const getUrl = currency => `https://v6.exchangerate-api.com/v6/{api_key}/latest/${currency}`

/*Criando uma constante para armazenar os tipos de erros que poderá acontecer no sistema,
e caso nenhum dos erros existentes ocorrá, e sim um novo, o "Não foi possível..." será invocado */

const getErrormessage = errorType => ({

"unsupported-code": "se não suportarmos o código de moeda fornecido (ver moedas suportadas...).",
"malformed-request" : "quando alguma parte de seu pedido não segue a estrutura mostrada acima.",
"invalid-key" : "quando sua chave API não é válida.",
"inactive-account" :  "quando seu endereço de e-mail não foi confirmado.",
"quota-reached": "quando sua conta tiver atingido o número de solicitações permitido por seu plano."
})[errorType] || "Não foi possível obter as informações."



/*Busca de dados por meio de URL, com prevenção de erros e 
utilizando/encapsulando por meio de async/await*/


const fetchExchangeRate = async url => {
    try{
        const response = await fetch(url)

    //Caso o objeto ok seja falso, a net deve ter caído, então deve executar o seguinte código:

        if(!response.ok){

            throw new Error("Sua conexão falhou. Não foi possível obter as informações.")
        }

    //Recebendo a resposta da API em formato JSON e desemcapsulando o await

        const exchangeRateData = await response.json()

    //Caso ocorra um erro no resultado da resposta deve chamar a getErrormessage

        if (exchangeRateData.result === "error"){
            throw new Error(getErrormessage(exchangeRateData['error-type']))
        }

        return exchangeRateData


    //Caso aconteça um erro, apareça um pop-up na tela em Bootstrap alertando o erro


    } catch (err) {
    
        const div = document.createElement("div")
        const button = document.createElement("button")

        div.textContent = err.message

        div.classList.add("alert", "alert-warning", "alert-dismissible", "fade show")
        div.setAttribute('role', 'alert')
        button.classList.add("btn-close")
        button.setAttribute('type', 'button')
        button.setAttribute('aria-label', 'Close')

        button.addEventListener('click', ()=>{

            div.remove
        })


        div.appendChild(button)
        currenciesEl.insertAdjacentElement('afterend', div)

    
    }
}

// Iniciar o fetchExchangeRate quando a página for carregada

const init = async () => {

    internalExchangeRate = {...(await fetchExchangeRate(getUrl('USD')))}
    
    //Criando um array de Opções para os Selections e transformando em String por meio de .join

    const getOptions = selectedCurrency => Object.keys(internalExchangeRate.conversion_rates)
    .map(currency => `<option ${currency === selectedCurrency ? 'selected' : ''}>${currency}</option>`)
    .join('')

    currencyOneEl.innerHTML = getOptions('USD')
    currencyTwoEl.innerHTML = getOptions('BRL')

    convertedValueEl.textContent = internalExchangeRate.conversion_rates.BRL.toFixed(2)
    valuePrecisionEl.textContent = `1 USD = ${internalExchangeRate.conversion_rates.BRL.toFixed(2)} BRL`
}

timesCurrencyOneEl.addEventListener('input', e =>{

    convertedValueEl.textContent = (e.target.value * internalExchangeRate.conversion_rates[currencyTwoEl.value]).toFixed(2)
})

currencyTwoEl.addEventListener('input', e =>{

    const currencyTwoValue = internalExchangeRate.conversion_rates[e.target.value]

    convertedValueEl.textContent = (timesCurrencyOneEl.value * currencyTwoValue).toFixed(2)

    valuePrecisionEl.textContent = `1 ${currencyOneEl.value} = ${1 * internalExchangeRate.conversion_rates[currencyTwoEl.value]} ${currencyTwoEl.value}`
})


currencyOneEl.addEventListener('input', async e=>{
 
   internalExchangeRate = {...(await fetchExchangeRate(getUrl(e.target.value)))}
   convertedValueEl.textContent = (timesCurrencyOneEl.value * internalExchangeRate.conversion_rates[currencyTwoEl.value ]).toFixed(2)

   valuePrecisionEl.textContent = `1 ${currencyOneEl.value} = ${1 * internalExchangeRate.conversion_rates[currencyTwoEl.value]} ${currencyTwoEl.value}`
})
init()

//Pesquisar sobre interpolação js ${} e ternário

