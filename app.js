"use strict";

/***************************************************
 *                                                 *
 *                 TextBorgen v0.14                *
 *          av Thor Hedeland, 06-02-24             *
 *                                                 *
 *                                                 *
 **************************************************/
//v0.2 17-12-23
//La till att man kan trycka på upp och nedpilarna för att återkalla de senaste
//senaste använda kommandona.
//v0.3 30-12-23
//La till några funktioner som jag har tagit från Mauritz Blomqvist, dessa funktioner
//läser speletshistori från en fil, så att all text inte är i koden.
//och ger felmeddelande om det inte funkar.
//Har även lagt till funktionen värderaText() som ger användaren respons beroende på
//vad den har skrivit som kommando. Om kommandot finns så ska den sen utföra kommandot.
//annars ger den ett felmeddelande.
//v0.4 01-01-24
//Bytte plats på senasteTextUpp() och senasteTextNer() kändes mer naturligt.
//Skapade funktionen skrivText(), fackla(), slut(), tillRum()
//Kortade ner väderaText() signifikant.
//v0.5 07-01-24
//La till !-kommandon i värdera text
//La till start()
//Gjorde om skrivText() till skrivRumText() och la till en ny skrivText()
//La till scrollTo(0, document.getElementById("body").offsetHeight); efter varje
//gång text skrivs, så att sidan skrollas ner.
//v0.6 08-01-24
//Skapade funktionen ändelser()
//v0.7 09-01-24
//La till förråd()
//v0.8 12-01-24
//La till ladda() och laddaFörändring() som hjälper användaren att
//ladda upp sparfiler från spelet.
//v0.9 15-01-24
//La till spara(), sparaFil() och bytBokstav()
//Dessa funktioner gör det möjligt för användaren att spara spelet i en sparfil
//och sedan kunna använda !ladda för att återfå denna spardata.
//v0.10 19-01-24
//Ändrade lite på erum() så att den funkar bättre med JSONen
//v0.11 26-01-24
//La till katakomb()
//v0.12 29-01-24
//Förfinade lite kod
//v0.13 05-02-24
//La till kokokosnötpussel()
//v0.14 06-02-24
//La till ni()

//-------Definitioner-----

const div = document.getElementById("terminal");
let upplåst = false;
let key;
let skrivenText;
let laddaText = document.createElement("input");
let txtCnt = 0;
let txtNmr;
let senasteText;
let aktivtRum;
let föremål = {
  nyckel: false,
  buske: false,
  svärd: false,
  fackla: false,
  kokosnöt: false,
  mynt: false,
};
let avslut = {
  1: "???",
  2: "???",
  3: "???",
  4: "???",
  5: "???",
  6: "???",
  7: "???",
  8: "???",
  9: "???",
  10: "???",
  11: "???",
  12: "???",
  13: "???",
  14: "???",
  15: "???",
  hemlig: "???",
};
//-------Speciella saker---

//Jobbar med t.js för att skriva ut texten i HTML-dokumentet
//som en "skrivmaskin" och inte "rakt" som det är vanligtvis
//läs i HTML-filen och dokumenatatitonen för mer info
$(document.getElementById("terminal")).t({
  caret: false,
});

//Flera funktioner för att läsa in historian från en JSONfil
//Dessa har jag tagit från Mauritz Blomqvists undervisningsmaterial
//som han skrivit till JavaScript, 15p19. Jag har modifierat den lite.
let historia;

async function fetchText(url, success, failure) {
  fetch(url)
    .then((response) => response.json())
    .then((data) => success(data))
    .catch((error) => {
      failure(error);
    });
}

fetchText("./historia.json", whatToDoWhenFileIsRead, whatToDoIfError);

function whatToDoWhenFileIsRead(data) {
  historia = data;
  document.getElementById("terminal").hidden = false;
}

function whatToDoIfError(error) {
  let felmeddelande = document.createElement("p");
  felmeddelande.innerText = "Du måste starta spelet i Live Server! " + error;
  document.getElementById("wrapper").appendChild(felmeddelande);
}

//-------FUNKTIONER-------

//-Spelmotor-funktioner---

//Funktionen kopplad till eventlyssnaren, switchen bestämmer
//vilken funktion som ska kallas beroende på vilken knapp som tryckts
function knappTryck(event) {
  key = event.key.toUpperCase();
  switch (key) {
    case "ENTER":
      läsText();
      break;
    case "ARROWDOWN":
      senasteTextUpp();
      break;
    case "ARROWUP":
      senasteTextNer();
      break;
  }
}

