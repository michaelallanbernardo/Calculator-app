const display = document.getElementById("display");
const buttons = document.querySelectorAll(".buttons button");
const historyList = document.getElementById("historyList");
const themeBtn = document.getElementById("themeBtn");

buttons.forEach(button => {
    button.addEventListener("click", () => {
        const value = button.textContent;

        if(value === "C"){
            display.value = "";
        }
        else if(value === "⌫"){
            display.value = display.value.slice(0,-1);
        }
        else if(value === "="){
            calculate();
        }
        else{
            display.value += value;
        }
    });
});

function calculate(){

    try{

        const expression = display.value;

        const result = Function(
            '"use strict"; return (' + expression + ')'
        )();

        historyList.innerHTML += `
            <li>${expression} = ${result}</li>
        `;

        display.value = result;

    }catch{
        display.value = "Error";
    }
}

document.addEventListener("keydown",(e)=>{

    const allowed =
    "0123456789+-*/.";

    if(allowed.includes(e.key)){
        display.value += e.key;
    }

    if(e.key === "Enter"){
        calculate();
    }

    if(e.key === "Backspace"){
        display.value =
        display.value.slice(0,-1);
    }

    if(e.key === "Escape"){
        display.value = "";
    }
});

themeBtn.addEventListener("click",()=>{

    document.body.classList.toggle("dark");

    themeBtn.textContent =
    document.body.classList.contains("dark")
    ? "☀️"
    : "🌙";
});