//Denna funktion skriver ut den texten användaren har skrivit till konsollen.
//Den ändrar också senasteText så att den stämmer överense med txtCnt
function läsText() {
  if (document.getElementById("input").value != "") {
    txtCnt++;
    senasteText = txtCnt + 1;
    let nytext = document.createElement("p");
    skrivenText = document.getElementById("input").value;
    nytext.innerText = "> " + skrivenText;
    sessionStorage.setItem(txtCnt, skrivenText);
    div.appendChild(nytext);
    scrollTo(0, document.getElementById("body").offsetHeight);
    document.getElementById("input").value = "";
    värderaText(skrivenText);
  }
}

//Återställer allt mellan spelomgångar
function återställ() {
  föremål = {
    nyckel: false,
    buske: false,
    svärd: false,
    fackla: false,
    kokosnöt: false,
    mynt: false,
  };
  sessionStorage.clear();
  txtCnt = 0;
  upplåst = false;
}
//Gör så att man kan trycka på uppåtpilen och gå nedåt i listan med senast skrivna kommandon
function senasteTextNer() {
  if (senasteText > 1) {
    senasteText--;
  }
  document.getElementById("input").value = sessionStorage.getItem(senasteText);
}

//Gör så att man kan trycka på uppåtpilen och gå uppåt i listan med senast skrivna kommandon
function senasteTextUpp() {
  if (senasteText <= txtCnt - 1) {
    senasteText++;
  }
  document.getElementById("input").value = sessionStorage.getItem(senasteText);
}

//En funktion som skapar texten som ska vara i sparfilen och kallar sedan sparaFil()
function spara() {
  skrivText("spara");
  let sparadText = historia.sparText;
  console.log(sparadText);
  for (let i = 15; i > 0; i--) {
    if (avslut[i] != "???") {
      console.log(i);
      sparadText = bytBokstav(sparadText, historia.läsare[i], "Y");
    }
  }
  if (avslut.hemlig != "???") {
    sparadText = bytBokstav(sparadText, historia.läsare[0], "Y");
  }
  sparaFil(sparadText);
}

//En funktion som sparar en fil till användarens dator
//Denna funktion har tagit inspiration av Mauritz Blomqvists
//lärobok för JS 15p10
function sparaFil(text) {
  let sparaText = document.createElement("a");
  sparaText.setAttribute(
    "href",
    "data:text/plain;charset=utf-8," + encodeURIComponent(text)
  );
  sparaText.setAttribute("download", "sparfil");
  sparaText.style.display = "none";
  div.appendChild(sparaText);
  sparaText.click();
  div.removeChild(sparaText);
}

//En funktion som hjälper spara(), den tar in sträng (variabelnamn), vilken plats
//man vill ändra bokstav på, och vilken bokstav.
function bytBokstav(str, plats, bokstav) {
  return str.substring(0, plats) + bokstav + str.substring(plats + 1);
}
//Kallar på laddaFörändring() för att processa datan från
//sparfilen och kolla vilka ändelser som är upplåsta.
function ladda() {
  skrivText("ladda");
  laddaText = document.createElement("input");
  laddaText.setAttribute("id", "dataInput");
  laddaText.setAttribute("type", "file");
  laddaText.innerText = "> Tryck här för att ladda upp sparad data";
  div.appendChild(laddaText);
  document
    .getElementById("dataInput")
    .addEventListener("change", laddaFörändring);
}

//Processar datan från sparfilen och kollar vilka ändelser som är upplåsta
//Majoriteten av koden är tagen från Mauritz Blomqvists lärobok i JS (15p10)
function laddaFörändring(event) {
  let läsare = new FileReader();
  läsare.readAsText(event.srcElement.files[0]);
  läsare.onload = function () {
    if (läsare.result[18] == "Y") {
      for (let i = 15; i > 0; i--) {
        if (läsare.result[historia.läsare[i]] == "Y") {
          slut(i);
        }
      }
      if (läsare.result[historia.läsare[0]] == "Y") {
        avslut.hemlig = historia.avslut[15];
      }
      skrivText("lyckadLaddning");
    } else {
      skrivText("misslyckadLaddning");
    }
    div.removeChild(laddaText);
  };
}

//-----Spel-funktioner----

//Denna funktion värderar texten användaren har skrivit och baserat på
// de kommandon som står i JSONfilen bestämmmer om den ska ge användaren
//ett felmeddelande eller utföra kommandot som den skrev.
//Det finns ett flödeschema till denna i dokumentationen.
function värderaText() {
  let inmatatText = skrivenText.toLowerCase();
  //Testar om användaren har använt ett !-kommando
  if (
    inmatatText == "!start" ||
    inmatatText == "!hjälp" ||
    inmatatText == "!ändelser" ||
    inmatatText == "!info" ||
    inmatatText == "!spara" ||
    inmatatText == "!ladda" ||
    inmatatText == "!förråd"
  ) {
    switch (inmatatText) {
      case "!spara":
        spara();
        break;
      case "!ladda":
        ladda();
        break;
      case "!ändelser":
        ändelser();
        break;
      case "!start":
        start();
        break;
      case "!förråd":
        förråd();
        break;
      default:
        skrivText(inmatatText.substring(1));
    }
  } else if (aktivtRum != "limbo") {
    for (let i = historia[aktivtRum].kommandon.length - 1; i > -2; i--) {
      let cmdSvar = historia[aktivtRum].kommandonSvar[i];
      if (inmatatText.includes(historia[aktivtRum].kommandon[i])) {
        //Testar efter om kommandot förösker ta användaren i ett nytt rum
        //och om det gör det så executar den tillRum() med nya rummet som ett villkor
        if (cmdSvar.includes("R")) {
          tillRum(cmdSvar);
          break;
        } else {
          //Testar om användaren försöker ta ett föremål och ger då svar beroende på om
          //användaren redan har tagit nyckeln eller liknande
          if (
            cmdSvar == "nyckel" ||
            cmdSvar == "buske" ||
            cmdSvar == "svärd" ||
            cmdSvar == "mynt" ||
            cmdSvar == "kokosnöt"
          ) {
            if (föremål[cmdSvar]) {
              let temp = cmdSvar + "Tagen";
              skrivRumText(temp);
            } else {
              föremål[cmdSvar] = true;
              //skrivRumText(cmdSvar);
            }
            //Eftersom jag inte orkar skriva in facklan i varje rum
            //så har jag lagt den utanför och med det får den en egen
            //funktion och sektion för detta.
          } else if (cmdSvar == "fackla") {
            fackla();
          } else if (cmdSvar.includes("avslut")) {
            if (cmdSvar[6] == 0) {
              slut(cmdSvar[7]);
              skrivRumText("avslut");
            } else {
              slut(cmdSvar[6] + cmdSvar[7]);
              skrivRumText("avslut");
            }
          } else {
            switch (cmdSvar) {
              case "erum":
                erum();
                break;
              case "låstDörr":
                låstDörr();
                break;

              case "katakomber":
                katakomber();
                break;

              case "kokosnötpussel":
                kokosnötPussel();
                break;

              case "ni":
                ni();
                break;

              default:
                let nytext = document.createElement("p");
                nytext.innerText = "> " + historia[aktivtRum][cmdSvar] + "\n >";
                div.appendChild(nytext);
                scrollTo(0, document.getElementById("body").offsetHeight);
                break;
            }
          }
        }
        break;
      } else if (i == -1) {
        let felText = document.createElement("p");
        felText.innerText =
          "> Okänt kommando: '" +
          skrivenText +
          "'. Skriv '!hjälp' för hjälp  \n > ";
        div.appendChild(felText);
        scrollTo(0, document.getElementById("body").offsetHeight);
        break;
      }
    }
  } else {
    let felText = document.createElement("p");
    felText.innerText =
      "> Okänt kommando: '" +
      skrivenText +
      "'. Skriv '!hjälp' för hjälp  \n > ";
    div.appendChild(felText);
    scrollTo(0, document.getElementById("body").offsetHeight);
  }
}

//Skickar användaren till det rum användaren har matat in att den vill gå
//in i. Den kollar även villkor på huruvida rummet är ett sådant rum man dör i
//omedelbart eller om det finns monster i rummet, då detta påverkar.
function tillRum(rum) {
  aktivtRum = rum;
  if (historia[aktivtRum].erum) {
    while (historia[aktivtRum].erum) {
      aktivtRum = aktivtRum + "e";
    }
    skrivRumText("rumText");
  } else if (historia[aktivtRum].strid) {
    if (föremål.svärd) {
      skrivRumText("rumText");
    } else {
      skrivRumText("avslut");
      slut(4);
    }
  } else if (historia[aktivtRum].kostar) {
    if (föremål.mynt) {
      skrivRumText("rumText");
    } else {
      skrivRumText("avslut");
      slut(4);
    }
  } else if (historia[aktivtRum].rumText != undefined) {
    skrivRumText("rumText");
  } else if (historia[aktivtRum].avslut == "h") {
    avslut.hemlig = historia.avslut[15];
    skrivRumText("avsluth");
    aktivtRum = "limbo";
  } else {
    let temp =
      "avslut" + historia[aktivtRum].avslut[0] + historia[aktivtRum].avslut[1];
    if (historia[aktivtRum].avslut[0] == 0) {
      skrivRumText(temp);
      slut(historia[aktivtRum].avslut[1]);
    } else {
      skrivRumText(temp);
      slut(historia[aktivtRum].avslut[0] + historia[aktivtRum].avslut[1]);
    }
  }
}

//En funktion som gör så att event i rum bara kan göras en gång
//Så att man inte tar nyckeln från skelettet och sedan
//Kan få upp texten att skelettet håller i en nyckel.
function erum() {
  if (historia[aktivtRum].erumHändelse) {
    skrivenText = "e1r2u3m";
    värderaText();
  }
  skrivRumText("erumText");
  historia[aktivtRum].erum = true;
  aktivtRum = aktivtRum + "e";
}

//Skriver ut i termnialen det man anger i funktionsvillkoret
function skrivRumText(text) {
  let nytext = document.createElement("p");
  nytext.innerText = "> " + historia[aktivtRum][text] + "\n >";
  div.appendChild(nytext);
  scrollTo(0, document.getElementById("body").offsetHeight);
}
//Skriver ut i termnialen det man anger i funktionsvillkoret
function skrivText(text) {
  let nytext = document.createElement("p");
  nytext.innerText = "> " + historia[text] + "\n >";
  div.appendChild(nytext);
  scrollTo(0, document.getElementById("body").offsetHeight);
}

//Öppnar dörren om du har en nyckel, annars säger den att du inte
//har en nyckel.
function låstDörr() {
  if (föremål.nyckel) {
    if (upplåst) {
      tillRum("R20");
    } else if (upplåst === false) {
      skrivRumText("dörrÖppen");
      upplåst = true;
    }
  } else {
    skrivRumText("dörrLåst");
  }
}

//Låter dig utforska katakomberna om du har en fackla.
function katakomb() {
  if (föremål.fackla) {
    tillRum("Rk2");
  } else {
    skrivRumText("avslut");
    slut(12);
  }
}

//Låter dig öppna en lönndörr om du slår kokosnötter.
function kokosnötpussel() {
  if (föremål.kokosnöt) {
    tillRum("R60e");
  } else {
    skrivRumText("misslyckad");
  }
}

//Ser om du kan ge buskar till riddarna. NI!
function ni() {
  if (föremål.buske) {
    skrivRumText("avslut");
    slut(15);
  } else {
    skrivRumText("misslyckat");
  }
}

//Används för att uppdatera användarens ändelser.
function slut(nummer) {
  avslut[nummer] = historia.avslut[nummer - 1];
  aktivtRum = "limbo";
}

//En funktion som radar upp alla upplåsta ändeleser för spelaren.
function ändelser() {
  skrivText("ändelser");
  for (let i = 15; i > 0; i--) {
    let nytext = document.createElement("p");
    nytext.innerText = "> " + i + ": " + avslut[i];
    div.appendChild(nytext);
    scrollTo(0, document.getElementById("body").offsetHeight);
  }
  if (avslut.hemlig != "???") {
    let nytext = document.createElement("p");
    nytext.innerText = "> Hemlig ändelse: " + avslut.hemlig;
    div.appendChild(nytext);
    scrollTo(0, document.getElementById("body").offsetHeight);
  }
}

//Eftersom man kan ta en fackla i nästan alla rum så la jag den utanför rummen
//i JSON-filen så därför fick den en egen funktion.
function fackla() {
  if (föremål.fackla) {
    skrivText("fackla");
  } else {
    föremål.fackla = true;
    skrivText("fackla");
  }
}
//Skriver ut till användaren vad den har i sitt förråd
function förråd() {
  let cnt = 0;
  let förrådstext = document.createElement("p");
  förrådstext.innerText = "> " + historia.förråd;
  div.appendChild(förrådstext);
  scrollTo(0, document.getElementById("body").offsetHeight);
  for (let i = 5; i > -1; i--) {
    if (föremål[historia.defineratförråd[i]]) {
      let nytext = document.createElement("p");
      nytext.innerText = "> " + historia.innehållförråd[i];
      div.appendChild(nytext);
      scrollTo(0, document.getElementById("body").offsetHeight);
    } else {
      cnt++;
    }
  }
  if (cnt == 6) {
    div.removeChild(förrådstext);
    skrivText("tomtförråd");
  }
}

//------Övrigt-----------

//Lägger till en händelselyssnare som kommer användas
//för att lyssna efter t.ex. "Enter" när en användare
//vill mata in den text de skrivit.
document.addEventListener("keydown", knappTryck);

//-------Start------------
sessionStorage.clear();
aktivtRum = "limbo";
document.getElementById("terminal").hidden = true; //Bara till för att se att spelaren spelar i liveserver.

//Startar spelet på nytt.
function start() {
  återställ();
  skrivText("start");
  tillRum("R5");
}
